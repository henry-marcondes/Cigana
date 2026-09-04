const VisibilidadeLivroService = require('../services/visibilidadeLivroService');

class VisibilidadeLivroController {

    static async listar(req, res, next) {
        try {
            const visibilidadeLivro = await VisibilidadeLivroService.listar();

            return res.json({
                success: true,
                data: visibilidadeLivro
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = VisibilidadeLivroController;
