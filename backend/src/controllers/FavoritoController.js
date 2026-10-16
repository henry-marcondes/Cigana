const FavoritoService = require('../services/favoritoService');
const { success, error } = require('../utils/apiResponse');

class FavoritoController {

    static async listar(req, res) {
        try {
            const usuario_id = req.usuario.id;

            const favoritos = await FavoritoService.listar(
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

    static async buscarPorLivro(req, res) {
        try {
            const usuario_id = req.usuario.id;
            const { livro_id } = req.params;

            const favorito = await FavoritoService.buscarPorLivro(
                usuario_id,
                livro_id
            );

            if (!favorito) {
                return error(
                    res,
                    'Favorito não encontrado.',
                    404
                );
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
            const usuario_id = req.usuario.id;
            const { livro_id } = req.body;

            const favorito = await FavoritoService.criar(
                usuario_id,
                livro_id
            );

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

    static async removerPorLivro(req, res) {
        try {
            const usuario_id = req.usuario.id;
            const { livro_id } = req.params;

            const favorito = await FavoritoService.removerPorLivro(
                usuario_id,
                livro_id
            );

            if (!favorito) {
                return error(
                    res,
                    'Favorito não encontrado.',
                    404
                );
            }

            return success(
                res,
                favorito,
                'Favorito removido com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

}

module.exports = FavoritoController;
