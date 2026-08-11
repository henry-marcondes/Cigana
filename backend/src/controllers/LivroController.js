const LivroService = require('../services/livroService');

class LivroController {

    static async listar(req, res, next) {
        try {
            const livros = await LivroService.listar();

            return res.json({
                success: true,
                data: livros
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const livro = await LivroService.buscarPorId(id);

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorSlug(req, res, next) {
        try {
            const { slug } = req.params;

            const livro = await LivroService.buscarPorSlug(slug);

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const livro = await LivroService.criar(req.body);

            return res.status(201).json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarInformacoes(req, res, next) {
        try {
            const { id } = req.params;

            const livro = await LivroService.alterarInformacoes(
                id,
                req.body
            );

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status_livro_id } = req.body;

            const livro = await LivroService.alterarStatus(
                id,
                status_livro_id
            );

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarVisibilidade(req, res, next) {
        try {
            const { id } = req.params;
            const { visibilidade_livro_id } = req.body;

            const livro = await LivroService.alterarVisibilidade(
                id,
                visibilidade_livro_id
            );

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarCapa(req, res, next) {
        try {
            const { id } = req.params;
            const { capa_url } = req.body;

            const livro = await LivroService.alterarCapa(
                id,
                capa_url
            );

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const { id } = req.params;

            const livro = await LivroService.desativar(id);

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Livro desativado com sucesso.',
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LivroController;
