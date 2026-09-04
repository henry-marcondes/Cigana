const ClassificacaoIndicativa = require('../../src/models/ClassificacaoIndicativa');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: ClassificacaoIndicativa');
    console.log('===================================\n');

    try {
        const classificacoesIndicativas = await ClassificacaoIndicativa.listar();

        if (classificacoesIndicativas.some((classificacao) => !classificacao.ativo)) {
            throw new Error('A listagem retornou classificação indicativa inativa.');
        }

        const idadesMinimas = classificacoesIndicativas.map(
            (classificacao) => classificacao.idade_minima
        );
        const idadesOrdenadas = [...idadesMinimas].sort((a, b) => a - b);

        if (idadesMinimas.join() !== idadesOrdenadas.join()) {
            throw new Error('A listagem não está ordenada por idade_minima.');
        }

        console.log(classificacoesIndicativas);
        console.log('\nListagem de classificações indicativas validada com sucesso.');
    } catch (erro) {
        console.error('\nERRO NOS TESTES\n');
        console.error(erro);
        process.exitCode = 1;
    }

}

executarTestes();
