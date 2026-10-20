const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    cena_id,
    tipo_conteudo,
    conteudo_id,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class CenaConteudo {

    static async listarPorCena(cena_id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_conteudos
             WHERE cena_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
        `, [cena_id]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM cena_conteudos
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async criar(cenaConteudo, client = pool) {

        const {
            cena_id,
            tipo_conteudo,
            conteudo_id,
            ordem_exibicao
        } = cenaConteudo;

        const result = await client.query(`
            INSERT INTO cena_conteudos (
                cena_id,
                tipo_conteudo,
                conteudo_id,
                ordem_exibicao
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            cena_id,
            tipo_conteudo,
            conteudo_id,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarOrdem(id, ordem_exibicao, client = pool) {

        const result = await client.query(`
            UPDATE cena_conteudos
               SET ordem_exibicao = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            ordem_exibicao,
            id
        ]);

        return result.rows[0];
    }

    static async reordenar(cena_id, ordem, client = pool) {

    const quantidade = ordem.length;
    const baseTemporaria = quantidade + 1;

    // 1. Remove temporariamente os conteúdos da faixa
    //    normal de ordenação, mantendo valores positivos.
    for (let i = 0; i < ordem.length; i++) {

        await client.query(`
            UPDATE cena_conteudos
               SET ordem_exibicao = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND cena_id = $3
               AND ativo = TRUE
        `, [
            baseTemporaria + i,
            ordem[i].id,
            cena_id
        ]);
    }

    // 2. Aplica a nova ordem definitiva.
    for (let i = 0; i < ordem.length; i++) {

        await client.query(`
            UPDATE cena_conteudos
               SET ordem_exibicao = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND cena_id = $3
               AND ativo = TRUE
        `, [
            i + 1,
            ordem[i].id,
            cena_id
        ]);
    }

    return await this.listarPorCena(cena_id, client);
    }

    static async alterarTipoConteudo(id, tipo_conteudo, client = pool) {

        const result = await client.query(`
            UPDATE cena_conteudos
               SET tipo_conteudo = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            tipo_conteudo,
            id
        ]);

        return result.rows[0];
    }

    static async desativar(id, client = pool) {

        const result = await client.query(`
            UPDATE cena_conteudos
               SET ativo = FALSE,
                   atualizado_em = NOW()
             WHERE id = $1
               AND ativo = TRUE
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [id]);

        return result.rows[0];
    }

    static async desativarPorConteudo(tipo_conteudo, conteudo_id, client = pool) {
        const result = await client.query(`
            UPDATE cena_conteudos
               SET ativo = FALSE,
                   atualizado_em = NOW()
             WHERE tipo_conteudo = $1
               AND conteudo_id = $2
               AND ativo = TRUE
            RETURNING
                cena_id
        `, [tipo_conteudo, conteudo_id]);

        const cenasAfetadas = [
            ...new Set(result.rows.map((linha) => linha.cena_id))
        ];

        for (const cena_id of cenasAfetadas) {
            await this.compactarOrdem(cena_id, client);
        }

        return result.rows;
    }

    static async compactarOrdem(cena_id, client = pool) {
        const conteudos = await this.listarPorCena(cena_id, client);

        for (let indice = 0; indice < conteudos.length; indice++) {
            const ordemCorreta = indice + 1;

            if (Number(conteudos[indice].ordem_exibicao) === ordemCorreta) {
                continue;
            }

            await client.query(`
                UPDATE cena_conteudos
                   SET ordem_exibicao = $1,
                       atualizado_em = NOW()
                 WHERE id = $2
                   AND ativo = TRUE
            `, [ordemCorreta, conteudos[indice].id]);
        }
    }

}

module.exports = CenaConteudo;
