const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    cena_id,
    titulo,
    livro_id,
    arquivo_id,
    texto_url,
    conteudo,
    ativo,
    criado_em,
    atualizado_em
`;

class CenaTexto {

    static async listarPorCena(cena_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_textos
             WHERE cena_id = $1
               AND ativo = TRUE
             ORDER BY criado_em
        `, [cena_id]);

        return result.rows;
    }

    static async buscarPorId(id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS_PUBLICOS},
                   EXISTS (
                       SELECT 1
                         FROM livro_documentos ld
                        WHERE ld.livro_id = cena_textos.livro_id
                          AND ld.arquivo_id = cena_textos.arquivo_id
                          AND ld.ativo = TRUE
                   ) AS documento_markdown_ativo
              FROM cena_textos
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorIdIncluindoInativo(
        id,
        client = pool,
        bloquear = false
    ) {
        const result = await client.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_textos
             WHERE id = $1
             ${bloquear ? 'FOR UPDATE' : ''}
        `, [id]);

        return result.rows[0];
    }

    static async criar(cenaTexto, client = pool) {

        const {
            cena_id,
            titulo,
            texto_url,
            livro_id,
            arquivo_id,
            conteudo
        } = cenaTexto;

        const result = await client.query(`
            INSERT INTO cena_textos (
                cena_id,
                titulo,
                texto_url,
                livro_id,
                arquivo_id,
                conteudo
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            cena_id,
            titulo ?? null,
            texto_url ?? null,
            livro_id ?? null,
            arquivo_id ?? null,
            conteudo ?? null
        ]);

        return result.rows[0];
    }

    static async alterar(id, cenaTexto, client = pool) {

        const {
            texto_url
        } = cenaTexto;

        const result = await client.query(`
            UPDATE cena_textos
               SET texto_url = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            texto_url,
            id
        ]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE cena_textos
               SET ativo = FALSE,
                   atualizado_em = NOW()
             WHERE id = $1
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [id]);

        return result.rows[0];
    }

}

module.exports = CenaTexto;
