const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    usuario_id,
    livro_id,
    ativo,
    criado_em,
    atualizado_em
`;

class Favorito {

    static async listarPorUsuario(usuario_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM favoritos
             WHERE usuario_id = $1
               AND ativo = TRUE
             ORDER BY criado_em DESC
        `, [usuario_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM favoritos
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorUsuarioELivro(usuario_id, livro_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM favoritos
             WHERE usuario_id = $1
               AND livro_id = $2
               AND ativo = TRUE
        `, [usuario_id, livro_id]);

        return result.rows[0];
    }

    static async criar(favorito, client = pool) {

        const {
            usuario_id,
            livro_id
        } = favorito;

        const result = await client.query(`
            INSERT INTO favoritos (
                usuario_id,
                livro_id
            )
            VALUES ($1, $2)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            usuario_id,
            livro_id
        ]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE favoritos
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

module.exports = Favorito;
