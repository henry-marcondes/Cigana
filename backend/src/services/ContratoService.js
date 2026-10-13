const crypto = require('crypto');
const Contrato = require('../models/Contrato');
const ContratoVersao = require('../models/ContratoVersao');
const ContratoObra = require('../models/ContratoObra');
const ContratoAceite = require('../models/ContratoAceite');
const LivroAutor = require('../models/LivroAutor');
const Usuario = require('../models/Usuario');
const Autor = require('../models/Autor');
const Livro = require('../models/Livro');
const EmailService = require('./EmailService');
const {
    TokenUsuarioService,
    FINALIDADES
} = require('./tokenUsuarioService');

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

    static async verificarAceitePorObra(
        usuarioId,
        livroId,
        contratoVersaoId
    ) {
        const obraAutorizada = await LivroAutor.usuarioEhAutorDaObra(
            usuarioId,
            livroId
        );

        if (!obraAutorizada) {
            const erro = new Error('Obra não encontrada ou não autorizada.');
            erro.statusCode = 404;
            erro.codigo = 'OBRA_NAO_ENCONTRADA_OU_NAO_AUTORIZADA';
            throw erro;
        }

        const versao = await ContratoVersao.buscarPorId(contratoVersaoId);
        if (!versao) {
            const erro = new Error('Versão do contrato não encontrada.');
            erro.statusCode = 404;
            erro.codigo = 'VERSAO_NAO_ENCONTRADA';
            throw erro;
        }

        const contrato = await Contrato.buscarPorId(versao.contrato_id);
        if (!contrato || contrato.tipo !== 'DIREITOS_AUTORAIS' || !contrato.ativo) {
            const erro = new Error(
                'A versão informada não pertence a um contrato ativo de Direitos Autorais.'
            );
            erro.statusCode = 409;
            erro.codigo = 'CONTRATO_INCOMPATIVEL';
            throw erro;
        }

        if (versao.status !== 'ATIVA') {
            const erro = new Error(
                'Somente uma versão ativa pode ser consultada para aceite.'
            );
            erro.statusCode = 409;
            erro.codigo = 'VERSAO_INATIVA';
            throw erro;
        }

        const aceite = await ContratoAceite.buscarPorUsuarioVersaoELivro(
            usuarioId,
            contratoVersaoId,
            livroId
        );

        return {
            aceito: Boolean(aceite),
            livro_id: livroId,
            contrato_id: contrato.id,
            contrato_versao_id: contratoVersaoId,
            aceite: aceite ? {
                id: aceite.id,
                aceito_em: aceite.aceito_em,
                registro_eletronico: aceite.registro_eletronico
            } : null
        };
    }

    static async solicitarCodigoAceite(usuarioId, contratoVersaoId, livroId) {
        const existente = await ContratoAceite.buscarPorUsuarioVersaoELivro(
            usuarioId,
            contratoVersaoId,
            livroId
        ); 
        if (existente) {
            const erro = new Error(
                'O usuário já aceitou esta versão do contrato.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return TokenUsuarioService.solicitarCodigoAceite({
            usuario_id: usuarioId,
            contrato_versao_id: contratoVersaoId,
            livro_id: livroId
        });
    }

    static async confirmarCodigoAceite(usuarioId, token, dados = {}) {
        const registroToken = await TokenUsuarioService.validar({
            usuario_id: usuarioId,
            finalidade: FINALIDADES.ACEITE_CONTRATO,
            token
        });
        const contexto = registroToken.dados_adicionais;

        if (!contexto || contexto.usuario_id !== usuarioId ||
            !contexto.contrato_versao_id || !contexto.livro_id) {
            const erro = new Error('Contexto do token inválido.');
            erro.statusCode = 400;
            throw erro;
        }

        const aceite = await this.registrarAceite(
            usuarioId,
            contexto.contrato_versao_id,
            contexto.livro_id,
            dados
        );

        try {
            const [usuario, autor, livro, versao] = await Promise.all([
                Usuario.buscarPorId(usuarioId),
                Autor.buscarPorUsuarioId(usuarioId),
                Livro.buscarPorId(contexto.livro_id),
                ContratoVersao.buscarPorId(contexto.contrato_versao_id)
            ]);
            const contrato = versao
                ? await Contrato.buscarPorId(versao.contrato_id)
                : null;

            await EmailService.notificarAceiteContrato({
                nome_autor: autor?.nome_publico || 'Não informado',
                email_autor: usuario?.email || 'Não informado',
                titulo_obra: livro?.titulo || 'Não informado',
                nome_contrato: contrato?.nome || 'Não informado',
                versao_contrato: versao?.versao || 'Não informada',
                data_hora: aceite.aceito_em,
                registro_eletronico: aceite.registro_eletronico
            });
        } catch (erroNotificacao) {
            console.error(
                'Falha ao enviar notificação institucional de aceite.',
                erroNotificacao.message
            );
        }

        return aceite;
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

        const contrato = await Contrato.buscarPorId(versao.contrato_id);
        if (!contrato) {
            const erro = new Error('Contrato da versão não encontrado.');
            erro.statusCode = 404;
            throw erro;
        }

        if (contrato.tipo === 'DIREITOS_AUTORAIS') {
            if (!contrato.ativo) {
                const erro = new Error('O contrato de Direitos Autorais está inativo.');
                erro.statusCode = 409;
                throw erro;
            }

            const ehAutor = await LivroAutor.usuarioEhAutorDaObra(
                usuarioId,
                livroId
            );
            if (!ehAutor) {
                const erro = new Error('Obra não encontrada ou não autorizada.');
                erro.statusCode = 404;
                throw erro;
            }
        } else {
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
        }

        const hashConteudo = crypto
            .createHash('sha256')
            .update(versao.conteudo, 'utf8')
            .digest('hex');

        const aceiteExistente =
            await ContratoAceite.buscarPorUsuarioVersaoELivro(
                usuarioId,
                contratoVersaoId,
                livroId
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
