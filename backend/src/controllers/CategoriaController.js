const CategoriaService = require('../services/categoriaService');

class CategoriaController {

    static async listar(req, res, next) {
        try {
            const categorias = await CategoriaService.listar();

            return res.json({
                success: true,
                data: categorias
            });
        } catch (error) {
            next(error);
        }
    }

    static async listarPorBiblioteca(req, res, next) {
        try {
            const { bibliotecaSlug } = req.params;

            const categorias =
                await CategoriaService.listarPorBiblioteca(
                    bibliotecaSlug
                );

            return res.json({
                success: true,
                data: categorias
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = CategoriaController;
