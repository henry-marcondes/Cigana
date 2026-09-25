const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    contrato_id,
    livro_id,
    criado_em
`;

class ContratoObra {

    static async listarPorContrato(contratoId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contrato_obras
            WHERE contrato_id = $1
            ORDER BY criado_em DESC
        `, [contratoId]);

        return result.rows;
    }

    static async listarPorObra(livroId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contrato_obras
            WHERE livro_id = $1
            ORDER BY criado_em DESC
        `, [livroId]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contrato_obras
            WHERE id = $1
            LIMIT 1
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarPorContratoEObra(contratoId, livroId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contrato_obras
            WHERE contrato_id = $1
              AND livro_id = $2
            LIMIT 1
        `, [contratoId, livroId]);

        return result.rows[0] || null;
    }

    static async criar(contratoId, livroId) {
        const result = await pool.query(`
            INSERT INTO contrato_obras (
                contrato_id,
                livro_id
            )
            VALUES ($1, $2)
            RETURNING ${CAMPOS_PUBLICOS}
        `, [contratoId, livroId]);

        return result.rows[0];
    }

}

module.exports = ContratoObra;
