const crypto = require('crypto');
const Contrato = require('../models/Contrato');
const ContratoVersao = require('../models/ContratoVersao');
const ContratoObra = require('../models/ContratoObra');
const ContratoAceite = require('../models/ContratoAceite');

class ContratoService {

    // =====================================================
    // CONTRATO
    // =====================================================

    static async listar(filtros = {}) {
        return await Contrato.listar(filtros);
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

    static async criar(dados) {
        const existente = await Contrato.buscarPorCodigo(dados.codigo);

        if (existente) {
            const erro = new Error('Já existe um contrato com este código.');
            erro.statusCode = 409;
            throw erro;
        }

        return await Contrato.criar(dados);
    }

    static async atualizar(id, dados) {
        await this.buscarPorId(id);

        if (dados.codigo) {
            const existente = await Contrato.buscarPorCodigo(dados.codigo);

            if (existente && existente.id !== id) {
                const erro = new Error('Já existe um contrato com este código.');
                erro.statusCode = 409;
                throw erro;
            }
        }

        const contrato = await Contrato.atualizar(id, dados);

        if (!contrato) {
            const erro = new Error('Contrato não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        return contrato;
    }

    static async ativar(id) {
        await this.buscarPorId(id);

        return await Contrato.ativar(id);
    }

    static async desativar(id) {
        await this.buscarPorId(id);

        return await Contrato.desativar(id);
    }

    // =====================================================
    // VERSÕES
    // =====================================================

    static async listarVersoes(contratoId) {
        await this.buscarPorId(contratoId);

        return await ContratoVersao.listarPorContrato(contratoId);
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

    static async buscarVersaoAtiva(contratoId) {
        await this.buscarPorId(contratoId);

        const versao = await ContratoVersao.buscarAtiva(contratoId);

        if (!versao) {
            const erro = new Error(
                'Não existe versão ativa para este contrato.'
            );
            erro.statusCode = 404;
            throw erro;
        }

        return versao;
    }

    static async criarVersao(contratoId, dados) {
        await this.buscarPorId(contratoId);

        const versao = await ContratoVersao.criar({
            contrato_id: contratoId,
            versao: dados.versao,
            titulo: dados.titulo,
            conteudo: dados.conteudo
        });

        return versao;
    }

    static async atualizarVersao(id, dados) {
        const versao = await this.buscarVersaoPorId(id);

        if (versao.status !== 'RASCUNHO') {
            const erro = new Error(
                'Somente versões em rascunho podem ser alteradas.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return await ContratoVersao.atualizar(id, dados);
    }

    static async publicarVersao(id) {
        const versao = await this.buscarVersaoPorId(id);

        if (versao.status !== 'RASCUNHO') {
            const erro = new Error(
                'Somente versões em rascunho podem ser publicadas.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        const versaoAtiva = await ContratoVersao.buscarAtiva(
            versao.contrato_id
        );

        if (versaoAtiva) {
            const erro = new Error(
                'Este contrato já possui uma versão ativa.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return await ContratoVersao.publicar(id);
    }

    static async encerrarVersao(id) {
        const versao = await this.buscarVersaoPorId(id);

        if (versao.status !== 'ATIVA') {
            const erro = new Error(
                'Somente versões ativas podem ser encerradas.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return await ContratoVersao.encerrar(id);
    }

    // =====================================================
    // VÍNCULO COM OBRAS
    // =====================================================

    static async listarObrasPorContrato(contratoId) {
        await this.buscarPorId(contratoId);

        return await ContratoObra.listarPorContrato(contratoId);
    }

    static async listarContratosPorObra(livroId) {
        return await ContratoObra.listarPorLivro(livroId);
    }

    static async buscarContratoObraPorId(id) {
        const contratoObra = await ContratoObra.buscarPorId(id);

        if (!contratoObra) {
            const erro = new Error(
                'Vínculo entre contrato e obra não encontrado.'
            );
            erro.statusCode = 404;
            throw erro;
        }

        return contratoObra;
    }

    static async vincularObra(contratoId, livroId) {
        await this.buscarPorId(contratoId);

        const existente = await ContratoObra.buscarPorContratoELivro(
            contratoId,
            livroId
        );

        if (existente) {
            const erro = new Error(
                'Contrato já está vinculado a esta obra.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return await ContratoObra.criar({
            contrato_id: contratoId,
            livro_id: livroId
        });
    }

    static async desvincularObra(id) {
        await this.buscarContratoObraPorId(id);

        return await ContratoObra.remover(id);
    }

    // =====================================================
    // ACEITES
    // =====================================================

    static async listarAceitesPorUsuario(usuarioId) {
        return await ContratoAceite.listarPorUsuario(usuarioId);
    }

    static async listarAceitesPorVersao(contratoVersaoId) {
        await this.buscarVersaoPorId(contratoVersaoId);

        return await ContratoAceite.listarPorVersao(contratoVersaoId);
    }

    static async buscarAceitePorId(id) {
        const aceite = await ContratoAceite.buscarPorId(id);

        if (!aceite) {
            const erro = new Error('Aceite de contrato não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        return aceite;
    }

    static async verificarAceite(usuarioId, contratoVersaoId) {
        await this.buscarVersaoPorId(contratoVersaoId);

        return await ContratoAceite.buscarPorUsuarioEVersao(
            usuarioId,
            contratoVersaoId
        );
    }

    static async registrarAceite(
        usuarioId,
        contratoVersaoId,
        livroId,
        dados = {}
    ) {
        const versao = await this.buscarVersaoPorId(contratoVersaoId);

        if (versao.status !== 'ATIVA') {
            const erro = new Error(
                'Somente uma versão ativa pode ser aceita.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        const contratoObra = await ContratoObra.buscarPorContratoELivro(
            versao.contrato_id,
            livroId
        );

        if (!contratoObra) {
            const erro = new Error(
                'A obra não está vinculada ao contrato desta versão.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        const hashConteudo = crypto
            .createHash('sha256')
            .update(versao.conteudo, 'utf8')
            .digest('hex');

        const aceiteExistente =
            await ContratoAceite.buscarPorUsuarioEVersao(
                usuarioId,
                contratoVersaoId
            );

        if (aceiteExistente) {
            const erro = new Error(
                'O usuário já aceitou esta versão do contrato.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        try {
            return await ContratoAceite.criar({
                contrato_versao_id: contratoVersaoId,
                livro_id: livroId,
                usuario_id: usuarioId,
                hash_conteudo: hashConteudo,
                ip_origem: dados.ip_origem || null,
                user_agent: dados.user_agent || null,
                dados_tecnicos: dados.dados_tecnicos || null
            });
        } catch (erro) {
            /*
             * Proteção adicional contra concorrência:
             * a constraint UNIQUE do PostgreSQL continua sendo
             * a garantia definitiva contra aceite duplicado.
             */
            if (erro.code === '23505') {
                const conflito = new Error(
                    'O usuário já aceitou esta versão do contrato.'
                );
                conflito.statusCode = 409;
                throw conflito;
            }

            throw erro;
        }
    }
}

module.exports = ContratoService;
