const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    categoria_id,
    classificacao_indicativa_id,
    idioma_id,
    status_livro_id,
    visibilidade_livro_id,
    titulo,
    slug,
    resumo,
    capa_url,
    isbn,
    ano_publicacao,
    data_publicacao,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class Livro {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM livros
             WHERE ativo = TRUE
             ORDER BY ordem_exibicao, titulo
        `);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM livros
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorSlug(slug) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM livros
             WHERE LOWER(slug) = LOWER($1)
               AND ativo = TRUE
        `, [slug]);

        return result.rows[0];
    }

    static async criar(livro, client = pool) {

        const {
            categoria_id,
            classificacao_indicativa_id,
            idioma_id,
            status_livro_id,
            visibilidade_livro_id,
            titulo,
            slug,
            resumo,
            capa_url,
            isbn,
            ano_publicacao,
            data_publicacao,
            ordem_exibicao
        } = livro;

        const result = await client.query(`
            INSERT INTO livros (
                categoria_id,
                classificacao_indicativa_id,
                idioma_id,
                status_livro_id,
                visibilidade_livro_id,
                titulo,
                slug,
                resumo,
                capa_url,
                isbn,
                ano_publicacao,
                data_publicacao,
                ordem_exibicao
            )
            VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,$8,$9,
                $10,$11,$12,$13
            )
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            categoria_id,
            classificacao_indicativa_id,
            idioma_id,
            status_livro_id,
            visibilidade_livro_id,
            titulo,
            slug,
            resumo,
            capa_url,
            isbn,
            ano_publicacao,
            data_publicacao,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarInformacoes(id, livro, client = pool) {

    const {
        titulo,
        slug,
        resumo,
        isbn,
        ano_publicacao,
        data_publicacao,
        ordem_exibicao
    } = livro;

    const result = await client.query(`
        UPDATE livros
           SET titulo = $1,
               slug = $2,
               resumo = $3,
               isbn = $4,
               ano_publicacao = $5,
               data_publicacao = $6,
               ordem_exibicao = $7,
               atualizado_em = NOW()
         WHERE id = $8
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
    `, [
        titulo,
        slug,
        resumo,
        isbn,
        ano_publicacao,
        data_publicacao,
        ordem_exibicao,
        id
    ]);

    return result.rows[0];
}

static async alterarStatus(id, status_livro_id, client = pool) {

    const result = await client.query(`
        UPDATE livros
           SET status_livro_id = $1,
               atualizado_em = NOW()
         WHERE id = $2
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
    `, [status_livro_id, id]);

    return result.rows[0];
}

static async alterarVisibilidade(id, visibilidade_livro_id, client = pool) {

    const result = await client.query(`
        UPDATE livros
           SET visibilidade_livro_id = $1,
               atualizado_em = NOW()
         WHERE id = $2
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
    `, [visibilidade_livro_id, id]);

    return result.rows[0];
}

static async alterarCapa(id, capa_url, client = pool) {

    const result = await client.query(`
        UPDATE livros
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
        UPDATE livros
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

module.exports = Livro;
