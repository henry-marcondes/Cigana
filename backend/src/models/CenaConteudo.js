const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    cena_id,
    tipo_conteudo,
    conteudo_id,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class CenaConteudo {

    static async listarPorCena(cena_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_conteudos
             WHERE cena_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [cena_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_conteudos
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async criar(cenaConteudo, client = pool) {

        const {
            cena_id,
            tipo_conteudo,
            conteudo_id,
            ordem_exibicao
        } = cenaConteudo;

        const result = await client.query(`
            INSERT INTO cena_conteudos (
                cena_id,
                tipo_conteudo,
                conteudo_id,
                ordem_exibicao
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            cena_id,
            tipo_conteudo,
            conteudo_id,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarOrdem(id, ordem_exibicao, client = pool) {

        const result = await client.query(`
            UPDATE cena_conteudos
               SET ordem_exibicao = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            ordem_exibicao,
            id
        ]);

        return result.rows[0];
    }

    static async alterarTipoConteudo(id, tipo_conteudo, client = pool) {

        const result = await client.query(`
            UPDATE cena_conteudos
               SET tipo_conteudo = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            tipo_conteudo,
            id
        ]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE cena_conteudos
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

module.exports = CenaConteudo;
