const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    nome,
    codigo,
    descricao,
    ativo,
    criado_em,
    atualizado_em
`;

class Permissao {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM permissoes
             WHERE ativo = TRUE
             ORDER BY nome ASC
        `);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM permissoes
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorCodigo(codigo) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM permissoes
             WHERE codigo = $1
               AND ativo = TRUE
        `, [codigo]);

        return result.rows[0];
    }

    static async criar(permissao, client = pool) {

        const {
            nome,
            codigo,
            descricao
        } = permissao;

        const result = await client.query(`
            INSERT INTO permissoes (
                nome,
                codigo,
                descricao
            )
            VALUES ($1, $2, $3)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            nome,
            codigo,
            descricao
        ]);

        return result.rows[0];
    }

    static async alterarNome(id, nome, client = pool) {

        const result = await client.query(`
            UPDATE permissoes
               SET nome = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [nome, id]);

        return result.rows[0];
    }

    static async alterarCodigo(id, codigo, client = pool) {

        const result = await client.query(`
            UPDATE permissoes
               SET codigo = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [codigo, id]);

        return result.rows[0];
    }

    static async alterarDescricao(id, descricao, client = pool) {

        const result = await client.query(`
            UPDATE permissoes
               SET descricao = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [descricao, id]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE permissoes
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

module.exports = Permissao;
