const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    ne.id,
    ne.cena_origem_id,
    ne.cena_destino_id,
    ne.rotulo,
    ne.ordem_exibicao,
    ne.ativo,
    ne.criado_em,
    ne.atualizado_em,
    destino.capitulo_id AS capitulo_destino_id,
    destino.slug AS cena_destino_slug,
    destino.titulo AS cena_destino_titulo,
    capitulo_destino.livro_id AS livro_destino_id,
    capitulo_destino.slug AS capitulo_destino_slug,
    capitulo_destino.titulo AS capitulo_destino_titulo,
    (destino.ativo = TRUE AND capitulo_destino.ativo = TRUE
        AND destino.cena_padrao = FALSE) AS destino_disponivel
`;

class NavegacaoEstrutural {
    static async buscarConfiguracaoPorId(id, client = pool) {
        const result = await client.query(`
            SELECT ne.id, ne.cena_origem_id, ne.cena_destino_id,
                   ne.rotulo, ne.ordem_exibicao, ne.ativo,
                   origem.capitulo_id AS capitulo_origem_id,
                   capitulo_origem.livro_id AS livro_origem_id,
                   destino.ativo AS destino_ativo,
                   destino.cena_padrao AS destino_padrao,
                   capitulo_destino.ativo AS capitulo_destino_ativo
              FROM navegacoes_estruturais ne
              JOIN cenas origem ON origem.id = ne.cena_origem_id
              JOIN capitulos capitulo_origem ON capitulo_origem.id = origem.capitulo_id
              LEFT JOIN cenas destino ON destino.id = ne.cena_destino_id
              LEFT JOIN capitulos capitulo_destino ON capitulo_destino.id = destino.capitulo_id
             WHERE ne.id = $1
               AND ne.ativo = TRUE
        `, [id]);

        return result.rows[0] || null;
    }

    static async listarPorCenaOrigem(cena_origem_id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM navegacoes_estruturais ne
              LEFT JOIN cenas destino ON destino.id = ne.cena_destino_id
              LEFT JOIN capitulos capitulo_destino ON capitulo_destino.id = destino.capitulo_id
             WHERE ne.cena_origem_id = $1
               AND ne.ativo = TRUE
             ORDER BY ne.ordem_exibicao
        `, [cena_origem_id]);

        return result.rows;
    }

    static async buscarPorId(id, client = pool) {
        const result = await client.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM navegacoes_estruturais ne
              LEFT JOIN cenas destino ON destino.id = ne.cena_destino_id
              LEFT JOIN capitulos capitulo_destino ON capitulo_destino.id = destino.capitulo_id
             WHERE ne.id = $1
               AND ne.ativo = TRUE
        `, [id]);

        return result.rows[0] || null;
    }

    static async criar({ cena_origem_id, cena_destino_id, rotulo, ordem_exibicao }, client = pool) {
        const result = await client.query(`
            INSERT INTO navegacoes_estruturais (
                cena_origem_id, cena_destino_id, rotulo, ordem_exibicao
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id, cena_origem_id, cena_destino_id, rotulo,
                      ordem_exibicao, ativo, criado_em, atualizado_em
        `, [cena_origem_id, cena_destino_id, rotulo, ordem_exibicao]);

        return result.rows[0];
    }

    static async alterar(id, { cena_destino_id, rotulo }, client = pool) {
        const result = await client.query(`
            UPDATE navegacoes_estruturais
               SET cena_destino_id = $1,
                   rotulo = $2,
                   atualizado_em = NOW()
             WHERE id = $3
               AND ativo = TRUE
            RETURNING id, cena_origem_id, cena_destino_id, rotulo,
                      ordem_exibicao, ativo, criado_em, atualizado_em
        `, [cena_destino_id, rotulo, id]);

        return result.rows[0] || null;
    }

    static async reordenar(cena_origem_id, ordem, client) {
        const atuais = await client.query(`
            SELECT id, ordem_exibicao
              FROM navegacoes_estruturais
             WHERE cena_origem_id = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao
             FOR UPDATE
        `, [cena_origem_id]);
        const maiorOrdem = atuais.rows.reduce(
            (maior, item) => Math.max(maior, Number(item.ordem_exibicao)),
            0
        );
        const baseTemporaria = maiorOrdem + atuais.rows.length + 1;

        for (let indice = 0; indice < ordem.length; indice += 1) {
            await client.query(`
                UPDATE navegacoes_estruturais
                   SET ordem_exibicao = $1,
                       atualizado_em = NOW()
                 WHERE id = $2
                   AND cena_origem_id = $3
                   AND ativo = TRUE
            `, [baseTemporaria + indice, ordem[indice].id, cena_origem_id]);
        }

        for (let indice = 0; indice < ordem.length; indice += 1) {
            await client.query(`
                UPDATE navegacoes_estruturais
                   SET ordem_exibicao = $1,
                       atualizado_em = NOW()
                 WHERE id = $2
                   AND cena_origem_id = $3
                   AND ativo = TRUE
            `, [indice + 1, ordem[indice].id, cena_origem_id]);
        }

        return this.listarPorCenaOrigem(cena_origem_id, client);
    }

    static async desativar(id, client = pool) {
        const result = await client.query(`
            UPDATE navegacoes_estruturais
               SET ativo = FALSE,
                   atualizado_em = NOW()
             WHERE id = $1
               AND ativo = TRUE
            RETURNING id, cena_origem_id, cena_destino_id, rotulo,
                      ordem_exibicao, ativo, criado_em, atualizado_em
        `, [id]);

        return result.rows[0] || null;
    }
}

module.exports = NavegacaoEstrutural;
