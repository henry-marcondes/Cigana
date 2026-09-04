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

}

module.exports = Categoria;
