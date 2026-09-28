const pool = require('../db/connection');

const Livro = require('../models/Livro');
const LivroAutor = require('../models/LivroAutor');
const Autor = require('../models/Autor');
const StatusLivro = require('../models/StatusLivro');
const VisibilidadeLivro = require('../models/VisibilidadeLivro');

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

    static async criar(dados, client) {
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
        return await Livro.alterarStatus(id, status_livro_id);
    }

    static async alterarVisibilidade(
        id,
        visibilidade_livro_id
    ) {
        return await Livro.alterarVisibilidade(
            id,
            visibilidade_livro_id
        );
    }

    static async alterarCapa(id, capa_url) {
        return await Livro.alterarCapa(id, capa_url);
    }

    static async desativar(id) {
        return await Livro.desativar(id);
    }
}

module.exports = LivroService;
