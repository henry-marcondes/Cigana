const { verificarToken } = require('../utils/jwt');
const IdentidadeExternaService = require('../services/IdentidadeExternaService');

async function autenticar(req, res, next) {
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

    let usuario;
    try {
        usuario = verificarToken(partes[1]);
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticação inválido ou expirado.'
        });
    }

    try {
        const identidade = await IdentidadeExternaService.resolverIdentidade(
            usuario.iss,
            usuario.id
        );

        if (!identidade) {
            return res.status(403).json({
                success: false,
                message: 'Identidade financeira não cadastrada ou inativa.'
            });
        }

        req.usuario = {
            ...usuario,
            usuarioFinanceiroId: identidade.usuarioFinanceiroId,
            plataformaCodigo: identidade.plataformaCodigo
        };
        return next();
    } catch {
        return res.status(503).json({
            success: false,
            message: 'Não foi possível resolver a identidade financeira.'
        });
    }
}

module.exports = autenticar;
