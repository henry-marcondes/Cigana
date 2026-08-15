const CenaImagemService = require('../services/cenaImagemService');

class CenaImagemController {

    static async listarPorCena(req, res, next) {
        try {
            const { cena_id } = req.params;

            const imagens = await CenaImagemService.listarPorCena(cena_id);

            return res.json({
                success: true,
                data: imagens
            });

        } catch (error) {
            next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const imagem = await CenaImagemService.buscarPorId(id);

            if (!imagem) {
                return res.status(404).json({
                    success: false,
                    message: 'Imagem da cena não encontrada.'
                });
            }

            return res.json({
                success: true,
                data: imagem
            });

        } catch (error) {
            next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const imagem = await CenaImagemService.criar(req.body);

            return res.status(201).json({
                success: true,
                data: imagem
            });

        } catch (error) {
            next(error);
        }
    }

    static async alterarInformacoes(req, res, next) {
        try {
            const { id } = req.params;

            const imagem = await CenaImagemService.alterarInformacoes(
                id,
                req.body
            );

            if (!imagem) {
                return res.status(404).json({
                    success: false,
                    message: 'Imagem da cena não encontrada.'
                });
            }

            return res.json({
                success: true,
                data: imagem
            });

        } catch (error) {
            next(error);
        }
    }

    static async alterarImagem(req, res, next) {
        try {
            const { id } = req.params;
            const { imagem_url } = req.body;

            const imagem = await CenaImagemService.alterarImagem(
                id,
                imagem_url
            );

            if (!imagem) {
                return res.status(404).json({
                    success: false,
                    message: 'Imagem da cena não encontrada.'
                });
            }

            return res.json({
                success: true,
                data: imagem
            });

        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const { id } = req.params;

            const imagem = await CenaImagemService.desativar(id);

            if (!imagem) {
                return res.status(404).json({
                    success: false,
                    message: 'Imagem da cena não encontrada.'
                });
            }

            return res.json({
                success: true,
                message: 'Imagem da cena desativada com sucesso.',
                data: imagem
            });

        } catch (error) {
            next(error);
        }
    }

}

module.exports = CenaImagemController;
