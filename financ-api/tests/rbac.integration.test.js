const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { test } = require('node:test');
const { criarPool, definirPool } = require('../src/db/pool');
const AutorizacaoFinanceiraService = require('../src/services/AutorizacaoFinanceiraService');
const exigirPermissao = require('../src/middleware/exigirPermissao');

const USUARIO_ADMIN_ID = 'e4fc3e89-16b3-4e56-8353-3e7c7676083a';
const PERMISSAO_ADMIN_RBAC = 'financeiro.rbac.consultar';
const CODIGO_PAPEL_ADMIN_RBAC = 'ADMIN_RBAC_FINANCEIRO';

function criarResposta() {
    return {
        statusCode: null,
        body: null,
        status(codigo) {
            this.statusCode = codigo;
            return this;
        },
        json(corpo) {
            this.body = corpo;
            return this;
        }
    };
}

async function executarMiddleware(codigoPermissao) {
    // req.usuario representa identidade já autenticada: este teste isola autorização;
    // a validação JWT permanece coberta pelas suítes JWT existentes.
    const req = { usuario: { id: USUARIO_ADMIN_ID } };
    const res = criarResposta();
    let chamouNext = false;

    await exigirPermissao(codigoPermissao)(req, res, () => {
        chamouNext = true;
    });

    return { res, chamouNext };
}

async function capturarEstadoRbac(client) {
    const tabelas = [
        ['usuarios_financeiros', 'usuario_id_externo'],
        ['papeis_financeiros', 'id'],
        ['permissoes_financeiras', 'id'],
        ['usuario_papeis_financeiros', 'usuario_id_externo, papel_id'],
        ['papel_permissoes_financeiras', 'papel_id, permissao_id']
    ];
    const estado = {};

    for (const [tabela, ordem] of tabelas) {
        const resultado = await client.query(`
            SELECT COALESCE(jsonb_agg(to_jsonb(registro) ORDER BY ${ordem}), '[]'::jsonb) AS linhas
              FROM financeiro.${tabela} AS registro
        `);
        estado[tabela] = resultado.rows[0].linhas;
    }

    return estado;
}

test('integra middleware RBAC com financeiro_db sem persistir fixtures', async (t) => {
    const databasePool = criarPool();
    let client;

    try {
        client = await databasePool.connect();
        definirPool({ query: (sql, parametros) => client.query(sql, parametros) });

        const banco = await client.query('SELECT current_database() AS nome');
        assert.equal(banco.rows[0].nome, 'financeiro_db');

        const associacao = await client.query(`
            SELECT usuario.ativo AS usuario_ativo,
                   usuario_papel.ativo AS associacao_ativa,
                   papel.id AS papel_id,
                   papel.ativo AS papel_ativo,
                   permissao.id AS permissao_id,
                   permissao.ativo AS permissao_ativa,
                   papel_permissao.ativo AS permissao_papel_ativa
              FROM financeiro.usuarios_financeiros AS usuario
              INNER JOIN financeiro.usuario_papeis_financeiros AS usuario_papel
                ON usuario_papel.usuario_id_externo = usuario.usuario_id_externo
              INNER JOIN financeiro.papeis_financeiros AS papel
                ON papel.id = usuario_papel.papel_id
              INNER JOIN financeiro.papel_permissoes_financeiras AS papel_permissao
                ON papel_permissao.papel_id = papel.id
              INNER JOIN financeiro.permissoes_financeiras AS permissao
                ON permissao.id = papel_permissao.permissao_id
             WHERE usuario.usuario_id_externo = $1
               AND papel.codigo = $2
               AND permissao.codigo = $3
        `, [USUARIO_ADMIN_ID, CODIGO_PAPEL_ADMIN_RBAC, PERMISSAO_ADMIN_RBAC]);

        assert.equal(associacao.rowCount, 1, 'administrador e permissão devem estar provisionados');
        assert.ok(Object.values(associacao.rows[0]).every(Boolean), 'todos os registros do caminho precisam estar ativos');

        const estadoAntes = await capturarEstadoRbac(client);
        const permissoesBase = await AutorizacaoFinanceiraService
            .listarPermissoesEfetivas(USUARIO_ADMIN_ID);

        await t.test('administrador possui financeiro.rbac.consultar no banco', async () => {
            assert.ok(permissoesBase.includes(PERMISSAO_ADMIN_RBAC));
        });

        await t.test('middleware permite acesso com permissão efetiva ativa', async () => {
            const resultado = await executarMiddleware(PERMISSAO_ADMIN_RBAC);
            assert.equal(resultado.chamouNext, true);
            assert.equal(resultado.res.statusCode, null);
        });

        await t.test('permissão não atribuída não autoriza', async () => {
            const codigoNaoAtribuido = `financeiro.rbac.integration.nao-atribuida.${randomUUID()}`;
            await client.query('BEGIN');
            try {
                const fixture = await client.query(`
                    INSERT INTO financeiro.permissoes_financeiras (
                        codigo, nome, descricao, criado_por_usuario_id_externo
                    )
                    VALUES ($1, $2, $3, $4)
                    RETURNING id
                `, [
                    codigoNaoAtribuido,
                    'Permissão de teste não atribuída',
                    'Fixture temporária da integração RBAC.',
                    USUARIO_ADMIN_ID
                ]);
                assert.equal(fixture.rowCount, 1);
                assert.equal(permissoesBase.includes(codigoNaoAtribuido), false);

                const resultado = await executarMiddleware(codigoNaoAtribuido);
                assert.equal(resultado.chamouNext, false);
                assert.equal(resultado.res.statusCode, 403);
            } finally {
                await client.query('ROLLBACK');
            }
        });

        await t.test('associação de usuário inativa não autoriza', async () => {
            await client.query('BEGIN');
            try {
                const alteracao = await client.query(`
                    UPDATE financeiro.usuario_papeis_financeiros
                       SET ativo = FALSE
                     WHERE usuario_id_externo = $1
                       AND papel_id = $2
                `, [USUARIO_ADMIN_ID, associacao.rows[0].papel_id]);
                assert.equal(alteracao.rowCount, 1);

                const resultado = await executarMiddleware(PERMISSAO_ADMIN_RBAC);
                assert.equal(resultado.chamouNext, false);
                assert.equal(resultado.res.statusCode, 403);
            } finally {
                await client.query('ROLLBACK');
            }
        });

        await t.test('papel inativo não autoriza', async () => {
            await client.query('BEGIN');
            try {
                await client.query('UPDATE financeiro.papeis_financeiros SET ativo = FALSE WHERE id = $1', [
                    associacao.rows[0].papel_id
                ]);

                const resultado = await executarMiddleware(PERMISSAO_ADMIN_RBAC);
                assert.equal(resultado.chamouNext, false);
                assert.equal(resultado.res.statusCode, 403);
            } finally {
                await client.query('ROLLBACK');
            }
        });

        await t.test('permissão inativa não autoriza', async () => {
            await client.query('BEGIN');
            try {
                await client.query('UPDATE financeiro.permissoes_financeiras SET ativo = FALSE WHERE id = $1', [
                    associacao.rows[0].permissao_id
                ]);

                const resultado = await executarMiddleware(PERMISSAO_ADMIN_RBAC);
                assert.equal(resultado.chamouNext, false);
                assert.equal(resultado.res.statusCode, 403);
            } finally {
                await client.query('ROLLBACK');
            }
        });

        await t.test('falha real de consulta PostgreSQL resulta em negação segura', async () => {
            definirPool({
                query: () => client.query('SELECT * FROM financeiro.tabela_de_teste_inexistente')
            });

            const resultado = await executarMiddleware(PERMISSAO_ADMIN_RBAC);
            assert.equal(resultado.chamouNext, false);
            assert.equal(resultado.res.statusCode, 503);
            assert.deepEqual(resultado.res.body, {
                success: false,
                message: 'Não foi possível validar a autorização financeira.'
            });
        });

        definirPool({ query: (sql, parametros) => client.query(sql, parametros) });
        const estadoDepois = await capturarEstadoRbac(client);
        assert.deepEqual(estadoDepois, estadoAntes, 'nenhuma alteração deve persistir no financeiro_db');
    } finally {
        definirPool(null);
        if (client) client.release();
        await databasePool.end();
    }
});
