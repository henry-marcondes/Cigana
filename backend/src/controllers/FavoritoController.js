const FavoritoService = require('../services/favoritoService');
const { success, error } = require('../utils/apiResponse');

class FavoritoController {

    static async listarPorUsuario(req, res) {
        try {
            const { usuario_id } = req.params;

            const favoritos = await FavoritoService.listarPorUsuario(
                usuario_id
            );

            return success(
                res,
                favoritos,
                'Favoritos encontrados com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const favorito = await FavoritoService.buscarPorId(id);

            if (!favorito) {
                return error(res, 'Favorito não encontrado.', 404);
            }

            return success(
                res,
                favorito,
                'Favorito encontrado com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async buscarPorUsuarioELivro(req, res) {
        try {
            const { usuario_id, livro_id } = req.params;

            const favorito =
                await FavoritoService.buscarPorUsuarioELivro(
                    usuario_id,
                    livro_id
                );

            if (!favorito) {
                return error(res, 'Favorito não encontrado.', 404);
            }

            return success(
                res,
                favorito,
                'Favorito encontrado com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async criar(req, res) {
        try {
            const favorito = await FavoritoService.criar(req.body);

            return success(
                res,
                favorito,
                'Favorito criado com sucesso',
                201
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async desativar(req, res) {
        try {
            const { id } = req.params;

            const favorito = await FavoritoService.desativar(id);

            if (!favorito) {
                return error(res, 'Favorito não encontrado.', 404);
            }

            return success(
                res,
                favorito,
                'Favorito desativado com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

}

module.exports = FavoritoController;
