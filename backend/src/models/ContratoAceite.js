const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    contrato_versao_id,
    usuario_id,
    aceito_em,
    registro_eletronico,
    ip_origem,
    user_agent,
    dados_tecnicos,
    criado_em
`;

class ContratoAceite {

    static async listarPorVersao(contratoVersaoId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contratos_aceites
            WHERE contrato_versao_id = $1
            ORDER BY aceito_em DESC
        `, [contratoVersaoId]);

        return result.rows;
    }

    static async listarPorUsuario(usuarioId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contratos_aceites
            WHERE usuario_id = $1
            ORDER BY aceito_em DESC
        `, [usuarioId]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contratos_aceites
            WHERE id = $1
            LIMIT 1
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarPorVersaoEUsuario(contratoVersaoId, usuarioId) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM contratos_aceites
            WHERE contrato_versao_id = $1
              AND usuario_id = $2
            LIMIT 1
        `, [contratoVersaoId, usuarioId]);

        return result.rows[0] || null;
    }

    static async criar(
        contratoVersaoId,
        usuarioId,
        ipOrigem,
        userAgent,
        dadosTecnicos
    ) {
        const result = await pool.query(`
            INSERT INTO contratos_aceites (
                contrato_versao_id,
                usuario_id,
                ip_origem,
                user_agent,
                dados_tecnicos
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING ${CAMPOS_PUBLICOS}
        `, [
            contratoVersaoId,
            usuarioId,
            ipOrigem,
            userAgent,
            dadosTecnicos
        ]);

        return result.rows[0];
    }

}

module.exports = ContratoAceite;
