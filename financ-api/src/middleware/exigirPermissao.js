const AutorizacaoFinanceiraService = require('../services/AutorizacaoFinanceiraService');

function exigirPermissao(codigoPermissao) {
    if (typeof codigoPermissao !== 'string' || codigoPermissao.trim() === '') {
        throw new Error('O código da permissão financeira é obrigatório.');
    }

    return async function middlewareExigirPermissao(req, res, next) {
        const usuarioFinanceiroId = req.usuario && req.usuario.usuarioFinanceiroId;

        if (typeof usuarioFinanceiroId !== 'string' || usuarioFinanceiroId === '') {
            return res.status(401).json({
                success: false,
                message: 'Autenticação necessária.'
            });
        }

        try {
            const permissoes = await AutorizacaoFinanceiraService
                .listarPermissoesEfetivas(usuarioFinanceiroId);

            if (!permissoes.includes(codigoPermissao)) {
                return res.status(403).json({
                    success: false,
                    message: 'Permissão financeira insuficiente.'
                });
            }

            return next();
        } catch {
            return res.status(503).json({
                success: false,
                message: 'Não foi possível validar a autorização financeira.'
            });
        }
    };
}

module.exports = exigirPermissao;
