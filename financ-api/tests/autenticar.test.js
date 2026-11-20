const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const { test } = require('node:test');
const jwt = require('jsonwebtoken');
const autenticar = require('../src/middleware/autenticar');
const IdentidadeExternaService = require('../src/services/IdentidadeExternaService');

const usuarioIdExterno = '6ad662a5-4bb5-4111-bb05-c9b03c4abc13';
const usuarioFinanceiroId = 'e4fc3e89-16b3-4e56-8353-3e7c7676083a';
const issuer = 'https://cigana.integration.test';
const audience = 'financ-api.integration.test';
const kid = 'financ-api-autenticacao-teste';
const parChaves = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

function criarToken({ id = usuarioIdExterno, iss = issuer } = {}) {
    return jwt.sign({ id }, parChaves.privateKey, {
        algorithm: 'RS256',
        keyid: kid,
        issuer: iss,
        audience,
        subject: id,
        expiresIn: 3600
    });
}

function criarResposta() {
    return {
        statusCode: null,
        body: null,
        status(status) { this.statusCode = status; return this; },
        json(body) { this.body = body; return this; }
    };
}

function configurarJwt(t) {
    const names = [
        'FINANC_API_JWT_PUBLIC_KEY',
        'FINANC_API_JWT_KID',
        'FINANC_API_JWT_ISSUER',
        'FINANC_API_JWT_AUDIENCE'
    ];
    const anteriores = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    Object.assign(process.env, {
        FINANC_API_JWT_PUBLIC_KEY: parChaves.publicKey,
        FINANC_API_JWT_KID: kid,
        FINANC_API_JWT_ISSUER: issuer,
        FINANC_API_JWT_AUDIENCE: audience
    });
    t.after(() => {
        for (const [name, value] of Object.entries(anteriores)) {
            if (value === undefined) delete process.env[name];
            else process.env[name] = value;
        }
    });
}

test('preserva o UUID externo e acrescenta a identidade financeira resolvida pelo iss validado', async (t) => {
    configurarJwt(t);
    let argumentos;
    t.mock.method(IdentidadeExternaService, 'resolverIdentidade', async (...args) => {
        argumentos = args;
        return { usuarioFinanceiroId, plataformaCodigo: 'CIGANA' };
    });

    const req = { headers: { authorization: `Bearer ${criarToken()}` } };
    const res = criarResposta();
    let chamouNext = false;

    await autenticar(req, res, () => { chamouNext = true; });

    assert.equal(chamouNext, true);
    assert.equal(req.usuario.id, usuarioIdExterno);
    assert.equal(req.usuario.sub, usuarioIdExterno);
    assert.equal(req.usuario.usuarioFinanceiroId, usuarioFinanceiroId);
    assert.equal(req.usuario.plataformaCodigo, 'CIGANA');
    assert.deepEqual(argumentos, [issuer, usuarioIdExterno]);
});

test('rejeita identidade não cadastrada ou inativa', async (t) => {
    configurarJwt(t);
    t.mock.method(IdentidadeExternaService, 'resolverIdentidade', async () => null);

    const req = { headers: { authorization: `Bearer ${criarToken()}` } };
    const res = criarResposta();
    let chamouNext = false;
    await autenticar(req, res, () => { chamouNext = true; });

    assert.equal(res.statusCode, 403);
    assert.equal(chamouNext, false);
});

test('retorna indisponibilidade se falhar a resolução PostgreSQL', async (t) => {
    configurarJwt(t);
    t.mock.method(IdentidadeExternaService, 'resolverIdentidade', async () => {
        throw new Error('falha simulada');
    });

    const req = { headers: { authorization: `Bearer ${criarToken()}` } };
    const res = criarResposta();
    let chamouNext = false;
    await autenticar(req, res, () => { chamouNext = true; });

    assert.equal(res.statusCode, 503);
    assert.equal(chamouNext, false);
});
