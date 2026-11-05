const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    livro_id,
    pasta_pai_id,
    nome,
    ativo,
    criado_em,
    atualizado_em
`;

class PastaObra {
    static async listarPorLivro(livro_id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM pastas_obra
             WHERE livro_id = $1
               AND ativo = TRUE
             ORDER BY lower(btrim(nome)), criado_em, id
        `, [livro_id]);

        return result.rows;
    }

    static async buscarPorId(id, client = pool, bloquear = false) {
        const result = await client.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM pastas_obra
             WHERE id = $1
               AND ativo = TRUE
             ${bloquear ? 'FOR UPDATE' : ''}
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarLivroIdPorId(id, client = pool) {
        const result = await client.query(`
            SELECT livro_id
              FROM pastas_obra
             WHERE id = $1
        `, [id]);

        return result.rows[0]?.livro_id || null;
    }

    static async criar({ livro_id, pasta_pai_id, nome }, client = pool) {
        const result = await client.query(`
            INSERT INTO pastas_obra (livro_id, pasta_pai_id, nome)
            VALUES ($1, $2, $3)
            RETURNING ${CAMPOS_PUBLICOS}
        `, [livro_id, pasta_pai_id, nome]);

        return result.rows[0];
    }

    static async renomear(id, nome, client = pool) {
        const result = await client.query(`
            UPDATE pastas_obra
               SET nome = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [nome, id]);

        return result.rows[0] || null;
    }

    static async mover(id, pasta_pai_id, client = pool) {
        const result = await client.query(`
            UPDATE pastas_obra
               SET pasta_pai_id = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [pasta_pai_id, id]);

        return result.rows[0] || null;
    }

    static async possuiConteudo(id, client = pool) {
        const result = await client.query(`
            SELECT EXISTS (
                SELECT 1
                  FROM arquivos_midia
                 WHERE pasta_id = $1
            ) OR EXISTS (
                SELECT 1
                  FROM pastas_obra
                 WHERE pasta_pai_id = $1
            ) AS possui_conteudo
        `, [id]);

        return result.rows[0].possui_conteudo;
    }

    static async desativar(id, client = pool) {
        const result = await client.query(`
            UPDATE pastas_obra
               SET ativo = FALSE,
                   atualizado_em = NOW()
             WHERE id = $1
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [id]);

        return result.rows[0] || null;
    }

    static async ehDescendente(id, pasta_pai_id, livro_id, client = pool) {
        const result = await client.query(`
            WITH RECURSIVE descendentes(id) AS (
                SELECT id
                  FROM pastas_obra
                 WHERE pasta_pai_id = $1
                   AND livro_id = $2
                UNION
                SELECT filha.id
                  FROM pastas_obra filha
                  INNER JOIN descendentes pai
                    ON filha.pasta_pai_id = pai.id
                 WHERE filha.livro_id = $2
            )
            SELECT EXISTS (
                SELECT 1
                  FROM descendentes
                 WHERE id = $3
            ) AS eh_descendente
        `, [id, livro_id, pasta_pai_id]);

        return result.rows[0].eh_descendente;
    }
}

module.exports = PastaObra;
