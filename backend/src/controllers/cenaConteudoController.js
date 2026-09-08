const CenaConteudoService = require('../services/cenaConteudoService');
const apiResponse = require('../utils/apiResponse');

class CenaConteudoController {

    static async listarPorCena(req, res) {
        try {
            const { cena_id } = req.params;

            const dados = await CenaConteudoService.listarPorCena(cena_id);

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

            const dados = await CenaConteudoService.buscarPorId(id);

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
            const dados = await CenaConteudoService.criar(req.body);

            return apiResponse.success(
                res,
                dados,
                'Conteúdo da cena criado com sucesso.',
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

    static async alterarOrdem(req, res) {
        try {
            const { id } = req.params;
            const { ordem_exibicao } = req.body;

            const dados = await CenaConteudoService.alterarOrdem(
                id,
                ordem_exibicao
            );

            return apiResponse.success(
                res,
                dados,
                'Ordem do conteúdo alterada com sucesso.'
            );

        } catch (error) {
            return apiResponse.error(
                res,
                error.message,
                error.status || 500
            );
        }
    }

    static async reordenar(req, res) {
        try {
            const { cena_id, ordem } = req.body;

            const dados = await CenaConteudoService.reordenar(
                cena_id,
                ordem
            );

            return apiResponse.success(
                res,
                dados,
                'Conteúdos da cena reordenados com sucesso.'
            );

        } catch (error) {
            return apiResponse.error(
                res,
                error.message,
                error.status || 500
            );
        }
    }


    static async alterarTipoConteudo(req, res) {
        try {
            const { id } = req.params;
            const { tipo_conteudo } = req.body;

            const dados = await CenaConteudoService.alterarTipoConteudo(
                id,
                tipo_conteudo
            );

            return apiResponse.success(
                res,
                dados,
                'Tipo de conteúdo alterado com sucesso.'
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

            const dados = await CenaConteudoService.desativar(id);

            return apiResponse.success(
                res,
                dados,
                'Conteúdo da cena desativado com sucesso.'
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

module.exports = CenaConteudoController;
