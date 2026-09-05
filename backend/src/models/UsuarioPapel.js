const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    usuario_id,
    papel_id,
    ativo,
    criado_em,
    atualizado_em
`;

class UsuarioPapel {

    static async listarPorUsuario(usuarioId) {
        const result = await pool.query(`
            SELECT
                up.id,
                up.usuario_id,
                up.papel_id,
                p.nome AS papel_nome,
                p.codigo AS papel_codigo,
                p.descricao AS papel_descricao,
                up.ativo,
                up.criado_em,
                up.atualizado_em
              FROM usuario_papeis up
              INNER JOIN papeis p
                ON p.id = up.papel_id
             WHERE up.usuario_id = $1
               AND up.ativo = TRUE
               AND p.ativo = TRUE
             ORDER BY p.nome ASC
        `, [usuarioId]);

        return result.rows;
    }

    static async listarPorPapel(papelId) {
        const result = await pool.query(`
            SELECT
                up.id,
                up.usuario_id,
                up.papel_id,
                u.email AS usuario_email,
                up.ativo,
                up.criado_em,
                up.atualizado_em
              FROM usuario_papeis up
              INNER JOIN usuarios u
                ON u.id = up.usuario_id
             WHERE up.papel_id = $1
               AND up.ativo = TRUE
             ORDER BY u.email ASC
        `, [papelId]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM usuario_papeis
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorUsuarioEPapel(usuarioId, papelId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM usuario_papeis
             WHERE usuario_id = $1
               AND papel_id = $2
               AND ativo = TRUE
        `, [usuarioId, papelId]);

        return result.rows[0];
    }

    static async criar(usuarioId, papelId, client = pool) {
        const result = await client.query(`
            INSERT INTO usuario_papeis (
                usuario_id,
                papel_id
            )
            VALUES ($1, $2)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [usuarioId, papelId]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {
        const result = await client.query(`
            UPDATE usuario_papeis
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

module.exports = UsuarioPapel;
