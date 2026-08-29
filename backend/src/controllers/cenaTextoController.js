const CenaTextoService = require('../services/cenaTextoService');
const apiResponse = require('../utils/apiResponse');

class CenaTextoController {

    static async listarPorCena(req, res) {
        try {
            const { cena_id } = req.params;

            const dados = await CenaTextoService.listarPorCena(cena_id);

            return apiResponse.success(res, dados);

        } catch (error) {
            return apiResponse.error(
                res,
                error.message,
                error.status || 500
            );
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const dados = await CenaTextoService.buscarPorId(id);

            return apiResponse.success(res, dados);

        } catch (error) {
            return apiResponse.error(
                res,
                error.message,
                error.status || 500
            );
        }
    }

    static async criar(req, res) {
        try {
            const dados = await CenaTextoService.criar(req.body);

            return apiResponse.success(
                res,
                dados,
                'Texto da cena criado com sucesso.',
                201
            );

        } catch (error) {
            return apiResponse.error(
                res,
                error.message,
                error.status || 500
            );
        }
    }

    static async alterar(req, res) {
        try {
            const { id } = req.params;

            const dados = await CenaTextoService.alterar(
                id,
                req.body
            );

            return apiResponse.success(
                res,
                dados,
                'Texto da cena alterado com sucesso.'
            );

        } catch (error) {
            return apiResponse.error(
                res,
                error.message,
                error.status || 500
            );
        }
    }

    static async desativar(req, res) {
        try {
            const { id } = req.params;

            const dados = await CenaTextoService.desativar(id);

            return apiResponse.success(
                res,
                dados,
                'Texto da cena desativado com sucesso.'
            );

        } catch (error) {
            return apiResponse.error(
                res,
                error.message,
                error.status || 500
            );
        }
    }
}

module.exports = CenaTextoController;
