const ClassificacaoIndicativaService = require('../services/classificacaoIndicativaService');

class ClassificacaoIndicativaController {

    static async listar(req, res, next) {
        try {
            const classificacoesIndicativas = await ClassificacaoIndicativaService.listar();

            return res.json({
                success: true,
                data: classificacoesIndicativas
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = ClassificacaoIndicativaController;
