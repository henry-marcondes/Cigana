const PreferenciaService = require('../services/PreferenciaService');
const { success, error } = require('../utils/apiResponse');

class PreferenciaController {

    static async listar(req, res) {
        try {
            const preferencias = await PreferenciaService.listar();

            return success(
                res,
                preferencias,
                'Preferências listadas com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao listar preferências.',
                err.statusCode || 500
            );
        }
    }

    static async listarPorGrupo(req, res) {
        try {
            const { grupo } = req.params;

            const preferencias =
                await PreferenciaService.listarPorGrupo(grupo);

            return success(
                res,
                preferencias,
                'Preferências do grupo listadas com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao listar preferências por grupo.',
                err.statusCode || 500
            );
        }
    }

    static async buscarPorCodigo(req, res) {
        try {
            const { grupo, codigo } = req.params;

            const preferencia =
                await PreferenciaService.buscarPorCodigo(
                    grupo,
                    codigo
                );

            return success(
                res,
                preferencia,
                'Preferência encontrada com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao buscar preferência.',
                err.statusCode || 500
            );
        }
    }

    static async criar(req, res) {
        try {
            const preferencia =
                await PreferenciaService.criar(req.body);

            return success(
                res,
                preferencia,
                'Preferência criada com sucesso.',
                201
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao criar preferência.',
                err.statusCode || 500
            );
        }
    }
}

module.exports = PreferenciaController;
