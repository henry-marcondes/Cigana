const CenaVideoService = require('../services/cenaVideoService');
const { success, error } = require('../utils/apiResponse');


class CenaVideoController {

    async listarPorCena(req, res) {
        try {
            const videos =
                await CenaVideoService.listarPorCena(req.params.cena_id);

            return success(
                res,
                videos,
                'Vídeos da cena listados com sucesso'
            );

        } catch (err) {
            return error(res, err.message, 500);
        }
    }


    async buscarPorId(req, res) {
        try {
            const video =
                await CenaVideoService.buscarPorId(req.params.id);

            return success(
                res,
                video,
                'Vídeo encontrado com sucesso'
            );

        } catch (err) {
            return error(res, err.message, 404);
        }
    }


    async criar(req, res) {
        try {
            const video =
                await CenaVideoService.criar(req.body);

            return success(
                res,
                video,
                'Vídeo da cena criado com sucesso',
                201
            );

        } catch (err) {
            return error(res, err.message, 400);
        }
    }


    async alterarInformacoes(req, res) {
        try {
            const video =
                await CenaVideoService.alterarInformacoes(
                    req.params.id,
                    req.body
                );

            return success(
                res,
                video,
                'Informações do vídeo alteradas com sucesso'
            );

        } catch (err) {
            return error(res, err.message, 400);
        }
    }


    async alterarVideo(req, res) {
        try {
            const video =
                await CenaVideoService.alterarVideo(
                    req.params.id,
                    req.body.video_url
                );

            return success(
                res,
                video,
                'Vídeo alterado com sucesso'
            );

        } catch (err) {
            return error(res, err.message, 400);
        }
    }


    async desativar(req, res) {
        try {
            const video =
                await CenaVideoService.desativar(req.params.id);

            return success(
                res,
                video,
                'Vídeo da cena desativado com sucesso'
            );

        } catch (err) {
            return error(res, err.message, 404);
        }
    }

}


module.exports = new CenaVideoController();
