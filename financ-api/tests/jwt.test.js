const assert = require('node:assert/strict');
const { generateKeyPairSync, sign: assinarBytes } = require('node:crypto');
const { test } = require('node:test');
const jwt = require('jsonwebtoken');
const autenticar = require('../src/middleware/autenticar');
const { verificarToken } = require('../src/utils/jwt');

const parTeste = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const uuidUsuario = 'bf03c86c-de36-4409-9305-ba8752edd3b2';
const configuracao = {
    FINANC_API_JWT_PUBLIC_KEY: parTeste.publicKey,
    FINANC_API_JWT_KID: 'kid-financ-api-teste',
    FINANC_API_JWT_ISSUER: 'issuer-teste',
    FINANC_API_JWT_AUDIENCE: 'audience-financ-api-teste'
};

function criarToken({
    algorithm = 'RS256',
    key = parTeste.privateKey,
    kid = configuracao.FINANC_API_JWT_KID,
    issuer = configuracao.FINANC_API_JWT_ISSUER,
    audience = configuracao.FINANC_API_JWT_AUDIENCE,
    expiresIn = 3600,
    subject = uuidUsuario,
    id = subject
} = {}) {
    const signingKey = algorithm === 'HS256' ? 'segredo-efemero-de-teste' : key;
    return jwt.sign({ id }, signingKey, {
        algorithm,
        keyid: kid,
        issuer,
        audience,
        subject,
        expiresIn
    });
}

function assinarPayload(payload) {
    const header = Buffer.from(JSON.stringify({
        alg: 'RS256',
        typ: 'JWT',
        kid: configuracao.FINANC_API_JWT_KID
    })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const conteudo = `${header}.${body}`;
    const assinatura = assinarBytes('RSA-SHA256', Buffer.from(conteudo), parTeste.privateKey)
        .toString('base64url');

    return `${conteudo}.${assinatura}`;
}

test('valida RS256 com chave pública e contrato configurado', () => {
    const payload = verificarToken(criarToken(), configuracao);
    assert.equal(payload.sub, uuidUsuario);
    assert.equal(payload.id, uuidUsuario);
    assert.equal(payload.iss, configuracao.FINANC_API_JWT_ISSUER);
    assert.equal(payload.aud, configuracao.FINANC_API_JWT_AUDIENCE);
});

test('rejeita HS256 sem fallback', () => {
    assert.throws(() => verificarToken(criarToken({ algorithm: 'HS256' }), configuracao));
});

test('rejeita assinatura inválida e chave pública que não corresponde', () => {
    const token = criarToken();
    const partes = token.split('.');
    partes[2] = `${partes[2][0] === 'A' ? 'B' : 'A'}${partes[2].slice(1)}`;
    assert.throws(() => verificarToken(partes.join('.'), configuracao));

    const outraChave = generateKeyPairSync('rsa', { modulusLength: 2048 });
    assert.throws(() => verificarToken(token, {
        ...configuracao,
        FINANC_API_JWT_PUBLIC_KEY: outraChave.publicKey.export({ type: 'spki', format: 'pem' })
    }));
});

test('rejeita emissor, audiência e kid incorretos', () => {
    assert.throws(() => verificarToken(criarToken({ issuer: 'outro-issuer' }), configuracao));
    assert.throws(() => verificarToken(criarToken({ audience: 'outra-audience' }), configuracao));
    assert.throws(() => verificarToken(criarToken({ kid: 'kid-desconhecido' }), configuracao));
});

test('rejeita sub fora do formato UUID e divergência entre id e sub', () => {
    assert.throws(() => verificarToken(criarToken({ subject: 'usuario-externo' }), configuracao));
    assert.throws(() => verificarToken(criarToken({ id: 'a0a56ca2-0ece-4dd8-b3c9-84dc70407331' }), configuracao));
});

test('rejeita token expirado', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
        { id: uuidUsuario, iat: now - 20, exp: now - 10 },
        parTeste.privateKey,
        {
            algorithm: 'RS256',
            keyid: configuracao.FINANC_API_JWT_KID,
            issuer: configuracao.FINANC_API_JWT_ISSUER,
            audience: configuracao.FINANC_API_JWT_AUDIENCE,
            subject: uuidUsuario
        }
    );
    assert.throws(() => verificarToken(token, configuracao));
});

test('rejeita claims temporais ausentes, inválidas ou com duração superior a um dia', () => {
    const now = Math.floor(Date.now() / 1000);
    const payloadValido = jwt.decode(criarToken());

    const semIat = { ...payloadValido };
    delete semIat.iat;
    const tokenSemIat = assinarPayload(semIat);
    assert.throws(() => verificarToken(tokenSemIat, configuracao));

    const iatInvalido = assinarPayload({
        ...payloadValido,
        iat: 'tempo-invalido'
    });
    assert.throws(() => verificarToken(iatInvalido, configuracao));

    const duracaoExcessiva = jwt.sign({
        ...payloadValido,
        iat: now,
        exp: now + 86401
    }, parTeste.privateKey, {
        algorithm: 'RS256',
        keyid: configuracao.FINANC_API_JWT_KID
    });
    assert.throws(() => verificarToken(duracaoExcessiva, configuracao));

    const nbfFuturo = jwt.sign({
        ...payloadValido,
        iat: now,
        nbf: now + 60,
        exp: now + 3600
    }, parTeste.privateKey, {
        algorithm: 'RS256',
        keyid: configuracao.FINANC_API_JWT_KID
    });
    assert.throws(() => verificarToken(nbfFuturo, configuracao));
});

test('falha fechada quando configuração RS256 está incompleta ou PEM é inválido', () => {
    const token = criarToken();
    assert.throws(() => verificarToken(token, {}));
    assert.throws(() => verificarToken(token, {
        ...configuracao,
        FINANC_API_JWT_PUBLIC_KEY: 'PEM-INVALIDO'
    }));
});

test('middleware não expõe erro de configuração ou detalhes do token', () => {
    const req = { headers: { authorization: `Bearer ${criarToken()}` } };
    const res = {
        statusCode: null,
        body: null,
        status(status) { this.statusCode = status; return this; },
        json(body) { this.body = body; return this; }
    };

    const env = process.env;
    const names = [
        'FINANC_API_JWT_PUBLIC_KEY',
        'FINANC_API_JWT_KID',
        'FINANC_API_JWT_ISSUER',
        'FINANC_API_JWT_AUDIENCE'
    ];
    const original = Object.fromEntries(names.map((name) => [name, env[name]]));

    try {
        for (const name of names) delete env[name];
        autenticar(req, res, () => assert.fail('não deveria aceitar sem configuração'));
    } finally {
        for (const [name, value] of Object.entries(original)) {
            if (value === undefined) delete env[name];
            else env[name] = value;
        }
    }

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, {
        success: false,
        message: 'Token de autenticação inválido ou expirado.'
    });
});
