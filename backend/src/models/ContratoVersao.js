const pool = require('../db/connection');

const CAMPOS = `
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

    static async listarPorContrato(contratoId, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contrato_versoes
            WHERE contrato_id = $1
            ORDER BY criado_em DESC
        `, [contratoId]);

        return result.rows;
    }

    static async buscarPorId(id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contrato_versoes
            WHERE id = $1
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarAtiva(contratoId, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contrato_versoes
            WHERE contrato_id = $1
              AND status = 'ATIVA'
            LIMIT 1
        `, [contratoId]);

        return result.rows[0] || null;
    }

    static async criar(dados, client = pool) {
        const result = await client.query(`
            INSERT INTO contrato_versoes (
                contrato_id,
                versao,
                titulo,
                conteudo
            )
            VALUES ($1, $2, $3, $4)
            RETURNING ${CAMPOS}
        `, [
            dados.contrato_id,
            dados.versao,
            dados.titulo,
            dados.conteudo
        ]);

        return result.rows[0];
    }

    static async atualizar(id, dados, client = pool) {
        const result = await client.query(`
            UPDATE contrato_versoes
            SET
                versao = $1,
                titulo = $2,
                conteudo = $3,
                atualizado_em = NOW()
            WHERE id = $4
              AND status = 'RASCUNHO'
            RETURNING ${CAMPOS}
        `, [
            dados.versao,
            dados.titulo,
            dados.conteudo,
            id
        ]);

        return result.rows[0] || null;
    }

    static async publicar(id, client = pool) {
        const result = await client.query(`
            UPDATE contrato_versoes
            SET
                status = 'ATIVA',
                publicado_em = NOW(),
                atualizado_em = NOW()
            WHERE id = $1
              AND status = 'RASCUNHO'
            RETURNING ${CAMPOS}
        `, [id]);

        return result.rows[0] || null;
    }

    static async encerrar(id, client = pool) {
        const result = await client.query(`
            UPDATE contrato_versoes
            SET
                status = 'ENCERRADA',
                atualizado_em = NOW()
            WHERE id = $1
              AND status = 'ATIVA'
            RETURNING ${CAMPOS}
        `, [id]);

        return result.rows[0] || null;
    }
}

module.exports = ContratoVersao;
