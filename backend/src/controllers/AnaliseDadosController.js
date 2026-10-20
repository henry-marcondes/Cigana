const AnaliseDadosService = require('../services/analiseDadosService');
const { success } = require('../utils/apiResponse');

class AnaliseDadosController {
    async obterIndicadoresAvaliacoesComentarios(req, res, next) {
        try {
            const indicadores =
                await AnaliseDadosService.obterIndicadoresAvaliacoesComentarios(
                    req.query
                );

            return success(
                res,
                indicadores,
                'Indicadores de avaliações e comentários encontrados.'
            );
        } catch (erro) {
            return next(erro);
        }
    }

    async obterIndicadoresProgressoLeitura(req, res, next) {
        try {
            const indicadores =
                await AnaliseDadosService.obterIndicadoresProgressoLeitura();

            return success(
                res,
                indicadores,
                'Indicadores de progresso de leitura encontrados.'
            );
        } catch (erro) {
            return next(erro);
        }
    }
}

module.exports = new AnaliseDadosController();
