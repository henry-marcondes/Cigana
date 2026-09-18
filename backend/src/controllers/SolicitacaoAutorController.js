const SolicitacaoAutorService = require('../services/solicitacaoAutorService');

class SolicitacaoAutorController {

    // =====================================================
    // USUÁRIO
    // =====================================================

    static async criar(req, res) {
        try {
            const usuario_id = req.usuario.id;

            const solicitacao =
                await SolicitacaoAutorService.criar(
                    usuario_id,
                    req.body
                );

            return res.status(201).json({
                success: true,
                data: solicitacao
            });

        } catch (error) {
            console.error(
                'Erro ao criar solicitação de Autor:',
                error
            );

            return res.status(error.statusCode || 500).json({
                success: false,
                message:
                    error.message ||
                    'Erro ao criar solicitação de Autor.'
            });
        }
    }

    static async buscarMinhaPorId(req, res) {
        try {
            const usuario_id = req.usuario.id;

            const solicitacao =
                await SolicitacaoAutorService.buscarMinhaPorId(
                    usuario_id,
                    req.params.id
                );

            return res.status(200).json({
                success: true,
                data: solicitacao
            });

        } catch (error) {
            console.error(
                'Erro ao buscar solicitação de Autor:',
                error
            );

            return res.status(error.statusCode || 500).json({
                success: false,
                message:
                    error.message ||
                    'Erro ao buscar solicitação de Autor.'
            });
        }
    }

    static async listarPorUsuario(req, res) {
        try {
            const usuario_id = req.usuario.id;

            const solicitacoes =
                await SolicitacaoAutorService.listarPorUsuario(
                    usuario_id
                );

            return res.status(200).json({
                success: true,
                data: solicitacoes
            });

        } catch (error) {
            console.error(
                'Erro ao listar solicitações de Autor:',
                error
            );

            return res.status(error.statusCode || 500).json({
                success: false,
                message:
                    error.message ||
                    'Erro ao listar solicitações de Autor.'
            });
        }
    }

    // =====================================================
    // GESTÃO DA PLATAFORMA
    // =====================================================

    static async buscarParaAvaliacao(req, res) {
        try {
            const avaliador_id = req.usuario.id;

            const solicitacao =
                await SolicitacaoAutorService.buscarParaAvaliacao(
                    avaliador_id,
                    req.params.id
                );

            return res.status(200).json({
                success: true,
                data: solicitacao
            });

        } catch (error) {
            console.error(
                'Erro ao buscar solicitação para avaliação:',
                error
            );

            return res.status(error.statusCode || 500).json({
                success: false,
                message:
                    error.message ||
                    'Erro ao buscar solicitação de Autor.'
            });
        }
    }

    static async listarPorAvaliacao(req, res) {
        try {
            const avaliador_id = req.usuario.id;
            const { status } = req.query;

            const solicitacoes =
                await SolicitacaoAutorService.listarPorAvaliacao(
                    avaliador_id,
                    status || null
                );

            return res.status(200).json({
                success: true,
                data: solicitacoes
            });

        } catch (error) {
            console.error(
                'Erro ao listar solicitações para avaliação:',
                error
            );

            return res.status(error.statusCode || 500).json({
                success: false,
                message:
                    error.message ||
                    'Erro ao listar solicitações de Autor.'
            });
        }
    }

    static async listarPendentes(req, res) {
        try {
            const avaliador_id = req.usuario.id;

            const solicitacoes =
                await SolicitacaoAutorService.listarPendentes(
                    avaliador_id
                );

            return res.status(200).json({
                success: true,
                data: solicitacoes
            });

        } catch (error) {
            console.error(
                'Erro ao listar solicitações pendentes:',
                error
            );

            return res.status(error.statusCode || 500).json({
                success: false,
                message:
                    error.message ||
                    'Erro ao listar solicitações pendentes.'
            });
        }
    }

    static async aprovar(req, res) {
        try {
            const avaliador_id = req.usuario.id;

            const solicitacao =
                await SolicitacaoAutorService.aprovar(
                    req.params.id,
                    avaliador_id
                );

            return res.status(200).json({
                success: true,
                data: solicitacao
            });

        } catch (error) {
            console.error(
                'Erro ao aprovar solicitação de Autor:',
                error
            );

            return res.status(error.statusCode || 500).json({
                success: false,
                message:
                    error.message ||
                    'Erro ao aprovar solicitação de Autor.'
            });
        }
    }

    static async recusar(req, res) {
        try {
            const avaliador_id = req.usuario.id;

            const solicitacao =
                await SolicitacaoAutorService.recusar(
                    req.params.id,
                    avaliador_id,
                    req.body.motivo_recusa
                );

            return res.status(200).json({
                success: true,
                data: solicitacao
            });

        } catch (error) {
            console.error(
                'Erro ao recusar solicitação de Autor:',
                error
            );

            return res.status(error.statusCode || 500).json({
                success: false,
                message:
                    error.message ||
                    'Erro ao recusar solicitação de Autor.'
            });
        }
    }
}

module.exports = SolicitacaoAutorController;
