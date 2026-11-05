const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const { after, afterEach, before, beforeEach, test } = require('node:test');
const jwt = require('jsonwebtoken');

const variaveisOriginais = {};
const nomesVariaveis = [
    'JWT_SECRET',
    'JWT_RS256_PRIVATE_KEY',
    'JWT_RS256_PUBLIC_KEY',
    'JWT_RS256_KID',
    'JWT_ISSUER',
    'JWT_AUDIENCE',
    'JWT_RS256_ENABLED'
];

for (const nome of nomesVariaveis) variaveisOriginais[nome] = process.env[nome];

const parTeste = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const uuidUsuario = 'bf03c86c-de36-4409-9305-ba8752edd3b2';
const segredoTeste = 'segredo-de-teste-do-middleware';
const livroId = 'livro-teste';

let autenticar;
let protegerLeituraObra;
let Livro;
let AutorizacaoService;
let assinarTokenRS256;

function configurarAmbienteTeste() {
    process.env.JWT_SECRET = segredoTeste;
    process.env.JWT_RS256_PRIVATE_KEY = parTeste.privateKey;
    process.env.JWT_RS256_PUBLIC_KEY = parTeste.publicKey;
    process.env.JWT_RS256_KID = 'kid-middleware-teste';
    process.env.JWT_ISSUER = 'emissor-middleware-teste';
    process.env.JWT_AUDIENCE = 'audiencia-api-principal-teste';
    delete process.env.JWT_RS256_ENABLED;
}

function restaurarVariaveis() {
    for (const [nome, valor] of Object.entries(variaveisOriginais)) {
        if (valor === undefined) delete process.env[nome];
        else process.env[nome] = valor;
    }
}

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

function criarReq(authorization) {
    return { headers: authorization === undefined ? {} : { authorization } };
}

function tokenHs256() {
    return jwt.sign({ id: uuidUsuario }, segredoTeste, {
        algorithm: 'HS256',
        expiresIn: '1h'
    });
}

before(() => {
    configurarAmbienteTeste();

    autenticar = require('../src/middleware/autenticar');
    protegerLeituraObra = require('../src/middleware/protegerLeituraObra');
    Livro = require('../src/models/Livro');
    AutorizacaoService = require('../src/services/autorizacaoService');
    ({ assinarTokenRS256 } = require('../src/utils/jwtAsimetrico'));
});

beforeEach(configurarAmbienteTeste);
afterEach(restaurarVariaveis);
after(restaurarVariaveis);

test('autenticar preserva respostas para token ausente, Bearer malformado e token inválido', () => {
    for (const [authorization, status, message] of [
        [undefined, 401, 'Token de autenticação não informado.'],
        ['Basic abc', 401, 'Formato do token de autenticação inválido.'],
        ['Bearer token-invalido', 401, 'Token de autenticação inválido ou expirado.']
    ]) {
        const req = criarReq(authorization);
        const res = criarResposta();
        let chamouNext = false;

        autenticar(req, res, () => { chamouNext = true; });

        assert.equal(res.statusCode, status);
        assert.deepEqual(res.body, { success: false, message });
        assert.equal(chamouNext, false);
    }
});

test('autenticar mantém req.usuario.id para HS256 legado e RS256 habilitado', () => {
    for (const { token, habilitarRs256 } of [
        { token: tokenHs256(), habilitarRs256: false },
        { token: assinarTokenRS256(uuidUsuario), habilitarRs256: true }
    ]) {
        if (habilitarRs256) process.env.JWT_RS256_ENABLED = 'true';
        else delete process.env.JWT_RS256_ENABLED;

        const req = criarReq(`Bearer ${token}`);
        const res = criarResposta();
        let chamouNext = false;

        autenticar(req, res, () => { chamouNext = true; });

        assert.equal(chamouNext, true);
        assert.equal(req.usuario.id, uuidUsuario);
        assert.equal(res.statusCode, null);
    }
    delete process.env.JWT_RS256_ENABLED;
});

test('autenticar rejeita RS256 quando a flag está ausente', () => {
    delete process.env.JWT_RS256_ENABLED;
    const req = criarReq(`Bearer ${assinarTokenRS256(uuidUsuario)}`);
    const res = criarResposta();

    autenticar(req, res, () => assert.fail('não deveria autenticar'));

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Token de autenticação inválido ou expirado.');
});

test('protegerLeituraObra mantém acesso público sem exigir token', async (t) => {
    t.mock.method(Livro, 'buscarPorId', async () => ({ id: livroId }));
    t.mock.method(Livro, 'estaDisponivelPublicamente', async () => true);
    const req = criarReq(undefined);
    const res = criarResposta();
    let chamouNext = false;

    await protegerLeituraObra(() => livroId)(req, res, () => { chamouNext = true; });

    assert.equal(chamouNext, true);
    assert.equal(req.usuario, undefined);
    assert.equal(res.statusCode, null);
});

test('protegerLeituraObra preserva respostas de token ausente e Bearer malformado', async (t) => {
    t.mock.method(Livro, 'buscarPorId', async () => ({ id: livroId }));
    t.mock.method(Livro, 'estaDisponivelPublicamente', async () => false);

    for (const [authorization, message] of [
        [undefined, 'Autenticação necessária para visualizar esta obra.'],
        ['Basic abc', 'Formato do token de autenticação inválido.']
    ]) {
        const req = criarReq(authorization);
        const res = criarResposta();

        await protegerLeituraObra(() => livroId)(req, res, () => {});

        assert.equal(res.statusCode, 401);
        assert.deepEqual(res.body, { success: false, message });
    }
});

test('protegerLeituraObra usa o dispatcher RS256 e preserva req.usuario.id', async (t) => {
    t.mock.method(Livro, 'buscarPorId', async () => ({ id: livroId }));
    t.mock.method(Livro, 'estaDisponivelPublicamente', async () => false);
    t.mock.method(AutorizacaoService, 'podeVisualizarObra', async () => true);
    process.env.JWT_RS256_ENABLED = 'true';

    const req = criarReq(`Bearer ${assinarTokenRS256(uuidUsuario)}`);
    const res = criarResposta();
    let chamouNext = false;

    await protegerLeituraObra(() => livroId)(req, res, () => { chamouNext = true; });

    assert.equal(chamouNext, true);
    assert.equal(req.usuario.id, uuidUsuario);
    delete process.env.JWT_RS256_ENABLED;
});

test('protegerLeituraObra rejeita RS256 desativado com a resposta atual', async (t) => {
    t.mock.method(Livro, 'buscarPorId', async () => ({ id: livroId }));
    t.mock.method(Livro, 'estaDisponivelPublicamente', async () => false);
    delete process.env.JWT_RS256_ENABLED;

    const req = criarReq(`Bearer ${assinarTokenRS256(uuidUsuario)}`);
    const res = criarResposta();

    await protegerLeituraObra(() => livroId)(req, res, () => {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Token de autenticação inválido ou expirado.');
});
