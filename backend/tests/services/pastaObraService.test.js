const assert = require('node:assert/strict');
const test = require('node:test');

const pool = require('../../src/db/connection');
const PastaObra = require('../../src/models/PastaObra');
const PastaObraService = require('../../src/services/pastaObraService');

const LIVRO_ID = '11111111-1111-4111-8111-111111111111';
const PASTA_ID = '22222222-2222-4222-8222-222222222222';
const PAI_ID = '33333333-3333-4333-8333-333333333333';

async function comDependenciasFalsas(t, { ehDescendente = false } = {}) {
    const chamadas = {
        queries: [],
        checagemDescendente: 0,
        mover: 0
    };
    const client = {
        async query(sql) {
            chamadas.queries.push(sql.trim());
            if (sql.includes('SELECT id FROM livros')) {
                return { rowCount: 1, rows: [{ id: LIVRO_ID }] };
            }
            return { rowCount: 0, rows: [] };
        },
        release() {
            chamadas.released = true;
        }
    };

    const originais = {
        connect: pool.connect,
        buscarPorId: PastaObra.buscarPorId,
        ehDescendente: PastaObra.ehDescendente,
        mover: PastaObra.mover
    };

    pool.connect = async () => client;
    PastaObra.buscarPorId = async (id) => ({
        id: id.toLowerCase(),
        livro_id: LIVRO_ID,
        ativo: true
    });
    PastaObra.ehDescendente = async () => {
        chamadas.checagemDescendente += 1;
        return ehDescendente;
    };
    PastaObra.mover = async (id, pasta_pai_id) => {
        chamadas.mover += 1;
        return { id, livro_id: LIVRO_ID, pasta_pai_id };
    };

    t.after(() => {
        pool.connect = originais.connect;
        PastaObra.buscarPorId = originais.buscarPorId;
        PastaObra.ehDescendente = originais.ehDescendente;
        PastaObra.mover = originais.mover;
    });

    return chamadas;
}

test('rejeita mover uma pasta para dentro de si mesma antes do UPDATE', async (t) => {
    const chamadas = await comDependenciasFalsas(t);

    await assert.rejects(
        PastaObraService.mover(PASTA_ID, LIVRO_ID, PASTA_ID.toUpperCase()),
        (error) => error.statusCode === 400
    );

    assert.equal(chamadas.mover, 0);
    assert.equal(chamadas.checagemDescendente, 0);
    assert.ok(chamadas.queries.includes('ROLLBACK'));
    assert.equal(chamadas.released, true);
});

test('rejeita mover uma pasta para dentro de uma descendente antes do UPDATE', async (t) => {
    const chamadas = await comDependenciasFalsas(t, { ehDescendente: true });

    await assert.rejects(
        PastaObraService.mover(PASTA_ID, LIVRO_ID, PAI_ID),
        (error) => error.statusCode === 400
    );

    assert.equal(chamadas.checagemDescendente, 1);
    assert.equal(chamadas.mover, 0);
    assert.ok(chamadas.queries.includes('ROLLBACK'));
    assert.equal(chamadas.released, true);
});

test('permite mover para uma pasta válida sem criar ciclo', async (t) => {
    const chamadas = await comDependenciasFalsas(t);

    const resultado = await PastaObraService.mover(
        PASTA_ID,
        LIVRO_ID,
        PAI_ID
    );

    assert.equal(chamadas.checagemDescendente, 1);
    assert.equal(chamadas.mover, 1);
    assert.equal(resultado.pasta_pai_id, PAI_ID);
    assert.ok(chamadas.queries.includes('COMMIT'));
    assert.equal(chamadas.released, true);
});
