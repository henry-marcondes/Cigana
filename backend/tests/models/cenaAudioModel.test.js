const pool = require('../../src/db/connection');

const Livro = require('../../src/models/Livro');
const Capitulo = require('../../src/models/Capitulo');
const Cena = require('../../src/models/Cena');
const CenaAudio = require('../../src/models/CenaAudio');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: CenaAudio');
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

        console.log('\n4. Criar áudio');

        const audio = await CenaAudio.criar({
            cena_id: cena.id,
            titulo: 'Narração',
            legenda: 'Legenda',
            descricao: 'Descrição do áudio',
            audio_url: 'https://ciganas.com/audio.mp3',
            reproducao_automatica: true,
            reproducao_em_loop: false,
            ordem_exibicao: 1
        });

        console.log(audio);

        console.log('\n5. Listar áudios');

        console.log(await CenaAudio.listarPorCena(cena.id));

        console.log('\n6. Buscar por ID');

        console.log(await CenaAudio.buscarPorId(audio.id));

        console.log('\n7. Alterar informações');

        console.log(await CenaAudio.alterarInformacoes(
            audio.id,
            {
                titulo: 'Nova Narração',
                legenda: 'Nova legenda',
                descricao: 'Descrição atualizada',
                reproducao_automatica: false,
                reproducao_em_loop: true,
                ordem_exibicao: 2
            }
        ));

        console.log('\n8. Alterar áudio');

        console.log(await CenaAudio.alterarAudio(
            audio.id,
            'https://ciganas.com/audio2.mp3'
        ));

        console.log('\n9. Desativar');

        console.log(await CenaAudio.desativar(audio.id));

        console.log('\n10. Buscar áudio desativado');

        console.log(await CenaAudio.buscarPorId(audio.id));

        console.log('\n===================================');
        console.log('TESTES FINALIZADOS');
        console.log('===================================\n');

    } catch (erro) {

        console.error('\nERRO NOS TESTES\n');
        console.error(erro);

    }

}

executarTestes();
