const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    nome,
    slug,
    descricao,
    ativo,
    criado_em,
    atualizado_em
`;

class VisibilidadeLivro {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM visibilidade_livro
             WHERE ativo = TRUE
             ORDER BY nome
        `);

        return result.rows;
    }

}

module.exports = VisibilidadeLivro;
