require('dotenv').config();

const {
    gerarToken,
    verificarToken
} = require('../utils/jwt');

async function testar() {

    try {

        console.log('--- TESTE JWT ---');

        const payload = {
            id: 'bf03c86c-de36-4409-9305-ba8752edd3b2'
        };

        const token = gerarToken(payload);

        console.log('\nToken gerado:');
        console.log(token);

        const dados = verificarToken(token);

        console.log('\nToken verificado:');
        console.log(dados);

        console.log('\nJWT OK');

    } catch (err) {

        console.error('\nERRO JWT:');
        console.error(err.message);

    }
}

testar();
