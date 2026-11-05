const assert = require('node:assert/strict');
const test = require('node:test');

const pool = require('../../src/db/connection');
const CenaImagem = require('../../src/models/CenaImagem');
const CenaImagemService = require('../../src/services/cenaImagemService');

function configurarBancoFake({
    existe = true,
    composicao = true,
    falhaDesativacao = false,
    falharNaCompactacao = false
} = {}) {
    const chamadas = [];
    const client = {
        async query(sql, parametros = []) {
            const consulta = sql.replace(/\s+/g, ' ').trim();
            chamadas.push({ consulta, parametros });

            if (consulta.startsWith('UPDATE cena_conteudos')) {
                if (consulta.includes('RETURNING cena_id')) {
                    return {
                        rows: !composicao
                            ? []
                            : [{ cena_id: 'cena-1' }]
                    };
                }

                if (falharNaCompactacao) {
                    throw new Error('falha de compactação');
                }

                return { rows: [] };
            }

            if (consulta.startsWith('SELECT id, cena_id')) {
                return {
                    rows: [{ id: 'conteudo-restante', ordem_exibicao: 2 }]
                };
            }

            return { rows: [] };
        },
        release() {
            chamadas.push({ consulta: 'RELEASE' });
        }
    };

    const connectOriginal = pool.connect;
    pool.connect = async () => client;

    const buscarOriginal = CenaImagem.buscarPorId;
    const desativarOriginal = CenaImagem.desativar;
    CenaImagem.buscarPorId = async (id, transacao) => {
        assert.equal(id, 'imagem-1');
        assert.equal(transacao, client);
        return existe ? { id, cena_id: 'cena-1' } : undefined;
    };
    CenaImagem.desativar = async (id, transacao) => {
        assert.equal(id, 'imagem-1');
        assert.equal(transacao, client);
        return falhaDesativacao ? undefined : { id, ativo: false };
    };

    return {
        chamadas,
        restaurar() {
            pool.connect = connectOriginal;
            CenaImagem.buscarPorId = buscarOriginal;
            CenaImagem.desativar = desativarOriginal;
        }
    };
}

test('desativa imagem e composição, compactando a ordem na mesma transação', async () => {
    const banco = configurarBancoFake();

    try {
        const resultado = await CenaImagemService.desativar('imagem-1');
        const consultas = banco.chamadas.map((chamada) => chamada.consulta);

        assert.deepEqual(resultado, { id: 'imagem-1', ativo: false });
        assert.ok(consultas.includes('BEGIN'));
        assert.ok(consultas.some((sql) => sql.includes('RETURNING cena_id')));
        assert.ok(consultas.some((sql) => sql.startsWith('SELECT id, cena_id')));
        assert.ok(consultas.some((sql) => sql.startsWith('UPDATE cena_conteudos')));
        assert.ok(consultas.includes('COMMIT'));
        assert.ok(!consultas.includes('ROLLBACK'));
    } finally {
        banco.restaurar();
    }
});

test('confirma a desativação da imagem mesmo sem composição correspondente', async () => {
    const banco = configurarBancoFake({ composicao: false });

    try {
        const resultado = await CenaImagemService.desativar('imagem-1');
        const consultas = banco.chamadas.map((chamada) => chamada.consulta);

        assert.deepEqual(resultado, { id: 'imagem-1', ativo: false });
        assert.ok(consultas.includes('COMMIT'));
        assert.ok(!consultas.some((sql) => sql.startsWith('SELECT id, cena_id')));
    } finally {
        banco.restaurar();
    }
});

test('faz rollback quando a reorganização da composição falha', async () => {
    const banco = configurarBancoFake({ falharNaCompactacao: true });

    try {
        await assert.rejects(
            CenaImagemService.desativar('imagem-1'),
            /falha de compactação/
        );
        const consultas = banco.chamadas.map((chamada) => chamada.consulta);

        assert.ok(consultas.includes('BEGIN'));
        assert.ok(consultas.includes('ROLLBACK'));
        assert.ok(!consultas.includes('COMMIT'));
    } finally {
        banco.restaurar();
    }
});

test('não inicia desativação quando a imagem não existe', async () => {
    const banco = configurarBancoFake({ existe: false });

    try {
        assert.equal(await CenaImagemService.desativar('imagem-1'), null);
        const consultas = banco.chamadas.map((chamada) => chamada.consulta);

        assert.ok(consultas.includes('BEGIN'));
        assert.ok(consultas.includes('COMMIT'));
        assert.ok(!consultas.some((sql) => sql.startsWith('UPDATE cena_conteudos')));
    } finally {
        banco.restaurar();
    }
});
