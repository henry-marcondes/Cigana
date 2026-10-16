const AvaliacaoService = require('../services/avaliacaoService');
const { success, error } = require('../utils/apiResponse');

class AvaliacaoController {

    static async listarPorLivro(req, res, next) {
        try {
            const { livro_id } = req.params;

            const avaliacoes = await AvaliacaoService.listarPorLivro(
                livro_id
            );

            return success(
                res,
                avaliacoes,
                'Avaliações encontradas com sucesso'
            );
        } catch (err) {
            return next(err);
        }
    }

    static async listarPorUsuario(req, res, next) {
        try {
            const { usuario_id } = req.params;

            if (usuario_id !== req.usuario.id) {
                return error(res, 'Avaliação não encontrada.', 404);
            }

            const avaliacoes = await AvaliacaoService.listarPorUsuario(
                usuario_id
            );

            return success(
                res,
                avaliacoes,
                'Avaliações encontradas com sucesso'
            );
        } catch (err) {
            return next(err);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const avaliacao = await AvaliacaoService.buscarPorId(id, req.usuario.id);

            if (!avaliacao) {
                return error(res, 'Avaliação não encontrada.', 404);
            }

            return success(
                res,
                avaliacao,
                'Avaliação encontrada com sucesso'
            );
        } catch (err) {
            return next(err);
        }
    }

    static async buscarPorUsuarioELivro(req, res, next) {
        try {
            const { usuario_id, livro_id } = req.params;

            if (usuario_id !== req.usuario.id) {
                return error(res, 'Avaliação não encontrada.', 404);
            }

            const avaliacao =
                await AvaliacaoService.buscarPorUsuarioELivro(
                    usuario_id,
                    livro_id
                );

            if (!avaliacao) {
                return error(res, 'Avaliação não encontrada.', 404);
            }

            return success(
                res,
                avaliacao,
                'Avaliação encontrada com sucesso'
            );
        } catch (err) {
            return next(err);
        }
    }

    static async criar(req, res, next) {
        try {
            const comentario = req.body.comentario == null || req.body.comentario.trim() === ''
                ? null
                : req.body.comentario;
            const avaliacao = await AvaliacaoService.criar({
                ...req.body,
                usuario_id: req.usuario.id,
                comentario
            });

            return success(
                res,
                avaliacao,
                'Avaliação criada com sucesso',
                201
            );
        } catch (err) {
            if (err.statusCode === 409) {
                return error(res, err.message, 409);
            }
            return next(err);
        }
    }

    static async alterarNota(req, res, next) {
        try {
            const { id } = req.params;
            const { nota } = req.body;

            const avaliacao = await AvaliacaoService.alterarNota(
                id,
                req.usuario.id,
                nota
            );

            if (!avaliacao) {
                return error(res, 'Avaliação não encontrada.', 404);
            }

            return success(
                res,
                avaliacao,
                'Nota da avaliação alterada com sucesso'
            );
        } catch (err) {
            return next(err);
        }
    }

    static async alterarComentario(req, res, next) {
        try {
            const { id } = req.params;
            const { comentario } = req.body;

            const avaliacao = await AvaliacaoService.alterarComentario(
                id,
                req.usuario.id,
                comentario == null || comentario.trim() === '' ? null : comentario
            );

            if (!avaliacao) {
                return error(res, 'Avaliação não encontrada.', 404);
            }

            return success(
                res,
                avaliacao,
                'Comentário da avaliação alterado com sucesso'
            );
        } catch (err) {
            return next(err);
        }
    }

    static async desativar(req, res, next) {
        try {
            const { id } = req.params;

            const avaliacao = await AvaliacaoService.desativar(id, req.usuario.id);

            if (!avaliacao) {
                return error(res, 'Avaliação não encontrada.', 404);
            }

            return success(
                res,
                avaliacao,
                'Avaliação desativada com sucesso'
            );
        } catch (err) {
            return next(err);
        }
    }

}

module.exports = AvaliacaoController;
