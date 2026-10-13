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

    static async validarCenaAtivaDaObra(client, livro_id, cena_id) {
        const result = await client.query(`
            SELECT c.id
              FROM cenas c
              INNER JOIN capitulos cap
                ON cap.id = c.capitulo_id
               AND cap.livro_id = $1
               AND cap.ativo = TRUE
             WHERE c.id = $2
               AND c.ativo = TRUE
             FOR SHARE OF c, cap
        `, [livro_id, cena_id]);

        if (result.rowCount === 0) {
            const erro = new Error(
                'A cena precisa estar ativa e pertencer à obra do progresso.'
            );
            erro.statusCode = 400;
            throw erro;
        }
    }

    static async registrarVisitaEAtualizarPercentual(
        client,
        progresso_id,
        livro_id,
        cena_id
    ) {
        await client.query(`
            INSERT INTO progresso_leitura_cenas_visitadas (
                progresso_id,
                cena_id
            )
            VALUES ($1, $2)
            ON CONFLICT (progresso_id, cena_id) DO NOTHING
        `, [progresso_id, cena_id]);

        const visitas = await client.query(`
            SELECT COUNT(DISTINCT v.cena_id)::INTEGER AS quantidade
              FROM progresso_leitura_cenas_visitadas v
              INNER JOIN progresso_leitura p
                ON p.id = v.progresso_id
               AND p.livro_id = $2
              INNER JOIN cenas c
                ON c.id = v.cena_id
               AND c.ativo = TRUE
              INNER JOIN capitulos cap
                ON cap.id = c.capitulo_id
               AND cap.livro_id = p.livro_id
               AND cap.ativo = TRUE
             WHERE v.progresso_id = $1
        `, [progresso_id, livro_id]);

        const totalCenas = await client.query(`
            SELECT COUNT(*)::INTEGER AS quantidade
              FROM capitulos cap
              INNER JOIN cenas c
                ON c.capitulo_id = cap.id
               AND c.ativo = TRUE
             WHERE cap.livro_id = $1
               AND cap.ativo = TRUE
        `, [livro_id]);

        const quantidadeTotal = totalCenas.rows[0].quantidade;
        if (quantidadeTotal === 0) {
            const erro = new Error(
                'A obra não possui cenas ativas para calcular o progresso.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        const percentual = await client.query(`
            SELECT LEAST(
                100::NUMERIC,
                GREATEST(
                    0::NUMERIC,
                    ROUND(($1::NUMERIC * 100) / $2::NUMERIC, 2)
                )
            ) AS percentual_concluido
        `, [visitas.rows[0].quantidade, quantidadeTotal]);

        const progressoAtualizado = await this.atualizarPercentual(
            progresso_id,
            percentual.rows[0].percentual_concluido,
            client
        );

        if (!progressoAtualizado) {
            const erro = new Error('Progresso de leitura não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        return progressoAtualizado;
    }

    static async aplicarCenaAtual(client, progresso_id, cena_id) {
        const result = await client.query(`
            UPDATE progresso_leitura
               SET cena_atual_id = $1,
                   ultima_leitura_em = NOW(),
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [cena_id, progresso_id]);

        if (result.rowCount === 0) {
            const erro = new Error('Progresso de leitura não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        return result.rows[0];
    }

    static async criar(progressoLeitura, client = null) {
        const {
            usuario_id,
            livro_id,
            versao_livro,
            cena_atual_id,
            concluido
        } = progressoLeitura;

        const possuiConexaoExterna = Boolean(client);
        const conexao = client || await pool.connect();

        try {
            if (!possuiConexaoExterna) {
                await conexao.query('BEGIN');
            }

            await this.validarCenaAtivaDaObra(
                conexao,
                livro_id,
                cena_atual_id
            );

            const inserido = await conexao.query(`
                INSERT INTO progresso_leitura (
                    usuario_id,
                    livro_id,
                    versao_livro,
                    cena_atual_id,
                    percentual_concluido,
                    concluido
                )
                VALUES ($1, $2, $3, $4, 0, $5)
                ON CONFLICT (usuario_id, livro_id) DO NOTHING
                RETURNING ${CAMPOS_PUBLICOS}
            `, [
                usuario_id,
                livro_id,
                versao_livro,
                cena_atual_id,
                concluido ?? false
            ]);

            let progresso;
            if (inserido.rowCount > 0) {
                progresso = await this.registrarVisitaEAtualizarPercentual(
                    conexao,
                    inserido.rows[0].id,
                    livro_id,
                    cena_atual_id
                );
            } else {
                const existente = await conexao.query(`
                    SELECT id
                      FROM progresso_leitura
                     WHERE usuario_id = $1
                       AND livro_id = $2
                     FOR UPDATE
                `, [usuario_id, livro_id]);

                if (existente.rowCount === 0) {
                    const erro = new Error('Progresso de leitura não encontrado.');
                    erro.statusCode = 404;
                    throw erro;
                }

                const reativado = await conexao.query(`
                    UPDATE progresso_leitura
                       SET ativo = TRUE,
                           atualizado_em = NOW()
                     WHERE id = $1
                    RETURNING ${CAMPOS_PUBLICOS}
                `, [existente.rows[0].id]);

                await this.registrarVisitaEAtualizarPercentual(
                    conexao,
                    reativado.rows[0].id,
                    livro_id,
                    cena_atual_id
                );
                progresso = await this.aplicarCenaAtual(
                    conexao,
                    reativado.rows[0].id,
                    cena_atual_id
                );
            }

            if (!possuiConexaoExterna) {
                await conexao.query('COMMIT');
            }

            return progresso;
        } catch (erro) {
            if (!possuiConexaoExterna) {
                await conexao.query('ROLLBACK');
            }
            throw erro;
        } finally {
            if (!possuiConexaoExterna) {
                conexao.release();
            }
        }
    }

    static async atualizarCenaAtual(id, cena_atual_id, client = null) {
        const possuiConexaoExterna = Boolean(client);
        const conexao = client || await pool.connect();

        try {
            if (!possuiConexaoExterna) {
                await conexao.query('BEGIN');
            }

            const progressoExistente = await conexao.query(`
                SELECT id, livro_id
                  FROM progresso_leitura
                 WHERE id = $1
                   AND ativo = TRUE
                 FOR UPDATE
            `, [id]);

            if (progressoExistente.rowCount === 0) {
                const erro = new Error('Progresso de leitura não encontrado.');
                erro.statusCode = 404;
                throw erro;
            }

            const { livro_id } = progressoExistente.rows[0];
            await this.validarCenaAtivaDaObra(
                conexao,
                livro_id,
                cena_atual_id
            );
            await this.registrarVisitaEAtualizarPercentual(
                conexao,
                id,
                livro_id,
                cena_atual_id
            );
            const result = await this.aplicarCenaAtual(
                conexao,
                id,
                cena_atual_id
            );

            if (!possuiConexaoExterna) {
                await conexao.query('COMMIT');
            }

            return result;
        } catch (erro) {
            if (!possuiConexaoExterna) {
                await conexao.query('ROLLBACK');
            }
            throw erro;
        } finally {
            if (!possuiConexaoExterna) {
                conexao.release();
            }
        }
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
