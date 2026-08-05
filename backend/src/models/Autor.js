const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    usuario_id,
    nome_publico,
    biografia,
    foto_url,
    ativo,
    criado_em,
    atualizado_em
`;

class Autor {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM autores
             WHERE ativo = TRUE
             ORDER BY criado_em DESC
        `);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM autores
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorUsuarioId(usuario_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM autores
             WHERE usuario_id = $1
               AND ativo = TRUE
        `, [usuario_id]);

        return result.rows[0];
    }

    static async criar(autor, client = pool) {

        const {
            usuario_id,
            nome_publico,
            biografia,
            foto_url
        } = autor;

        const result = await client.query(`
            INSERT INTO autores (
                usuario_id,
                nome_publico,
                biografia,
                foto_url
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            usuario_id,
            nome_publico,
            biografia,
            foto_url
        ]);

        return result.rows[0];
    }

    static async alterarNomePublico(id, nome_publico, client = pool) {

        const result = await client.query(`
            UPDATE autores
               SET nome_publico = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [nome_publico, id]);

        return result.rows[0];
    }

    static async alterarBiografia(id, biografia, client = pool) {

        const result = await client.query(`
            UPDATE autores
               SET biografia = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [biografia, id]);

        return result.rows[0];
    }

    static async alterarFoto(id, foto_url, client = pool) {

        const result = await client.query(`
            UPDATE autores
               SET foto_url = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [foto_url, id]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE autores
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

module.exports = Autor;
