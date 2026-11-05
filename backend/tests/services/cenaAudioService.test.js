const assert = require('node:assert/strict');
const test = require('node:test');

const pool = require('../../src/db/connection');
const CenaAudio = require('../../src/models/CenaAudio');
const CenaConteudo = require('../../src/models/CenaConteudo');
const CenaAudioService = require('../../src/services/cenaAudioService');

function configurarBancoFake({ falharDesativacaoComposicao = false } = {}) {
    const chamadas = [];
    const client = {
        async query(sql) {
            chamadas.push(sql.replace(/\s+/g, ' ').trim());
            return { rows: [] };
        },
        release() {
            chamadas.push('RELEASE');
        }
    };

    const connectOriginal = pool.connect;
    const buscarOriginal = CenaAudio.buscarPorId;
    const desativarOriginal = CenaAudio.desativar;
    const desativarComposicaoOriginal = CenaConteudo.desativarPorConteudo;

    pool.connect = async () => client;
    CenaAudio.buscarPorId = async (id, transacao) => {
        assert.equal(id, 'audio-1');
        assert.equal(transacao, client);
        return { id, cena_id: 'cena-1' };
    };
    CenaAudio.desativar = async (id, transacao) => {
        assert.equal(id, 'audio-1');
        assert.equal(transacao, client);
        return { id, ativo: false };
    };
    CenaConteudo.desativarPorConteudo = async (tipo, id, transacao) => {
        assert.equal(tipo, 'AUDIO');
        assert.equal(id, 'audio-1');
        assert.equal(transacao, client);
        if (falharDesativacaoComposicao) {
            throw new Error('falha ao desativar composição');
        }
        return [{ cena_id: 'cena-1' }];
    };

    return {
        chamadas,
        restaurar() {
            pool.connect = connectOriginal;
            CenaAudio.buscarPorId = buscarOriginal;
            CenaAudio.desativar = desativarOriginal;
            CenaConteudo.desativarPorConteudo = desativarComposicaoOriginal;
        }
    };
}

test('desativa áudio e vínculo na mesma transação', async () => {
    const banco = configurarBancoFake();
    try {
        assert.deepEqual(
            await CenaAudioService.desativar('audio-1'),
            { id: 'audio-1', ativo: false }
        );
        assert.ok(banco.chamadas.includes('BEGIN'));
        assert.ok(banco.chamadas.includes('COMMIT'));
        assert.ok(!banco.chamadas.includes('ROLLBACK'));
    } finally {
        banco.restaurar();
    }
});

test('faz rollback se a desativação do vínculo falhar', async () => {
    const banco = configurarBancoFake({ falharDesativacaoComposicao: true });
    try {
        await assert.rejects(
            CenaAudioService.desativar('audio-1'),
            /falha ao desativar composição/
        );
        assert.ok(banco.chamadas.includes('BEGIN'));
        assert.ok(banco.chamadas.includes('ROLLBACK'));
        assert.ok(!banco.chamadas.includes('COMMIT'));
    } finally {
        banco.restaurar();
    }
});
