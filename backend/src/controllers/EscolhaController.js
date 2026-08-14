const EscolhaService = require('../services/escolhaService');

class EscolhaController {

    static async listarPorCenaOrigem(req, res, next) {
        try {
            const { cena_origem_id } = req.params;

            const escolhas = await EscolhaService.listarPorCenaOrigem(
                cena_origem_id
            );

            return res.json({
                success: true,
                data: escolhas
            });

        } catch (error) {
            next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const escolha = await EscolhaService.buscarPorId(id);

            if (!escolha) {
                return res.status(404).json({
                    success: false,
                    message: 'Escolha não encontrada.'
                });
            }

            return res.json({
                success: true,
                data: escolha
            });

        } catch (error) {
            next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const escolha = await EscolhaService.criar(req.body);

            return res.status(201).json({
                success: true,
                data: escolha
            });

        } catch (error) {
            next(error);
        }
    }

    static async alterarTexto(req, res, next) {
        try {
            const { id } = req.params;
            const { texto } = req.body;

            const escolha = await EscolhaService.alterarTexto(
                id,
                texto
            );

            if (!escolha) {
                return res.status(404).json({
                    success: false,
                    message: 'Escolha não encontrada.'
                });
            }

            return res.json({
                success: true,
                data: escolha
            });

        } catch (error) {
            next(error);
        }
    }

    static async alterarDestino(req, res, next) {
        try {
            const { id } = req.params;
            const { cena_destino_id } = req.body;

            const escolha = await EscolhaService.alterarDestino(
                id,
                cena_destino_id
            );

            if (!escolha) {
                return res.status(404).json({
                    success: false,
                    message: 'Escolha não encontrada.'
                });
            }

            return res.json({
                success: true,
                data: escolha
            });

        } catch (error) {
            next(error);
        }
    }

    static async alterarOrdemExibicao(req, res, next) {
        try {
            const { id } = req.params;
            const { ordem_exibicao } = req.body;

            const escolha = await EscolhaService.alterarOrdemExibicao(
                id,
                ordem_exibicao
            );

            if (!escolha) {
                return res.status(404).json({
                    success: false,
                    message: 'Escolha não encontrada.'
                });
            }

            return res.json({
                success: true,
                data: escolha
            });

        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const { id } = req.params;

            const escolha = await EscolhaService.desativar(id);

            if (!escolha) {
                return res.status(404).json({
                    success: false,
                    message: 'Escolha não encontrada.'
                });
            }

            return res.json({
                success: true,
                message: 'Escolha desativada com sucesso.',
                data: escolha
            });

        } catch (error) {
            next(error);
        }
    }

}

module.exports = EscolhaController;
