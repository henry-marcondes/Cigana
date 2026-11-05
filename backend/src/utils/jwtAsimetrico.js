const jwt = require('jsonwebtoken');

const ALGORITMO = 'RS256';
const VALIDADE_EMISSAO_SEGUNDOS = 24 * 60 * 60;
const TOLERANCIA_RELOGIO_SEGUNDOS = 5;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function obterClaimsConfiguracao() {
    const kid = process.env.JWT_RS256_KID;
    const issuer = process.env.JWT_ISSUER;
    const audience = process.env.JWT_AUDIENCE;

    if (!kid || !issuer || !audience) {
        throw new Error('Configuração obrigatória do JWT RS256 ausente.');
    }

    return { kid, issuer, audience };
}

function normalizarPem(valor) {
    return valor.replace(/\\n/g, '\n');
}

function obterChavePrivada() {
    const configurada = process.env.JWT_RS256_PRIVATE_KEY;

    if (!configurada) {
        throw new Error('Chave privada JWT RS256 ausente no emissor.');
    }

    const privateKey = normalizarPem(configurada);
    const segredoLegado = process.env.JWT_SECRET
        ? normalizarPem(process.env.JWT_SECRET)
        : undefined;

    if (privateKey === segredoLegado) {
        throw new Error('A chave JWT RS256 deve ser independente do segredo legado.');
    }

    return privateKey;
}

function obterChavePublica() {
    const configurada = process.env.JWT_RS256_PUBLIC_KEY;

    if (!configurada) {
        throw new Error('Chave pública JWT RS256 ausente no validador.');
    }

    return normalizarPem(configurada);
}

function ehUuid(valor) {
    return typeof valor === 'string' && UUID_REGEX.test(valor);
}

function assinarTokenRS256(sub) {
    if (!ehUuid(sub)) {
        throw new Error('sub deve ser um UUID válido.');
    }

    const { kid, issuer, audience } = obterClaimsConfiguracao();
    const privateKey = obterChavePrivada();

    try {
        return jwt.sign(
            { id: sub },
            privateKey,
            {
                algorithm: ALGORITMO,
                keyid: kid,
                issuer,
                audience,
                subject: sub,
                expiresIn: VALIDADE_EMISSAO_SEGUNDOS
            }
        );
    } catch {
        throw new Error('Falha ao assinar token JWT RS256.');
    }
}

function verificarTokenRS256(token) {
    const { kid, issuer, audience } = obterClaimsConfiguracao();
    let decodificado;

    try {
        decodificado = jwt.decode(token, { complete: true });
    } catch {
        throw new Error('Token JWT inválido.');
    }

    if (
        !decodificado ||
        !decodificado.header ||
        decodificado.header.alg !== ALGORITMO ||
        decodificado.header.kid !== kid
    ) {
        throw new Error('Token JWT inválido.');
    }

    const now = Math.floor(Date.now() / 1000);
    let payload;

    try {
        payload = jwt.verify(token, obterChavePublica(), {
            algorithms: [ALGORITMO],
            issuer,
            audience,
            clockTimestamp: now,
            clockTolerance: TOLERANCIA_RELOGIO_SEGUNDOS
        });
    } catch {
        throw new Error('Token JWT inválido.');
    }

    if (
        !payload ||
        typeof payload !== 'object' ||
        !ehUuid(payload.sub) ||
        payload.id !== payload.sub ||
        !Number.isSafeInteger(payload.iat) ||
        !Number.isSafeInteger(payload.exp) ||
        payload.iat > now + TOLERANCIA_RELOGIO_SEGUNDOS ||
        payload.exp <= payload.iat ||
        payload.exp - payload.iat > VALIDADE_EMISSAO_SEGUNDOS ||
        (payload.nbf !== undefined && !Number.isSafeInteger(payload.nbf)) ||
        (payload.nbf !== undefined && payload.nbf >= payload.exp)
    ) {
        throw new Error('Token JWT inválido.');
    }

    return payload;
}

module.exports = {
    assinarTokenRS256,
    verificarTokenRS256
};
