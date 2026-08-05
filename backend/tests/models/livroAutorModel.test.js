const pool = require('../../src/db/connection');

const Usuario = require('../../src/models/Usuario');
const Autor = require('../../src/models/Autor');
const Livro = require('../../src/models/Livro');
const LivroAutor = require('../../src/models/LivroAutor');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: LivroAutor');
    console.log('===================================\n');

    try {

        const categoria = (
            await pool.query('SELECT id FROM categorias LIMIT 1')
        ).rows[0];

        const classificacao = (
            await pool.query('SELECT id FROM classificacoes_indicativas LIMIT 1')
        ).rows[0];

        const idioma = (
            await pool.query('SELECT id FROM idiomas LIMIT 1')
        ).rows[0];

        const status = (
            await pool.query('SELECT id FROM status_livro LIMIT 1')
        ).rows[0];

        const visibilidade = (
            await pool.query('SELECT id FROM visibilidade_livro LIMIT 1')
        ).rows[0];

        const timestamp = Date.now();

        console.log('1. Criar usuário');

        const usuario = await Usuario.criar({
            email: `livroautor${timestamp}@ciganas.com`,
            senha_hash: 'HASH_TESTE'
        });

        console.log(usuario);

        console.log('\n2. Criar autor');

        const autor = await Autor.criar({
            usuario_id: usuario.id,
            nome_publico: 'Autor Teste',
            biografia: 'Biografia',
            foto_url: null
        });

        console.log(autor);

        console.log('\n3. Criar livro');

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

        console.log('\n4. Vincular autor ao livro');

        const livroAutor = await LivroAutor.criar({

            livro_id: livro.id,
            autor_id: autor.id,
            ordem_exibicao: 1

        });

        console.log(livroAutor);

        console.log('\n5. Listar por livro');

        console.log(
            await LivroAutor.listarPorLivro(livro.id)
        );

        console.log('\n6. Listar por autor');

        console.log(
            await LivroAutor.listarPorAutor(autor.id)
        );

        console.log('\n7. Alterar ordem de exibição');

        console.log(
            await LivroAutor.alterarOrdemExibicao(
                livroAutor.id,
                2
            )
        );

        console.log('\n8. Desativar');

        console.log(
            await LivroAutor.desativar(
                livroAutor.id
            )
        );

        console.log('\n9. Listar por livro após desativação');

        console.log(
            await LivroAutor.listarPorLivro(
                livro.id
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
