const assert = require('node:assert/strict');
const test = require('node:test');

const pool = require('../../src/db/connection');
const Cena = require('../../src/models/Cena');
const CenaConteudo = require('../../src/models/CenaConteudo');
const CenaConteudoService = require('../../src/services/cenaConteudoService');

function configurarService({ idsAtuais = ['c1', 'c2'], falhaModelo = false } = {}) {
    const chamadas = [];
    const client = {
        async query(sql) {
            chamadas.push(sql);
            return { rows: [] };
        },
        release() { chamadas.push('RELEASE'); }
    };
    const connectOriginal = pool.connect;
    const buscarCenaOriginal = Cena.buscarPorId;
    const listarOriginal = CenaConteudo.listarPorCena;
    const reordenarOriginal = CenaConteudo.reordenar;

    pool.connect = async () => client;
    Cena.buscarPorId = async () => ({ id: 'cena-1' });
    CenaConteudo.listarPorCena = async (cenaId, transacao) => {
        assert.equal(cenaId, 'cena-1');
        assert.equal(transacao, client);
        return idsAtuais.map((id) => ({ id }));
    };
    CenaConteudo.reordenar = async (_cenaId, ordem, transacao) => {
        assert.equal(transacao, client);
        if (falhaModelo) throw new Error('falha no model');
        return ordem;
    };

    return {
        chamadas,
        restaurar() {
            pool.connect = connectOriginal;
            Cena.buscarPorId = buscarCenaOriginal;
            CenaConteudo.listarPorCena = listarOriginal;
            CenaConteudo.reordenar = reordenarOriginal;
        }
    };
}

test('rejeita IDs duplicados e faz rollback', async () => {
    const banco = configurarService();
    try {
        await assert.rejects(
            CenaConteudoService.reordenar('cena-1', [{ id: 'c1' }, { id: 'c1' }]),
            /não pode conter conteúdos repetidos/
        );
        assert.ok(banco.chamadas.includes('ROLLBACK'));
    } finally { banco.restaurar(); }
});

test('rejeita lista incompleta e IDs de outra cena, com rollback', async () => {
    const banco = configurarService();
    try {
        await assert.rejects(
            CenaConteudoService.reordenar('cena-1', [{ id: 'c1' }]),
            /deve conter todos os conteúdos ativos/
        );
        await assert.rejects(
            CenaConteudoService.reordenar('cena-1', [{ id: 'c1' }, { id: 'outra-cena' }]),
            /não pertencem à cena/
        );
        assert.equal(banco.chamadas.filter((sql) => sql === 'ROLLBACK').length, 2);
    } finally { banco.restaurar(); }
});

test('faz rollback quando o model falha durante a reordenação', async () => {
    const banco = configurarService({ falhaModelo: true });
    try {
        await assert.rejects(
            CenaConteudoService.reordenar('cena-1', [{ id: 'c2' }, { id: 'c1' }]),
            /falha no model/
        );
        assert.ok(banco.chamadas.includes('BEGIN'));
        assert.ok(banco.chamadas.includes('ROLLBACK'));
        assert.ok(!banco.chamadas.includes('COMMIT'));
    } finally { banco.restaurar(); }
});
