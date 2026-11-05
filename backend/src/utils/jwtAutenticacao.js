const jwt = require('jsonwebtoken');
const { verificarToken } = require('./jwt');
const { verificarTokenRS256 } = require('./jwtAsimetrico');

const ALGORITMO_LEGADO = 'HS256';
const ALGORITMO_ASSIMETRICO = 'RS256';

function obterAlgoritmo(token) {
    const decodificado = jwt.decode(token, { complete: true });

    if (
        !decodificado ||
        !decodificado.header ||
        typeof decodificado.header.alg !== 'string'
    ) {
        throw new Error('Token JWT inválido.');
    }

    return decodificado.header.alg;
}

function verificarTokenApiPrincipal(token) {
    const algoritmo = obterAlgoritmo(token);

    if (algoritmo === ALGORITMO_LEGADO) {
        try {
            return verificarToken(token);
        } catch {
            throw new Error('Token JWT inválido.');
        }
    }

    if (algoritmo === ALGORITMO_ASSIMETRICO) {
        if (process.env.JWT_RS256_ENABLED !== 'true') {
            throw new Error('Token JWT inválido.');
        }

        try {
            return verificarTokenRS256(token);
        } catch {
            throw new Error('Token JWT inválido.');
        }
    }

    throw new Error('Token JWT inválido.');
}

module.exports = {
    verificarTokenApiPrincipal
};
