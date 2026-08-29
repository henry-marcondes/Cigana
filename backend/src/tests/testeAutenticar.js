require('dotenv').config();

const autenticar = require('../middleware/autenticar');
const { gerarToken } = require('../utils/jwt');

function criarReq(authorization) {
    return {
        headers: {
            authorization
        }
    };
}

function criarRes() {

    return {
        status(codigo) {
            console.log('HTTP Status:', codigo);
            return this;
        },

        json(dados) {
            console.log('Resposta:', dados);
            return this;
        }
    };
}

function criarNext(nome) {

    return function () {
        console.log(`${nome}: NEXT executado`);
    };
}

async function testar() {

    console.log('\n==============================');
    console.log('TESTE 1 - SEM TOKEN');
    console.log('==============================');

    autenticar(
        criarReq(undefined),
        criarRes(),
        criarNext('Teste 1')
    );


    console.log('\n==============================');
    console.log('TESTE 2 - FORMATO INCORRETO');
    console.log('==============================');

    autenticar(
        criarReq('Token abc123'),
        criarRes(),
        criarNext('Teste 2')
    );


    console.log('\n==============================');
    console.log('TESTE 3 - TOKEN INVÁLIDO');
    console.log('==============================');

    autenticar(
        criarReq('Bearer token-invalido'),
        criarRes(),
        criarNext('Teste 3')
    );


    console.log('\n==============================');
    console.log('TESTE 4 - TOKEN VÁLIDO');
    console.log('==============================');

    const token = gerarToken({
        id: 'bf03c86c-de36-4409-9305-ba8752edd3b2'
    });

    const req = criarReq(`Bearer ${token}`);

    autenticar(
        req,
        criarRes(),
        function () {
            console.log('Teste 4: NEXT executado');
            console.log('req.usuario:', req.usuario);
        }
    );
}

testar();
