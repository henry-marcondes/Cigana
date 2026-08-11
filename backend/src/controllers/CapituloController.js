const CapituloService = require('../services/capituloService');

class CapituloController {

    static async listarPorLivro(req, res, next) {
        try {
            const { livro_id } = req.params;

            const capitulos = await CapituloService.listarPorLivro(livro_id);

            return res.json({
                success: true,
                data: capitulos
            });
        } catch (erro) {
            next(erro);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const capitulo = await CapituloService.buscarPorId(id);

            if (!capitulo) {
                return res.status(404).json({
                    success: false,
                    message: 'Capítulo não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: capitulo
            });
        } catch (erro) {
            next(erro);
        }
    }

    static async buscarPorSlug(req, res, next) {
        try {
            const { livro_id, slug } = req.params;

            const capitulo = await CapituloService.buscarPorSlug(
                livro_id,
                slug
            );

            if (!capitulo) {
                return res.status(404).json({
                    success: false,
                    message: 'Capítulo não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: capitulo
            });
        } catch (erro) {
            next(erro);
        }
    }

    static async criar(req, res, next) {
        try {
            const capitulo = await CapituloService.criar(req.body);

            return res.status(201).json({
                success: true,
                data: capitulo
            });
        } catch (erro) {
            next(erro);
        }
    }

    static async alterarInformacoes(req, res, next) {
        try {
            const { id } = req.params;

            const capitulo = await CapituloService.alterarInformacoes(
                id,
                req.body
            );

            if (!capitulo) {
                return res.status(404).json({
                    success: false,
                    message: 'Capítulo não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: capitulo
            });
        } catch (erro) {
            next(erro);
        }
    }

    static async alterarCapa(req, res, next) {
        try {
            const { id } = req.params;

            const capitulo = await CapituloService.alterarCapa(
                id,
                req.body.capa_url
            );

            if (!capitulo) {
                return res.status(404).json({
                    success: false,
                    message: 'Capítulo não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: capitulo
            });
        } catch (erro) {
            next(erro);
        }
    }

    static async desativar(req, res, next) {
        try {
            const { id } = req.params;

            const capitulo = await CapituloService.desativar(id);

            if (!capitulo) {
                return res.status(404).json({
                    success: false,
                    message: 'Capítulo não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: capitulo
            });
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = CapituloController;
