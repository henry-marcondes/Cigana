const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    cena_id,
    titulo,
    legenda,
    descricao,
    video_url,
    miniatura_url,
    reproducao_automatica,
    reproducao_em_loop,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class CenaVideo {

    static async listarPorCena(cena_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_videos
             WHERE cena_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [cena_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_videos
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async criar(cenaVideo, client = pool) {

        const {
            cena_id,
            titulo,
            legenda,
            descricao,
            video_url,
            miniatura_url,
            reproducao_automatica,
            reproducao_em_loop,
            ordem_exibicao
        } = cenaVideo;

        const result = await client.query(`
            INSERT INTO cena_videos (
                cena_id,
                titulo,
                legenda,
                descricao,
                video_url,
                miniatura_url,
                reproducao_automatica,
                reproducao_em_loop,
                ordem_exibicao
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            cena_id,
            titulo,
            legenda,
            descricao,
            video_url,
            miniatura_url,
            reproducao_automatica,
            reproducao_em_loop,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarInformacoes(id, cenaVideo, client = pool) {

        const {
            titulo,
            legenda,
            descricao,
            miniatura_url,
            reproducao_automatica,
            reproducao_em_loop,
            ordem_exibicao
        } = cenaVideo;

        const result = await client.query(`
            UPDATE cena_videos
               SET titulo = $1,
                   legenda = $2,
                   descricao = $3,
                   miniatura_url = $4,
                   reproducao_automatica = $5,
                   reproducao_em_loop = $6,
                   ordem_exibicao = $7,
                   atualizado_em = NOW()
             WHERE id = $8
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            titulo,
            legenda,
            descricao,
            miniatura_url,
            reproducao_automatica,
            reproducao_em_loop,
            ordem_exibicao,
            id
        ]);

        return result.rows[0];
    }

    static async alterarVideo(id, video_url, client = pool) {

        const result = await client.query(`
            UPDATE cena_videos
               SET video_url = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [video_url, id]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE cena_videos
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

module.exports = CenaVideo;
