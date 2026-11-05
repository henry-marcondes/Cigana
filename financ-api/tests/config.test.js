const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
    DATABASE_NAME,
    obterConfiguracaoBanco,
    obterConfiguracaoJwt
} = require('../src/config');
const { criarPool } = require('../src/db/pool');

const envBancoTeste = {
    FINANC_API_DB_HOST: '127.0.0.1',
    FINANC_API_DB_PORT: '5432',
    FINANC_API_DB_NAME: 'financeiro_db',
    FINANC_API_DB_USER: 'financeiro-teste',
    FINANC_API_DB_PASSWORD: 'senha-de-teste'
};

test('conexão é construída somente para financeiro_db com configuração própria', async () => {
    assert.equal(DATABASE_NAME, 'financeiro_db');
    assert.deepEqual(obterConfiguracaoBanco(envBancoTeste), {
        host: '127.0.0.1',
        port: 5432,
        database: 'financeiro_db',
        user: 'financeiro-teste',
        password: 'senha-de-teste'
    });

    const pool = criarPool(envBancoTeste);
    assert.equal(pool.options.database, 'financeiro_db');
    assert.equal(pool.options.user, 'financeiro-teste');
    await pool.end();
});

test('rejeita configuração do banco principal ou ausência de configuração própria', () => {
    assert.throws(() => obterConfiguracaoBanco({
        ...envBancoTeste,
        FINANC_API_DB_NAME: 'cigana'
    }), /financeiro_db/);
    assert.throws(() => obterConfiguracaoBanco({
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_NAME: 'financeiro_db',
        DB_USER: 'usuario',
        DB_PASSWORD: 'senha'
    }), /ausente/);
});

test('autenticação exige configuração explícita sem valores padrão', () => {
    assert.throws(() => obterConfiguracaoJwt({}), /ausente/);
    assert.deepEqual(obterConfiguracaoJwt({
        FINANC_API_JWT_PUBLIC_KEY: 'PEM-DE-TESTE',
        FINANC_API_JWT_KID: 'kid-teste',
        FINANC_API_JWT_ISSUER: 'issuer-teste',
        FINANC_API_JWT_AUDIENCE: 'audience-teste'
    }), {
        publicKey: 'PEM-DE-TESTE',
        kid: 'kid-teste',
        issuer: 'issuer-teste',
        audience: 'audience-teste'
    });
});

test('código de produção não contém chaves privadas ou segredo JWT hardcoded', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const diretorioSrc = path.resolve(__dirname, '../src');

    function listarArquivos(diretorio) {
        return fs.readdirSync(diretorio, { withFileTypes: true }).flatMap((item) => {
            const caminho = path.join(diretorio, item.name);
            return item.isDirectory() ? listarArquivos(caminho) : [caminho];
        });
    }

    const codigo = listarArquivos(diretorioSrc)
        .map((arquivo) => fs.readFileSync(arquivo, 'utf8'))
        .join('\n');

    assert.doesNotMatch(codigo, /-----BEGIN (?:RSA )?PRIVATE KEY-----/);
    assert.doesNotMatch(codigo, /JWT_SECRET/);
});
