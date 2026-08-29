const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado.');
}

const JWT_EXPIRES_IN = '1d';

function gerarToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
}

function verificarToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    gerarToken,
    verificarToken
};
