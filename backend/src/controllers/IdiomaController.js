const IdiomaService = require('../services/idiomaService');

class IdiomaController {

    static async listar(req, res, next) {
        try {
            const idiomas = await IdiomaService.listar();

            return res.json({
                success: true,
                data: idiomas
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = IdiomaController;
