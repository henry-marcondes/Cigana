const CenaTexto = require('../models/CenaTexto');
const Cena = require('../models/Cena');
const CenaConteudo = require('../models/CenaConteudo');
const pool = require('../db/connection');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const { resolverLivroDoConteudo } = require('./arquivoCenaService');
const ArquivoMidiaService = require('./arquivoMidiaService');

const armazenamento = require('../storage/armazenamentoArquivosMidiaLocal');

function erroApi(mensagem, status) {
    const erro = new Error(mensagem);
    erro.status = status;
    erro.statusCode = status;
    return erro;
}

function caminhoSeguroTexto(textoUrl) {
    if (typeof textoUrl !== 'string' || !textoUrl.startsWith('/media/textos/')) {
        throw erroApi('Este texto não referencia um arquivo Markdown local permitido.', 400);
    }

    let url;
    try {
        url = new URL(textoUrl, 'http://cigana.local');
    } catch {
        throw erroApi('Referência do arquivo Markdown inválida.', 400);
    }

    if (url.origin !== 'http://cigana.local' || url.search || url.hash) {
        throw erroApi('Referência do arquivo Markdown inválida.', 400);
    }

    let relativo;
    try {
        relativo = decodeURIComponent(url.pathname.slice('/media/textos/'.length));
    } catch {
        throw erroApi('Referência do arquivo Markdown inválida.', 400);
    }

    if (!relativo || relativo.includes('\\') || relativo.includes('\0')) {
        throw erroApi('Referência do arquivo Markdown inválida.', 400);
    }

    const arquivo = path.resolve(DIRETORIO_TEXTOS, relativo);
    const caminhoRelativo = path.relative(DIRETORIO_TEXTOS, arquivo);
    if (!caminhoRelativo || caminhoRelativo.startsWith(`..${path.sep}`) || path.isAbsolute(caminhoRelativo)) {
        throw erroApi('Referência do arquivo Markdown fora do diretório permitido.', 400);
    }

    const relativoCanonico = caminhoRelativo
        .split(path.sep)
        .map((parte) => encodeURIComponent(parte))
        .join('/');
    if (textoUrl !== `/media/textos/${relativoCanonico}`) {
        throw erroApi('A URL do arquivo Markdown precisa estar em formato canônico.', 400);
    }

    return arquivo;
}

async function verificarArquivoRegularDentroDaRaiz(arquivo) {
    let real;
    let informacoes;
    try {
        [real, informacoes] = await Promise.all([
            fs.realpath(arquivo),
            fs.stat(arquivo)
        ]);
    } catch {
        throw erroApi('Arquivo Markdown não encontrado.', 404);
    }

    const relativo = path.relative(DIRETORIO_TEXTOS, real);
    if (real !== arquivo || relativo.startsWith(`..${path.sep}`) || path.isAbsolute(relativo) || !informacoes.isFile()) {
        throw erroApi('Arquivo Markdown fora do diretório permitido.', 400);
    }
    return real;
}

async function comBloqueioArquivo(chave, operacao) {
    const client = await pool.connect();
    let bloqueado = false;
    try {
        await client.query('SELECT pg_advisory_lock(hashtext($1))', [chave]);
        bloqueado = true;
        return await operacao();
    } finally {
        if (bloqueado) {
            await client.query('SELECT pg_advisory_unlock(hashtext($1))', [chave])
                .catch((erro) => console.error('Falha ao liberar bloqueio do arquivo Markdown.', erro.message));
        }
        client.release();
    }
}

class CenaTextoService {

    static async associarArquivoMarkdown({ cena_id, arquivo_id }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const cena = await client.query(`SELECT c.id, cap.livro_id FROM cenas c
                JOIN capitulos cap ON cap.id=c.capitulo_id
                WHERE c.id=$1 AND c.ativo=TRUE AND cap.ativo=TRUE FOR UPDATE OF c`, [cena_id]);
            if (!cena.rows[0]) throw erroApi('Cena não encontrada.', 404);
            const livroId = cena.rows[0].livro_id;
            const arquivo = await client.query(`SELECT id, nome_original, mime_type, ativo FROM arquivos_midia
                WHERE id=$1 AND livro_id=$2 FOR UPDATE`, [arquivo_id, livroId]);
            const arquivoRow = arquivo.rows[0];
            if (!arquivoRow || !arquivoRow.ativo) throw erroApi('Arquivo ativo não encontrado nesta obra.', 404);
            if (!/\.(md|markdown)$/i.test(arquivoRow.nome_original) || !['text/markdown', 'text/plain', 'text/x-markdown'].includes(arquivoRow.mime_type)) {
                throw erroApi('Selecione um arquivo Markdown.', 400);
            }
            const uso = await client.query(`SELECT 1 FROM cena_textos WHERE arquivo_id=$1
                UNION ALL SELECT 1 FROM cena_imagens WHERE arquivo_id=$1
                UNION ALL SELECT 1 FROM cena_audios WHERE arquivo_id=$1
                UNION ALL SELECT 1 FROM cena_videos WHERE arquivo_id=$1
                UNION ALL SELECT 1 FROM livro_documentos WHERE arquivo_id=$1
                LIMIT 1`, [arquivo_id]);
            if (uso.rowCount) throw erroApi('Este arquivo já foi utilizado e não pode ser associado novamente.', 409);
            const texto = await CenaTexto.criar({
                cena_id, livro_id: livroId, arquivo_id,
                titulo: arquivoRow.nome_original.replace(/\.(md|markdown)$/i, ''),
                texto_url: null
            }, client);
            const proxima = await client.query(`SELECT COALESCE(MAX(ordem_exibicao),0)+1 AS ordem
                FROM cena_conteudos WHERE cena_id=$1 AND ativo=TRUE`, [cena_id]);
            const associacao = await CenaConteudo.criar({
                cena_id, livro_id: livroId, tipo_conteudo: 'TEXTO',
                conteudo_id: texto.id, ordem_exibicao: proxima.rows[0].ordem
            }, client);
            await client.query('COMMIT');
            return { texto, associacao };
        } catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23505') throw erroApi('Este arquivo já foi associado a um conteúdo narrativo.', 409);
            throw error;
        } finally { client.release(); }
    }

    static async listarPorCena(cena_id) {

        const cena = await Cena.buscarPorId(cena_id);

        if (!cena) {
            const erro = new Error('Cena não encontrada.');
            erro.status = 404;
            throw erro;
        }

        return await CenaTexto.listarPorCena(cena_id);
    }

    static async buscarPorId(id) {

        const cenaTexto = await CenaTexto.buscarPorId(id);

        if (!cenaTexto) {
            const erro = new Error('Texto da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        return cenaTexto;
    }

    static async criar(dados) {

        const { cena_id, titulo, texto_url, arquivo_id, conteudo } = dados;
        const livro_id = await resolverLivroDoConteudo(dados, pool);

        if (arquivo_id) throw erroApi('Use a operação de associação editorial para vincular o arquivo à cena.', 400);
        if (!cena_id) {
            if (typeof titulo !== 'string' || !titulo.trim() || typeof conteudo !== 'string') {
                throw erroApi('Texto independente exige título e conteúdo textual.', 400);
            }
            return CenaTexto.criar({ cena_id: null, livro_id, titulo: titulo.trim(), conteudo, texto_url: null });
        }
        if (!texto_url) throw erroApi('Informe texto_url para o texto associado à cena.', 400);
        return await CenaTexto.criar({ cena_id, livro_id, titulo, texto_url });
    }

    static async alterar(id, dados) {

        const cenaTexto = await CenaTexto.buscarPorId(id);

        if (!cenaTexto) {
            const erro = new Error('Texto da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        if (cenaTexto.arquivo_id) {
            throw erroApi('A referência de um texto gerenciado não pode ser alterada pelo fluxo de URL legado.', 409);
        }

        return await CenaTexto.alterar(id, {
            texto_url: dados.texto_url
        });
    }

    static async salvarConteudo(id, livroId, conteudo, hashEsperado) {
        if (typeof conteudo !== 'string') {
            throw erroApi('O conteúdo Markdown deve ser uma string.', 400);
        }
        if (typeof hashEsperado !== 'string' || !/^[a-f0-9]{64}$/i.test(hashEsperado)) {
            throw erroApi('Hash de versão esperado inválido.', 400);
        }

        const cenaTexto = await CenaTexto.buscarPorId(id);
        if (!cenaTexto) {
            throw erroApi('Texto da cena não encontrado.', 404);
        }

        if (cenaTexto.arquivo_id) {
            const arquivo = await pool.query(`SELECT id, livro_id, chave_armazenamento, mime_type, nome_original, hash_sha256
                FROM arquivos_midia WHERE id=$1 AND ativo=TRUE`, [cenaTexto.arquivo_id]);
            const registro = arquivo.rows[0];
            if (!registro || registro.livro_id !== livroId) throw erroApi('Arquivo Markdown não encontrado nesta obra.', 404);
            if (!/\.(md|markdown)$/i.test(registro.nome_original) || !['text/markdown', 'text/plain', 'text/x-markdown'].includes(registro.mime_type)) {
                throw erroApi('O arquivo associado não é Markdown.', 409);
            }
            return comBloqueioArquivo(registro.id, async () => {
                if (registro.hash_sha256 !== hashEsperado.toLowerCase()) throw erroApi('O arquivo foi alterado desde a última leitura. Recarregue o conteúdo antes de salvar.', 409);
                const objeto = await armazenamento.abrirObjeto(registro.livro_id, registro.chave_armazenamento);
                const partes = [];
                for await (const parte of objeto.criarStream()) partes.push(parte);
                const hashAtual = crypto.createHash('sha256').update(Buffer.concat(partes)).digest('hex');
                if (hashAtual !== hashEsperado.toLowerCase()) throw erroApi('O arquivo foi alterado desde a última leitura. Recarregue o conteúdo antes de salvar.', 409);
                const atualizado = await ArquivoMidiaService.substituirConteudo(
                    registro.id, registro.livro_id,
                    Readable.from([conteudo]),
                    { hashEsperado, markdownGerenciado: true }
                );
                return { texto_id: id, arquivo_id: atualizado.id, hash_sha256: atualizado.hash_sha256 };
            });
        }
        const caminho = caminhoSeguroTexto(cenaTexto.texto_url);
        const real = await verificarArquivoRegularDentroDaRaiz(caminho);

        const referenciaEmOutraObra = await pool.query(`
            SELECT 1
              FROM cena_textos ct
              JOIN cenas c ON c.id = ct.cena_id
              JOIN capitulos cap ON cap.id = c.capitulo_id
             WHERE ct.texto_url = $1
               AND ct.ativo = TRUE
               AND cap.livro_id <> $2
             LIMIT 1
        `, [cenaTexto.texto_url, livroId]);
        if (referenciaEmOutraObra.rowCount > 0) {
            throw erroApi('Este arquivo também está associado a outra obra e não pode ser alterado por este fluxo.', 403);
        }

        return comBloqueioArquivo(real, async () => {
            const atual = await fs.readFile(real);
            const hashAtual = crypto.createHash('sha256').update(atual).digest('hex');
            if (hashAtual !== hashEsperado.toLowerCase()) {
                throw erroApi('O arquivo foi alterado desde a última leitura. Recarregue o conteúdo antes de salvar.', 409);
            }

            const temporario = path.join(
                path.dirname(real),
                `.cigana-${crypto.randomUUID()}.tmp`
            );
            let renomeado = false;
            try {
                await fs.writeFile(temporario, conteudo, { flag: 'wx', mode: 0o600 });
                await fs.rename(temporario, real);
                renomeado = true;
            } finally {
                if (!renomeado) {
                    await fs.rm(temporario, { force: true }).catch(() => {});
                }
            }

            const hash = crypto.createHash('sha256').update(conteudo, 'utf8').digest('hex');
            return { texto_id: id, texto_url: cenaTexto.texto_url, hash_sha256: hash };
        });
    }

    static async desativar(id) {
        const client = await pool.connect();
        let transacaoIniciada = false;

        try {
            await client.query('BEGIN');
            transacaoIniciada = true;

            const cenaTexto = await CenaTexto.buscarPorIdIncluindoInativo(
                id,
                client,
                true
            );

            if (!cenaTexto) {
                const erro = new Error('Texto da cena não encontrado.');
                erro.status = 404;
                throw erro;
            }

            const textoDesativado = cenaTexto.ativo
                ? await CenaTexto.desativar(id, client)
                : cenaTexto;

            if (!textoDesativado) {
                const erro = new Error('Texto da cena não encontrado.');
                erro.status = 404;
                throw erro;
            }

            await CenaConteudo.desativarPorConteudo(
                'TEXTO',
                id,
                client
            );

            await client.query('COMMIT');
            transacaoIniciada = false;

            return textoDesativado;
        } catch (error) {
            if (transacaoIniciada) {
                await client.query('ROLLBACK');
            }

            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = CenaTextoService;
