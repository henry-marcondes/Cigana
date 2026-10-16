const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    usuario_id,
    livro_id,
    nota,
    comentario,
    ativo,
    criado_em,
    atualizado_em
`;

class Avaliacao {

    static async listarPorLivro(livro_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM avaliacoes
             WHERE livro_id = $1
               AND ativo = TRUE
             ORDER BY criado_em DESC
        `, [livro_id]);

        return result.rows;
    }

    static async listarPorUsuario(usuario_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM avaliacoes
             WHERE usuario_id = $1
               AND ativo = TRUE
             ORDER BY criado_em DESC
        `, [usuario_id]);

        return result.rows;
    }

    static async buscarPorId(id, usuario_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM avaliacoes
             WHERE id = $1
               AND usuario_id = $2
               AND ativo = TRUE
        `, [id, usuario_id]);

        return result.rows[0];
    }

    static async buscarPorUsuarioELivro(usuario_id, livro_id) {

        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM avaliacoes
             WHERE usuario_id = $1
               AND livro_id = $2
               AND ativo = TRUE
        `, [
            usuario_id,
            livro_id
        ]);

        return result.rows[0];
    }

    static async criar(avaliacao, client = pool) {

        const {
            usuario_id,
            livro_id,
            nota,
            comentario
        } = avaliacao;

        const result = await client.query(`
            INSERT INTO avaliacoes (
                usuario_id,
                livro_id,
                nota,
                comentario
            )
            VALUES ($1,$2,$3,$4)
            ON CONFLICT (usuario_id, livro_id)
            DO UPDATE SET
                ativo = TRUE,
                atualizado_em = NOW()
            WHERE avaliacoes.ativo = FALSE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            usuario_id,
            livro_id,
            nota,
            comentario
        ]);

        if (result.rows[0]) return result.rows[0];

        const erro = new Error('Já existe uma avaliação ativa para esta obra.');
        erro.statusCode = 409;
        throw erro;
    }

    static async alterarNota(id, usuario_id, nota, client = pool) {

        const result = await client.query(`
            UPDATE avaliacoes
               SET nota = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND usuario_id = $3
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            nota,
            id,
            usuario_id
        ]);

        return result.rows[0];
    }

    static async alterarComentario(id, usuario_id, comentario, client = pool) {

        const result = await client.query(`
            UPDATE avaliacoes
               SET comentario = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND usuario_id = $3
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            comentario,
            id,
            usuario_id
        ]);

        return result.rows[0];
    }

    static async desativar(id, usuario_id, client = pool) {

        const result = await client.query(`
            UPDATE avaliacoes
               SET ativo = FALSE,
                   atualizado_em = NOW()
             WHERE id = $1
               AND usuario_id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [id, usuario_id]);

        return result.rows[0];
    }

}

module.exports = Avaliacao;
