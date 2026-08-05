const pool = require('../../src/db/connection');

const Livro = require('../../src/models/Livro');
const Capitulo = require('../../src/models/Capitulo');
const Cena = require('../../src/models/Cena');
const CenaImagem = require('../../src/models/CenaImagem');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: CenaImagem');
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
            slug: `cena-${timestamp}`,
            texto: 'Texto da cena.',
            ordem_exibicao: 1,
            cena_inicial: true
        });

        console.log(cena);

        console.log('\n4. Criar imagem');

        const imagem = await CenaImagem.criar({
            cena_id: cena.id,
            titulo: 'Imagem Principal',
            legenda: 'Legenda',
            texto_alternativo: 'Texto alternativo',
            imagem_url: 'https://ciganas.com/imagem.jpg',
            ordem_exibicao: 1
        });

        console.log(imagem);

        console.log('\n5. Listar imagens');

        console.log(await CenaImagem.listarPorCena(cena.id));

        console.log('\n6. Buscar por ID');

        console.log(await CenaImagem.buscarPorId(imagem.id));

        console.log('\n7. Alterar informações');

        console.log(await CenaImagem.alterarInformacoes(
            imagem.id,
            {
                titulo: 'Imagem Atualizada',
                legenda: 'Nova legenda',
                texto_alternativo: 'Novo texto alternativo',
                ordem_exibicao: 2
            }
        ));

        console.log('\n8. Alterar imagem');

        console.log(await CenaImagem.alterarImagem(
            imagem.id,
            'https://ciganas.com/imagem2.jpg'
        ));

        console.log('\n9. Desativar');

        console.log(await CenaImagem.desativar(imagem.id));

        console.log('\n10. Buscar imagem desativada');

        console.log(await CenaImagem.buscarPorId(imagem.id));

        console.log('\n===================================');
        console.log('TESTES FINALIZADOS');
        console.log('===================================\n');

    } catch (erro) {

        console.error('\nERRO NOS TESTES\n');
        console.error(erro);
    }

}

executarTestes();
