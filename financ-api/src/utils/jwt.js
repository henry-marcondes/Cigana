const jwt = require('jsonwebtoken');
const { obterConfiguracaoJwt } = require('../config');

const ALGORITMO = 'RS256';
const TOLERANCIA_RELOGIO_SEGUNDOS = 5;
const DURACAO_MAXIMA_SEGUNDOS = 24 * 60 * 60;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ehUuid(valor) {
    return typeof valor === 'string' && UUID_REGEX.test(valor);
}

function verificarToken(token, env = process.env) {
    const configuracao = obterConfiguracaoJwt(env);
    let cabecalho;

    try {
        const decodificado = jwt.decode(token, { complete: true });
        cabecalho = decodificado && decodificado.header;
    } catch {
        throw new Error('Token JWT inválido.');
    }

    if (
        !cabecalho ||
        cabecalho.alg !== ALGORITMO ||
        cabecalho.kid !== configuracao.kid
    ) {
        throw new Error('Token JWT inválido.');
    }

    const now = Math.floor(Date.now() / 1000);
    let payload;

    try {
        payload = jwt.verify(token, configuracao.publicKey, {
            algorithms: [ALGORITMO],
            issuer: configuracao.issuer,
            audience: configuracao.audience,
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
        payload.exp - payload.iat > DURACAO_MAXIMA_SEGUNDOS ||
        (payload.nbf !== undefined && !Number.isSafeInteger(payload.nbf)) ||
        (payload.nbf !== undefined && payload.nbf >= payload.exp)
    ) {
        throw new Error('Token JWT inválido.');
    }

    return payload;
}

module.exports = { verificarToken };
