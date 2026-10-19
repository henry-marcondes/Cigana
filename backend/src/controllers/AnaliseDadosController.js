const AnaliseDadosService = require('../services/analiseDadosService');
const { success } = require('../utils/apiResponse');

class AnaliseDadosController {
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
