const { verificarToken } = require('../utils/jwt');
const { error } = require('../utils/apiResponse');
const Livro = require('../models/Livro');
const AutorizacaoService = require('../services/autorizacaoService');

function protegerLeituraObra(resolverLivroId) {
    return async function (req, res, next) {
        try {
            const livroId = await resolverLivroId(req);
            const livro = await Livro.buscarPorId(livroId);

            if (!livro) {
                return error(res, 'Obra não encontrada.', 404);
            }

            if (await Livro.estaDisponivelPublicamente(livroId)) {
                return next();
            }

            const authorization = req.headers.authorization;
            if (!authorization) {
                return error(
                    res,
                    'Autenticação necessária para visualizar esta obra.',
                    401
                );
            }

            const partes = authorization.split(' ');
            if (partes.length !== 2 || partes[0] !== 'Bearer') {
                return error(
                    res,
                    'Formato do token de autenticação inválido.',
                    401
                );
            }

            try {
                req.usuario = verificarToken(partes[1]);
            } catch (erroToken) {
                return error(
                    res,
                    'Token de autenticação inválido ou expirado.',
                    401
                );
            }

            const autorizado = await AutorizacaoService.podeVisualizarObra(
                req.usuario.id,
                livroId
            );

            if (!autorizado) {
                return error(
                    res,
                    'Usuário não possui autorização para visualizar esta obra.',
                    403
                );
            }

            return next();
        } catch (erroMiddleware) {
            return next(erroMiddleware);
        }
    };
}

module.exports = protegerLeituraObra;
