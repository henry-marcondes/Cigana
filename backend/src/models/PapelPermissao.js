const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    papel_id,
    permissao_id,
    ativo,
    criado_em,
    atualizado_em
`;

class PapelPermissao {

    static async listarPorPapel(papelId) {
        const result = await pool.query(`
            SELECT
                pp.id,
                pp.papel_id,
                pp.permissao_id,
                p.nome AS permissao_nome,
                p.codigo AS permissao_codigo,
                p.descricao AS permissao_descricao,
                pp.ativo,
                pp.criado_em,
                pp.atualizado_em
              FROM papel_permissoes pp
              INNER JOIN permissoes p
                ON p.id = pp.permissao_id
             WHERE pp.papel_id = $1
               AND pp.ativo = TRUE
               AND p.ativo = TRUE
             ORDER BY p.nome ASC
        `, [papelId]);

        return result.rows;
    }

    static async listarPorPermissao(permissaoId) {
        const result = await pool.query(`
            SELECT
                pp.id,
                pp.papel_id,
                pp.permissao_id,
                p.nome AS papel_nome,
                p.codigo AS papel_codigo,
                p.descricao AS papel_descricao,
                pp.ativo,
                pp.criado_em,
                pp.atualizado_em
              FROM papel_permissoes pp
              INNER JOIN papeis p
                ON p.id = pp.papel_id
             WHERE pp.permissao_id = $1
               AND pp.ativo = TRUE
               AND p.ativo = TRUE
             ORDER BY p.nome ASC
        `, [permissaoId]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM papel_permissoes
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorPapelEPermissao(papelId, permissaoId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM papel_permissoes
             WHERE papel_id = $1
               AND permissao_id = $2
               AND ativo = TRUE
        `, [papelId, permissaoId]);

        return result.rows[0];
    }

    static async criar(papelId, permissaoId, client = pool) {
        const result = await client.query(`
            INSERT INTO papel_permissoes (
                papel_id,
                permissao_id
            )
            VALUES ($1, $2)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [papelId, permissaoId]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {
        const result = await client.query(`
            UPDATE papel_permissoes
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

module.exports = PapelPermissao;
