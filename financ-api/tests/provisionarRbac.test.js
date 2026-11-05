const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
    CODIGO_PAPEL_ADMIN,
    PERMISSOES_RBAC,
    obterUsuarioAlvo,
    provisionarRbac
} = require('../scripts/provisionar-rbac');

const usuarioAdmin = 'bf03c86c-de36-4409-9305-ba8752edd3b2';

function criarClienteFalso(seed = {}) {
    const estado = {
        papel: null,
        permissoes: new Map(),
        permissoesDoPapel: new Set(),
        usuarios: new Map(),
        associacoesUsuarioPapel: new Map(),
        outrosUsuariosAtivos: [],
        ...seed
    };
    const consultas = [];
    const idsPermissoes = new Map();
    let proximoIdPermissao = 1;
    let snapshot;

    return {
        estado,
        consultas,
        async query(sqlOriginal, parametros = []) {
            const sql = sqlOriginal.replace(/\s+/g, ' ').trim();
            consultas.push({ sql, parametros });

            if (sql === 'BEGIN') {
                snapshot = structuredClone(estado);
                return { rows: [], rowCount: 0 };
            }
            if (sql === 'COMMIT') return { rows: [], rowCount: 0 };
            if (sql === 'ROLLBACK') {
                for (const chave of Object.keys(estado)) delete estado[chave];
                Object.assign(estado, snapshot);
                return { rows: [], rowCount: 0 };
            }

            if (sql.startsWith('INSERT INTO financeiro.papeis_financeiros')) {
                estado.papel ||= { id: 41, codigo: parametros[0], ativo: true };
                return { rows: [], rowCount: 0 };
            }
            if (sql.startsWith('SELECT id, ativo FROM financeiro.papeis_financeiros')) {
                return { rows: estado.papel ? [{ id: estado.papel.id, ativo: estado.papel.ativo }] : [] };
            }
            if (sql.startsWith('INSERT INTO financeiro.permissoes_financeiras')) {
                if (!estado.permissoes.has(parametros[0])) {
                    const id = proximoIdPermissao++;
                    estado.permissoes.set(parametros[0], { id, ativo: true });
                    idsPermissoes.set(id, parametros[0]);
                }
                return { rows: [], rowCount: 0 };
            }
            if (sql.startsWith('SELECT id, ativo FROM financeiro.permissoes_financeiras')) {
                const permissao = estado.permissoes.get(parametros[0]);
                return { rows: permissao ? [{ ...permissao }] : [] };
            }
            if (sql.startsWith('SELECT 1 FROM financeiro.usuario_papeis_financeiros')) {
                const rows = estado.outrosUsuariosAtivos.length > 0 ? [{ '?column?': 1 }] : [];
                return { rows, rowCount: rows.length };
            }
            if (sql.startsWith('SELECT permissao.codigo FROM financeiro.papel_permissoes_financeiras')) {
                return {
                    rows: [...estado.permissoesDoPapel].map((codigo) => ({ codigo })),
                    rowCount: estado.permissoesDoPapel.size
                };
            }
            if (sql.startsWith('INSERT INTO financeiro.papel_permissoes_financeiras')) {
                const codigo = idsPermissoes.get(parametros[1]);
                estado.permissoesDoPapel.add(codigo);
                return { rows: [], rowCount: 0 };
            }
            if (sql.startsWith('INSERT INTO financeiro.usuarios_financeiros')) {
                if (!estado.usuarios.has(parametros[0])) estado.usuarios.set(parametros[0], true);
                return { rows: [], rowCount: 0 };
            }
            if (sql.startsWith('SELECT ativo FROM financeiro.usuarios_financeiros')) {
                const ativo = estado.usuarios.get(parametros[0]);
                return { rows: ativo === undefined ? [] : [{ ativo }] };
            }
            if (sql.startsWith('INSERT INTO financeiro.usuario_papeis_financeiros')) {
                const chave = `${parametros[0]}:${parametros[1]}`;
                if (!estado.associacoesUsuarioPapel.has(chave)) {
                    estado.associacoesUsuarioPapel.set(chave, true);
                }
                return { rows: [], rowCount: 0 };
            }
            if (sql.startsWith('SELECT ativo FROM financeiro.usuario_papeis_financeiros')) {
                const ativo = estado.associacoesUsuarioPapel.get(`${parametros[0]}:${parametros[1]}`);
                return { rows: ativo === undefined ? [] : [{ ativo }] };
            }

            throw new Error(`Consulta inesperada no teste: ${sql}`);
        }
    };
}

test('exige UUID explícito e confirmação do papel ADMINISTRADOR externo', () => {
    assert.equal(obterUsuarioAlvo([
        '--usuario-id', usuarioAdmin,
        '--confirmar-papel-plataforma', 'ADMINISTRADOR'
    ]), usuarioAdmin);

    assert.throws(() => obterUsuarioAlvo([]), /Uso:/);
    assert.throws(() => obterUsuarioAlvo([
        '--usuario-id', 'uuid-inválido',
        '--confirmar-papel-plataforma', 'ADMINISTRADOR'
    ]), /UUID válido/);
    assert.throws(() => obterUsuarioAlvo([
        '--usuario-id', usuarioAdmin,
        '--confirmar-papel-plataforma', 'GERENTE'
    ]), /Uso:/);
});

test('provisionamento idempotente cria só o papel dedicado e associa um usuário explícito', async () => {
    const client = criarClienteFalso();

    await provisionarRbac(client, usuarioAdmin);
    const estadoInicial = structuredClone(client.estado);
    await provisionarRbac(client, usuarioAdmin);

    assert.equal(client.estado.papel.codigo, CODIGO_PAPEL_ADMIN);
    assert.deepEqual([...client.estado.permissoes.keys()], PERMISSOES_RBAC.map(({ codigo }) => codigo));
    assert.deepEqual([...client.estado.permissoesDoPapel].sort(), PERMISSOES_RBAC.map(({ codigo }) => codigo).sort());
    assert.deepEqual([...client.estado.usuarios.keys()], [usuarioAdmin]);
    assert.deepEqual([...client.estado.associacoesUsuarioPapel.keys()], [`${usuarioAdmin}:41`]);
    assert.deepEqual(client.estado, estadoInicial);

    const inserts = client.consultas.filter(({ sql }) => sql.startsWith('INSERT INTO'));
    assert.ok(inserts.every(({ sql }) => /ON CONFLICT .* DO NOTHING/.test(sql)));
    assert.ok(inserts
        .filter(({ sql }) => /criado_por_usuario_id_externo|atribuido_por_usuario_id_externo/.test(sql))
        .every(({ parametros }) => parametros.at(-1) === usuarioAdmin));
    assert.equal(client.consultas.some(({ sql }) => /^(UPDATE|DELETE)\b/i.test(sql)), false);
    assert.equal(client.estado.papel.codigo === 'FINANCEIRO', false);
});

test('não amplia papel administrativo incompleto já atribuído a outros usuários', async () => {
    const client = criarClienteFalso({
        papel: { id: 41, codigo: CODIGO_PAPEL_ADMIN, ativo: true },
        outrosUsuariosAtivos: ['outro-usuario']
    });
    const estadoOriginal = structuredClone(client.estado);

    await assert.rejects(
        provisionarRbac(client, usuarioAdmin),
        /já possui outros usuários ativos/
    );

    assert.deepEqual(client.estado, estadoOriginal);
    assert.ok(client.consultas.some(({ sql }) => sql === 'ROLLBACK'));
    assert.equal(client.consultas.some(({ sql }) => sql.startsWith('INSERT INTO financeiro.papel_permissoes_financeiras')), false);
});

test('não reativa usuário inativo existente', async () => {
    const client = criarClienteFalso({ usuarios: new Map([[usuarioAdmin, false]]) });
    const estadoOriginal = structuredClone(client.estado);

    await assert.rejects(
        provisionarRbac(client, usuarioAdmin),
        /usuário financeiro informado não existe ou está inativo/
    );

    assert.deepEqual(client.estado, estadoOriginal);
    assert.equal(client.consultas.some(({ sql }) => /^UPDATE\b/i.test(sql)), false);
});
