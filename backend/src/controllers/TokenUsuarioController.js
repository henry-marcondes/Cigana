const {
    TokenUsuarioService
} = require('../services/tokenUsuarioService');

const apiResponse = require('../utils/apiResponse');

class TokenUsuarioController {

    static async criar(req, res) {
        try {
            const resultado = await TokenUsuarioService.criar(req.body);

            return apiResponse.success(
                res,
                {
                    id: resultado.id,
                    usuario_id: resultado.usuario_id,
                    finalidade: resultado.finalidade,
                    expira_em: resultado.expira_em
                },
                'Token criado com sucesso.'
            );
        } catch (error) {
            return apiResponse.error(
                res,
                error.message
            );
        }
    }

    static async validar(req, res) {
        try {
            const resultado = await TokenUsuarioService.validar(req.body);

            return apiResponse.success(
                res,
                {
                    id: resultado.id,
                    usuario_id: resultado.usuario_id,
                    finalidade: resultado.finalidade,
                    usado_em: resultado.usado_em
                },
                'Token validado com sucesso.'
            );
        } catch (error) {
            return apiResponse.error(
                res,
                error.message
            );
        }
    }

    static async invalidar(req, res) {
        try {
            const resultado = await TokenUsuarioService.invalidar(req.body);

            return apiResponse.success(
                res,
                resultado,
                'Token invalidado com sucesso.'
            );
        } catch (error) {
            return apiResponse.error(
                res,
                error.message
            );
        }
    }
}

module.exports = TokenUsuarioController;
