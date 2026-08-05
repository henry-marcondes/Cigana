const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    cena_origem_id,
    cena_destino_id,
    texto,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class Escolha {

    static async listarPorCenaOrigem(cena_origem_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM escolhas
             WHERE cena_origem_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [cena_origem_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM escolhas
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async criar(escolha, client = pool) {

        const {
            cena_origem_id,
            cena_destino_id,
            texto,
            ordem_exibicao
        } = escolha;

        const result = await client.query(`
            INSERT INTO escolhas (
                cena_origem_id,
                cena_destino_id,
                texto,
                ordem_exibicao
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            cena_origem_id,
            cena_destino_id,
            texto,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarTexto(id, texto, client = pool) {

        const result = await client.query(`
            UPDATE escolhas
               SET texto = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [texto, id]);

        return result.rows[0];
    }

    static async alterarDestino(id, cena_destino_id, client = pool) {

        const result = await client.query(`
            UPDATE escolhas
               SET cena_destino_id = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [cena_destino_id, id]);

        return result.rows[0];
    }

    static async alterarOrdemExibicao(id, ordem_exibicao, client = pool) {

        const result = await client.query(`
            UPDATE escolhas
               SET ordem_exibicao = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [ordem_exibicao, id]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE escolhas
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

module.exports = Escolha;
