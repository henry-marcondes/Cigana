const pool = require('../db/connection');

const Livro = require('../models/Livro');
const LivroAutor = require('../models/LivroAutor');
const Autor = require('../models/Autor');
const StatusLivro = require('../models/StatusLivro');
const VisibilidadeLivro = require('../models/VisibilidadeLivro');
const PessoaService = require('./PessoaService');
const ContratoService = require('./ContratoService');

class LivroService {

    static async listar() {
        return await Livro.listar();
    }

    static async buscarPorId(id) {
        return await Livro.buscarPorId(id);
    }

    static async buscarPorSlug(slug) {
        return await Livro.buscarPorSlug(slug);
    }

    static async listarParaDecisaoEditorial() {
        return await Livro.listarAguardandoDecisaoEditorial();
    }

    static async buscarDecisaoEditorial(id) {
        return await Livro.buscarDecisaoEditorial(id);
    }

    static async decidirEditorial(id, decisao, usuarioId, motivoRejeicao) {
        return await Livro.registrarDecisaoEditorial(
            id,
            decisao,
            usuarioId,
            motivoRejeicao
        );
    }

    static async criar(dados, client) {
        const [statusDisponiveis, visibilidadesDisponiveis] =
            await Promise.all([
                StatusLivro.listar(),
                VisibilidadeLivro.listar()
            ]);
        const statusInicial = statusDisponiveis.find(
            ({ id }) => id === dados.status_livro_id
        );
        const visibilidadeInicial = visibilidadesDisponiveis.find(
            ({ id }) => id === dados.visibilidade_livro_id
        );

        if (
            statusInicial?.slug === 'publicado' ||
            visibilidadeInicial?.slug === 'publica'
        ) {
            const erro = new Error(
                'Uma obra não pode ser criada diretamente como publicada ou pública.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return await Livro.criar(dados, client);
    }

    static async criarParaAutor(usuario_id, dados) {

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // -------------------------------------------------
            // 1. Obter o Autor vinculado ao usuário
            // -------------------------------------------------

            const autor = await Autor.buscarPorUsuarioId(usuario_id);

            if (!autor) {
                const error = new Error(
                    'Usuário não possui cadastro de Autor.'
                );

                error.statusCode = 403;

                throw error;
            }

            // -------------------------------------------------
            // 2. Obter status "Em elaboração"
            // -------------------------------------------------

            const statusLivro = (
                await client.query(`
                    SELECT id
                      FROM status_livro
                     WHERE slug = 'em-elaboracao'
                       AND ativo = TRUE
                     LIMIT 1
                `)
            ).rows[0];

            if (!statusLivro) {
                const error = new Error(
                    'Status "Em elaboração" não encontrado.'
                );

                error.statusCode = 500;

                throw error;
            }

            // -------------------------------------------------
            // 3. Obter visibilidade "Rascunho"
            // -------------------------------------------------

            const visibilidadeLivro = (
                await client.query(`
                    SELECT id
                      FROM visibilidade_livro
                     WHERE slug = 'rascunho'
                       AND ativo = TRUE
                     LIMIT 1
                `)
            ).rows[0];

            if (!visibilidadeLivro) {
                const error = new Error(
                    'Visibilidade "Rascunho" não encontrada.'
                );

                error.statusCode = 500;

                throw error;
            }

            // -------------------------------------------------
            // 4. Criar a obra
            // -------------------------------------------------

            const livro = await Livro.criar(
                {
                    categoria_id: dados.categoria_id,
                    classificacao_indicativa_id:
                        dados.classificacao_indicativa_id,
                    idioma_id: dados.idioma_id,

                    status_livro_id: statusLivro.id,
                    visibilidade_livro_id: visibilidadeLivro.id,

                    titulo: dados.titulo,
                    slug: dados.slug,
                    resumo: dados.resumo ?? null,
                    capa_url: dados.capa_url ?? null,
                    isbn: dados.isbn ?? null,
                    ano_publicacao: dados.ano_publicacao ?? null,
                    data_publicacao: dados.data_publicacao ?? null,
                    ordem_exibicao:
                        dados.ordem_exibicao ?? 0
                },
                client
            );

            // -------------------------------------------------
            // 5. Vincular o Autor à obra
            // -------------------------------------------------

            const livroAutor = await LivroAutor.criar(
                {
                    livro_id: livro.id,
                    autor_id: autor.id,
                    ordem_exibicao: 1
                },
                client
            );

            // -------------------------------------------------
            // 6. Confirmar operação
            // -------------------------------------------------

            await client.query('COMMIT');

            return {
                livro,
                autor,
                livro_autor: livroAutor
            };

        } catch (error) {

            await client.query('ROLLBACK');

            throw error;

        } finally {

            client.release();

        }
    }

    static async alterarInformacoes(id, dados) {
        return await Livro.alterarInformacoes(id, dados);
    }

    static async alterarStatus(id, status_livro_id) {
        const status = (await StatusLivro.listar()).find(
            ({ id: statusId }) => statusId === status_livro_id
        );

        if (status?.slug === 'publicado') {
            const erro = new Error(
                'Use a operação de publicação para disponibilizar uma obra.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return await Livro.alterarStatus(id, status_livro_id);
    }

    static async enviarParaRevisao(id) {
        return await Livro.enviarParaRevisao(id);
    }

    static async alterarVisibilidade(
        id,
        visibilidade_livro_id
    ) {
        const visibilidade = (await VisibilidadeLivro.listar()).find(
            ({ id: visibilidadeId }) =>
                visibilidadeId === visibilidade_livro_id
        );

        if (visibilidade?.slug === 'publica') {
            const erro = new Error(
                'Use a operação de publicação para disponibilizar uma obra publicamente.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        return await Livro.alterarVisibilidade(
            id,
            visibilidade_livro_id
        );
    }

    static async publicar(id) {
        const livro = await Livro.buscarPorId(id);

        if (!livro) {
            const erro = new Error('Obra não encontrada ou inativa.');
            erro.statusCode = 404;
            throw erro;
        }

        const [statusDisponiveis, visibilidadesDisponiveis] =
            await Promise.all([
                StatusLivro.listar(),
                VisibilidadeLivro.listar()
            ]);
        const statusAtual = statusDisponiveis.find(
            ({ id: statusId }) => statusId === livro.status_livro_id
        );
        const visibilidadeAtual = visibilidadesDisponiveis.find(
            ({ id: visibilidadeId }) =>
                visibilidadeId === livro.visibilidade_livro_id
        );

        if (!statusAtual || !visibilidadeAtual) {
            const erro = new Error(
                'A obra possui status ou visibilidade inativo ou inexistente.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        if (statusAtual?.slug === 'publicado' &&
            visibilidadeAtual?.slug === 'publica') {
            const erro = new Error('A obra já está publicada.');
            erro.statusCode = 409;
            throw erro;
        }

        if (statusAtual?.slug === 'arquivado') {
            const erro = new Error(
                'Obras arquivadas não podem ser publicadas por esta operação.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        if (statusAtual.slug !== 'em-revisao') {
            const erro = new Error(
                'A obra precisa estar em revisão para ser publicada.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        const decisaoEditorial = await Livro.buscarDecisaoEditorial(id);
        if (!decisaoEditorial || decisaoEditorial.decisao !== 'APROVADA') {
            const mensagem = decisaoEditorial?.decisao === 'REJEITADA'
                ? 'A obra foi rejeitada editorialmente e não pode ser publicada.'
                : 'A obra ainda não foi aprovada editorialmente.';
            const erro = new Error(mensagem);
            erro.statusCode = 409;
            throw erro;
        }

        const vinculosAutores = await LivroAutor.listarPorLivro(id);
        if (vinculosAutores.length === 0) {
            const erro = new Error(
                'A obra precisa ter ao menos um Autor ativo vinculado.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        const autores = await Promise.all(
            vinculosAutores.map(({ autor_id }) => Autor.buscarPorId(autor_id))
        );
        const autoresAtivos = autores.filter(Boolean);

        const pendencias = [];
        for (const autor of autoresAtivos) {
            const regularizacao =
                await PessoaService.verificarRegularizacao(autor.usuario_id);

            if (!regularizacao.regularizado) {
                pendencias.push(
                    ...regularizacao.pendencias.map(
                        ({ mensagem }) => `${autor.nome_publico}: ${mensagem}`
                    )
                );
            }
        }

        if (autoresAtivos.length !== vinculosAutores.length) {
            pendencias.push('Há vínculo com Autor inativo ou inexistente.');
        }

        const contratosDireitos = await ContratoService.listar({
            ativo: true,
            tipo: 'DIREITOS_AUTORAIS'
        });

        if (contratosDireitos.length === 0) {
            pendencias.push(
                'Não há contrato ativo de Direitos Autorais aplicável.'
            );
        }

        for (const contrato of contratosDireitos) {
            let versao;
            try {
                versao = await ContratoService.buscarVersaoAtiva(contrato.id);
            } catch (erro) {
                if (erro.statusCode !== 404) throw erro;
                pendencias.push(
                    `O contrato "${contrato.nome}" não possui versão ativa.`
                );
                continue;
            }

            for (const autor of autoresAtivos) {
                const verificacao =
                    await ContratoService.verificarAceitePorObra(
                        autor.usuario_id,
                        id,
                        versao.id
                    );

                if (!verificacao.aceito) {
                    pendencias.push(
                        `${autor.nome_publico} ainda não aceitou a versão ativa do contrato "${contrato.nome}" para esta obra.`
                    );
                }
            }
        }

        if (pendencias.length > 0) {
            const erro = new Error(
                `A obra não pode ser publicada. Pendências: ${pendencias.join(' ')}`
            );
            erro.statusCode = 409;
            throw erro;
        }

        const publicada = await Livro.publicarAtomico(id);
        if (!publicada) {
            const erro = new Error('Obra não encontrada ou inativa.');
            erro.statusCode = 404;
            throw erro;
        }

        return publicada;
    }

    static async alterarCapa(id, capa_url) {
        return await Livro.alterarCapa(id, capa_url);
    }

    static async desativar(id) {
        return await Livro.desativar(id);
    }
}

module.exports = LivroService;
