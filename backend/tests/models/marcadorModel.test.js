const pool = require('../../src/db/connection');

const Usuario = require('../../src/models/Usuario');
const Livro = require('../../src/models/Livro');
const Capitulo = require('../../src/models/Capitulo');
const Cena = require('../../src/models/Cena');
const Marcador = require('../../src/models/Marcador');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Marcador');
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
            email: `marcador${timestamp}@ciganas.com`,
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
            resumo: 'Livro para teste',
            capa_url: null,
            isbn: '9780000000000',
            ano_publicacao: 2026,
            data_publicacao: new Date(),
            ordem_exibicao: 1
        });

        console.log(livro);

        console.log('\n3. Criar capítulo');

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

        console.log('\n4. Criar cena');

        const cena = await Cena.criar({
            capitulo_id: capitulo.id,
            titulo: 'Cena 1',
            slug: `cena-${timestamp}`,
            texto: 'Texto da cena',
            ordem_exibicao: 1,
            cena_inicial: true
        });

        console.log(cena);

        console.log('\n5. Criar marcador');

        const marcador = await Marcador.criar({
            usuario_id: usuario.id,
            livro_id: livro.id,
            cena_id: cena.id,
            titulo: 'Meu marcador',
            observacao: 'Observação inicial',
            categoria: 'Importante',
            ordem_exibicao: 1
        });

        console.log(marcador);

        console.log('\n6. Listar por usuário');

        console.log(
            await Marcador.listarPorUsuario(usuario.id)
        );

        console.log('\n7. Listar por livro');

        console.log(
            await Marcador.listarPorLivro(
                usuario.id,
                livro.id
            )
        );

        console.log('\n8. Buscar por ID');

        console.log(
            await Marcador.buscarPorId(marcador.id)
        );

        console.log('\n9. Alterar informações');

        console.log(
            await Marcador.alterarInformacoes(
                marcador.id,
                {
                    titulo: 'Marcador Atualizado',
                    observacao: 'Nova observação',
                    categoria: 'Favorito',
                    ordem_exibicao: 2
                }
            )
        );

        console.log('\n10. Alterar cena');

        console.log(
            await Marcador.alterarCena(
                marcador.id,
                cena.id
            )
        );

        console.log('\n11. Desativar');

        console.log(
            await Marcador.desativar(
                marcador.id
            )
        );

        console.log('\n12. Buscar marcador desativado');

        console.log(
            await Marcador.buscarPorId(
                marcador.id
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
