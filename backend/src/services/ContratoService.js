const Contrato = require('../models/Contrato');
const ContratoVersao = require('../models/ContratoVersao');
const ContratoObra = require('../models/ContratoObra');

class ContratoService {

    static async listar() {
        return await Contrato.listar();
    }

    static async buscarPorId(id) {
        const contrato = await Contrato.buscarPorId(id);

        if (!contrato) {
            const erro = new Error('Contrato não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        return contrato;
    }

    static async buscarPorCodigo(codigo) {
        const contrato = await Contrato.buscarPorCodigo(codigo);

        if (!contrato) {
            const erro = new Error('Contrato não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        return contrato;
    }

    static async listarVersoes(contratoId) {
        await this.buscarPorId(contratoId);

        return await ContratoVersao.listarPorContrato(contratoId);
    }

    static async buscarVersaoAtiva(contratoId) {
        await this.buscarPorId(contratoId);

        const versao = await ContratoVersao.buscarVersaoAtiva(contratoId);

        if (!versao) {
            const erro = new Error('Não existe versão ativa para este contrato.');
            erro.statusCode = 404;
            throw erro;
        }

        return versao;
    }

    static async buscarVersaoPorId(id) {
        const versao = await ContratoVersao.buscarPorId(id);

        if (!versao) {
            const erro = new Error('Versão do contrato não encontrada.');
            erro.statusCode = 404;
            throw erro;
        }

        return versao;
    }

    static async listarObrasPorContrato(contratoId) {
        await this.buscarPorId(contratoId);

        return await ContratoObra.listarPorContrato(contratoId);
    }

    static async listarContratosPorObra(livroId) {
        return await ContratoObra.listarPorObra(livroId);
    }

    static async buscarContratoObraPorId(id) {
        const contratoObra = await ContratoObra.buscarPorId(id);

        if (!contratoObra) {
            const erro = new Error('Vínculo entre contrato e obra não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        return contratoObra;
    }

    static async vincularObra(contratoId, livroId) {

        await this.buscarPorId(contratoId);

        const existente = await ContratoObra.buscarPorContratoEObra(
            contratoId,
            livroId
        );

        if (existente) {
            const erro = new Error('Contrato já está vinculado a esta obra.');
            erro.statusCode = 409;
            throw erro;
        }

        return await ContratoObra.criar(contratoId, livroId);
    }

}

module.exports = ContratoService;
