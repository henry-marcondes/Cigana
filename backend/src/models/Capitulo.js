const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    livro_id,
    titulo,
    slug,
    resumo,
    texto_introdutorio,
    capa_url,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class Capitulo {

    static async listarPorLivro(livro_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM capitulos
             WHERE livro_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [livro_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM capitulos
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorSlug(livro_id, slug) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM capitulos
             WHERE livro_id = $1
               AND LOWER(slug) = LOWER($2)
               AND ativo = TRUE
        `, [livro_id, slug]);

        return result.rows[0];
    }

    static async criar(capitulo, client = pool) {

        const {
            livro_id,
            titulo,
            slug,
            resumo,
            texto_introdutorio,
            capa_url,
            ordem_exibicao
        } = capitulo;

        const result = await client.query(`
            INSERT INTO capitulos (
                livro_id,
                titulo,
                slug,
                resumo,
                texto_introdutorio,
                capa_url,
                ordem_exibicao
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            livro_id,
            titulo,
            slug,
            resumo,
            texto_introdutorio,
            capa_url,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarInformacoes(id, capitulo, client = pool) {

        const {
            titulo,
            slug,
            resumo,
            texto_introdutorio,
            ordem_exibicao
        } = capitulo;

        const result = await client.query(`
            UPDATE capitulos
               SET titulo = $1,
                   slug = $2,
                   resumo = $3,
                   texto_introdutorio = $4,
                   ordem_exibicao = $5,
                   atualizado_em = NOW()
             WHERE id = $6
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            titulo,
            slug,
            resumo,
            texto_introdutorio,
            ordem_exibicao,
            id
        ]);

        return result.rows[0];
    }

    static async alterarCapa(id, capa_url, client = pool) {

        const result = await client.query(`
            UPDATE capitulos
               SET capa_url = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [capa_url, id]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE capitulos
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

module.exports = Capitulo;
