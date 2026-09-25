const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    contrato_id,
    versao,
    titulo,
    conteudo,
    status,
    publicado_em,
    criado_em,
    atualizado_em
`;

class ContratoVersao {

    static async listarPorContrato(contratoId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contrato_versoes
            WHERE contrato_id = $1
            ORDER BY criado_em DESC
        `, [contratoId]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contrato_versoes
            WHERE id = $1
            LIMIT 1
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarVersaoAtiva(contratoId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contrato_versoes
            WHERE contrato_id = $1
              AND status = 'ATIVA'
            LIMIT 1
        `, [contratoId]);

        return result.rows[0] || null;
    }

}

module.exports = ContratoVersao;
