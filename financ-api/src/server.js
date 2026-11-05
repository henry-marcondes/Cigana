const { criarApp } = require('./app');
const { obterConfiguracaoServidor } = require('./config');
const { criarPool, definirPool } = require('./db/pool');

function iniciarServidor() {
    const { port } = obterConfiguracaoServidor();
    const pool = criarPool();
    definirPool(pool);
    const app = criarApp();
    const server = app.listen(port, () => {
        console.log(`API Financeira disponível na porta ${port}.`);
    });

    function encerrar() {
        server.close(() => {
            pool.end().finally(() => process.exit(0));
        });
    }

    process.once('SIGINT', encerrar);
    process.once('SIGTERM', encerrar);

    return { app, pool, server };
}

if (require.main === module) {
    try {
        iniciarServidor();
    } catch {
        console.error('Não foi possível iniciar a API Financeira: verifique a configuração local.');
        process.exitCode = 1;
    }
}

module.exports = { iniciarServidor };
