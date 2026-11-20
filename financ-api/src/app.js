const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const usuarioFinanceiroRoutes = require('./routes/usuarioFinanceiroRoutes');

function criarApp() {
    const app = express();

    app.use(express.json());
    app.use('/api', healthRoutes);
    app.use('/api/financeiro', usuarioFinanceiroRoutes);

    return app;
}

module.exports = { criarApp };
