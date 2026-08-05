const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    cena_id,
    titulo,
    legenda,
    texto_alternativo,
    imagem_url,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class CenaImagem {

    static async listarPorCena(cena_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_imagens
             WHERE cena_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [cena_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_imagens
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async criar(cenaImagem, client = pool) {

        const {
            cena_id,
            titulo,
            legenda,
            texto_alternativo,
            imagem_url,
            ordem_exibicao
        } = cenaImagem;

        const result = await client.query(`
            INSERT INTO cena_imagens (
                cena_id,
                titulo,
                legenda,
                texto_alternativo,
                imagem_url,
                ordem_exibicao
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            cena_id,
            titulo,
            legenda,
            texto_alternativo,
            imagem_url,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarInformacoes(id, cenaImagem, client = pool) {

        const {
            titulo,
            legenda,
            texto_alternativo,
            ordem_exibicao
        } = cenaImagem;

        const result = await client.query(`
            UPDATE cena_imagens
               SET titulo = $1,
                   legenda = $2,
                   texto_alternativo = $3,
                   ordem_exibicao = $4,
                   atualizado_em = NOW()
             WHERE id = $5
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            titulo,
            legenda,
            texto_alternativo,
            ordem_exibicao,
            id
        ]);

        return result.rows[0];
    }

    static async alterarImagem(id, imagem_url, client = pool) {

        const result = await client.query(`
            UPDATE cena_imagens
               SET imagem_url = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [imagem_url, id]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE cena_imagens
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

module.exports = CenaImagem;
