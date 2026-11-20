const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const { test } = require('node:test');

const UUID_USUARIO = 'bf03c86c-de36-4409-9305-ba8752edd3b2';
const PAR_CHAVES = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

test('login Cigana emite token aceito pela autenticação da API Financeira', async () => {
    const nomesVariaveis = [
        'JWT_RS256_PRIVATE_KEY',
        'JWT_RS256_PUBLIC_KEY',
        'JWT_RS256_KID',
        'JWT_ISSUER',
        'JWT_AUDIENCE',
        'JWT_RS256_ENABLED',
        'FINANC_API_JWT_PUBLIC_KEY',
        'FINANC_API_JWT_KID',
        'FINANC_API_JWT_ISSUER',
        'FINANC_API_JWT_AUDIENCE'
    ];
    const variaveisOriginais = Object.fromEntries(
        nomesVariaveis.map((nome) => [nome, process.env[nome]])
    );
    const kid = 'cigana-financeira-integration-test';
    const issuer = 'https://cigana.test';
    const audience = 'cigana-financ-api-test';

    Object.assign(process.env, {
        JWT_RS256_PRIVATE_KEY: PAR_CHAVES.privateKey,
        JWT_RS256_PUBLIC_KEY: PAR_CHAVES.publicKey,
        JWT_RS256_KID: kid,
        JWT_ISSUER: issuer,
        JWT_AUDIENCE: audience,
        JWT_RS256_ENABLED: 'true',
        FINANC_API_JWT_PUBLIC_KEY: PAR_CHAVES.publicKey,
        FINANC_API_JWT_KID: kid,
        FINANC_API_JWT_ISSUER: issuer,
        FINANC_API_JWT_AUDIENCE: audience
    });

    const UsuarioService = require('../src/services/usuarioService');
    const autenticar = require('../src/controllers/UsuarioController').autenticar;
    const autenticarFinanceiro = require('../../financ-api/src/middleware/autenticar');
    const { verificarToken } = require('../../financ-api/src/utils/jwt');
    const autenticarOriginal = UsuarioService.autenticarUsuario;

    try {
        UsuarioService.autenticarUsuario = async () => ({ id: UUID_USUARIO });

        const respostaLogin = {
            statusCode: null,
            body: null,
            status(codigo) { this.statusCode = codigo; return this; },
            json(corpo) { this.body = corpo; return this; }
        };
        await autenticar({ body: { email: 'teste@cigana.test', senha: 'senha-teste' } }, respostaLogin);

        assert.equal(respostaLogin.statusCode, 200);
        assert.equal(respostaLogin.body.data.usuario.id, UUID_USUARIO);
        const token = respostaLogin.body.data.token;
        assert.equal(token.split('.')[0] && JSON.parse(Buffer.from(token.split('.')[0], 'base64url')).alg, 'RS256');

        const payloadFinanceiro = verificarToken(token);
        assert.equal(payloadFinanceiro.sub, UUID_USUARIO);
        assert.equal(payloadFinanceiro.id, UUID_USUARIO);
        assert.equal(payloadFinanceiro.iss, issuer);
        assert.equal(payloadFinanceiro.aud, audience);
        assert.equal(payloadFinanceiro.exp - payloadFinanceiro.iat, 86400);

        const reqFinanceiro = { headers: { authorization: `Bearer ${token}` } };
        const resFinanceiro = {
            statusCode: null,
            body: null,
            status(codigo) { this.statusCode = codigo; return this; },
            json(corpo) { this.body = corpo; return this; }
        };
        let chamouNext = false;
        autenticarFinanceiro(reqFinanceiro, resFinanceiro, () => { chamouNext = true; });

        assert.equal(chamouNext, true);
        assert.equal(reqFinanceiro.usuario.id, UUID_USUARIO);
        assert.equal(reqFinanceiro.usuario.sub, UUID_USUARIO);
        assert.equal(resFinanceiro.statusCode, null);
    } finally {
        UsuarioService.autenticarUsuario = autenticarOriginal;
        for (const [nome, valor] of Object.entries(variaveisOriginais)) {
            if (valor === undefined) delete process.env[nome];
            else process.env[nome] = valor;
        }
    }
});
