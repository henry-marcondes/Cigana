const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    usuario_id,
    livro_id,
    versao_livro,
    cena_atual_id,
    percentual_concluido,
    concluido,
    ultima_leitura_em,
    ativo,
    criado_em,
    atualizado_em
`;

class ProgressoLeitura {

    static async listarPorUsuario(usuario_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM progresso_leitura
             WHERE usuario_id = $1
               AND ativo = TRUE
             ORDER BY ultima_leitura_em DESC
        `, [usuario_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM progresso_leitura
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorUsuarioELivro(usuario_id, livro_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM progresso_leitura
             WHERE usuario_id = $1
               AND livro_id = $2
               AND ativo = TRUE
        `, [usuario_id, livro_id]);

        return result.rows[0];
    }

    static async criar(progressoLeitura, client = pool) {

        const {
            usuario_id,
            livro_id,
            versao_livro,
            cena_atual_id,
            percentual_concluido,
            concluido
        } = progressoLeitura;

        const result = await client.query(`
            INSERT INTO progresso_leitura (
                usuario_id,
                livro_id,
                versao_livro,
                cena_atual_id,
                percentual_concluido,
                concluido
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            usuario_id,
            livro_id,
            versao_livro,
            cena_atual_id,
            percentual_concluido,
            concluido
        ]);

        return result.rows[0];
    }

    static async atualizarCenaAtual(id, cena_atual_id, client = pool) {

        const result = await client.query(`
            UPDATE progresso_leitura
               SET cena_atual_id = $1,
                   ultima_leitura_em = NOW(),
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [cena_atual_id, id]);

        return result.rows[0];
    }

    static async atualizarPercentual(id, percentual_concluido, client = pool) {

        const result = await client.query(`
            UPDATE progresso_leitura
               SET percentual_concluido = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [percentual_concluido, id]);

        return result.rows[0];
    }

    static async concluirLeitura(id, client = pool) {

        const result = await client.query(`
            UPDATE progresso_leitura
               SET concluido = TRUE,
                   percentual_concluido = 100,
                   ultima_leitura_em = NOW(),
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
            UPDATE progresso_leitura
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

module.exports = ProgressoLeitura;
