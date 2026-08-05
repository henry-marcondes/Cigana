const pool = require('../../src/db/connection');

const Usuario = require('../../src/models/Usuario');
const Livro = require('../../src/models/Livro');
const Comentario = require('../../src/models/Comentario');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Comentario');
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

        console.log('1. Criar usuário');

        const usuario = await Usuario.criar({
            email: `comentario${timestamp}@ciganas.com`,
            senha_hash: 'HASH_TESTE'
        });

        console.log(usuario);

        console.log('\n2. Criar livro');

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

        console.log('\n3. Criar comentário');

        const comentario = await Comentario.criar({
            usuario_id: usuario.id,
            livro_id: livro.id,
            texto: 'Excelente história.'
        });

        console.log(comentario);

        console.log('\n4. Listar por livro');

        console.log(
            await Comentario.listarPorLivro(
                livro.id
            )
        );

        console.log('\n5. Listar por usuário');

        console.log(
            await Comentario.listarPorUsuario(
                usuario.id
            )
        );

        console.log('\n6. Buscar por ID');

        console.log(
            await Comentario.buscarPorId(
                comentario.id
            )
        );

        console.log('\n7. Alterar texto');

        console.log(
            await Comentario.alterarTexto(
                comentario.id,
                'História muito interessante.'
            )
        );

        console.log('\n8. Desativar');

        console.log(
            await Comentario.desativar(
                comentario.id
            )
        );

        console.log('\n9. Buscar comentário desativado');

        console.log(
            await Comentario.buscarPorId(
                comentario.id
            )
        );

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
