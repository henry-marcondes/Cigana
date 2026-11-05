const assert = require('node:assert/strict');
const { test } = require('node:test');
const { criarApp } = require('../src/app');

test('inicializa a aplicação e despacha o endpoint de saúde sem abrir banco', async () => {
    const app = criarApp();
    const req = {
        method: 'GET',
        url: '/api/health',
        originalUrl: '/api/health',
        headers: {},
        socket: {}
    };
    const res = {
        statusCode: 200,
        headers: {},
        setHeader(nome, valor) { this.headers[nome.toLowerCase()] = valor; },
        getHeader(nome) { return this.headers[nome.toLowerCase()]; },
        removeHeader(nome) { delete this.headers[nome.toLowerCase()]; },
        end(conteudo) { this.body = conteudo; this.writableEnded = true; }
    };

    app.handle(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), {
        status: 'ok',
        service: 'financ-api'
    });
});
