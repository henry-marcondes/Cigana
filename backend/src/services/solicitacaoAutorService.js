const pool = require('../db/connection');

const SolicitacaoAutor = require('../models/SolicitacaoAutor');
const Usuario = require('../models/Usuario');
const Autor = require('../models/Autor');
const Papel = require('../models/Papel');
const UsuarioPapel = require('../models/UsuarioPapel');
const LivroAutor = require('../models/LivroAutor');

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


    static async listarPorAvaliacao(
        avaliador_id,
        status = null
    ) {

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


    /**
     * Aprova uma solicitação de Autor.
     *
     * A aprovação é uma operação transacional:
     *
     * 1. valida a solicitação;
     * 2. obtém o papel AUTOR;
     * 3. atribui o papel ao usuário, se ainda não possuir;
     * 4. cria a entidade Autor, se ainda não existir;
     * 5. vincula o Autor à obra proposta;
     * 6. altera a solicitação para APROVADA;
     * 7. confirma tudo com COMMIT.
     */
    static async aprovar(id, avaliador_id) {

        await this._validarPermissaoAvaliacao(avaliador_id);

        const client = await pool.connect();

        try {

            await client.query('BEGIN');

            /*
             * Busca a solicitação dentro da transação.
             */
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


            /*
             * Verifica o usuário candidato.
             */
            const usuario =
                await Usuario.buscarPorId(solicitacao.usuario_id);

            if (!usuario) {
                const erro = new Error(
                    'Usuário da solicitação não encontrado.'
                );

                erro.statusCode = 404;
                throw erro;
            }


            /*
             * Obtém o papel AUTOR diretamente pelo código.
             *
             * O banco continua sendo a fonte de verdade
             * para RBAC.
             */
            const papelAutor =
                await Papel.buscarPorCodigo('AUTOR');

            if (!papelAutor) {
                const erro = new Error(
                    'Papel AUTOR não encontrado.'
                );

                erro.statusCode = 500;
                throw erro;
            }


            /*
             * Atribui o papel AUTOR caso o usuário ainda
             * não possua esse papel.
             */
            let usuarioPapel =
                await UsuarioPapel.buscarPorUsuarioEPapel(
                    solicitacao.usuario_id,
                    papelAutor.id,
                    client
                );

            if (!usuarioPapel) {

                usuarioPapel =
                    await UsuarioPapel.criar(
                        solicitacao.usuario_id,
                        papelAutor.id,
                        client
                    );
            }


            /*
             * Obtém ou cria a entidade de domínio Autor.
             */
            let autor =
                await Autor.buscarPorUsuarioId(
                    solicitacao.usuario_id
                );

            if (!autor) {

                autor = await Autor.criar(
                    {
                        usuario_id: solicitacao.usuario_id,
                        nome_publico: solicitacao.nome_publico,
                        biografia: solicitacao.biografia,
                        foto_url: solicitacao.foto_url
                    },
                    client
                );
            }


            /*
             * Verifica se o Autor já está vinculado
             * à obra proposta.
             *
             * Não criamos vínculo duplicado.
             */
            const autorDaObra =
                await LivroAutor.usuarioEhAutorDaObra(
                    solicitacao.usuario_id,
                    solicitacao.id
                );

            /*
             * A solicitação ainda não possui livro_id.
             *
             * A obra da solicitação é criada neste processo.
             */
            let livroId = null;

            /*
             * A partir da estrutura atual, a solicitação contém
             * os dados da futura obra, mas não contém livro_id.
             *
             * Portanto, a aprovação não pode simplesmente criar
             * LivroAutor ainda.
             *
             * Esta condição interrompe a transação de forma
             * explícita até que a obra seja criada/vinculada
             * por uma operação definida para esse fluxo.
             */
            if (!livroId) {

                const erro = new Error(
                    'A solicitação aprovada ainda não possui uma obra vinculável.'
                );

                erro.statusCode = 409;
                throw erro;
            }


            /*
             * Este bloco será executado quando o fluxo de criação
             * da obra estiver definido.
             */
            if (!autorDaObra) {

                await LivroAutor.criar(
                    {
                        livro_id: livroId,
                        autor_id: autor.id,
                        ordem_exibicao: 1
                    },
                    client
                );
            }


            /*
             * Finalmente aprova a solicitação.
             */
            const solicitacaoAprovada =
                await SolicitacaoAutor.aprovar(
                    id,
                    avaliador_id,
                    client
                );

            if (!solicitacaoAprovada) {
                const erro = new Error(
                    'Não foi possível aprovar a solicitação de Autor.'
                );

                erro.statusCode = 409;
                throw erro;
            }


            await client.query('COMMIT');

            return {
                solicitacao: solicitacaoAprovada,
                usuario_papel: usuarioPapel,
                autor
            };

        } catch (error) {

            await client.query('ROLLBACK');

            throw error;

        } finally {

            client.release();
        }
    }


    static async recusar(
        id,
        avaliador_id,
        motivo_recusa
    ) {

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
