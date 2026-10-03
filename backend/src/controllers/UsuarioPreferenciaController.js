const UsuarioPreferenciaService = require('../services/UsuarioPreferenciaService');
const { success, error } = require('../utils/apiResponse');

class UsuarioPreferenciaController {

    static async listarPorUsuario(req, res) {
        try {
            const usuarioId = req.usuario.id;

            const preferencias =
                await UsuarioPreferenciaService.listarPorUsuario(
                    usuarioId
                );

            return success(
                res,
                preferencias,
                'Preferências do usuário listadas com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao listar preferências do usuário.',
                err.statusCode || 500
            );
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const preferencia =
                await UsuarioPreferenciaService.buscarPorId(id, req.usuario.id);

            return success(
                res,
                preferencia,
                'Preferência do usuário encontrada com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao buscar preferência do usuário.',
                err.statusCode || 500
            );
        }
    }

    static async adicionar(req, res) {
        try {
            const { preferencia_id } = req.body;

            const preferencia =
                await UsuarioPreferenciaService.adicionar(
                    req.usuario.id,
                    preferencia_id
                );

            return success(
                res,
                preferencia,
                'Preferência adicionada ao usuário com sucesso.',
                201
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao adicionar preferência ao usuário.',
                err.statusCode || 500
            );
        }
    }

    static async remover(req, res) {
        try {
            const { id } = req.params;

            const preferencia =
                await UsuarioPreferenciaService.remover(id, req.usuario.id);

            return success(
                res,
                preferencia,
                'Preferência removida do usuário com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message || 'Erro ao remover preferência do usuário.',
                err.statusCode || 500
            );
        }
    }
}

module.exports = UsuarioPreferenciaController;
