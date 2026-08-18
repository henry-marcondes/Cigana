const AvaliacaoService = require('../services/avaliacaoService');
const { success, error } = require('../utils/apiResponse');

class AvaliacaoController {

    static async listarPorLivro(req, res) {
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
            return error(res, err.message, 400);
        }
    }

    static async listarPorUsuario(req, res) {
        try {
            const { usuario_id } = req.params;

            const avaliacoes = await AvaliacaoService.listarPorUsuario(
                usuario_id
            );

            return success(
                res,
                avaliacoes,
                'Avaliações encontradas com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const avaliacao = await AvaliacaoService.buscarPorId(id);

            if (!avaliacao) {
                return error(res, 'Avaliação não encontrada.', 404);
            }

            return success(
                res,
                avaliacao,
                'Avaliação encontrada com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async buscarPorUsuarioELivro(req, res) {
        try {
            const { usuario_id, livro_id } = req.params;

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
            return error(res, err.message, 400);
        }
    }

    static async criar(req, res) {
        try {
            const avaliacao = await AvaliacaoService.criar(req.body);

            return success(
                res,
                avaliacao,
                'Avaliação criada com sucesso',
                201
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async alterarNota(req, res) {
        try {
            const { id } = req.params;
            const { nota } = req.body;

            const avaliacao = await AvaliacaoService.alterarNota(
                id,
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
            return error(res, err.message, 400);
        }
    }

    static async alterarComentario(req, res) {
        try {
            const { id } = req.params;
            const { comentario } = req.body;

            const avaliacao = await AvaliacaoService.alterarComentario(
                id,
                comentario
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
            return error(res, err.message, 400);
        }
    }

    static async desativar(req, res) {
        try {
            const { id } = req.params;

            const avaliacao = await AvaliacaoService.desativar(id);

            if (!avaliacao) {
                return error(res, 'Avaliação não encontrada.', 404);
            }

            return success(
                res,
                avaliacao,
                'Avaliação desativada com sucesso'
            );
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

}

module.exports = AvaliacaoController;
