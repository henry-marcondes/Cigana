const express = require('express');
const healthRoutes = require('./routes/healthRoutes');

function criarApp() {
    const app = express();

    app.use(express.json());
    app.use('/api', healthRoutes);

    return app;
}

module.exports = { criarApp };
