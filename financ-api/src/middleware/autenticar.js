const { verificarToken } = require('../utils/jwt');

function autenticar(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticação não informado.'
        });
    }

    const partes = authorization.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({
            success: false,
            message: 'Formato do token de autenticação inválido.'
        });
    }

    try {
        req.usuario = verificarToken(partes[1]);
        return next();
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticação inválido ou expirado.'
        });
    }
}

module.exports = autenticar;
