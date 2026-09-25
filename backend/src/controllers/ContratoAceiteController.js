const ContratoAceiteService = require('../services/ContratoAceiteService');

class ContratoAceiteController {

    static async listarPorVersao(req, res) {
        try {
            const { contrato_versao_id } = req.params;

            const aceites = await ContratoAceiteService.listarPorVersao(
                contrato_versao_id
            );

            return res.status(200).json({
                success: true,
                data: aceites
            });

        } catch (error) {
            console.error('Erro ao listar aceites da versão:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message ||
                    'Erro interno ao listar aceites da versão.'
            });
        }
    }

    static async listarPorUsuario(req, res) {
        try {
            const { usuario_id } = req.params;

            const aceites = await ContratoAceiteService.listarPorUsuario(
                usuario_id
            );

            return res.status(200).json({
                success: true,
                data: aceites
            });

        } catch (error) {
            console.error('Erro ao listar aceites do usuário:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message ||
                    'Erro interno ao listar aceites do usuário.'
            });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const aceite = await ContratoAceiteService.buscarPorId(id);

            return res.status(200).json({
                success: true,
                data: aceite
            });

        } catch (error) {
            console.error('Erro ao buscar aceite do contrato:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message ||
                    'Erro interno ao buscar aceite do contrato.'
            });
        }
    }

    static async buscarPorVersaoEUsuario(req, res) {
        try {
            const {
                contrato_versao_id,
                usuario_id
            } = req.params;

            const aceite =
                await ContratoAceiteService.buscarPorVersaoEUsuario(
                    contrato_versao_id,
                    usuario_id
                );

            return res.status(200).json({
                success: true,
                data: aceite
            });

        } catch (error) {
            console.error(
                'Erro ao buscar aceite por versão e usuário:',
                error
            );

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message ||
                    'Erro interno ao buscar aceite por versão e usuário.'
            });
        }
    }

    static async criar(req, res) {
        try {
            const {
                contrato_versao_id,
                usuario_id,
                ip_origem,
                user_agent,
                dados_tecnicos
            } = req.body;

            const aceite = await ContratoAceiteService.criar(
                contrato_versao_id,
                usuario_id,
                ip_origem,
                user_agent,
                dados_tecnicos
            );

            return res.status(201).json({
                success: true,
                message: 'Contrato aceito com sucesso.',
                data: aceite
            });

        } catch (error) {
            console.error('Erro ao registrar aceite do contrato:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message ||
                    'Erro interno ao registrar aceite do contrato.'
            });
        }
    }

}

module.exports = ContratoAceiteController;
