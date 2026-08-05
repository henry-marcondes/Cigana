const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    usuario_id,
    livro_id,
    cena_id,
    titulo,
    observacao,
    categoria,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class Marcador {

    static async listarPorUsuario(usuario_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM marcadores
             WHERE usuario_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao, criado_em
        `, [usuario_id]);

        return result.rows;
    }

    static async listarPorLivro(usuario_id, livro_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM marcadores
             WHERE usuario_id = $1
               AND livro_id = $2
               AND ativo = TRUE
             ORDER BY ordem_exibicao, criado_em
        `, [usuario_id, livro_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM marcadores
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async criar(marcador, client = pool) {

        const {
            usuario_id,
            livro_id,
            cena_id,
            titulo,
            observacao,
            categoria,
            ordem_exibicao
        } = marcador;

        const result = await client.query(`
            INSERT INTO marcadores (
                usuario_id,
                livro_id,
                cena_id,
                titulo,
                observacao,
                categoria,
                ordem_exibicao
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            usuario_id,
            livro_id,
            cena_id,
            titulo,
            observacao,
            categoria,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarInformacoes(id, marcador, client = pool) {

        const {
            titulo,
            observacao,
            categoria,
            ordem_exibicao
        } = marcador;

        const result = await client.query(`
            UPDATE marcadores
               SET titulo = $1,
                   observacao = $2,
                   categoria = $3,
                   ordem_exibicao = $4,
                   atualizado_em = NOW()
             WHERE id = $5
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            titulo,
            observacao,
            categoria,
            ordem_exibicao,
            id
        ]);

        return result.rows[0];
    }

    static async alterarCena(id, cena_id, client = pool) {

        const result = await client.query(`
            UPDATE marcadores
               SET cena_id = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [cena_id, id]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE marcadores
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

module.exports = Marcador;
