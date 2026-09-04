const Idioma = require('../../src/models/Idioma');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Idioma');
    console.log('===================================\n');

    try {
        const idiomas = await Idioma.listar();

        if (idiomas.some((idioma) => !idioma.ativo)) {
            throw new Error('A listagem retornou idioma inativo.');
        }

        const nomes = idiomas.map((idioma) => idioma.nome);
        const nomesOrdenados = [...nomes].sort((a, b) => a.localeCompare(b));

        if (nomes.join() !== nomesOrdenados.join()) {
            throw new Error('A listagem não está ordenada por nome.');
        }

        console.log(idiomas);
        console.log('\nListagem de idiomas validada com sucesso.');
    } catch (erro) {
        console.error('\nERRO NOS TESTES\n');
        console.error(erro);
        process.exitCode = 1;
    }

}

executarTestes();
