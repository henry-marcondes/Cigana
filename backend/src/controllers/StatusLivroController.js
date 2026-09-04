const StatusLivroService = require('../services/statusLivroService');

class StatusLivroController {

    static async listar(req, res, next) {
        try {
            const statusLivro = await StatusLivroService.listar();

            return res.json({
                success: true,
                data: statusLivro
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = StatusLivroController;
