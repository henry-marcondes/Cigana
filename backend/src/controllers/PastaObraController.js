const PastaObraService = require('../services/pastaObraService');
const apiResponse = require('../utils/apiResponse');

function responderErro(res, error) {
    return apiResponse.error(
        res,
        error.message,
        error.statusCode || 500
    );
}

class PastaObraController {
    static async criar(req, res) {
        try {
            const pasta = await PastaObraService.criar(
                req.livro_id,
                req.body
            );

            return apiResponse.success(
                res,
                pasta,
                'Pasta criada com sucesso.',
                201
            );
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async listar(req, res) {
        try {
            const pastas = await PastaObraService.listar(req.livro_id);
            return apiResponse.success(res, pastas);
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async renomear(req, res) {
        try {
            const pasta = await PastaObraService.renomear(
                req.params.id,
                req.livro_id,
                req.body.nome
            );

            return apiResponse.success(
                res,
                pasta,
                'Pasta renomeada com sucesso.'
            );
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async mover(req, res) {
        try {
            const pasta = await PastaObraService.mover(
                req.params.id,
                req.livro_id,
                req.body.pasta_pai_id
            );

            return apiResponse.success(
                res,
                pasta,
                'Pasta movida com sucesso.'
            );
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async excluir(req, res) {
        try {
            const pasta = await PastaObraService.excluir(
                req.params.id,
                req.livro_id
            );

            return apiResponse.success(
                res,
                pasta,
                'Pasta excluída com sucesso.'
            );
        } catch (error) {
            return responderErro(res, error);
        }
    }
}

module.exports = PastaObraController;
