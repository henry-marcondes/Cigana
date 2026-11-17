const pool = require('../db/connection');
const CenaConteudo = require('../models/CenaConteudo');
const Cena = require('../models/Cena');
const Capitulo = require('../models/Capitulo');
const path = require('node:path');

const MODELOS_MIDIA = {
    IMAGEM: require('../models/CenaImagem'),
    AUDIO: require('../models/CenaAudio'),
    VIDEO: require('../models/CenaVideo')
};

const MODELOS_CONTEUDO = {
    TEXTO: require('../models/CenaTexto'),
    IMAGEM: require('../models/CenaImagem'),
    AUDIO: require('../models/CenaAudio'),
    VIDEO: require('../models/CenaVideo')
};

class CenaConteudoService {

    static async listarDisponiveisPorLivro(livro_id) {
        const result = await pool.query(`
            SELECT disponiveis.id, disponiveis.tipo_conteudo, disponiveis.titulo,
                   disponiveis.arquivo_id
              FROM (
                SELECT a.id, 'TEXTO'::TEXT AS tipo_conteudo,
                       a.nome_original AS titulo, a.id AS arquivo_id
                  FROM arquivos_midia a
                 WHERE a.livro_id = $1 AND a.ativo = TRUE
                   AND lower(a.nome_original) ~ '\\.(md|markdown)$'
                   AND a.mime_type IN ('text/markdown', 'text/plain', 'text/x-markdown')
                   AND NOT EXISTS (SELECT 1 FROM cena_textos ct WHERE ct.arquivo_id = a.id)
                   AND NOT EXISTS (SELECT 1 FROM cena_imagens ci WHERE ci.arquivo_id = a.id)
                   AND NOT EXISTS (SELECT 1 FROM cena_audios ca WHERE ca.arquivo_id = a.id)
                   AND NOT EXISTS (SELECT 1 FROM cena_videos cv WHERE cv.arquivo_id = a.id)
                   AND NOT EXISTS (SELECT 1 FROM livro_documentos ld WHERE ld.arquivo_id = a.id)
                UNION ALL
                SELECT ci.id, 'IMAGEM'::TEXT AS tipo_conteudo, ci.titulo, ci.arquivo_id
                  FROM cena_imagens ci
                  JOIN arquivos_midia a ON a.id = ci.arquivo_id
                   AND a.livro_id = ci.livro_id AND a.ativo = TRUE
                   AND lower(a.mime_type) LIKE 'image/%'
                 WHERE ci.livro_id = $1 AND ci.ativo = TRUE
                   AND nullif(btrim(ci.titulo), '') IS NOT NULL
                   AND ci.arquivo_id IS NOT NULL
                   AND NOT EXISTS (
                       SELECT 1 FROM cena_conteudos cc
                        WHERE cc.tipo_conteudo = 'IMAGEM'
                          AND cc.conteudo_id = ci.id
                   )
                UNION ALL
                SELECT ca.id, 'AUDIO'::TEXT AS tipo_conteudo, ca.titulo, ca.arquivo_id
                  FROM cena_audios ca
                  JOIN arquivos_midia a ON a.id = ca.arquivo_id
                   AND a.livro_id = ca.livro_id AND a.ativo = TRUE
                   AND lower(a.mime_type) LIKE 'audio/%'
                 WHERE ca.livro_id = $1 AND ca.ativo = TRUE
                   AND nullif(btrim(ca.titulo), '') IS NOT NULL
                   AND ca.arquivo_id IS NOT NULL
                   AND NOT EXISTS (
                       SELECT 1 FROM cena_conteudos cc
                        WHERE cc.tipo_conteudo = 'AUDIO'
                          AND cc.conteudo_id = ca.id
                   )
                UNION ALL
                SELECT cv.id, 'VIDEO'::TEXT AS tipo_conteudo, cv.titulo, cv.arquivo_id
                  FROM cena_videos cv
                  JOIN arquivos_midia a ON a.id = cv.arquivo_id
                   AND a.livro_id = cv.livro_id AND a.ativo = TRUE
                   AND lower(a.mime_type) LIKE 'video/%'
                 WHERE cv.livro_id = $1 AND cv.ativo = TRUE
                   AND nullif(btrim(cv.titulo), '') IS NOT NULL
                   AND cv.arquivo_id IS NOT NULL
                   AND NOT EXISTS (
                       SELECT 1 FROM cena_conteudos cc
                        WHERE cc.tipo_conteudo = 'VIDEO'
                          AND cc.conteudo_id = cv.id
                   )
              ) disponiveis
             ORDER BY lower(disponiveis.titulo), disponiveis.tipo_conteudo, disponiveis.id
        `, [livro_id]);
        return result.rows;
    }

    static async listarPorCena(cena_id) {

        const cena = await Cena.buscarPorId(cena_id);

        if (!cena) {
            const erro = new Error('Cena não encontrada.');
            erro.status = 404;
            throw erro;
        }

        return await CenaConteudo.listarPorCena(cena_id);
    }

    static async buscarPorId(id) {

        const cenaConteudo = await CenaConteudo.buscarPorId(id);

        if (!cenaConteudo) {
            const erro = new Error('Conteúdo da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        return cenaConteudo;
    }

    static async criar(dados) {

        const {
            cena_id,
            tipo_conteudo,
            conteudo_id,
            ordem_exibicao
        } = dados;

        const ModeloConteudo = MODELOS_CONTEUDO[tipo_conteudo];

        if (!ModeloConteudo) {
            const erro = new Error('Tipo de conteúdo inválido.');
            erro.status = 400;
            throw erro;
        }

        if (dados.arquivo_id) {
            return this.criarComArquivoDoStorage(dados);
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const cena = await Cena.buscarPorId(cena_id);
            if (!cena) {
                const erro = new Error('Cena não encontrada.');
                erro.status = 404;
                throw erro;
            }
            const capitulo = await Capitulo.buscarPorId(cena.capitulo_id);
            if (!capitulo) {
                const erro = new Error('Capítulo da cena não encontrado.');
                erro.status = 404;
                throw erro;
            }
            const conteudo = await ModeloConteudo.buscarPorId(conteudo_id, client);
            if (!conteudo || !conteudo.ativo) {
                const erro = new Error('Conteúdo ativo não encontrado.');
                erro.status = 404;
                throw erro;
            }
            if (conteudo.livro_id !== capitulo.livro_id) {
                const erro = new Error('O conteúdo informado não pertence à obra da cena.');
                erro.status = 400;
                throw erro;
            }
            const associado = await CenaConteudo.criar({
                cena_id,
                livro_id: capitulo.livro_id,
                tipo_conteudo,
                conteudo_id,
                ordem_exibicao
            }, client);
            await client.query('COMMIT');
            return associado;
        } catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23505') {
                error.status = 409;
                error.message = error.constraint === 'uq_cena_conteudos_cena_ordem'
                    ? 'A composição da cena mudou durante a inclusão. Atualize a árvore e tente novamente.'
                    : 'Este conteúdo já está associado a uma cena desta obra.';
            } else if (error.code === '23514') {
                error.status = 400;
            }
            throw error;
        } finally {
            client.release();
        }
    }

    static async criarComArquivoDoStorage(dados) {
        const ModeloMidia = MODELOS_MIDIA[dados.tipo_conteudo];
        if (!ModeloMidia) {
            const erro = new Error('Arquivo do Storage deve ser associado como IMAGEM, AUDIO ou VIDEO.');
            erro.status = 400;
            throw erro;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const cenaResult = await client.query(`
                SELECT c.id AS cena_id, cap.livro_id
                  FROM cenas c
                  JOIN capitulos cap ON cap.id = c.capitulo_id
                 WHERE c.id = $1 AND c.ativo = TRUE AND cap.ativo = TRUE
                 FOR UPDATE OF c
            `, [dados.cena_id]);
            const cena = cenaResult.rows[0];
            if (!cena) {
                const erro = new Error('Cena não encontrada.');
                erro.status = 404;
                throw erro;
            }

            const arquivoResult = await client.query(`
                SELECT id, livro_id, nome_original, mime_type, ativo
                  FROM arquivos_midia
                 WHERE id = $1
                 FOR UPDATE
            `, [dados.arquivo_id]);
            const arquivo = arquivoResult.rows[0];
            if (!arquivo || !arquivo.ativo) {
                const erro = new Error('Arquivo ativo não encontrado no Storage.');
                erro.status = 404;
                throw erro;
            }
            if (arquivo.livro_id !== cena.livro_id) {
                const erro = new Error('O arquivo não pertence à obra da cena.');
                erro.status = 400;
                throw erro;
            }
            const mimeEsperado = { IMAGEM: 'image/', AUDIO: 'audio/', VIDEO: 'video/' }[dados.tipo_conteudo];
            if (!String(arquivo.mime_type || '').toLowerCase().startsWith(mimeEsperado)) {
                const erro = new Error(`O arquivo não é compatível com o tipo ${dados.tipo_conteudo}.`);
                erro.status = 400;
                throw erro;
            }

            const usoExistente = await client.query(`
                SELECT EXISTS (
                    SELECT 1 FROM cena_textos WHERE arquivo_id = $1
                    UNION ALL SELECT 1 FROM cena_imagens WHERE arquivo_id = $1
                    UNION ALL SELECT 1 FROM cena_audios WHERE arquivo_id = $1
                    UNION ALL SELECT 1 FROM cena_videos WHERE arquivo_id = $1
                    UNION ALL SELECT 1 FROM livro_documentos WHERE arquivo_id = $1
                ) AS utilizado
            `, [dados.arquivo_id]);
            if (usoExistente.rows[0]?.utilizado) {
                const erro = new Error('Este arquivo já foi utilizado e não pode ser associado novamente.');
                erro.status = 409;
                throw erro;
            }

            const ordemResult = await client.query(`
                SELECT COALESCE(MAX(ordem_exibicao), 0) + 1 AS ordem_exibicao
                  FROM cena_conteudos
                 WHERE cena_id = $1 AND ativo = TRUE
            `, [cena.cena_id]);
            const ordemExibicao = Number(ordemResult.rows[0]?.ordem_exibicao || 1);

            const titulo = path.basename(arquivo.nome_original || 'Mídia').replace(/\.[^.]+$/, '') || 'Mídia';
            const camposComuns = {
                cena_id: null,
                livro_id: cena.livro_id,
                titulo,
                legenda: null,
                arquivo_id: arquivo.id,
                ordem_exibicao: 1
            };
            let midia;
            if (dados.tipo_conteudo === 'IMAGEM') {
                midia = await ModeloMidia.criar({
                    ...camposComuns, texto_alternativo: titulo, imagem_url: null
                }, client);
            } else if (dados.tipo_conteudo === 'AUDIO') {
                midia = await ModeloMidia.criar({
                    ...camposComuns, descricao: null, audio_url: null,
                    reproducao_automatica: false, reproducao_em_loop: false
                }, client);
            } else {
                midia = await ModeloMidia.criar({
                    ...camposComuns, descricao: null, video_url: null, miniatura_url: null,
                    reproducao_automatica: false, reproducao_em_loop: false
                }, client);
            }
            const associado = await CenaConteudo.criar({
                cena_id: cena.cena_id,
                livro_id: cena.livro_id,
                tipo_conteudo: dados.tipo_conteudo,
                conteudo_id: midia.id,
                ordem_exibicao: ordemExibicao
            }, client);
            await client.query('COMMIT');
            return associado;
        } catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23505') {
                error.status = 409;
                error.message = 'Este arquivo já foi utilizado e não pode ser associado novamente.';
            } else if (error.code === '23514') {
                error.status = 400;
            }
            throw error;
        } finally {
            client.release();
        }
    }

    static async alterarOrdem(id, ordem_exibicao) {

        const cenaConteudo = await CenaConteudo.buscarPorId(id);

        if (!cenaConteudo) {
            const erro = new Error('Conteúdo da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        return await CenaConteudo.alterarOrdem(
            id,
            ordem_exibicao
        );
    }

    static async reordenar(cena_id, ordem) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const cena = await Cena.buscarPorId(cena_id);

        if (!cena) {
            const erro = new Error('Cena não encontrada.');
            erro.status = 404;
            throw erro;
        }

        const conteudosAtuais =
            await CenaConteudo.listarPorCena(cena_id, client);

        if (conteudosAtuais.length !== ordem.length) {
            const erro = new Error(
                'A ordem deve conter todos os conteúdos ativos da cena.'
            );
            erro.status = 400;
            throw erro;
        }

        const idsAtuais = new Set(
            conteudosAtuais.map(conteudo => conteudo.id)
        );

        const idsRecebidos = ordem.map(item => item.id);

        const idsUnicos = new Set(idsRecebidos);

        if (idsUnicos.size !== idsRecebidos.length) {
            const erro = new Error(
                'A ordem não pode conter conteúdos repetidos.'
            );
            erro.status = 400;
            throw erro;
        }

        for (const id of idsRecebidos) {

            if (!idsAtuais.has(id)) {
                const erro = new Error(
                    'Um ou mais conteúdos informados não pertencem à cena.'
                );
                erro.status = 400;
                throw erro;
            }
        }

        const dados = await CenaConteudo.reordenar(
            cena_id,
            ordem,
            client
        );

        await client.query('COMMIT');

        return dados;

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
  }

    static async alterarTipoConteudo(id, tipo_conteudo) {

        const cenaConteudo = await CenaConteudo.buscarPorId(id);

        if (!cenaConteudo) {
            const erro = new Error('Conteúdo da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        const ModeloConteudo = MODELOS_CONTEUDO[tipo_conteudo];

        if (!ModeloConteudo) {
            const erro = new Error('Tipo de conteúdo inválido.');
            erro.status = 400;
            throw erro;
        }

        const conteudo = await ModeloConteudo.buscarPorId(
            cenaConteudo.conteudo_id
        );

        if (!conteudo) {
            const erro = new Error('Conteúdo não encontrado.');
            erro.status = 404;
            throw erro;
        }

        if (conteudo.livro_id !== cenaConteudo.livro_id) {
            const erro = new Error(
                'O conteúdo não pertence à obra da associação.'
            );
            erro.status = 400;
            throw erro;
        }

        return await CenaConteudo.alterarTipoConteudo(
            id,
            tipo_conteudo
        );
    }

    static async desativar(id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const cenaConteudo = await CenaConteudo.buscarPorId(id, client);
            if (!cenaConteudo) {
                const erro = new Error('Conteúdo da cena não encontrado.');
                erro.status = 404;
                throw erro;
            }
            const retirado = await CenaConteudo.desativar(id, client);
            await CenaConteudo.compactarOrdem(cenaConteudo.cena_id, client);
            await client.query('COMMIT');
            return retirado;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = CenaConteudoService;
