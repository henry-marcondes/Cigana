const AutorizacaoService = require('../services/autorizacaoService');
const { error } = require('../utils/apiResponse');

function autorizarObra(resolverLivroId) {
    return async function (req, res, next) {

        if (!req.usuario || !req.usuario.id) {
            return error(res, 'Usuário não autenticado.', 401);
        }

        try {
            const livro_id = await resolverLivroId(req);

            if (!livro_id) {
                return error(res, 'Obra não identificada.', 400);
            }

            const autorizado = await AutorizacaoService.podeEditarObra(
                req.usuario.id,
                livro_id
            );

            if (!autorizado) {
                return error(
                    res,
                    'Usuário não possui autorização para editar esta obra.',
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
