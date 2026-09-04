const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    nome,
    nome_nativo,
    codigo_iso_639_1,
    codigo_iso_639_2,
    locale,
    ativo,
    criado_em,
    atualizado_em
`;

class Idioma {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM idiomas
             WHERE ativo = TRUE
             ORDER BY nome
        `);

        return result.rows;
    }

}

module.exports = Idioma;
