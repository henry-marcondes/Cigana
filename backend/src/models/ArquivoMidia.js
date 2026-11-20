const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    livro_id,
    pasta_id,
    nome_original,
    mime_type,
    tamanho_bytes,
    hash_sha256,
    ativo,
    criado_em,
    atualizado_em
`;

const CAMPOS_INTERNOS = `
    id,
    livro_id,
    pasta_id,
    nome_original,
    chave_armazenamento,
    mime_type,
    tamanho_bytes,
    hash_sha256,
    ativo,
    criado_em,
    atualizado_em
`;

class ArquivoMidia {
    static async buscarDadosArmazenamentoPorLivro(livro_id, client = pool) {
        const obraResult = await client.query(`
            SELECT id AS livro_id, cota_armazenamento_bytes
              FROM livros
             WHERE id = $1
               AND ativo = TRUE
        `, [livro_id]);

        if (!obraResult.rows[0]) return null;

        const arquivosResult = await client.query(`
            SELECT
                a.id,
                a.nome_original,
                a.mime_type,
                a.tamanho_bytes,
                a.ativo,
                a.criado_em,
                COALESCE(vinculos.associacoes, '[]'::jsonb) AS associacoes
              FROM arquivos_midia a
              LEFT JOIN LATERAL (
                    SELECT jsonb_agg(DISTINCT jsonb_build_object(
                        'tipo_conteudo', item.tipo_conteudo,
                        'conteudo_id', item.conteudo_id,
                        'titulo', item.titulo,
                        'capitulo_id', item.capitulo_id,
                        'capitulo_titulo', item.capitulo_titulo,
                        'cena_id', item.cena_id,
                        'cena_titulo', item.cena_titulo
                    )) AS associacoes
                      FROM (
                            SELECT
                                'TEXTO'::TEXT AS tipo_conteudo,
                                ct.id AS conteudo_id,
                                COALESCE(ct.titulo, a.nome_original, 'Texto') AS titulo,
                                cap.id AS capitulo_id,
                                cap.titulo AS capitulo_titulo,
                                c.id AS cena_id,
                                c.titulo AS cena_titulo
                              FROM cena_textos ct
                              JOIN cenas c ON c.id = ct.cena_id
                              JOIN capitulos cap ON cap.id = c.capitulo_id
                             WHERE ct.arquivo_id = a.id
                            UNION ALL
                            SELECT
                                'IMAGEM'::TEXT AS tipo_conteudo,
                                ci.id AS conteudo_id,
                                COALESCE(ci.titulo, ci.legenda, 'Imagem') AS titulo,
                                cap.id AS capitulo_id,
                                cap.titulo AS capitulo_titulo,
                                c.id AS cena_id,
                                c.titulo AS cena_titulo
                              FROM cena_imagens ci
                              JOIN cenas c ON c.id = ci.cena_id AND c.ativo = TRUE
                              JOIN capitulos cap ON cap.id = c.capitulo_id AND cap.ativo = TRUE
                             WHERE ci.arquivo_id = a.id
                               AND ci.ativo = TRUE
                               AND a.ativo = TRUE
                            UNION ALL
                            SELECT
                                'AUDIO'::TEXT,
                                ca.id,
                                COALESCE(ca.titulo, ca.legenda, 'Áudio'),
                                cap.id,
                                cap.titulo,
                                c.id,
                                c.titulo
                              FROM cena_audios ca
                              JOIN cenas c ON c.id = ca.cena_id AND c.ativo = TRUE
                              JOIN capitulos cap ON cap.id = c.capitulo_id AND cap.ativo = TRUE
                             WHERE ca.arquivo_id = a.id
                               AND ca.ativo = TRUE
                               AND a.ativo = TRUE
                            UNION ALL
                            SELECT
                                'VIDEO'::TEXT,
                                cv.id,
                                COALESCE(cv.titulo, cv.legenda, 'Vídeo'),
                                cap.id,
                                cap.titulo,
                                c.id,
                                c.titulo
                              FROM cena_videos cv
                              JOIN cenas c ON c.id = cv.cena_id AND c.ativo = TRUE
                              JOIN capitulos cap ON cap.id = c.capitulo_id AND cap.ativo = TRUE
                             WHERE cv.arquivo_id = a.id
                               AND cv.ativo = TRUE
                               AND a.ativo = TRUE
                      ) item
              ) vinculos ON TRUE
             WHERE a.livro_id = $1
             ORDER BY lower(a.nome_original), a.criado_em, a.id
        `, [livro_id]);

        return {
            ...obraResult.rows[0],
            arquivos: arquivosResult.rows
        };
    }

    static async buscarConsumoRegistradoPorLivro(livro_id, client = pool) {
        const result = await client.query(`
            SELECT COALESCE(SUM(tamanho_bytes), 0)::TEXT AS consumo_bytes
              FROM arquivos_midia
             WHERE livro_id = $1
        `, [livro_id]);

        return result.rows[0].consumo_bytes;
    }

    static async listarPorLivro(livro_id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS_PUBLICOS},
                   (
                       EXISTS (SELECT 1 FROM cena_textos ct WHERE ct.arquivo_id = arquivos_midia.id)
                       OR EXISTS (SELECT 1 FROM cena_imagens ci WHERE ci.arquivo_id = arquivos_midia.id)
                       OR EXISTS (SELECT 1 FROM cena_audios ca WHERE ca.arquivo_id = arquivos_midia.id)
                       OR EXISTS (SELECT 1 FROM cena_videos cv WHERE cv.arquivo_id = arquivos_midia.id)
                       OR EXISTS (SELECT 1 FROM capitulos cap WHERE cap.arquivo_capa_id = arquivos_midia.id AND cap.ativo = TRUE)
                       OR EXISTS (SELECT 1 FROM livro_documentos ld WHERE ld.arquivo_id = arquivos_midia.id)
                   ) AS utilizado
              FROM arquivos_midia
             WHERE livro_id = $1
               AND ativo = TRUE
             ORDER BY lower(nome_original), criado_em, id
        `, [livro_id]);

        return result.rows;
    }

    static async buscarPorId(id, client = pool, bloquear = false) {
        const result = await client.query(`
            SELECT ${CAMPOS_INTERNOS}
              FROM arquivos_midia
             WHERE id = $1
               AND ativo = TRUE
             ${bloquear ? 'FOR UPDATE' : ''}
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarLivroIdPorId(id, client = pool) {
        const result = await client.query(`
            SELECT livro_id
              FROM arquivos_midia
             WHERE id = $1
        `, [id]);

        return result.rows[0]?.livro_id || null;
    }

    static async criar(dados, client = pool) {
        const result = await client.query(`
            INSERT INTO arquivos_midia (
                livro_id,
                pasta_id,
                nome_original,
                chave_armazenamento,
                mime_type,
                tamanho_bytes,
                hash_sha256
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING ${CAMPOS_PUBLICOS}
        `, [
            dados.livro_id,
            dados.pasta_id,
            dados.nome_original,
            dados.chave_armazenamento,
            dados.mime_type,
            dados.tamanho_bytes,
            dados.hash_sha256
        ]);

        return result.rows[0];
    }

    static async renomear(id, nome_original, client = pool) {
        const result = await client.query(`
            UPDATE arquivos_midia
               SET nome_original = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [nome_original, id]);

        return result.rows[0] || null;
    }

    static async mover(id, pasta_id, client = pool) {
        const result = await client.query(`
            UPDATE arquivos_midia
               SET pasta_id = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [pasta_id, id]);

        return result.rows[0] || null;
    }

    static async substituirConteudo(id, conteudo, client = pool) {
        const result = await client.query(`
            UPDATE arquivos_midia
               SET chave_armazenamento = $1,
                   mime_type = $2,
                   tamanho_bytes = $3,
                   hash_sha256 = $4,
                   atualizado_em = NOW()
             WHERE id = $5
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [
            conteudo.chave_armazenamento,
            conteudo.mime_type,
            conteudo.tamanho_bytes,
            conteudo.hash_sha256,
            id
        ]);

        return result.rows[0] || null;
    }

    static async desativar(id, client = pool) {
        const result = await client.query(`
            UPDATE arquivos_midia
               SET ativo = FALSE,
                   atualizado_em = NOW()
             WHERE id = $1
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [id]);

        return result.rows[0] || null;
    }
}

module.exports = ArquivoMidia;
