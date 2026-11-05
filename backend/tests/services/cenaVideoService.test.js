const assert = require('node:assert/strict');
const test = require('node:test');

const pool = require('../../src/db/connection');
const CenaVideo = require('../../src/models/CenaVideo');
const CenaConteudo = require('../../src/models/CenaConteudo');
const CenaVideoService = require('../../src/services/cenaVideoService');

test('regressão: desativa vídeo e vínculo na mesma transação', async () => {
    const chamadas = [];
    const client = {
        async query(sql) {
            chamadas.push(sql);
            return { rows: [] };
        },
        release() { chamadas.push('RELEASE'); }
    };
    const connectOriginal = pool.connect;
    const buscarOriginal = CenaVideo.buscarPorId;
    const desativarOriginal = CenaVideo.desativar;
    const desativarComposicaoOriginal = CenaConteudo.desativarPorConteudo;

    pool.connect = async () => client;
    CenaVideo.buscarPorId = async (id, transacao) => {
        assert.equal(id, 'video-1');
        assert.equal(transacao, client);
        return { id, cena_id: 'cena-1' };
    };
    CenaVideo.desativar = async (id, transacao) => {
        assert.equal(id, 'video-1');
        assert.equal(transacao, client);
        return { id, ativo: false };
    };
    CenaConteudo.desativarPorConteudo = async (tipo, id, transacao) => {
        assert.equal(tipo, 'VIDEO');
        assert.equal(id, 'video-1');
        assert.equal(transacao, client);
        return [];
    };

    try {
        assert.deepEqual(await CenaVideoService.desativar('video-1'), {
            id: 'video-1', ativo: false
        });
        assert.ok(chamadas.includes('BEGIN'));
        assert.ok(chamadas.includes('COMMIT'));
        assert.ok(!chamadas.includes('ROLLBACK'));
    } finally {
        pool.connect = connectOriginal;
        CenaVideo.buscarPorId = buscarOriginal;
        CenaVideo.desativar = desativarOriginal;
        CenaConteudo.desativarPorConteudo = desativarComposicaoOriginal;
    }
});
