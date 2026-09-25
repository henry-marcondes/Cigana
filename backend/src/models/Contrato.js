const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    tipo,
    codigo,
    nome,
    descricao,
    ativo,
    criado_em,
    atualizado_em
`;

class Contrato {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contratos
            WHERE ativo = TRUE
            ORDER BY nome ASC
        `);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contratos
            WHERE id = $1
              AND ativo = TRUE
            LIMIT 1
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarPorCodigo(codigo) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contratos
            WHERE codigo = $1
              AND ativo = TRUE
            LIMIT 1
        `, [codigo]);

        return result.rows[0] || null;
    }

}

module.exports = Contrato;
