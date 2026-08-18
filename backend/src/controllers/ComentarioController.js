const ComentarioService = require('../services/comentarioService');
const { success, error } = require('../utils/apiResponse');

class ComentarioController {

    static async listarPorLivro(req, res) {
        try {
            const { livro_id } = req.params;

            const comentarios = await ComentarioService.listarPorLivro(
                livro_id
            );

            return success(
                res,
                comentarios,
                'Comentários encontrados com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async listarPorUsuario(req, res) {
        try {
            const { usuario_id } = req.params;

            const comentarios = await ComentarioService.listarPorUsuario(
                usuario_id
            );

            return success(
                res,
                comentarios,
                'Comentários encontrados com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const comentario = await ComentarioService.buscarPorId(id);

            if (!comentario) {
                return error(res, 'Comentário não encontrado.', 404);
            }

            return success(
                res,
                comentario,
                'Comentário encontrado com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async criar(req, res) {
        try {
            const comentario = await ComentarioService.criar(req.body);

            return success(
                res,
                comentario,
                'Comentário criado com sucesso',
                201
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async alterarTexto(req, res) {
        try {
            const { id } = req.params;
            const { texto } = req.body;

            const comentario = await ComentarioService.alterarTexto(
                id,
                texto
            );

            if (!comentario) {
                return error(res, 'Comentário não encontrado.', 404);
            }

            return success(
                res,
                comentario,
                'Texto do comentário alterado com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async desativar(req, res) {
        try {
            const { id } = req.params;

            const comentario = await ComentarioService.desativar(id);

            if (!comentario) {
                return error(res, 'Comentário não encontrado.', 404);
            }

            return success(
                res,
                comentario,
                'Comentário desativado com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

}

module.exports = ComentarioController;
