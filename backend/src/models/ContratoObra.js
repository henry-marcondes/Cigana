const pool = require('../db/connection');

const CAMPOS = `
    id,
    contrato_id,
    livro_id,
    criado_em
`;

class ContratoObra {

    static async listarPorContrato(contratoId, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contrato_obras
            WHERE contrato_id = $1
            ORDER BY criado_em
        `, [contratoId]);

        return result.rows;
    }

    static async listarPorLivro(livroId, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contrato_obras
            WHERE livro_id = $1
            ORDER BY criado_em
        `, [livroId]);

        return result.rows;
    }

    static async buscarPorId(id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contrato_obras
            WHERE id = $1
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarPorContratoELivro(
        contratoId,
        livroId,
        client = pool
    ) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM contrato_obras
            WHERE contrato_id = $1
            AND livro_id = $2
        `, [contratoId, livroId]);

        return result.rows[0] || null;
    }

    static async criar(dados, client = pool) {
        const result = await client.query(`
            INSERT INTO contrato_obras (
                contrato_id,
                livro_id
            )
            VALUES ($1, $2)
            RETURNING ${CAMPOS}
        `, [
            dados.contrato_id,
            dados.livro_id
        ]);

        return result.rows[0];
    }

    static async remover(id, client = pool) {
        const result = await client.query(`
            DELETE FROM contrato_obras
            WHERE id = $1
            RETURNING ${CAMPOS}
        `, [id]);

        return result.rows[0] || null;
    }
}

module.exports = ContratoObra;
