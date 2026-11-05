const assert = require('node:assert/strict');
const test = require('node:test');

const { validarArquivoDaCena } = require('../../src/services/arquivoCenaService');

test('valida arquivo ativo associado à mesma obra da cena', async () => {
    const client = {
        async query(sql) {
            assert.match(sql, /a\.livro_id = cap\.livro_id/);
            assert.match(sql, /a\.ativo = TRUE/);
            assert.match(sql, /FOR UPDATE OF a/);
            return { rowCount: 1, rows: [{ id: 'arquivo' }] };
        }
    };
    await assert.doesNotReject(() => validarArquivoDaCena('arquivo', 'cena', client));
});

test('rejeita arquivo inativo ou inexistente', async () => {
    let chamadas = 0;
    const client = {
        async query() {
            chamadas += 1;
            return chamadas === 1
                ? { rowCount: 0, rows: [] }
                : { rowCount: 1, rows: [{ id: 'arquivo', ativo: false }] };
        }
    };
    await assert.rejects(
        validarArquivoDaCena('arquivo', 'cena', client),
        (error) => error.statusCode === 404
    );
});

test('rejeita arquivo pertencente a outra obra', async () => {
    let chamadas = 0;
    const client = {
        async query() {
            chamadas += 1;
            return chamadas === 1
                ? { rowCount: 0, rows: [] }
                : { rowCount: 1, rows: [{ id: 'arquivo', ativo: true }] };
        }
    };
    await assert.rejects(
        validarArquivoDaCena('arquivo', 'cena', client),
        (error) => error.statusCode === 400
    );
});
