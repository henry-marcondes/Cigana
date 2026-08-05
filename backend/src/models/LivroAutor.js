const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    livro_id,
    autor_id,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class LivroAutor {

    static async listarPorLivro(livro_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM livro_autores
             WHERE livro_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [livro_id]);

        return result.rows;
    }

    static async listarPorAutor(autor_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM livro_autores
             WHERE autor_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [autor_id]);

        return result.rows;
    }

    static async criar(livroAutor, client = pool) {

        const {
            livro_id,
            autor_id,
            ordem_exibicao
        } = livroAutor;

        const result = await client.query(`
            INSERT INTO livro_autores (
                livro_id,
                autor_id,
                ordem_exibicao
            )
            VALUES ($1, $2, $3)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            livro_id,
            autor_id,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarOrdemExibicao(id, ordem_exibicao, client = pool) {

        const result = await client.query(`
            UPDATE livro_autores
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
            UPDATE livro_autores
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

module.exports = LivroAutor;
