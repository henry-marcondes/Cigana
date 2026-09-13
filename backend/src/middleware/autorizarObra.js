const AutorizacaoService = require('../services/autorizacaoService');
const { error } = require('../utils/apiResponse');

function autorizarObra(
    resolverLivroId,
    codigoPermissao = 'obra.editar'
) {
    return async function (req, res, next) {

        if (!req.usuario || !req.usuario.id) {
            return error(res, 'Usuário não autenticado.', 401);
        }

        if (
            !codigoPermissao ||
            typeof codigoPermissao !== 'string'
        ) {
            return error(
                res,
                'Permissão de autorização não informada.',
                500
            );
        }

        try {
            const livro_id = await resolverLivroId(req);

            if (!livro_id) {
                return error(
                    res,
                    'Obra não identificada.',
                    400
                );
            }

            const autorizado =
                await AutorizacaoService.podeEditarObra(
                    req.usuario.id,
                    livro_id,
                    codigoPermissao
                );

            if (!autorizado) {
                return error(
                    res,
                    'Usuário não possui autorização para executar esta operação nesta obra.',
                    403
                );
            }

            req.livro_id = livro_id;

            next();

        } catch (err) {
            next(err);
        }
    };
}

module.exports = autorizarObra;
