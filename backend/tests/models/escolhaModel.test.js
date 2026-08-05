const pool = require('../../src/db/connection');

const Livro = require('../../src/models/Livro');
const Capitulo = require('../../src/models/Capitulo');
const Cena = require('../../src/models/Cena');
const Escolha = require('../../src/models/Escolha');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Escolha');
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

        console.log('\n3. Criar cena origem');

        const cenaOrigem = await Cena.criar({
            capitulo_id: capitulo.id,
            titulo: 'Cena Origem',
            slug: `origem-${timestamp}`,
            texto: 'Texto origem.',
            ordem_exibicao: 1,
            cena_inicial: true
        });

        console.log(cenaOrigem);

        console.log('\n4. Criar cena destino');

        const cenaDestino = await Cena.criar({
            capitulo_id: capitulo.id,
            titulo: 'Cena Destino',
            slug: `destino-${timestamp}`,
            texto: 'Texto destino.',
            ordem_exibicao: 2,
            cena_inicial: false
        });

        console.log(cenaDestino);

        console.log('\n5. Criar escolha');

        const escolha = await Escolha.criar({
            cena_origem_id: cenaOrigem.id,
            cena_destino_id: cenaDestino.id,
            texto: 'Seguir caminho.',
            ordem_exibicao: 1
        });

        console.log(escolha);

        console.log('\n6. Listar escolhas');

        console.log(
            await Escolha.listarPorCenaOrigem(cenaOrigem.id)
        );

        console.log('\n7. Buscar por ID');

        console.log(
            await Escolha.buscarPorId(escolha.id)
        );

        console.log('\n8. Alterar texto');

        console.log(
            await Escolha.alterarTexto(
                escolha.id,
                'Novo texto da escolha.'
            )
        );

        console.log('\n9. Alterar destino');

        console.log(
            await Escolha.alterarDestino(
                escolha.id,
                cenaDestino.id
            )
        );

        console.log('\n10. Alterar ordem');

        console.log(
            await Escolha.alterarOrdemExibicao(
                escolha.id,
                2
            )
        );

        console.log('\n11. Desativar');

        console.log(
            await Escolha.desativar(
                escolha.id
            )
        );

        console.log('\n12. Buscar escolha desativada');

        console.log(
            await Escolha.buscarPorId(
                escolha.id
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
