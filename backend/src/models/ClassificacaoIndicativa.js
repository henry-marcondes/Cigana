const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    nome,
    idade_minima,
    descricao,
    ativo,
    criado_em,
    atualizado_em
`;

class ClassificacaoIndicativa {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM classificacoes_indicativas
             WHERE ativo = TRUE
             ORDER BY idade_minima
        `);

        return result.rows;
    }

}

module.exports = ClassificacaoIndicativa;
