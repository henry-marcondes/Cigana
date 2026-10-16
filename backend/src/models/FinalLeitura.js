const pool = require('../db/connection');

class FinalLeitura {
    static async listarPorUsuarioELivro(usuario_id, livro_id) {
        const result = await pool.query(`
            SELECT
                f.id,
                f.usuario_id,
                f.livro_id,
                f.cena_id,
                c.titulo AS cena_titulo,
                c.slug AS cena_slug,
                cap.titulo AS capitulo_titulo,
                f.confirmado_em
              FROM finais_leitura f
              INNER JOIN cenas c
                ON c.id = f.cena_id
              INNER JOIN capitulos cap
                ON cap.id = c.capitulo_id
             WHERE f.usuario_id = $1
               AND f.livro_id = $2
             ORDER BY f.confirmado_em DESC
        `, [usuario_id, livro_id]);

        return result.rows;
    }

    static async registrar(usuario_id, livro_id, cena_id) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const cena = await client.query(`
                SELECT c.id
                  FROM cenas c
                  INNER JOIN capitulos cap
                    ON cap.id = c.capitulo_id
                   AND cap.ativo = TRUE
                   AND cap.livro_id = $2
                  INNER JOIN livros l
                    ON l.id = cap.livro_id
                   AND l.ativo = TRUE
                 WHERE c.id = $1
                   AND c.ativo = TRUE
                   AND c.cena_final = TRUE
                 FOR SHARE OF c, cap, l
            `, [cena_id, livro_id]);

            if (cena.rowCount === 0) {
                const erro = new Error(
                    'A cena não está definida como final desta obra.'
                );
                erro.statusCode = 409;
                throw erro;
            }

            const inserido = await client.query(`
                INSERT INTO finais_leitura (
                    usuario_id,
                    livro_id,
                    cena_id
                )
                VALUES ($1, $2, $3)
                ON CONFLICT (usuario_id, livro_id, cena_id) DO NOTHING
                RETURNING
                    id,
                    usuario_id,
                    livro_id,
                    cena_id,
                    confirmado_em
            `, [usuario_id, livro_id, cena_id]);

            let registro = inserido.rows[0];
            if (!registro) {
                const existente = await client.query(`
                    SELECT
                        id,
                        usuario_id,
                        livro_id,
                        cena_id,
                        confirmado_em
                      FROM finais_leitura
                     WHERE usuario_id = $1
                       AND livro_id = $2
                       AND cena_id = $3
                `, [usuario_id, livro_id, cena_id]);
                registro = existente.rows[0];
            }

            if (!registro) {
                throw new Error('Não foi possível confirmar o final.');
            }

            await client.query('COMMIT');
            return registro;
        } catch (erro) {
            await client.query('ROLLBACK');
            throw erro;
        } finally {
            client.release();
        }
    }
}

module.exports = FinalLeitura;
