const assert = require('node:assert/strict');
const { generateKeyPairSync, sign: assinarBytes } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { after, before, test } = require('node:test');

const configuracaoOriginal = {
    JWT_RS256_PRIVATE_KEY: process.env.JWT_RS256_PRIVATE_KEY,
    JWT_RS256_PUBLIC_KEY: process.env.JWT_RS256_PUBLIC_KEY,
    JWT_RS256_KID: process.env.JWT_RS256_KID,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    JWT_SECRET: process.env.JWT_SECRET
};

const parTeste = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const outraChaveTeste = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const configuracaoTeste = {
    privateKey: parTeste.privateKey,
    publicKey: parTeste.publicKey,
    kid: 'kid-teste',
    issuer: 'emissor-teste',
    audience: 'audiencia-teste'
};

const UUID_VALIDO = 'bf03c86c-de36-4409-9305-ba8752edd3b2';
const UUID_OUTRO = 'a0a56ca2-0ece-4dd8-b3c9-84dc70407331';

function definirConfiguracaoTeste() {
    process.env.JWT_RS256_PRIVATE_KEY = configuracaoTeste.privateKey;
    process.env.JWT_RS256_PUBLIC_KEY = configuracaoTeste.publicKey;
    process.env.JWT_RS256_KID = configuracaoTeste.kid;
    process.env.JWT_ISSUER = configuracaoTeste.issuer;
    process.env.JWT_AUDIENCE = configuracaoTeste.audience;
    delete process.env.JWT_SECRET;
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

function criarToken(payloadOverrides = {}, headerOverrides = {}, keyPair = parTeste) {
    const now = Math.floor(Date.now() / 1000);
    const header = {
        alg: 'RS256',
        typ: 'JWT',
        kid: configuracaoTeste.kid,
        ...headerOverrides
    };
    const payload = {
        iss: configuracaoTeste.issuer,
        aud: configuracaoTeste.audience,
        sub: UUID_VALIDO,
        id: UUID_VALIDO,
        iat: now,
        exp: now + 3600,
        ...payloadOverrides
    };
    const headerCodificado = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const assinado = `${headerCodificado}.${payloadCodificado}`;
    const assinatura = assinarBytes('RSA-SHA256', Buffer.from(assinado), keyPair.privateKey)
        .toString('base64url');

    return `${assinado}.${assinatura}`;
}

function alterarAssinatura(token) {
    const partes = token.split('.');
    const primeiro = partes[2][0];
    partes[2] = `${primeiro === 'A' ? 'B' : 'A'}${partes[2].slice(1)}`;
    return partes.join('.');
}

let assinarTokenRS256;
let verificarTokenRS256;

before(() => {
    definirConfiguracaoTeste();
    ({ assinarTokenRS256, verificarTokenRS256 } = require('../src/utils/jwtAsimetrico'));
});

after(() => {
    for (const [nome, valor] of Object.entries(configuracaoOriginal)) {
        if (valor === undefined) delete process.env[nome];
        else process.env[nome] = valor;
    }
});

test('emite RS256 com UUID, claims contratuais e validade de um dia', () => {
    const token = assinarTokenRS256(UUID_VALIDO);
    const payload = verificarTokenRS256(token);
    const [cabecalho] = token.split('.');
    const header = JSON.parse(Buffer.from(cabecalho, 'base64url').toString('utf8'));

    assert.equal(header.alg, 'RS256');
    assert.equal(header.kid, configuracaoTeste.kid);
    assert.equal(payload.sub, UUID_VALIDO);
    assert.equal(payload.id, payload.sub);
    assert.equal(payload.iss, configuracaoTeste.issuer);
    assert.equal(payload.aud, configuracaoTeste.audience);
    assert.equal(payload.exp - payload.iat, 86400);
});

test('emissão rejeita sub que não esteja no formato UUID', () => {
    assert.throws(() => assinarTokenRS256('usuario-nao-uuid'), /UUID válido/);
});

test('validador funciona sem chave privada configurada', () => {
    const token = assinarTokenRS256(UUID_VALIDO);

    comVariaveis({ JWT_RS256_PRIVATE_KEY: undefined }, () => {
        assert.equal(verificarTokenRS256(token).sub, UUID_VALIDO);
    });
});

test('rejeita assinatura adulterada', () => {
    assert.throws(() => verificarTokenRS256(alterarAssinatura(criarToken())));
});

test('rejeita algoritmo diferente de RS256', () => {
    assert.throws(() => verificarTokenRS256(criarToken({}, { alg: 'HS256' })));
});

test('rejeita kid desconhecido', () => {
    assert.throws(() => verificarTokenRS256(criarToken({}, { kid: 'kid-desconhecido' })));
});

test('rejeita iss e aud incorretos', () => {
    assert.throws(() => verificarTokenRS256(criarToken({ iss: 'outro-emissor' })));
    assert.throws(() => verificarTokenRS256(criarToken({ aud: 'outra-audiencia' })));
});

test('rejeita token expirado além da tolerância de relógio', () => {
    const now = Math.floor(Date.now() / 1000);
    assert.throws(() => verificarTokenRS256(criarToken({
        iat: now - 86410,
        exp: now - 10
    })));
});

test('exp aceita até antes do limite e rejeita no limite de cinco segundos', (t) => {
    const now = 1_700_000_000;
    t.mock.method(Date, 'now', () => now * 1000);

    assert.doesNotThrow(() => verificarTokenRS256(criarToken({
        iat: now - 3600,
        exp: now - 4
    })));
    assert.throws(() => verificarTokenRS256(criarToken({
        iat: now - 3600,
        exp: now - 5
    })));
});

test('nbf respeita a tolerância de cinco segundos no limite e logo além', (t) => {
    const now = 1_700_000_000;
    t.mock.method(Date, 'now', () => now * 1000);

    assert.doesNotThrow(() => verificarTokenRS256(criarToken({
        iat: now,
        nbf: now + 5,
        exp: now + 3600
    })));
    assert.throws(() => verificarTokenRS256(criarToken({
        iat: now,
        nbf: now + 6,
        exp: now + 3600
    })));
});

test('rejeita iat ausente, malformado ou mais de cinco segundos no futuro', () => {
    const now = Math.floor(Date.now() / 1000);

    assert.throws(() => verificarTokenRS256(criarToken({ iat: undefined })));
    assert.throws(() => verificarTokenRS256(criarToken({ iat: 'invalido' })));
    assert.throws(() => verificarTokenRS256(criarToken({ iat: now + 6 })));
});

test('rejeita exp malformado, exp menor ou igual a iat e vida superior a um dia', () => {
    const now = Math.floor(Date.now() / 1000);

    assert.throws(() => verificarTokenRS256(criarToken({ exp: 'invalido' })));
    assert.throws(() => verificarTokenRS256(criarToken({ iat: now, exp: now })));
    assert.throws(() => verificarTokenRS256(criarToken({ iat: now, exp: now + 86401 })));
});

test('rejeita nbf malformado e ainda futuro além da tolerância', () => {
    const now = Math.floor(Date.now() / 1000);

    assert.throws(() => verificarTokenRS256(criarToken({ nbf: 'invalido' })));
    assert.throws(() => verificarTokenRS256(criarToken({ nbf: now + 0.5 })));
    assert.throws(() => verificarTokenRS256(criarToken({ nbf: now + 6 })));
});

test('rejeita sub inválido ou divergente de id', () => {
    assert.throws(() => verificarTokenRS256(criarToken({ sub: 'não-uuid' })));
    assert.throws(() => verificarTokenRS256(criarToken({ id: UUID_OUTRO })));
});

test('rejeita chave pública ausente ou PEM inválido sem expor detalhes', () => {
    const token = criarToken();

    comVariaveis({ JWT_RS256_PUBLIC_KEY: undefined }, () => {
        assert.throws(() => verificarTokenRS256(token), /^Error: Token JWT inválido\.$/);
    });

    comVariaveis({ JWT_RS256_PUBLIC_KEY: 'PEM-INVALIDO-NAO-SECRETO' }, () => {
        assert.throws(() => verificarTokenRS256(token), /^Error: Token JWT inválido\.$/);
    });
});

test('rejeita assinatura feita com chave diferente da pública configurada', () => {
    const token = criarToken({}, {}, outraChaveTeste);
    assert.throws(() => verificarTokenRS256(token), /^Error: Token JWT inválido\.$/);
});

test('rejeita chave pública configurada que não corresponde à assinatura', () => {
    const token = criarToken();

    comVariaveis({ JWT_RS256_PUBLIC_KEY: outraChaveTeste.publicKey }, () => {
        assert.throws(() => verificarTokenRS256(token), /^Error: Token JWT inválido\.$/);
    });
});

test('rejeita configuração incompleta e chave privada inválida', () => {
    comVariaveis({ JWT_RS256_KID: undefined }, () => {
        assert.throws(() => assinarTokenRS256(UUID_VALIDO), /Configuração obrigatória/);
    });

    comVariaveis({ JWT_RS256_PRIVATE_KEY: 'PEM-INVALIDO-NAO-SECRETO' }, () => {
        assert.throws(() => assinarTokenRS256(UUID_VALIDO), /^Error: Falha ao assinar token JWT RS256\.$/);
    });
});

test('rejeita reutilização textual do segredo legado, inclusive PEM escapado', () => {
    const pemEscapado = configuracaoTeste.privateKey.replace(/\n/g, '\\n');

    comVariaveis({
        JWT_RS256_PRIVATE_KEY: pemEscapado,
        JWT_SECRET: pemEscapado
    }, () => {
        assert.throws(() => assinarTokenRS256(UUID_VALIDO), /independente do segredo legado/);
    });
});

test('middlewares usam o dispatcher e o login permanece no JWT legado', () => {
    const controller = readFileSync(
        require.resolve('../src/controllers/UsuarioController.js'),
        'utf8'
    );
    assert.doesNotMatch(controller, /jwtAsimetrico|jwtAutenticacao/);

    for (const caminho of [
        '../src/middleware/autenticar.js',
        '../src/middleware/protegerLeituraObra.js'
    ]) {
        const codigo = readFileSync(require.resolve(caminho), 'utf8');
        assert.match(codigo, /jwtAutenticacao/);
        assert.doesNotMatch(codigo, /require\(['"]\.\.\/utils\/jwt['"]\)/);
        assert.doesNotMatch(codigo, /jwtAsimetrico/);
    }

    const jwtLegado = readFileSync(require.resolve('../src/utils/jwt.js'), 'utf8');
    assert.match(jwtLegado, /jwt\.sign\(payload, JWT_SECRET/);
    assert.match(jwtLegado, /jwt\.verify\(token, JWT_SECRET,\s*\{\s*algorithms:\s*\['HS256'\]/);
});
