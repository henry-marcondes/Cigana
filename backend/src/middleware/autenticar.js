const { verificarToken } = require('../utils/jwt');
const { error } = require('../utils/apiResponse');

function autenticar(req, res, next) {

    const authorization = req.headers.authorization;

    if (!authorization) {
        return error(
            res,
            'Token de autenticação não informado.',
            401
        );
    }

    const partes = authorization.split(' ');

    if (
        partes.length !== 2 ||
        partes[0] !== 'Bearer'
    ) {
        return error(
            res,
            'Formato do token de autenticação inválido.',
            401
        );
    }

    const token = partes[1];

    try {

        const payload = verificarToken(token);

        req.usuario = payload;

        next();

    } catch (err) {

        return error(
            res,
            'Token de autenticação inválido ou expirado.',
            401
        );
    }
}

module.exports = autenticar;
