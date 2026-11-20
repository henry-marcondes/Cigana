const pool = require('../db/connection');
const NavegacaoEstrutural = require('../models/NavegacaoEstrutural');

function erroHttp(mensagem, statusCode = 400) {
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
}

class NavegacaoEstruturalService {
    static async validarMesmoLivro(cena_origem_id, cena_destino_id, client = pool) {
        const result = await client.query(`
            SELECT capitulo_origem.livro_id AS livro_origem_id,
                   capitulo_destino.livro_id AS livro_destino_id,
                   destino.cena_padrao AS destino_padrao
              FROM cenas origem
              JOIN capitulos capitulo_origem ON capitulo_origem.id = origem.capitulo_id
              JOIN cenas destino ON destino.id = $2
              JOIN capitulos capitulo_destino ON capitulo_destino.id = destino.capitulo_id
             WHERE origem.id = $1
               AND origem.ativo = TRUE
               AND capitulo_origem.ativo = TRUE
               AND destino.ativo = TRUE
               AND capitulo_destino.ativo = TRUE
             FOR UPDATE OF origem, capitulo_origem, destino, capitulo_destino
        `, [cena_origem_id, cena_destino_id]);

        const relacao = result.rows[0];
        if (!relacao) {
            throw erroHttp('Cena de origem ou destino não encontrada ou indisponível.', 404);
        }
        if (relacao.livro_origem_id !== relacao.livro_destino_id) {
            throw erroHttp('A cena de destino deve pertencer à mesma obra da cena de origem.');
        }
        if (relacao.destino_padrao === true) {
            throw erroHttp('A Cena Padrão não pode ser destino de navegação estrutural.');
        }
    }

    static async listarPorCenaOrigem(cena_origem_id) {
        const origem = await pool.query(`
            SELECT c.id
              FROM cenas c
              JOIN capitulos cap ON cap.id = c.capitulo_id
             WHERE c.id = $1 AND c.ativo = TRUE AND cap.ativo = TRUE
        `, [cena_origem_id]);
        if (!origem.rows[0]) throw erroHttp('Cena de origem não encontrada ou indisponível.', 404);
        return NavegacaoEstrutural.listarPorCenaOrigem(cena_origem_id);
    }

    static async buscarPorId(id) {
        const configuracao = await NavegacaoEstrutural.buscarConfiguracaoPorId(id);
        if (!configuracao) throw erroHttp('Navegação estrutural não encontrada.', 404);

        if (configuracao.destino_ativo !== true
            || configuracao.capitulo_destino_ativo !== true
            || configuracao.destino_padrao === true) {
            throw erroHttp('O destino desta navegação está indisponível.', 404);
        }

        return NavegacaoEstrutural.buscarPorId(id);
    }

    static async criar(dados) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await this.validarMesmoLivro(dados.cena_origem_id, dados.cena_destino_id, client);
            const criada = await NavegacaoEstrutural.criar({
                ...dados,
                rotulo: dados.rotulo.trim(),
            }, client);
            await client.query('COMMIT');
            return criada;
        } catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23505') {
                throw erroHttp('Já existe um botão nesta posição para a cena.', 409);
            }
            throw error;
        } finally {
            client.release();
        }
    }

    static async alterar(id, dados) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const configuracao = await NavegacaoEstrutural.buscarConfiguracaoPorId(id, client);
            if (!configuracao) throw erroHttp('Navegação estrutural não encontrada.', 404);

            await this.validarMesmoLivro(configuracao.cena_origem_id, dados.cena_destino_id, client);
            const alterada = await NavegacaoEstrutural.alterar(id, {
                ...dados,
                rotulo: dados.rotulo.trim(),
            }, client);
            if (!alterada) throw erroHttp('Navegação estrutural não encontrada.', 404);
            await client.query('COMMIT');
            return alterada;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async reordenar(cena_origem_id, ordem) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const origem = await client.query(`
                SELECT c.id
                  FROM cenas c
                  JOIN capitulos cap ON cap.id = c.capitulo_id
                 WHERE c.id = $1
                   AND c.ativo = TRUE
                   AND cap.ativo = TRUE
                 FOR UPDATE OF c
            `, [cena_origem_id]);
            if (!origem.rows[0]) {
                const erro = new Error('Cena de origem não encontrada ou indisponível.');
                erro.statusCode = 404;
                throw erro;
            }

            const atuais = await client.query(`
                SELECT id
                  FROM navegacoes_estruturais
                 WHERE cena_origem_id = $1
                   AND ativo = TRUE
                 ORDER BY ordem_exibicao
                 FOR UPDATE
            `, [cena_origem_id]);
            const idsAtuais = new Set(atuais.rows.map((item) => item.id));
            const idsRecebidos = ordem.map((item) => item.id);

            if (idsRecebidos.length !== idsAtuais.size) {
                const erro = new Error('A ordem deve conter todos os botões ativos da cena.');
                erro.statusCode = 400;
                throw erro;
            }
            if (new Set(idsRecebidos).size !== idsRecebidos.length) {
                const erro = new Error('A ordem não pode conter botões repetidos.');
                erro.statusCode = 400;
                throw erro;
            }
            if (idsRecebidos.some((id) => !idsAtuais.has(id))) {
                const erro = new Error('Um ou mais botões informados não pertencem à cena.');
                erro.statusCode = 400;
                throw erro;
            }

            const resultado = await NavegacaoEstrutural.reordenar(cena_origem_id, ordem, client);
            await client.query('COMMIT');
            return resultado;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async desativar(id) {
        const configuracao = await NavegacaoEstrutural.buscarConfiguracaoPorId(id);
        if (!configuracao) return null;
        return NavegacaoEstrutural.desativar(id);
    }
}

module.exports = NavegacaoEstruturalService;
