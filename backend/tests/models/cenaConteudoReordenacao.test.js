const assert = require('node:assert/strict');
const test = require('node:test');

const CenaConteudo = require('../../src/models/CenaConteudo');

function criarClientFake(registros) {
    const chamadas = [];
    const client = {
        async query(sql, parametros = []) {
            const consulta = sql.replace(/\s+/g, ' ').trim();
            chamadas.push({ consulta, parametros });

            if (consulta.startsWith('SELECT ordem_exibicao')) {
                return {
                    rows: registros.filter((item) => item.ativo)
                        .map((item) => ({ ordem_exibicao: item.ordem }))
                };
            }

            if (consulta.startsWith('UPDATE cena_conteudos')) {
                const [ordem, id, cenaId] = parametros;
                const registro = registros.find(
                    (item) => item.id === id && item.cena_id === cenaId && item.ativo
                );
                if (!registro) return { rows: [] };

                const colisao = registros.some(
                    (item) => item !== registro && item.cena_id === cenaId &&
                        item.ativo && item.ordem === ordem
                );
                assert.equal(colisao, false, `colisão na ordem ${ordem}`);
                registro.ordem = ordem;
                return { rows: [] };
            }

            if (consulta.startsWith('SELECT id, cena_id')) {
                return {
                    rows: registros.filter((item) => item.ativo)
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((item) => ({
                            id: item.id,
                            cena_id: item.cena_id,
                            tipo_conteudo: item.tipo_conteudo,
                            conteudo_id: item.conteudo_id,
                            ordem_exibicao: item.ordem,
                            ativo: true
                        }))
                };
            }
            throw new Error(`Consulta inesperada: ${consulta}`);
        }
    };
    return { client, chamadas };
}

test('reordena tipos diferentes usando posições acima do maior índice ativo', async () => {
    const registros = [
        { id: 'imagem', cena_id: 'cena-1', tipo_conteudo: 'IMAGEM', conteudo_id: 'i1', ordem: 1, ativo: true },
        { id: 'video', cena_id: 'cena-1', tipo_conteudo: 'VIDEO', conteudo_id: 'v1', ordem: 2, ativo: true },
        { id: 'audio', cena_id: 'cena-1', tipo_conteudo: 'AUDIO', conteudo_id: 'a1', ordem: 4, ativo: true },
        { id: 'inativo', cena_id: 'cena-1', tipo_conteudo: 'TEXTO', conteudo_id: 't1', ordem: 3, ativo: false }
    ];
    const { client, chamadas } = criarClientFake(registros);

    const resultado = await CenaConteudo.reordenar('cena-1', [
        { id: 'audio' }, { id: 'imagem' }, { id: 'video' }
    ], client);

    assert.deepEqual(resultado.map((item) => item.id), ['audio', 'imagem', 'video']);
    assert.deepEqual(registros.filter((item) => item.ativo)
        .sort((a, b) => a.ordem - b.ordem).map((item) => item.id),
    ['audio', 'imagem', 'video']);
    assert.equal(chamadas[0].consulta.startsWith('SELECT ordem_exibicao'), true);
    assert.deepEqual(chamadas.slice(1, 4).map((item) => item.parametros[0]), [5, 6, 7]);
});

test('usa posições livres quando a faixa acima da maior ordem excede INTEGER', async () => {
    const registros = [
        { id: 'x', cena_id: 'cena-1', tipo_conteudo: 'AUDIO', conteudo_id: 'a1', ordem: 2147483647, ativo: true },
        { id: 'y', cena_id: 'cena-1', tipo_conteudo: 'IMAGEM', conteudo_id: 'i1', ordem: 1, ativo: true }
    ];
    const { client, chamadas } = criarClientFake(registros);

    await CenaConteudo.reordenar('cena-1', [
        { id: 'y' }, { id: 'x' }
    ], client);

    assert.deepEqual(chamadas.slice(1, 3).map((item) => item.parametros[0]), [2, 3]);
    assert.deepEqual(registros.filter((item) => item.ativo)
        .sort((a, b) => a.ordem - b.ordem).map((item) => item.id), ['y', 'x']);
});

test('a listagem da composição retorna somente vínculos ativos', async () => {
    let consultaExecutada = '';
    const client = {
        async query(sql) {
            consultaExecutada = sql.replace(/\s+/g, ' ').trim();
            return { rows: [{ id: 'ativo', ativo: true }] };
        }
    };

    const resultado = await CenaConteudo.listarPorCena('cena-1', client);

    assert.deepEqual(resultado, [{ id: 'ativo', ativo: true }]);
    assert.match(consultaExecutada, /ativo = TRUE/);
});
