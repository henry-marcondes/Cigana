const pool = require('../../src/db/connection');
const Livro = require('../../src/models/Livro');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Livro');
    console.log('===================================\n');

    try {

        const categoria = (
            await pool.query(`SELECT id FROM categorias LIMIT 1`)
        ).rows[0];

        const classificacao = (
            await pool.query(`SELECT id FROM classificacoes_indicativas LIMIT 1`)
        ).rows[0];

        const idioma = (
            await pool.query(`SELECT id FROM idiomas LIMIT 1`)
        ).rows[0];

        const status = (
            await pool.query(`SELECT id FROM status_livro LIMIT 1`)
        ).rows[0];

        const visibilidade = (
            await pool.query(`SELECT id FROM visibilidade_livro LIMIT 1`)
        ).rows[0];

        const timestamp = Date.now();

        console.log('1. Criar livro');

        const livro = await Livro.criar({

            categoria_id: categoria.id,
            classificacao_indicativa_id: classificacao.id,
            idioma_id: idioma.id,
            status_livro_id: status.id,
            visibilidade_livro_id: visibilidade.id,

            titulo: 'Livro de Teste',

            slug: `livro-teste-${timestamp}`,

            resumo: 'Livro criado para testes.',

            capa_url: null,

            isbn: '9780000000000',

            ano_publicacao: 2026,

            data_publicacao: new Date(),

            ordem_exibicao: 1

        });

        console.log(livro);

        console.log('\n2. Listar livros');

        console.log(await Livro.listar());

        console.log('\n3. Buscar por ID');

        console.log(await Livro.buscarPorId(livro.id));

        console.log('\n4. Buscar por slug');

        console.log(await Livro.buscarPorSlug(livro.slug));

        console.log('\n5. Alterar informações');

const livroAtualizado = await Livro.alterarInformacoes(
    livro.id,
    {
        titulo: 'Livro de Teste Atualizado',
        slug: `livro-atualizado-${timestamp}`,
        resumo: 'Resumo atualizado.',
        isbn: '9781111111111',
        ano_publicacao: 2027,
        data_publicacao: new Date(),
        ordem_exibicao: 2
    }
);

        console.log(livroAtualizado);

        console.log('\n6. Alterar status');

const statusAtualizado = await Livro.alterarStatus(
    livro.id,
    status.id
);

        console.log(statusAtualizado);

        console.log('\n7. Alterar visibilidade');

const visibilidadeAtualizada = await Livro.alterarVisibilidade(
    livro.id,
    visibilidade.id
);

        console.log(visibilidadeAtualizada);

        console.log('\n8. Alterar capa');

const capaAtualizada = await Livro.alterarCapa(
    livro.id,
    'https://ciganas.com/capas/livro.jpg'
);

        console.log(capaAtualizada);

        console.log('\n9. Desativar');

const livroDesativado = await Livro.desativar(
    livro.id
);

        console.log(livroDesativado);

        console.log('\n10. Buscar livro desativado');

const livroInativo = await Livro.buscarPorId(
    livro.id
);

        console.log(livroInativo);

        console.log('\n===================================');
        console.log('TESTES FINALIZADOS');
        console.log('===================================\n');

    } catch (erro) {

        console.error('\nERRO NOS TESTES\n');
        console.error(erro);

    } finally {

        await pool.end();

    }

}

executarTestes();
