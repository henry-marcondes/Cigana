const VisibilidadeLivro = require('../../src/models/VisibilidadeLivro');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: VisibilidadeLivro');
    console.log('===================================\n');

    try {
        const visibilidadeLivro = await VisibilidadeLivro.listar();

        if (visibilidadeLivro.some((visibilidade) => !visibilidade.ativo)) {
            throw new Error('A listagem retornou visibilidade de livro inativa.');
        }

        const nomes = visibilidadeLivro.map((visibilidade) => visibilidade.nome);
        const nomesOrdenados = [...nomes].sort((a, b) => a.localeCompare(b));

        if (nomes.join() !== nomesOrdenados.join()) {
            throw new Error('A listagem não está ordenada por nome.');
        }

        console.log(visibilidadeLivro);
        console.log('\nListagem de visibilidade de livro validada com sucesso.');
    } catch (erro) {
        console.error('\nERRO NOS TESTES\n');
        console.error(erro);
        process.exitCode = 1;
    }

}

executarTestes();
