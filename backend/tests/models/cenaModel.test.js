const pool = require('../../src/db/connection');

const Livro = require('../../src/models/Livro');
const Capitulo = require('../../src/models/Capitulo');
const Cena = require('../../src/models/Cena');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Cena');
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
            slug: `capitulo-${timestamp}`,
            resumo: 'Resumo',
            texto_introdutorio: 'Introdução',
            capa_url: null,
            ordem_exibicao: 1
        });

        console.log(capitulo);

        console.log('\n3. Criar cena');

        const cena = await Cena.criar({
            capitulo_id: capitulo.id,
            titulo: 'Cena 1',
            slug: `cena-1-${timestamp}`,
            texto: 'Texto da cena.',
            ordem_exibicao: 1,
            cena_inicial: true
        });

        console.log(cena);

        console.log('\n4. Listar cenas');

        console.log(await Cena.listarPorCapitulo(capitulo.id));

        console.log('\n5. Buscar por ID');

        console.log(await Cena.buscarPorId(cena.id));

        console.log('\n6. Buscar por slug');

        console.log(
            await Cena.buscarPorSlug(
                capitulo.id,
                cena.slug
            )
        );

        console.log('\n7. Buscar cena inicial');

        console.log(
            await Cena.buscarCenaInicial(
                capitulo.id
            )
        );

        console.log('\n8. Alterar informações');

        console.log(
            await Cena.alterarInformacoes(
                cena.id,
                {
                    titulo: 'Cena Atualizada',
                    slug: `cena-atualizada-${timestamp}`,
                    texto: 'Texto atualizado.',
                    ordem_exibicao: 2
                }
            )
        );

        console.log('\n9. Definir cena inicial');

        console.log(
            await Cena.definirCenaInicial(
                cena.id
            )
        );

        console.log('\n10. Desativar');

        console.log(
            await Cena.desativar(
                cena.id
            )
        );

        console.log('\n11. Buscar cena desativada');

        console.log(
            await Cena.buscarPorId(
                cena.id
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
