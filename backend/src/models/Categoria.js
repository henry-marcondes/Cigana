const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    biblioteca_id,
    categoria_pai_id,
    nome,
    slug,
    descricao,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class Categoria {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM categorias
             WHERE ativo = TRUE
             ORDER BY ordem_exibicao, nome
        `);

        return result.rows;
    }

    static async listarPorBiblioteca(bibliotecaSlug) {
    const result = await pool.query(`
        SELECT
            c.id,
            c.biblioteca_id,
            c.categoria_pai_id,
            c.nome,
            c.slug,
            c.descricao,
            c.ordem_exibicao,
            c.ativo,
            c.criado_em,
            c.atualizado_em
        FROM categorias c
        INNER JOIN bibliotecas b
            ON b.id = c.biblioteca_id
        WHERE c.ativo = TRUE
          AND b.ativo = TRUE
          AND b.slug = $1
        ORDER BY c.ordem_exibicao, c.nome
    `, [bibliotecaSlug]);

    return result.rows;
  }
}

module.exports = Categoria;
