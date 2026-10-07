const pool = require('../db/connection');

const CAMPOS = `
    id,
    pessoa_id,
    razao_social,
    nome_fantasia,
    cnpj,
    inscricao_estadual,
    inscricao_municipal,
    ativo,
    criado_em,
    atualizado_em
`;

class PessoaJuridica {

    static async buscarPorPessoaId(pessoaId, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM pessoas_juridicas
            WHERE pessoa_id = $1
              AND ativo = TRUE
            LIMIT 1
        `, [pessoaId]);

        return result.rows[0] || null;
    }

    static async buscarPorId(id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS}
            FROM pessoas_juridicas
            WHERE id = $1
              AND ativo = TRUE
            LIMIT 1
        `, [id]);

        return result.rows[0] || null;
    }

    static async criar({
        pessoaId,
        razaoSocial,
        nomeFantasia = null,
        cnpj = null,
        inscricaoEstadual = null,
        inscricaoMunicipal = null,
        client = pool
    }) {
        const result = await client.query(`
            INSERT INTO pessoas_juridicas (
                pessoa_id,
                razao_social,
                nome_fantasia,
                cnpj,
                inscricao_estadual,
                inscricao_municipal
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING ${CAMPOS}
        `, [
            pessoaId,
            razaoSocial,
            nomeFantasia,
            cnpj,
            inscricaoEstadual,
            inscricaoMunicipal
        ]);

        return result.rows[0];
    }

    static async atualizar({
        id,
        razaoSocial,
        nomeFantasia = null,
        cnpj = null,
        inscricaoEstadual = null,
        inscricaoMunicipal = null,
        client = pool
    }) {
        const result = await client.query(`
            UPDATE pessoas_juridicas
            SET
                razao_social = $1,
                nome_fantasia = $2,
                cnpj = $3,
                inscricao_estadual = $4,
                inscricao_municipal = $5,
                atualizado_em = NOW()
            WHERE id = $6
              AND ativo = TRUE
            RETURNING ${CAMPOS}
        `, [
            razaoSocial,
            nomeFantasia,
            cnpj,
            inscricaoEstadual,
            inscricaoMunicipal,
            id
        ]);

        return result.rows[0] || null;
    }
}

module.exports = PessoaJuridica;
