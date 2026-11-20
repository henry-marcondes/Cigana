const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const exigirPermissao = require('../src/middleware/exigirPermissao');
const pool = require('../src/db/pool');
const PermissaoFinanceira = require('../src/models/PermissaoFinanceira');

const usuarioFinanceiroId = 'e4fc3e89-16b3-4e56-8353-3e7c7676083a';
const usuarioIdExterno = '6ad662a5-4bb5-4111-bb05-c9b03c4abc13';
const permissaoNecessaria = 'financeiro.extrato.consultar';

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

async function executarMiddleware(usuario, resultadoConsulta, t) {
    let queryExecutada;
    t.mock.method(pool, 'obterPool', () => ({
        query: async (sql, parametros) => {
            queryExecutada = { sql, parametros };
            if (resultadoConsulta instanceof Error) throw resultadoConsulta;
            return { rows: resultadoConsulta };
        }
    }));

    const req = { usuario };
    const res = criarResposta();
    let chamouNext = false;
    await exigirPermissao(permissaoNecessaria)(req, res, () => {
        chamouNext = true;
    });

    return { req, res, chamouNext, queryExecutada };
}

test('usuário sem associação financeira não recebe autorização', async (t) => {
    const resultado = await executarMiddleware({ id: usuarioIdExterno, usuarioFinanceiroId }, [], t);

    assert.equal(resultado.res.statusCode, 403);
    assert.equal(resultado.chamouNext, false);
    assert.deepEqual(resultado.queryExecutada.parametros, [usuarioFinanceiroId]);
});

test('usuário recebe autorização quando a consulta retorna a permissão exigida', async (t) => {
    const resultado = await executarMiddleware(
        { id: usuarioIdExterno, usuarioFinanceiroId },
        [{ codigo: permissaoNecessaria }],
        t
    );

    assert.equal(resultado.res.statusCode, null);
    assert.equal(resultado.chamouNext, true);
});

test('papel sem a permissão exigida não autoriza a operação', async (t) => {
    const resultado = await executarMiddleware(
        { id: usuarioIdExterno, usuarioFinanceiroId, papel: 'papel-com-outra-permissao' },
        [{ codigo: 'financeiro.pagamento.consultar' }],
        t
    );

    assert.equal(resultado.res.statusCode, 403);
    assert.equal(resultado.chamouNext, false);
});

test('usuário inativo não recebe permissão efetiva', async (t) => {
    const resultado = await executarMiddleware({ id: usuarioIdExterno, usuarioFinanceiroId }, [], t);

    assert.equal(resultado.res.statusCode, 403);
    assert.match(resultado.queryExecutada.sql, /usuario\.ativo = TRUE/);
    assert.match(resultado.queryExecutada.sql, /usuario_papel\.ativo = TRUE/);
    assert.match(resultado.queryExecutada.sql, /papel\.ativo = TRUE/);
    assert.match(resultado.queryExecutada.sql, /papel_permissao\.ativo = TRUE/);
    assert.match(resultado.queryExecutada.sql, /permissao\.ativo = TRUE/);
});

test('declarações de papel e permissão no JWT não concedem acesso', async (t) => {
    const resultado = await executarMiddleware({
        id: usuarioIdExterno,
        usuarioFinanceiroId,
        role: 'financeiro_admin',
        roles: ['financeiro_admin'],
        permissions: [permissaoNecessaria]
    }, [], t);

    assert.equal(resultado.res.statusCode, 403);
    assert.equal(resultado.chamouNext, false);
});

test('falha na consulta ao banco resulta em negação segura', async (t) => {
    const resultado = await executarMiddleware(
        { id: usuarioIdExterno, usuarioFinanceiroId },
        new Error('falha interna simulada'),
        t
    );

    assert.equal(resultado.res.statusCode, 503);
    assert.equal(resultado.chamouNext, false);
    assert.deepEqual(resultado.res.body, {
        success: false,
        message: 'Não foi possível validar a autorização financeira.'
    });
});

test('middleware exige identidade previamente autenticada e código de permissão válido', async () => {
    assert.throws(() => exigirPermissao(' '), /código da permissão/);

    const res = criarResposta();
    let chamouNext = false;
    await exigirPermissao(permissaoNecessaria)(
        { usuario: { role: 'financeiro_admin' } },
        res,
        () => { chamouNext = true; }
    );

    assert.equal(res.statusCode, 401);
    assert.equal(chamouNext, false);
});

test('model consulta apenas relações ativas no schema financeiro', async (t) => {
    let chamada;
    t.mock.method(pool, 'obterPool', () => ({
        query: async (sql, parametros) => {
            chamada = { sql, parametros };
            return { rows: [{ codigo: permissaoNecessaria }] };
        }
    }));

    const permissoes = await PermissaoFinanceira
        .listarCodigosEfetivosPorUsuario(usuarioFinanceiroId);

    assert.deepEqual(permissoes, [permissaoNecessaria]);
    assert.deepEqual(chamada.parametros, [usuarioFinanceiroId]);
    assert.match(chamada.sql, /FROM financeiro\.usuarios_financeiros/);
    assert.match(chamada.sql, /JOIN financeiro\.usuario_papeis_financeiros/);
    assert.match(chamada.sql, /usuario_papel\.usuario_financeiro_id = usuario\.id/);
    assert.match(chamada.sql, /WHERE usuario\.id = \$1/);
    assert.match(chamada.sql, /JOIN financeiro\.papeis_financeiros/);
    assert.match(chamada.sql, /JOIN financeiro\.papel_permissoes_financeiras/);
    assert.match(chamada.sql, /JOIN financeiro\.permissoes_financeiras/);
});

test('migration cria RBAC local sem seeds ou referência ao banco principal', () => {
    const migration = fs.readFileSync(
        path.resolve(__dirname, '../database/migrations/0002_create_rbac_financeiro.sql'),
        'utf8'
    );

    for (const tabela of [
        'usuarios_financeiros',
        'papeis_financeiros',
        'permissoes_financeiras',
        'usuario_papeis_financeiros',
        'papel_permissoes_financeiras'
    ]) {
        assert.match(migration, new RegExp(`CREATE TABLE financeiro\\.${tabela}`));
    }

    const referencias = [...migration.matchAll(/REFERENCES\s+([a-z_.]+)/gi)]
        .map((match) => match[1]);
    assert.ok(referencias.length > 0);
    assert.ok(referencias.every((alvo) => alvo.startsWith('financeiro.')));
    assert.doesNotMatch(migration, /INSERT\s+INTO/i);
});
