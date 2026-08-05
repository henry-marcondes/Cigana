const pool = require('../../src/db/connection');

const Usuario = require('../../src/models/Usuario');
const Livro = require('../../src/models/Livro');
const Capitulo = require('../../src/models/Capitulo');
const Cena = require('../../src/models/Cena');
const ProgressoLeitura = require('../../src/models/ProgressoLeitura');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: ProgressoLeitura');
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
            email: `progresso${timestamp}@ciganas.com`,
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
            texto: 'Texto da cena.',
            ordem_exibicao: 1,
            cena_inicial: true
        });

        console.log(cena);

        console.log('\n5. Criar progresso');

        const progresso = await ProgressoLeitura.criar({
            usuario_id: usuario.id,
            livro_id: livro.id,
            versao_livro: 1,
            cena_atual_id: cena.id,
            percentual_concluido: 0,
            concluido: false
        });

        console.log(progresso);

        console.log('\n6. Listar por usuário');

        console.log(
            await ProgressoLeitura.listarPorUsuario(usuario.id)
        );

        console.log('\n7. Buscar por ID');

        console.log(
            await ProgressoLeitura.buscarPorId(progresso.id)
        );

        console.log('\n8. Buscar por usuário e livro');

        console.log(
            await ProgressoLeitura.buscarPorUsuarioELivro(
                usuario.id,
                livro.id
            )
        );

        console.log('\n9. Atualizar cena atual');

        console.log(
            await ProgressoLeitura.atualizarCenaAtual(
                progresso.id,
                cena.id
            )
        );

        console.log('\n10. Atualizar percentual');

        console.log(
            await ProgressoLeitura.atualizarPercentual(
                progresso.id,
                45.50
            )
        );

        console.log('\n11. Concluir leitura');

        console.log(
            await ProgressoLeitura.concluirLeitura(
                progresso.id
            )
        );

        console.log('\n12. Desativar');

        console.log(
            await ProgressoLeitura.desativar(
                progresso.id
            )
        );

        console.log('\n13. Buscar progresso desativado');

        console.log(
            await ProgressoLeitura.buscarPorId(
                progresso.id
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
