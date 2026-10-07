const pool = require('../db/connection');

const CAMPOS = `
    id,
    pessoa_id,
    nome,
    sobrenome,
    data_nascimento,
    cpf,
    rg,
    orgao_expedidor_rg,
    uf_expedidor_rg,
    ativo,
    criado_em,
    atualizado_em
`;

class PessoaFisica {

    static async buscarPorPessoaId(pessoaId, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM pessoas_fisicas
            WHERE pessoa_id = $1
              AND ativo = TRUE
            LIMIT 1
        `, [pessoaId]);

        return result.rows[0] || null;
    }

    static async buscarPorId(id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM pessoas_fisicas
            WHERE id = $1
              AND ativo = TRUE
            LIMIT 1
        `, [id]);

        return result.rows[0] || null;
    }

    static async criar({
        pessoaId,
        nome,
        sobrenome,
        dataNascimento = null,
        cpf = null,
        rg = null,
        orgaoExpedidorRg = null,
        ufExpedidorRg = null,
        client = pool
    }) {
        const result = await client.query(`
            INSERT INTO pessoas_fisicas (
                pessoa_id,
                nome,
                sobrenome,
                data_nascimento,
                cpf,
                rg,
                orgao_expedidor_rg,
                uf_expedidor_rg
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING ${CAMPOS}
        `, [
            pessoaId,
            nome,
            sobrenome,
            dataNascimento,
            cpf,
            rg,
            orgaoExpedidorRg,
            ufExpedidorRg
        ]);

        return result.rows[0];
    }

    static async atualizar({
        id,
        nome,
        sobrenome,
        dataNascimento = null,
        cpf = null,
        rg = null,
        orgaoExpedidorRg = null,
        ufExpedidorRg = null,
        client = pool
    }) {
        const result = await client.query(`
            UPDATE pessoas_fisicas
            SET
                nome = $1,
                sobrenome = $2,
                data_nascimento = $3,
                cpf = $4,
                rg = $5,
                orgao_expedidor_rg = $6,
                uf_expedidor_rg = $7,
                atualizado_em = NOW()
            WHERE id = $8
              AND ativo = TRUE
            RETURNING ${CAMPOS}
        `, [
            nome,
            sobrenome,
            dataNascimento,
            cpf,
            rg,
            orgaoExpedidorRg,
            ufExpedidorRg,
            id
        ]);

        return result.rows[0] || null;
    }
}

module.exports = PessoaFisica;
