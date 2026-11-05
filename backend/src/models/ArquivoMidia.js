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
    static async listarPorLivro(livro_id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS_PUBLICOS}
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
