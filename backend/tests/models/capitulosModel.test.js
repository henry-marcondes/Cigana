const pool = require('../../src/db/connection');

const Livro = require('../../src/models/Livro');
const Capitulo = require('../../src/models/Capitulo');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Capitulo');
    console.log('===================================\n');

    try {

        const categoria = (await pool.query(
            'SELECT id FROM categorias LIMIT 1'
        )).rows[0];

        const classificacao = (await pool.query(
            'SELECT id FROM classificacoes_indicativas LIMIT 1'
        )).rows[0];

        const idioma = (await pool.query(
            'SELECT id FROM idiomas LIMIT 1'
        )).rows[0];

        const status = (await pool.query(
            'SELECT id FROM status_livro LIMIT 1'
        )).rows[0];

        const visibilidade = (await pool.query(
            'SELECT id FROM visibilidade_livro LIMIT 1'
        )).rows[0];

        const timestamp = Date.now();

        console.log('1. Criar livro');

        const livro = await Livro.criar({

            categoria_id: categoria.id,
            classificacao_indicativa_id: classificacao.id,
            idioma_id: idioma.id,
            status_livro_id: status.id,
            visibilidade_livro_id: visibilidade.id,

            titulo: 'Livro Teste',

            slug: `livro-${timestamp}`,

            resumo: 'Livro para teste.',

            capa_url: null,

            isbn: '9780000000000',

            ano_publicacao: 2026,

            data_publicacao: new Date(),

            ordem_exibicao: 1

        });

        console.log(livro);

        console.log('\n2. Criar capítulo');

        const capitulo = await Capitulo.criar({

            livro_id: livro.id,

            titulo: 'Capítulo 1',

            slug: `capitulo-1-${timestamp}`,

            resumo: 'Resumo',

            texto_introdutorio: 'Texto introdutório.',

            capa_url: null,

            ordem_exibicao: 1

        });

        console.log(capitulo);

        console.log('\n3. Listar capítulos');

        console.log(
            await Capitulo.listarPorLivro(livro.id)
        );

        console.log('\n4. Buscar por ID');

        console.log(
            await Capitulo.buscarPorId(capitulo.id)
        );

        console.log('\n5. Buscar por slug');

        console.log(
            await Capitulo.buscarPorSlug(
                livro.id,
                capitulo.slug
            )
        );

        console.log('\n6. Alterar informações');

        console.log(
            await Capitulo.alterarInformacoes(
                capitulo.id,
                {
                    titulo: 'Capítulo Atualizado',
                    slug: `capitulo-atualizado-${timestamp}`,
                    resumo: 'Resumo atualizado.',
                    texto_introdutorio: 'Novo texto.',
                    ordem_exibicao: 2
                }
            )
        );

        console.log('\n7. Alterar capa');

        console.log(
            await Capitulo.alterarCapa(
                capitulo.id,
                'https://ciganas.com/capas/capitulo.jpg'
            )
        );

        console.log('\n8. Desativar');

        console.log(
            await Capitulo.desativar(
                capitulo.id
            )
        );

        console.log('\n9. Buscar capítulo desativado');

        console.log(
            await Capitulo.buscarPorId(
                capitulo.id
            )
        );

        console.log('\n===================================');
        console.log('TESTES FINALIZADOS');
        console.log('===================================\n');

    } catch (erro) {

        console.error('\nERRO NOS TESTES\n');
        console.error(erro);

    }

}

executarTestes();
