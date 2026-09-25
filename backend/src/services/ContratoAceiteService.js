const ContratoAceite = require('../models/ContratoAceite');
const ContratoVersao = require('../models/ContratoVersao');

class ContratoAceiteService {

    static async listarPorVersao(contratoVersaoId) {
        const versao = await ContratoVersao.buscarPorId(contratoVersaoId);

        if (!versao) {
            const erro = new Error('Versão do contrato não encontrada.');
            erro.statusCode = 404;
            throw erro;
        }

        return await ContratoAceite.listarPorVersao(contratoVersaoId);
    }

    static async listarPorUsuario(usuarioId) {
        return await ContratoAceite.listarPorUsuario(usuarioId);
    }

    static async buscarPorId(id) {
        const aceite = await ContratoAceite.buscarPorId(id);

        if (!aceite) {
            const erro = new Error('Aceite do contrato não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        return aceite;
    }

    static async buscarPorVersaoEUsuario(contratoVersaoId, usuarioId) {
        const aceite = await ContratoAceite.buscarPorVersaoEUsuario(
            contratoVersaoId,
            usuarioId
        );

        return aceite;
    }

    static async criar(
        contratoVersaoId,
        usuarioId,
        ipOrigem,
        userAgent,
        dadosTecnicos
    ) {
        const versao = await ContratoVersao.buscarPorId(contratoVersaoId);

        if (!versao) {
            const erro = new Error('Versão do contrato não encontrada.');
            erro.statusCode = 404;
            throw erro;
        }

        if (versao.status !== 'ATIVA') {
            const erro = new Error(
                'Não é possível aceitar uma versão de contrato que não está ativa.'
            );
            erro.statusCode = 400;
            throw erro;
        }

        const existente = await ContratoAceite.buscarPorVersaoEUsuario(
            contratoVersaoId,
            usuarioId
        );

        if (existente) {
            const erro = new Error(
                'Usuário já aceitou esta versão do contrato.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return await ContratoAceite.criar(
            contratoVersaoId,
            usuarioId,
            ipOrigem,
            userAgent,
            dadosTecnicos
        );
    }

}

module.exports = ContratoAceiteService;
