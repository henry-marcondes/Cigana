const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_NAME = 'financeiro_db';

function obterConfiguracaoServidor(env = process.env) {
    const port = Number(env.FINANC_API_PORT || 3001);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('Configuração da porta da API Financeira inválida.');
    }

    return { port };
}

function obterConfiguracaoBanco(env = process.env) {
    const host = env.FINANC_API_DB_HOST;
    const port = Number(env.FINANC_API_DB_PORT);
    const database = env.FINANC_API_DB_NAME;
    const user = env.FINANC_API_DB_USER;
    const password = env.FINANC_API_DB_PASSWORD;

    if (!host || !user || !password || !env.FINANC_API_DB_PORT || !database) {
        throw new Error('Configuração obrigatória do banco financeiro ausente.');
    }

    if (database !== DATABASE_NAME) {
        throw new Error('A API Financeira só pode conectar ao banco financeiro_db.');
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('Configuração da porta do banco financeiro inválida.');
    }

    return { host, port, database, user, password };
}

function normalizarPem(valor) {
    return valor.replace(/\\n/g, '\n');
}

function obterConfiguracaoJwt(env = process.env) {
    const publicKey = env.FINANC_API_JWT_PUBLIC_KEY;
    const kid = env.FINANC_API_JWT_KID;
    const issuer = env.FINANC_API_JWT_ISSUER;
    const audience = env.FINANC_API_JWT_AUDIENCE;

    if (!publicKey || !kid || !issuer || !audience) {
        throw new Error('Configuração de autenticação da API Financeira ausente.');
    }

    return {
        publicKey: normalizarPem(publicKey),
        kid,
        issuer,
        audience
    };
}

module.exports = {
    DATABASE_NAME,
    obterConfiguracaoBanco,
    obterConfiguracaoJwt,
    obterConfiguracaoServidor
};
