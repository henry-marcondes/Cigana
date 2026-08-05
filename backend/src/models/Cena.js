const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    capitulo_id,
    titulo,
    slug,
    texto,
    ordem_exibicao,
    cena_inicial,
    ativo,
    criado_em,
    atualizado_em
`;

class Cena {

    static async listarPorCapitulo(capitulo_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cenas
             WHERE capitulo_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [capitulo_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cenas
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorSlug(capitulo_id, slug) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cenas
             WHERE capitulo_id = $1
               AND LOWER(slug) = LOWER($2)
               AND ativo = TRUE
        `, [capitulo_id, slug]);

        return result.rows[0];
    }

    static async buscarCenaInicial(capitulo_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cenas
             WHERE capitulo_id = $1
               AND cena_inicial = TRUE
               AND ativo = TRUE
        `, [capitulo_id]);

        return result.rows[0];
    }

    static async criar(cena, client = pool) {

        const {
            capitulo_id,
            titulo,
            slug,
            texto,
            ordem_exibicao,
            cena_inicial
        } = cena;

        const result = await client.query(`
            INSERT INTO cenas (
                capitulo_id,
                titulo,
                slug,
                texto,
                ordem_exibicao,
                cena_inicial
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            capitulo_id,
            titulo,
            slug,
            texto,
            ordem_exibicao,
            cena_inicial
        ]);

        return result.rows[0];
    }

    static async alterarInformacoes(id, cena, client = pool) {

        const {
            titulo,
            slug,
            texto,
            ordem_exibicao
        } = cena;

        const result = await client.query(`
            UPDATE cenas
               SET titulo = $1,
                   slug = $2,
                   texto = $3,
                   ordem_exibicao = $4,
                   atualizado_em = NOW()
             WHERE id = $5
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            titulo,
            slug,
            texto,
            ordem_exibicao,
            id
        ]);

        return result.rows[0];
    }

    static async definirCenaInicial(id, client = pool) {

        await client.query(`
            UPDATE cenas
               SET cena_inicial = FALSE,
                   atualizado_em = NOW()
             WHERE capitulo_id = (
                 SELECT capitulo_id
                   FROM cenas
                  WHERE id = $1
             )
        `, [id]);

        const result = await client.query(`
            UPDATE cenas
               SET cena_inicial = TRUE,
                   atualizado_em = NOW()
             WHERE id = $1
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [id]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE cenas
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

module.exports = Cena;
