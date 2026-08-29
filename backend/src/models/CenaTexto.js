const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    cena_id,
    texto_url,
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

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_textos
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async criar(cenaTexto, client = pool) {

        const {
            cena_id,
            texto_url
        } = cenaTexto;

        const result = await client.query(`
            INSERT INTO cena_textos (
                cena_id,
                texto_url
            )
            VALUES ($1, $2)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            cena_id,
            texto_url
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
