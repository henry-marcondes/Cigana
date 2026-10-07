const pool = require('../db/connection');

const CAMPOS = `
    id,
    contrato_versao_id,
    livro_id,
    usuario_id,
    hash_conteudo,
    aceito_em,
    registro_eletronico,
    ip_origem,
    user_agent,
    dados_tecnicos,
    criado_em
`;

class ContratoAceite {

    static async listarPorUsuario(usuarioId, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contratos_aceites
            WHERE usuario_id = $1
            ORDER BY aceito_em DESC
        `, [usuarioId]);

        return result.rows;
    }

    static async listarPorVersao(contratoVersaoId, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contratos_aceites
            WHERE contrato_versao_id = $1
            ORDER BY aceito_em
        `, [contratoVersaoId]);

        return result.rows;
    }

    static async buscarPorId(id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contratos_aceites
            WHERE id = $1
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarPorUsuarioEVersao(
        usuarioId,
        contratoVersaoId,
        client = pool
    ) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contratos_aceites
            WHERE usuario_id = $1
              AND contrato_versao_id = $2
        `, [
            usuarioId,
            contratoVersaoId
        ]);

        return result.rows[0] || null;
    }

    static async criar(dados, client = pool) {
        const result = await client.query(`
            INSERT INTO contratos_aceites (
                contrato_versao_id,
                livro_id,
                usuario_id,
                hash_conteudo,
                ip_origem,
                user_agent,
                dados_tecnicos
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING ${CAMPOS}
        `, [
            dados.contrato_versao_id,
            dados.livro_id,
            dados.usuario_id,
            dados.hash_conteudo,
            dados.ip_origem || null,
            dados.user_agent || null,
            dados.dados_tecnicos || null
        ]);

        return result.rows[0];
    }
}

module.exports = ContratoAceite;
