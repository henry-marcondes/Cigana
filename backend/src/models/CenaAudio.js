const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    cena_id,
    titulo,
    legenda,
    descricao,
    audio_url,
    reproducao_automatica,
    reproducao_em_loop,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class CenaAudio {

    static async listarPorCena(cena_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_audios
             WHERE cena_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [cena_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_audios
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async criar(cenaAudio, client = pool) {

        const {
            cena_id,
            titulo,
            legenda,
            descricao,
            audio_url,
            reproducao_automatica,
            reproducao_em_loop,
            ordem_exibicao
        } = cenaAudio;

        const result = await client.query(`
            INSERT INTO cena_audios (
                cena_id,
                titulo,
                legenda,
                descricao,
                audio_url,
                reproducao_automatica,
                reproducao_em_loop,
                ordem_exibicao
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            cena_id,
            titulo,
            legenda,
            descricao,
            audio_url,
            reproducao_automatica,
            reproducao_em_loop,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarInformacoes(id, cenaAudio, client = pool) {

        const {
            titulo,
            legenda,
            descricao,
            reproducao_automatica,
            reproducao_em_loop,
            ordem_exibicao
        } = cenaAudio;

        const result = await client.query(`
            UPDATE cena_audios
               SET titulo = $1,
                   legenda = $2,
                   descricao = $3,
                   reproducao_automatica = $4,
                   reproducao_em_loop = $5,
                   ordem_exibicao = $6,
                   atualizado_em = NOW()
             WHERE id = $7
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            titulo,
            legenda,
            descricao,
            reproducao_automatica,
            reproducao_em_loop,
            ordem_exibicao,
            id
        ]);

        return result.rows[0];
    }

    static async alterarAudio(id, audio_url, client = pool) {

        const result = await client.query(`
            UPDATE cena_audios
               SET audio_url = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [audio_url, id]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE cena_audios
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

module.exports = CenaAudio;
