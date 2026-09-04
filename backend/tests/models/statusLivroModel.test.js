const StatusLivro = require('../../src/models/StatusLivro');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: StatusLivro');
    console.log('===================================\n');

    try {
        const statusLivro = await StatusLivro.listar();

        if (statusLivro.some((status) => !status.ativo)) {
            throw new Error('A listagem retornou status de livro inativo.');
        }

        const nomes = statusLivro.map((status) => status.nome);
        const nomesOrdenados = [...nomes].sort((a, b) => a.localeCompare(b));

        if (nomes.join() !== nomesOrdenados.join()) {
            throw new Error('A listagem não está ordenada por nome.');
        }

        console.log(statusLivro);
        console.log('\nListagem de status de livro validada com sucesso.');
    } catch (erro) {
        console.error('\nERRO NOS TESTES\n');
        console.error(erro);
        process.exitCode = 1;
    }

}

executarTestes();
