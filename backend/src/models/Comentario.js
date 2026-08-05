const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    usuario_id,
    livro_id,
    texto,
    ativo,
    criado_em,
    atualizado_em
`;

class Comentario {

    static async listarPorLivro(livro_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM comentarios
             WHERE livro_id = $1
               AND ativo = TRUE
             ORDER BY criado_em DESC
        `, [livro_id]);

        return result.rows;
    }

    static async listarPorUsuario(usuario_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM comentarios
             WHERE usuario_id = $1
               AND ativo = TRUE
             ORDER BY criado_em DESC
        `, [usuario_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM comentarios
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async criar(comentario, client = pool) {

        const {
            usuario_id,
            livro_id,
            texto
        } = comentario;

        const result = await client.query(`
            INSERT INTO comentarios (
                usuario_id,
                livro_id,
                texto
            )
            VALUES ($1,$2,$3)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            usuario_id,
            livro_id,
            texto
        ]);

        return result.rows[0];
    }

    static async alterarTexto(id, texto, client = pool) {

        const result = await client.query(`
            UPDATE comentarios
               SET texto = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            texto,
            id
        ]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE comentarios
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

module.exports = Comentario;
