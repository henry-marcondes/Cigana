const UsuarioCategoriaPreferidaService =
    require('../services/UsuarioCategoriaPreferidaService');

const { success, error } = require('../utils/apiResponse');

class UsuarioCategoriaPreferidaController {

    static async listarPorUsuario(req, res) {
        try {
            const usuarioId = req.usuario.id;

            const categorias =
                await UsuarioCategoriaPreferidaService.listarPorUsuario(
                    usuarioId
                );

            return success(
                res,
                categorias,
                'Categorias preferidas do usuário listadas com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message ||
                    'Erro ao listar categorias preferidas do usuário.',
                err.statusCode || 500
            );
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const categoria =
                await UsuarioCategoriaPreferidaService.buscarPorId(
                    id,
                    req.usuario.id
                );

            return success(
                res,
                categoria,
                'Categoria preferida do usuário encontrada com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message ||
                    'Erro ao buscar categoria preferida do usuário.',
                err.statusCode || 500
            );
        }
    }

    static async adicionar(req, res) {
        try {
            const { categoria_id } = req.body;

            const categoria =
                await UsuarioCategoriaPreferidaService.adicionar(
                    req.usuario.id,
                    categoria_id
                );

            return success(
                res,
                categoria,
                'Categoria adicionada às preferências do usuário com sucesso.',
                201
            );
        } catch (err) {
            return error(
                res,
                err.message ||
                    'Erro ao adicionar categoria às preferências do usuário.',
                err.statusCode || 500
            );
        }
    }

    static async remover(req, res) {
        try {
            const { id } = req.params;

            const categoria =
                await UsuarioCategoriaPreferidaService.remover(
                    id,
                    req.usuario.id
                );

            return success(
                res,
                categoria,
                'Categoria removida das preferências do usuário com sucesso.'
            );
        } catch (err) {
            return error(
                res,
                err.message ||
                    'Erro ao remover categoria das preferências do usuário.',
                err.statusCode || 500
            );
        }
    }
}

module.exports = UsuarioCategoriaPreferidaController;
