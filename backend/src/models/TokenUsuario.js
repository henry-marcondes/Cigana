const pool = require('../db/connection');

class TokenUsuario {

    static async criar({
        usuario_id,
        finalidade,
        token_hash,
        expira_em
    }) {
        const query = `
            INSERT INTO tokens_usuario (
                usuario_id,
                finalidade,
                token_hash,
                expira_em
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const values = [
            usuario_id,
            finalidade,
            token_hash,
            expira_em
        ];

        const { rows } = await pool.query(query, values);

        return rows[0];
    }

    static async buscarPorId(id) {
        const query = `
            SELECT *
            FROM tokens_usuario
            WHERE id = $1;
        `;

        const { rows } = await pool.query(query, [id]);

        return rows[0] || null;
    }

    static async buscarAtivo(usuario_id, finalidade) {
        const query = `
            SELECT *
            FROM tokens_usuario
            WHERE usuario_id = $1
              AND finalidade = $2
              AND ativo = TRUE
              AND usado_em IS NULL
            ORDER BY criado_em DESC
            LIMIT 1;
        `;

        const { rows } = await pool.query(query, [
            usuario_id,
            finalidade
        ]);

        return rows[0] || null;
    }

    static async incrementarTentativas(id) {
        const query = `
            UPDATE tokens_usuario
            SET
                tentativas = tentativas + 1,
                atualizado_em = NOW()
            WHERE id = $1
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [id]);

        return rows[0] || null;
    }

    static async marcarComoUsado(id) {
        const query = `
            UPDATE tokens_usuario
            SET
                usado_em = NOW(),
                ativo = FALSE,
                atualizado_em = NOW()
            WHERE id = $1
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [id]);

        return rows[0] || null;
    }

    static async desativar(id) {
        const query = `
            UPDATE tokens_usuario
            SET
                ativo = FALSE,
                atualizado_em = NOW()
            WHERE id = $1
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [id]);

        return rows[0] || null;
    }
}

module.exports = TokenUsuario;
