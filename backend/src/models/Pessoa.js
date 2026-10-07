const pool = require('../db/connection');

const CAMPOS = `
    id,
    usuario_id,
    tipo_pessoa,
    ativo,
    criado_em,
    atualizado_em
`;

class Pessoa {

    static async buscarPorUsuarioId(usuarioId) {
        const result = await pool.query(`
            SELECT ${CAMPOS}
            FROM pessoas
            WHERE usuario_id = $1
              AND ativo = TRUE
            LIMIT 1
        `, [usuarioId]);

        return result.rows[0] || null;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS}
            FROM pessoas
            WHERE id = $1
              AND ativo = TRUE
            LIMIT 1
        `, [id]);

        return result.rows[0] || null;
    }

    static async criar({
        usuarioId,
        tipoPessoa = null,
        client = pool
    }) {
        const result = await client.query(`
            INSERT INTO pessoas (
                usuario_id,
                tipo_pessoa
            )
            VALUES ($1, $2)
            RETURNING ${CAMPOS}
        `, [
            usuarioId,
            tipoPessoa
        ]);

        return result.rows[0];
    }

    static async atualizarTipoPessoa({
        id,
        tipoPessoa,
        client = pool
    }) {
        const result = await client.query(`
            UPDATE pessoas
            SET
                tipo_pessoa = $1,
                atualizado_em = NOW()
            WHERE id = $2
              AND ativo = TRUE
            RETURNING ${CAMPOS}
        `, [
            tipoPessoa,
            id
        ]);

        return result.rows[0] || null;
    }
}

module.exports = Pessoa;
