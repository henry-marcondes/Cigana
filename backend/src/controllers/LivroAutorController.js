const LivroAutorService = require('../services/livroAutorService');

class LivroAutorController {

static async listarPorLivro(req, res, next) {
    try {
        const livroAutores =
            await LivroAutorService.listarPorLivro(
                req.params.livro_id
            );

        return res.json({
            success: true,
            data: livroAutores
        });

    } catch (error) {
        next(error);
    }
}

static async listarPorAutor(req, res, next) {
    try {
        const livroAutores =
            await LivroAutorService.listarPorAutor(
                req.params.autor_id
            );

        return res.json({
            success: true,
            data: livroAutores
        });

    } catch (error) {
        next(error);
    }
}

static async criar(req, res, next) {
    try {
        const livroAutor =
            await LivroAutorService.criarLivroAutor(
                req.body
            );

        return res.status(201).json({
            success: true,
            message: 'Relação livro-autor criada com sucesso.',
            data: livroAutor
        });

    } catch (error) {
        next(error);
    }
}

static async alterarOrdemExibicao(req, res, next) {
    try {
        const livroAutor =
            await LivroAutorService.alterarOrdemExibicao(
                req.params.id,
                req.body.ordem_exibicao
            );

        if (!livroAutor) {
            return res.status(404).json({
                success: false,
                message: 'Relação livro-autor não encontrada.'
            });
        }

        return res.json({
            success: true,
            message: 'Ordem de exibição alterada com sucesso.',
            data: livroAutor
        });

    } catch (error) {
        next(error);
    }
}

static async desativar(req, res, next) {
    try {
        const livroAutor =
            await LivroAutorService.desativarLivroAutor(
                req.params.id
            );

        if (!livroAutor) {
            return res.status(404).json({
                success: false,
                message: 'Relação livro-autor não encontrada.'
            });
        }

        return res.json({
            success: true,
            message: 'Relação livro-autor desativada com sucesso.',
            data: livroAutor
        });

    } catch (error) {
        next(error);
    }
}

}

module.exports = LivroAutorController;
