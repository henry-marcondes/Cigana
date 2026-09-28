const pool = require('../db/connection');

const SolicitacaoAutor = require('../models/SolicitacaoAutor');
const UsuarioPapel = require('../models/UsuarioPapel');
const Papel = require('../models/Papel');
const Autor = require('../models/Autor');
const Livro = require('../models/Livro');
const LivroAutor = require('../models/LivroAutor');

class SolicitacaoAutorService {

    // =====================================================
    // USUÁRIO
    // =====================================================

    static async criar(usuario_id, dados) {

        const existente =
            await SolicitacaoAutor.buscarPendentePorUsuario(
                usuario_id
            );

        if (existente) {
            const error = new Error(
                'Já existe uma solicitação de Autor pendente para este usuário.'
            );

            error.statusCode = 409;
            throw error;
        }

        return await SolicitacaoAutor.criar({
            usuario_id,
            ...dados
        });
    }

    static async buscarMinhaPorId(usuario_id, id) {

        const solicitacao =
            await SolicitacaoAutor.buscarPorId(id);

        if (!solicitacao) {
            const error = new Error(
                'Solicitação de Autor não encontrada.'
            );

            error.statusCode = 404;
            throw error;
        }

        if (solicitacao.usuario_id !== usuario_id) {
            const error = new Error(
                'Você não tem acesso a esta solicitação.'
            );

            error.statusCode = 403;
            throw error;
        }

        return solicitacao;
    }

    static async listarPorUsuario(usuario_id) {

        return await SolicitacaoAutor.listarPorUsuario(
            usuario_id
        );
    }

    // =====================================================
    // GESTÃO DA PLATAFORMA
    // =====================================================

    static async buscarParaAvaliacao(
        avaliador_id,
        id
    ) {

        const solicitacao =
            await SolicitacaoAutor.buscarPorId(id);

        if (!solicitacao) {
            const error = new Error(
                'Solicitação de Autor não encontrada.'
            );

            error.statusCode = 404;
            throw error;
        }

        return solicitacao;
    }

    static async listarPorAvaliacao(
        avaliador_id,
        status = null
    ) {

        if (status) {
            return await SolicitacaoAutor.listarPorStatus(
                status
            );
        }

        return await SolicitacaoAutor.listarTodas();
    }

    static async listarPendentes(avaliador_id) {

        return await SolicitacaoAutor.listarPendentes();
    }

    // =====================================================
    // APROVAÇÃO
    // =====================================================

    static async aprovar(
        id,
        avaliador_id
    ) {

        const client = await pool.connect();

        try {

            await client.query('BEGIN');

            // -------------------------------------------------
            // 1. Buscar solicitação
            // -------------------------------------------------

            const solicitacao =
                await client.query(`
                    SELECT
                        id,
                        usuario_id,
                        nome_publico,
                        biografia,
                        foto_url,
                        titulo_provisorio,
                        resumo,
                        categoria_id,
                        classificacao_indicativa_id,
                        idioma_id,
                        status
                    FROM solicitacoes_autor
                    WHERE id = $1
                    FOR UPDATE
                `, [id]);

            if (solicitacao.rowCount === 0) {

                const error = new Error(
                    'Solicitação de Autor não encontrada.'
                );

                error.statusCode = 404;
                throw error;
            }

            const dados = solicitacao.rows[0];

            // -------------------------------------------------
            // 2. Garantir que ainda está pendente
            // -------------------------------------------------

            if (dados.status !== 'PENDENTE') {

                const error = new Error(
                    'Esta solicitação já foi avaliada.'
                );

                error.statusCode = 409;
                throw error;
            }

            // -------------------------------------------------
            // 3. Obter papel AUTOR
            // -------------------------------------------------

            const papelAutor =
                await Papel.buscarPorCodigo('AUTOR');

            if (!papelAutor) {

                const error = new Error(
                    'O papel AUTOR não está cadastrado.'
                );

                error.statusCode = 500;
                throw error;
            }

            // -------------------------------------------------
            // 4. Atribuir papel AUTOR ao usuário
            // -------------------------------------------------

            let usuarioPapel =
                await UsuarioPapel.buscarPorUsuarioEPapel(
                    dados.usuario_id,
                    papelAutor.id,
                    client
                );

            if (!usuarioPapel) {

                usuarioPapel =
                    await UsuarioPapel.criar(
                        dados.usuario_id,
                        papelAutor.id,
                        client
                    );
            }

            // -------------------------------------------------
            // 5. Criar ou obter entidade Autor
            // -------------------------------------------------

            let autor =
                await Autor.buscarPorUsuarioId(
                    dados.usuario_id
                );

            if (!autor) {

                autor = await Autor.criar({
                    usuario_id: dados.usuario_id,
                    nome_publico: dados.nome_publico,
                    biografia: dados.biografia,
                    foto_url: dados.foto_url
                }, client);
            }

            // -------------------------------------------------
            // 6. Criar a Obra
            // -------------------------------------------------

            const statusResult =
                await client.query(`
                    SELECT id
                    FROM status_livro
                    WHERE slug = 'em-elaboracao'
                      AND ativo = TRUE
                    LIMIT 1
                `);

            if (statusResult.rowCount === 0) {

                const error = new Error(
                    'O status "Em elaboração" não está cadastrado.'
                );

                error.statusCode = 500;
                throw error;
            }

            const visibilidadeResult =
                await client.query(`
                    SELECT id
                    FROM visibilidade_livro
                    WHERE slug = 'rascunho'
                      AND ativo = TRUE
                    LIMIT 1
                `);

            if (visibilidadeResult.rowCount === 0) {

                const error = new Error(
                    'A visibilidade "Rascunho" não está cadastrada.'
                );

                error.statusCode = 500;
                throw error;
            }

            const status_livro_id =
                statusResult.rows[0].id;

            const visibilidade_livro_id =
                visibilidadeResult.rows[0].id;

            // -------------------------------------------------
            // Slug inicial da obra
            // -------------------------------------------------

            const slugBase =
                this.gerarSlug(dados.titulo_provisorio);

            const slug =
                await this.gerarSlugUnico(
                    slugBase,
                    client
                );

            const livro =
                await Livro.criar({
                    categoria_id:
                        dados.categoria_id,

                    classificacao_indicativa_id:
                        dados.classificacao_indicativa_id,

                    idioma_id:
                        dados.idioma_id,

                    status_livro_id,

                    visibilidade_livro_id,

                    titulo:
                        dados.titulo_provisorio,

                    slug,

                    resumo:
                        dados.resumo,

                    capa_url:
                        null,

                    isbn:
                        null,

                    ano_publicacao:
                        null,

                    data_publicacao:
                        null,

                    ordem_exibicao:
                        0

                }, client);

            // -------------------------------------------------
            // 7. Vincular Autor à Obra
            // -------------------------------------------------

            await LivroAutor.criar({
                livro_id: livro.id,
                autor_id: autor.id,
                ordem_exibicao: 1
            }, client);

            // -------------------------------------------------
            // 8. Aprovar solicitação
            // -------------------------------------------------

            const resultado =
                await SolicitacaoAutor.aprovar(
                    id,
                    avaliador_id,
                    client
                );

            if (!resultado) {

                const error = new Error(
                    'Não foi possível aprovar a solicitação.'
                );

                error.statusCode = 409;
                throw error;
            }

            await client.query('COMMIT');

            return {
                solicitacao: resultado,
                autor,
                livro
            };

        } catch (error) {

            await client.query('ROLLBACK');

            throw error;

        } finally {

            client.release();
        }
    }

    // =====================================================
    // RECUSA
    // =====================================================

    static async recusar(
        id,
        avaliador_id,
        motivo_recusa
    ) {

        const solicitacao =
            await SolicitacaoAutor.buscarPorId(id);

        if (!solicitacao) {

            const error = new Error(
                'Solicitação de Autor não encontrada.'
            );

            error.statusCode = 404;
            throw error;
        }

        if (solicitacao.status !== 'PENDENTE') {

            const error = new Error(
                'Esta solicitação já foi avaliada.'
            );

            error.statusCode = 409;
            throw error;
        }

        if (
            !motivo_recusa ||
            !motivo_recusa.trim()
        ) {

            const error = new Error(
                'O motivo da recusa é obrigatório.'
            );

            error.statusCode = 400;
            throw error;
        }

        return await SolicitacaoAutor.recusar(
            id,
            avaliador_id,
            motivo_recusa.trim()
        );
    }

    // =====================================================
    // UTILITÁRIOS
    // =====================================================

    static gerarSlug(texto) {

        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    static async gerarSlugUnico(
        slugBase,
        client
    ) {

        let slug = slugBase;
        let contador = 2;

        while (true) {

            const result = await client.query(`
                SELECT 1
                FROM livros
                WHERE slug = $1
                LIMIT 1
            `, [slug]);

            if (result.rowCount === 0) {
                return slug;
            }

            slug = `${slugBase}-${contador}`;
            contador++;
        }
    }
}

module.exports = SolicitacaoAutorService;


