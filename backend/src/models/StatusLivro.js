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

class StatusLivro {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM status_livro
             WHERE ativo = TRUE
             ORDER BY nome
        `);

        return result.rows;
    }

}

module.exports = StatusLivro;
