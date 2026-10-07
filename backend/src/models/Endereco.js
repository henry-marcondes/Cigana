const pool = require('../db/connection');

const CAMPOS = `
    id,
    pessoa_id,
    tipo,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    uf,
    pais,
    principal,
    ativo,
    criado_em,
    atualizado_em
`;

class Endereco {

    static async listarPorPessoaId(pessoaId) {
        const result = await pool.query(`
            SELECT ${CAMPOS}
            FROM enderecos
            WHERE pessoa_id = $1
              AND ativo = TRUE
            ORDER BY principal DESC, criado_em ASC
        `, [pessoaId]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS}
            FROM enderecos
            WHERE id = $1
              AND ativo = TRUE
            LIMIT 1
        `, [id]);

        return result.rows[0] || null;
    }

    static async criar({
        pessoaId,
        tipo,
        cep,
        logradouro,
        numero,
        complemento = null,
        bairro,
        cidade,
        uf,
        pais = 'Brasil',
        principal = false,
        client = pool
    }) {
        const result = await client.query(`
            INSERT INTO enderecos (
                pessoa_id,
                tipo,
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                uf,
                pais,
                principal
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING ${CAMPOS}
        `, [
            pessoaId,
            tipo,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            uf,
            pais,
            principal
        ]);

        return result.rows[0];
    }

    static async atualizar({
        id,
        pessoaId,
        tipo,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        pais,
        principal,
        client = pool
    }) {
        const result = await client.query(`
            UPDATE enderecos
            SET
                tipo = $1,
                cep = $2,
                logradouro = $3,
                numero = $4,
                complemento = $5,
                bairro = $6,
                cidade = $7,
                uf = $8,
                pais = $9,
                principal = $10,
                atualizado_em = NOW()
            WHERE id = $11
              AND pessoa_id = $12
              AND ativo = TRUE
            RETURNING ${CAMPOS}
        `, [
            tipo,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            uf,
            pais,
            principal,
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
            UPDATE enderecos
            SET
                principal = FALSE,
                atualizado_em = NOW()
            WHERE pessoa_id = $1
              AND ativo = TRUE
        `, [pessoaId]);

        const result = await client.query(`
            UPDATE enderecos
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
            UPDATE enderecos
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

module.exports = Endereco;
