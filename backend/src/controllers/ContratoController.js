const ContratoService = require('../services/ContratoService');

class ContratoController {

    static async listar(req, res) {
        try {
            const contratos = await ContratoService.listar();

            return res.status(200).json({
                success: true,
                data: contratos
            });

        } catch (error) {
            console.error('Erro ao listar contratos:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao listar contratos.'
            });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const contrato = await ContratoService.buscarPorId(id);

            return res.status(200).json({
                success: true,
                data: contrato
            });

        } catch (error) {
            console.error('Erro ao buscar contrato:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao buscar contrato.'
            });
        }
    }

    static async buscarPorCodigo(req, res) {
        try {
            const { codigo } = req.params;

            const contrato = await ContratoService.buscarPorCodigo(codigo);

            return res.status(200).json({
                success: true,
                data: contrato
            });

        } catch (error) {
            console.error('Erro ao buscar contrato por código:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao buscar contrato.'
            });
        }
    }

    static async listarVersoes(req, res) {
        try {
            const { id } = req.params;

            const versoes = await ContratoService.listarVersoes(id);

            return res.status(200).json({
                success: true,
                data: versoes
            });

        } catch (error) {
            console.error('Erro ao listar versões do contrato:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao listar versões do contrato.'
            });
        }
    }

    static async buscarVersaoAtiva(req, res) {
        try {
            const { id } = req.params;

            const versao = await ContratoService.buscarVersaoAtiva(id);

            return res.status(200).json({
                success: true,
                data: versao
            });

        } catch (error) {
            console.error('Erro ao buscar versão ativa do contrato:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao buscar versão ativa do contrato.'
            });
        }
    }

    static async buscarVersaoPorId(req, res) {
        try {
            const { id } = req.params;

            const versao = await ContratoService.buscarVersaoPorId(id);

            return res.status(200).json({
                success: true,
                data: versao
            });

        } catch (error) {
            console.error('Erro ao buscar versão do contrato:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao buscar versão do contrato.'
            });
        }
    }

    static async listarObrasPorContrato(req, res) {
        try {
            const { id } = req.params;

            const vinculos = await ContratoService.listarObrasPorContrato(id);

            return res.status(200).json({
                success: true,
                data: vinculos
            });

        } catch (error) {
            console.error('Erro ao listar obras do contrato:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao listar obras do contrato.'
            });
        }
    }

    static async listarContratosPorObra(req, res) {
        try {
            const { livro_id } = req.params;

            const vinculos = await ContratoService.listarContratosPorObra(livro_id);

            return res.status(200).json({
                success: true,
                data: vinculos
            });

        } catch (error) {
            console.error('Erro ao listar contratos da obra:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao listar contratos da obra.'
            });
        }
    }

    static async buscarContratoObraPorId(req, res) {
        try {
            const { id } = req.params;

            const vinculo = await ContratoService.buscarContratoObraPorId(id);

            return res.status(200).json({
                success: true,
                data: vinculo
            });

        } catch (error) {
            console.error('Erro ao buscar vínculo contrato-obra:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao buscar vínculo contrato-obra.'
            });
        }
    }

    static async vincularObra(req, res) {
        try {
            const { contrato_id, livro_id } = req.body;

            const vinculo = await ContratoService.vincularObra(
                contrato_id,
                livro_id
            );

            return res.status(201).json({
                success: true,
                message: 'Contrato vinculado à obra com sucesso.',
                data: vinculo
            });

        } catch (error) {
            console.error('Erro ao vincular contrato à obra:', error);

            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno ao vincular contrato à obra.'
            });
        }
    }

}

module.exports = ContratoController;
