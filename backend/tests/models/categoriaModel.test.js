const Categoria = require('../../src/models/Categoria');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Categoria');
    console.log('===================================\n');

    try {
        const categorias = await Categoria.listar();

        if (categorias.some((categoria) => !categoria.ativo)) {
            throw new Error('A listagem retornou categoria inativa.');
        }

        const categoriasOrdenadas = [...categorias].sort((a, b) => {
            if (a.ordem_exibicao !== b.ordem_exibicao) {
                return a.ordem_exibicao - b.ordem_exibicao;
            }

            return a.nome.localeCompare(b.nome);
        });

        if (
            categorias.map((categoria) => categoria.id).join() !==
            categoriasOrdenadas.map((categoria) => categoria.id).join()
        ) {
            throw new Error('A listagem não está ordenada por ordem_exibicao e nome.');
        }

        console.log(categorias);
        console.log('\nListagem de categorias validada com sucesso.');
    } catch (erro) {
        console.error('\nERRO NOS TESTES\n');
        console.error(erro);
        process.exitCode = 1;
    }

}

executarTestes();
