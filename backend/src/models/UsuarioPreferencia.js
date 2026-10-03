const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    up.id,
    up.usuario_id,
    up.preferencia_id,
    p.grupo,
    p.codigo,
    p.nome,
    p.descricao,
    p.ordem_exibicao,
    up.criado_em,
    up.atualizado_em
`;

class UsuarioPreferencia {

    static async listarPorUsuario(usuarioId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM usuario_preferencias up
             INNER JOIN preferencias p
                ON p.id = up.preferencia_id
             WHERE up.usuario_id = $1
               AND p.ativo = TRUE
             ORDER BY p.grupo, p.ordem_exibicao, p.nome
        `, [usuarioId]);

        return result.rows;
    }

    static async buscarPorId(id, usuarioId = null) {
        const parametros = [id];

    let filtroUsuario = '';

    if (usuarioId) {
        parametros.push(usuarioId);
        filtroUsuario = 'AND up.usuario_id = $2';
    }
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM usuario_preferencias up
             INNER JOIN preferencias p
                ON p.id = up.preferencia_id
             WHERE up.id = $1
               AND p.ativo = TRUE
               ${filtroUsuario}
        `, parametros);

        return result.rows[0];
    }

    static async adicionar(usuarioId, preferenciaId, client = pool) {
        const result = await client.query(`
            INSERT INTO usuario_preferencias (
                usuario_id,
                preferencia_id
            )
            VALUES ($1, $2)
            RETURNING
                id,
                usuario_id,
                preferencia_id,
                criado_em,
                atualizado_em
        `, [
            usuarioId,
            preferenciaId
        ]);

        return result.rows[0];
    }

    static async remover(id, usuarioId, client = pool) {
        const result = await client.query(`
            DELETE FROM usuario_preferencias
            WHERE id = $1
            AND usuario_id = $2
            RETURNING
                id,
                usuario_id,
                preferencia_id,
                criado_em,
                atualizado_em
        `, [
            id, usuarioId
        ]);

        return result.rows[0];
    }

}


module.exports = UsuarioPreferencia;
