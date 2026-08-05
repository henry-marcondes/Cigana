const pool = require('../../src/db/connection');

const Usuario = require('../../src/models/Usuario');
const Livro = require('../../src/models/Livro');
const Avaliacao = require('../../src/models/Avaliacao');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Avaliacao');
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
            email: `avaliacao${timestamp}@ciganas.com`,
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

        console.log('\n3. Criar avaliação');

        const avaliacao = await Avaliacao.criar({
            usuario_id: usuario.id,
            livro_id: livro.id,
            nota: 5,
            comentario: 'Excelente livro.'
        });

        console.log(avaliacao);

        console.log('\n4. Listar por livro');

        console.log(
            await Avaliacao.listarPorLivro(
                livro.id
            )
        );

        console.log('\n5. Listar por usuário');

        console.log(
            await Avaliacao.listarPorUsuario(
                usuario.id
            )
        );

        console.log('\n6. Buscar por ID');

        console.log(
            await Avaliacao.buscarPorId(
                avaliacao.id
            )
        );

        console.log('\n7. Buscar por usuário e livro');

        console.log(
            await Avaliacao.buscarPorUsuarioELivro(
                usuario.id,
                livro.id
            )
        );

        console.log('\n8. Alterar nota');

        console.log(
            await Avaliacao.alterarNota(
                avaliacao.id,
                4
            )
        );

        console.log('\n9. Alterar comentário');

        console.log(
            await Avaliacao.alterarComentario(
                avaliacao.id,
                'Livro muito bom, recomendo.'
            )
        );

        console.log('\n10. Desativar');

        console.log(
            await Avaliacao.desativar(
                avaliacao.id
            )
        );

        console.log('\n11. Buscar avaliação desativada');

        console.log(
            await Avaliacao.buscarPorId(
                avaliacao.id
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
