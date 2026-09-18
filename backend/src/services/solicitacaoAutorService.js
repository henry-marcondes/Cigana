const SolicitacaoAutor = require('../models/SolicitacaoAutor');
const Usuario = require('../models/Usuario');
const AutorizacaoService = require('./autorizacaoService');

class SolicitacaoAutorService {

    static async criar(usuario_id, dados) {
        const usuario = await Usuario.buscarPorId(usuario_id);

        if (!usuario) {
            const erro = new Error('Usuário não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        if (!usuario.email_verificado_em) {
            const erro = new Error(
                'É necessário verificar o e-mail antes de solicitar atuação como Autor.'
            );
            erro.statusCode = 400;
            throw erro;
        }

        const pendente =
            await SolicitacaoAutor.buscarPendentePorUsuario(usuario_id);

        if (pendente) {
            const erro = new Error(
                'Já existe uma solicitação para atuação como Autor pendente.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return SolicitacaoAutor.criar({
            usuario_id,
            ...dados
        });
    }

    static async buscarMinhaPorId(usuario_id, id) {
        const solicitacao =
            await SolicitacaoAutor.buscarPorId(id);

        if (!solicitacao) {
            const erro = new Error(
                'Solicitação de Autor não encontrada.'
            );
            erro.statusCode = 404;
            throw erro;
        }

        if (solicitacao.usuario_id !== usuario_id) {
            const erro = new Error(
                'Solicitação de Autor não encontrada.'
            );
            erro.statusCode = 404;
            throw erro;
        }

        return solicitacao;
    }

    static async listarPorUsuario(usuario_id) {
        return SolicitacaoAutor.listarPorUsuario(usuario_id);
    }

    static async buscarParaAvaliacao(avaliador_id, id) {
        await this._validarPermissaoAvaliacao(avaliador_id);

        const solicitacao =
            await SolicitacaoAutor.buscarPorId(id);

        if (!solicitacao) {
            const erro = new Error(
                'Solicitação de Autor não encontrada.'
            );
            erro.statusCode = 404;
            throw erro;
        }

        return solicitacao;
    }

    static async listarPorAvaliacao(avaliador_id, status = null) {
        await this._validarPermissaoAvaliacao(avaliador_id);

        if (status) {
            return SolicitacaoAutor.listarPorStatus(status);
        }

        return SolicitacaoAutor.listarTodas();
    }

    static async listarPendentes(avaliador_id) {
        await this._validarPermissaoAvaliacao(avaliador_id);

        return SolicitacaoAutor.listarPendentes();
    }

    static async aprovar(id, avaliador_id) {
        await this._validarPermissaoAvaliacao(avaliador_id);

        const solicitacao =
            await SolicitacaoAutor.buscarPorId(id);

        if (!solicitacao) {
            const erro = new Error(
                'Solicitação de Autor não encontrada.'
            );
            erro.statusCode = 404;
            throw erro;
        }

        if (solicitacao.status !== 'PENDENTE') {
            const erro = new Error(
                'Somente solicitações pendentes podem ser aprovadas.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return SolicitacaoAutor.aprovar(
            id,
            avaliador_id
        );
    }

    static async recusar(id, avaliador_id, motivo_recusa) {
        await this._validarPermissaoAvaliacao(avaliador_id);

        const solicitacao =
            await SolicitacaoAutor.buscarPorId(id);

        if (!solicitacao) {
            const erro = new Error(
                'Solicitação de Autor não encontrada.'
            );
            erro.statusCode = 404;
            throw erro;
        }

        if (solicitacao.status !== 'PENDENTE') {
            const erro = new Error(
                'Somente solicitações pendentes podem ser recusadas.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        if (!motivo_recusa || !motivo_recusa.trim()) {
            const erro = new Error(
                'O motivo da recusa é obrigatório.'
            );
            erro.statusCode = 400;
            throw erro;
        }

        return SolicitacaoAutor.recusar(
            id,
            avaliador_id,
            motivo_recusa.trim()
        );
    }

    static async _validarPermissaoAvaliacao(usuario_id) {
        const podeAvaliar =
            await AutorizacaoService.temPermissao(
                usuario_id,
                'autor.editar'
            );

        if (!podeAvaliar) {
            const erro = new Error(
                'Usuário não possui permissão para avaliar solicitações de Autor.'
            );
            erro.statusCode = 403;
            throw erro;
        }
    }
}

module.exports = SolicitacaoAutorService;
