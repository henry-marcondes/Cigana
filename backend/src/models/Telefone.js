const pool = require('../db/connection');

const CAMPOS = `
    id,
    pessoa_id,
    tipo,
    codigo_pais,
    ddd,
    numero,
    numero_normalizado,
    principal,
    verificado,
    ativo,
    criado_em,
    atualizado_em
`;

class Telefone {

    static async listarPorPessoaId(pessoaId) {
        const result = await pool.query(`
            SELECT ${CAMPOS}
            FROM telefones
            WHERE pessoa_id = $1
              AND ativo = TRUE
            ORDER BY principal DESC, criado_em ASC
        `, [pessoaId]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS}
            FROM telefones
            WHERE id = $1
              AND ativo = TRUE
            LIMIT 1
        `, [id]);

        return result.rows[0] || null;
    }

    static async criar({
        pessoaId,
        tipo,
        codigoPais = '55',
        ddd = null,
        numero,
        numeroNormalizado,
        principal = false,
        verificado = false,
        client = pool
    }) {
        const result = await client.query(`
            INSERT INTO telefones (
                pessoa_id,
                tipo,
                codigo_pais,
                ddd,
                numero,
                numero_normalizado,
                principal,
                verificado
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING ${CAMPOS}
        `, [
            pessoaId,
            tipo,
            codigoPais,
            ddd,
            numero,
            numeroNormalizado,
            principal,
            verificado
        ]);

        return result.rows[0];
    }

    static async atualizar({
        id,
        pessoaId,
        tipo,
        codigoPais,
        ddd,
        numero,
        numeroNormalizado,
        principal,
        verificado,
        client = pool
    }) {
        const result = await client.query(`
            UPDATE telefones
            SET
                tipo = $1,
                codigo_pais = $2,
                ddd = $3,
                numero = $4,
                numero_normalizado = $5,
                principal = $6,
                verificado = $7,
                atualizado_em = NOW()
            WHERE id = $8
              AND pessoa_id = $9
              AND ativo = TRUE
            RETURNING ${CAMPOS}
        `, [
            tipo,
            codigoPais,
            ddd,
            numero,
            numeroNormalizado,
            principal,
            verificado,
            id,
            pessoaId
        ]);

        return result.rows[0] || null;
    }

    static async definirPrincipal({
        id,
        pessoaId,
        client = pool
    }) {
        await client.query(`
            UPDATE telefones
            SET
                principal = FALSE,
                atualizado_em = NOW()
            WHERE pessoa_id = $1
              AND ativo = TRUE
        `, [pessoaId]);

        const result = await client.query(`
            UPDATE telefones
            SET
                principal = TRUE,
                atualizado_em = NOW()
            WHERE id = $1
              AND pessoa_id = $2
              AND ativo = TRUE
            RETURNING ${CAMPOS}
        `, [id, pessoaId]);

        return result.rows[0] || null;
    }

    static async desativar({
        id,
        pessoaId,
        client = pool
    }) {
        const result = await client.query(`
            UPDATE telefones
            SET
                ativo = FALSE,
                principal = FALSE,
                atualizado_em = NOW()
            WHERE id = $1
              AND pessoa_id = $2
              AND ativo = TRUE
            RETURNING ${CAMPOS}
        `, [id, pessoaId]);

        return result.rows[0] || null;
    }
}

module.exports = Telefone;
