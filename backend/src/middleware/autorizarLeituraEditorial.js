const AutorizacaoService = require('../services/autorizacaoService');
const { error } = require('../utils/apiResponse');

function autorizarLeituraEditorial(req, res, next) {
    if (!req.usuario || !req.usuario.id) {
        return error(res, 'Usuário não autenticado.', 401);
    }

    const livroId = req.params.id;
    if (!livroId) {
        return error(res, 'Obra não identificada.', 400);
    }

    AutorizacaoService.podeVisualizarObra(req.usuario.id, livroId)
        .then((autorizado) => {
            if (!autorizado) {
                return error(
                    res,
                    'Usuário não possui autorização para visualizar a decisão editorial desta obra.',
                    403
                );
            }

            req.livro_id = livroId;
            return next();
        })
        .catch(next);
}

module.exports = autorizarLeituraEditorial;
