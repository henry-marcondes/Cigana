const assert = require('node:assert/strict');
const { generateKeyPairSync, sign: assinarBytes } = require('node:crypto');
const { after, before, test } = require('node:test');
const jwt = require('jsonwebtoken');

const variaveisOriginais = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_RS256_PRIVATE_KEY: process.env.JWT_RS256_PRIVATE_KEY,
    JWT_RS256_PUBLIC_KEY: process.env.JWT_RS256_PUBLIC_KEY,
    JWT_RS256_KID: process.env.JWT_RS256_KID,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    JWT_RS256_ENABLED: process.env.JWT_RS256_ENABLED
};

const chaveTeste = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const uuid = 'bf03c86c-de36-4409-9305-ba8752edd3b2';
const issuer = 'emissor-teste';
const audiencePrincipal = 'audiencia-principal-teste';
const segredoLegadoTeste = 'segredo-legado-apenas-para-teste';

function restaurarVariaveis() {
    for (const [nome, valor] of Object.entries(variaveisOriginais)) {
        if (valor === undefined) delete process.env[nome];
        else process.env[nome] = valor;
    }
}

function comRs256Habilitado(executar) {
    const valorOriginal = process.env.JWT_RS256_ENABLED;
    process.env.JWT_RS256_ENABLED = 'true';

    try {
        return executar();
    } finally {
        if (valorOriginal === undefined) delete process.env.JWT_RS256_ENABLED;
        else process.env.JWT_RS256_ENABLED = valorOriginal;
    }
}

function comVariaveis(overrides, executar) {
    const anteriores = {};

    for (const [nome, valor] of Object.entries(overrides)) {
        anteriores[nome] = process.env[nome];
        if (valor === undefined) delete process.env[nome];
        else process.env[nome] = valor;
    }

    try {
        return executar();
    } finally {
        for (const [nome, valor] of Object.entries(anteriores)) {
            if (valor === undefined) delete process.env[nome];
            else process.env[nome] = valor;
        }
    }
}

function criarTokenRs256({
    audience = audiencePrincipal,
    issuer: emissor = issuer,
    kid = 'kid-principal',
    sub = uuid,
    id = sub
} = {}) {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT', kid };
    const payload = {
        iss: emissor,
        aud: audience,
        sub,
        id,
        iat: now,
        exp: now + 3600
    };
    const headerCodificado = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const assinado = `${headerCodificado}.${payloadCodificado}`;
    const assinatura = assinarBytes('RSA-SHA256', Buffer.from(assinado), chaveTeste.privateKey)
        .toString('base64url');

    return `${assinado}.${assinatura}`;
}

let verificarTokenApiPrincipal;
let verificarTokenLegado;

before(() => {
    process.env.JWT_SECRET = segredoLegadoTeste;
    process.env.JWT_RS256_PRIVATE_KEY = chaveTeste.privateKey;
    process.env.JWT_RS256_PUBLIC_KEY = chaveTeste.publicKey;
    process.env.JWT_RS256_KID = 'kid-principal';
    process.env.JWT_ISSUER = issuer;
    process.env.JWT_AUDIENCE = audiencePrincipal;
    delete process.env.JWT_RS256_ENABLED;

    ({ verificarTokenApiPrincipal } = require('../src/utils/jwtAutenticacao'));
    ({ verificarToken: verificarTokenLegado } = require('../src/utils/jwt'));
});

after(restaurarVariaveis);

test('valida token legado HS256 apenas pelo caminho legado', () => {
    const token = jwt.sign({ id: uuid }, segredoLegadoTeste, {
        algorithm: 'HS256',
        expiresIn: '1h'
    });

    assert.equal(verificarTokenLegado(token).id, uuid);
    assert.equal(verificarTokenApiPrincipal(token).id, uuid);
});

test('aceita HS256 com a flag RS256 ausente, falsa ou verdadeira', () => {
    const token = jwt.sign({ id: uuid }, segredoLegadoTeste, {
        algorithm: 'HS256',
        expiresIn: '1h'
    });

    for (const valor of [undefined, 'false', 'true']) {
        comVariaveis({ JWT_RS256_ENABLED: valor }, () => {
            assert.equal(verificarTokenApiPrincipal(token).id, uuid);
        });
    }
});

test('verificador legado rejeita RS256, HS384 e HS512', () => {
    const tokenRs256 = criarTokenRs256();
    const tokenHs384 = jwt.sign({ id: uuid }, segredoLegadoTeste, {
        algorithm: 'HS384',
        expiresIn: '1h'
    });
    const tokenHs512 = jwt.sign({ id: uuid }, segredoLegadoTeste, {
        algorithm: 'HS512',
        expiresIn: '1h'
    });

    assert.throws(() => verificarTokenLegado(tokenRs256));
    assert.throws(() => verificarTokenLegado(tokenHs384));
    assert.throws(() => verificarTokenLegado(tokenHs512));
});

test('rejeita RS256 com flag ausente, falsa ou diferente de true', () => {
    const token = criarTokenRs256();

    for (const valor of [undefined, 'false', 'TRUE', '1', '']) {
        comVariaveis({ JWT_RS256_ENABLED: valor }, () => {
            assert.throws(
                () => verificarTokenApiPrincipal(token),
                /^Error: Token JWT inválido\.$/
            );
        });
    }
});

test('valida RS256 somente com flag true e audiência configurada para a API principal', () => {
    comRs256Habilitado(() => {
        const payload = verificarTokenApiPrincipal(criarTokenRs256());

        assert.equal(payload.sub, uuid);
        assert.equal(payload.id, uuid);
    });
});

test('rejeita token RS256 destinado a outra audiência', () => {
    comRs256Habilitado(() => {
        assert.throws(
            () => verificarTokenApiPrincipal(criarTokenRs256({ audience: 'cigana-api-financeira' })),
            /^Error: Token JWT inválido\.$/
        );
    });
});

test('rejeita token RS256 com emissor incorreto', () => {
    comRs256Habilitado(() => {
        assert.throws(
            () => verificarTokenApiPrincipal(criarTokenRs256({ issuer: 'outro-emissor' })),
            /^Error: Token JWT inválido\.$/
        );
    });
});

test('rejeita HS384 sem tentar validar como RS256 ou como HS256', () => {
    const token = jwt.sign({ id: uuid }, segredoLegadoTeste, {
        algorithm: 'HS384',
        expiresIn: '1h'
    });

    assert.throws(() => verificarTokenApiPrincipal(token), /^Error: Token JWT inválido\.$/);
});

test('rejeita RS256 com kid não configurado sem fallback para o segredo legado', () => {
    comRs256Habilitado(() => {
        assert.throws(
            () => verificarTokenApiPrincipal(criarTokenRs256({ kid: 'kid-desconhecido' })),
            /^Error: Token JWT inválido\.$/
        );
    });
});

test('rejeita RS256 inválido sem fallback para validação legada', () => {
    comRs256Habilitado(() => {
        const token = criarTokenRs256();
        const partes = token.split('.');
        partes[2] = `${partes[2][0] === 'A' ? 'B' : 'A'}${partes[2].slice(1)}`;

        assert.throws(
            () => verificarTokenApiPrincipal(partes.join('.')),
            /^Error: Token JWT inválido\.$/
        );
    });
});

test('falha fechada se configuração RS256 estiver incompleta com a flag habilitada', () => {
    process.env.JWT_RS256_ENABLED = 'true';
    const audienciaOriginal = process.env.JWT_AUDIENCE;
    delete process.env.JWT_AUDIENCE;

    try {
        assert.throws(
            () => verificarTokenApiPrincipal(criarTokenRs256()),
            /^Error: Token JWT inválido\.$/
        );
    } finally {
        if (audienciaOriginal === undefined) delete process.env.JWT_AUDIENCE;
        else process.env.JWT_AUDIENCE = audienciaOriginal;
        delete process.env.JWT_RS256_ENABLED;
    }
});
