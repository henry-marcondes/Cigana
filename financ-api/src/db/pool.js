const { Pool } = require('pg');
const { obterConfiguracaoBanco } = require('../config');

let poolAtivo;

function criarPool(env = process.env) {
    const config = obterConfiguracaoBanco(env);
    const pool = new Pool(config);

    pool.on('error', () => {
        console.error('Erro inesperado no pool da API Financeira.');
    });

    return pool;
}

function definirPool(pool) {
    poolAtivo = pool;
}

function obterPool() {
    if (!poolAtivo) poolAtivo = criarPool();
    return poolAtivo;
}

module.exports = { criarPool, definirPool, obterPool };
