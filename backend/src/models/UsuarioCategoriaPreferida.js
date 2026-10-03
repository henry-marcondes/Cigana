const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    ucp.id,
    ucp.usuario_id,
    ucp.categoria_id,
    c.biblioteca_id,
    c.categoria_pai_id,
    c.nome,
    c.slug,
    c.descricao,
    c.ordem_exibicao,
    ucp.criado_em,
    ucp.atualizado_em
`;

class UsuarioCategoriaPreferida {

    static async listarPorUsuario(usuarioId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM usuario_categorias_preferidas ucp
             INNER JOIN categorias c
                ON c.id = ucp.categoria_id
             WHERE ucp.usuario_id = $1
               AND c.ativo = TRUE
             ORDER BY c.ordem_exibicao, c.nome
        `, [usuarioId]);

        return result.rows;
    }

    static async buscarPorId(id, usuarioId = null) {
        const parametros = [id];

        let filtroUsuario = '';

        if (usuarioId) {
            parametros.push(usuarioId);
            filtroUsuario = 'AND ucp.usuario_id = $2';
        }

        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM usuario_categorias_preferidas ucp
            INNER JOIN categorias c
                ON c.id = ucp.categoria_id
            WHERE ucp.id = $1
                AND c.ativo = TRUE
                ${filtroUsuario}
            `, parametros);

        return result.rows[0];
    }

    static async adicionar(usuarioId, categoriaId, client = pool) {
        const result = await client.query(`
            INSERT INTO usuario_categorias_preferidas (
                usuario_id,
                categoria_id
            )
            VALUES ($1, $2)
            RETURNING
                id,
                usuario_id,
                categoria_id,
                criado_em,
                atualizado_em
        `, [
            usuarioId,
            categoriaId
        ]);

        return result.rows[0];
    }

    static async remover(id, usuarioId, client = pool) {
        const result = await client.query(`
            DELETE FROM usuario_categorias_preferidas
            WHERE id = $1
                AND usuario_id = $2
            RETURNING
                id,
                usuario_id,
                categoria_id,
                criado_em,
                atualizado_em
        `, [ id, usuarioId ]);

        return result.rows[0];
    }
}
module.exports = UsuarioCategoriaPreferida;
