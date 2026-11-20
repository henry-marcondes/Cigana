const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
    CODIGO_PAPEL_ADMIN,
    PERMISSOES_RBAC,
    obterUsuarioAlvo,
    provisionarRbac
} = require('../scripts/provisionar-rbac');

const usuarioIdExterno = '6ad662a5-4bb5-4111-bb05-c9b03c4abc13';
const usuarioFinanceiroId = 'e4fc3e89-16b3-4e56-8353-3e7c7676083a';

function criarClienteFalso(seed = {}) {
    const estado = {
        papel: null,
        permissoes: new Map(),
        permissoesDoPapel: new Set(),
        usuarios: new Map([[usuarioFinanceiroId, true]]),
        identidade: {
            usuario_financeiro_id: usuarioFinanceiroId,
            usuario_ativo: true,
            identidade_ativa: true,
            plataforma_ativa: true
        },
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
            if (sql.startsWith('SELECT usuario.id AS usuario_financeiro_id')) {
                const corresponde = parametros[0] === 'CIGANA' && parametros[1] === usuarioIdExterno;
                return {
                    rows: corresponde && estado.identidade ? [{ ...estado.identidade }] : []
                };
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

test('exige plataforma, UUID externo e confirmação do papel ADMINISTRADOR', () => {
    assert.deepEqual(obterUsuarioAlvo([
        '--plataforma', 'CIGANA',
        '--usuario-id', usuarioIdExterno,
        '--confirmar-papel-plataforma', 'ADMINISTRADOR'
    ]), { codigoPlataforma: 'CIGANA', usuarioIdExterno });

    assert.throws(() => obterUsuarioAlvo([]), /Uso:/);
    assert.throws(() => obterUsuarioAlvo([
        '--plataforma', 'cigana',
        '--usuario-id', usuarioIdExterno,
        '--confirmar-papel-plataforma', 'ADMINISTRADOR'
    ]), /código válido/);
    assert.throws(() => obterUsuarioAlvo([
        '--plataforma', 'CIGANA',
        '--usuario-id', 'uuid-inválido',
        '--confirmar-papel-plataforma', 'ADMINISTRADOR'
    ]), /UUID válido/);
});

test('provisionamento idempotente resolve identidade sem criar usuário ou identidade', async () => {
    const client = criarClienteFalso();

    await provisionarRbac(client, 'CIGANA', usuarioIdExterno);
    const estadoInicial = structuredClone(client.estado);
    await provisionarRbac(client, 'CIGANA', usuarioIdExterno);

    assert.equal(client.estado.papel.codigo, CODIGO_PAPEL_ADMIN);
    assert.deepEqual([...client.estado.permissoes.keys()], PERMISSOES_RBAC.map(({ codigo }) => codigo));
    assert.deepEqual([...client.estado.permissoesDoPapel].sort(), PERMISSOES_RBAC.map(({ codigo }) => codigo).sort());
    assert.deepEqual([...client.estado.usuarios.keys()], [usuarioFinanceiroId]);
    assert.deepEqual([...client.estado.associacoesUsuarioPapel.keys()], [`${usuarioFinanceiroId}:41`]);
    assert.deepEqual(client.estado, estadoInicial);

    const inserts = client.consultas.filter(({ sql }) => sql.startsWith('INSERT INTO'));
    assert.ok(inserts.every(({ sql }) => /ON CONFLICT .* DO NOTHING/.test(sql)));
    assert.equal(inserts.some(({ sql }) => /usuarios_financeiros|identidades_externas/.test(sql)), false);
    assert.ok(inserts
        .filter(({ sql }) => /criado_por_usuario_id_externo|atribuido_por_usuario_id_externo/.test(sql))
        .every(({ parametros }) => parametros.at(-1) === usuarioIdExterno));
    assert.equal(client.consultas.some(({ sql }) => /^(UPDATE|DELETE)\b/i.test(sql)), false);
});

test('não amplia papel administrativo incompleto já atribuído a outros usuários', async () => {
    const client = criarClienteFalso({
        papel: { id: 41, codigo: CODIGO_PAPEL_ADMIN, ativo: true },
        outrosUsuariosAtivos: ['outro-usuario']
    });
    const estadoOriginal = structuredClone(client.estado);

    await assert.rejects(
        provisionarRbac(client, 'CIGANA', usuarioIdExterno),
        /já possui outros usuários ativos/
    );

    assert.deepEqual(client.estado, estadoOriginal);
    assert.ok(client.consultas.some(({ sql }) => sql === 'ROLLBACK'));
    assert.equal(client.consultas.some(({ sql }) => sql.startsWith('INSERT INTO financeiro.papel_permissoes_financeiras')), false);
});

test('rejeita plataforma, identidade ou usuário inativo e não cria vínculo', async () => {
    for (const identidade of [
        null,
        { usuario_financeiro_id: usuarioFinanceiroId, usuario_ativo: false, identidade_ativa: true, plataforma_ativa: true },
        { usuario_financeiro_id: usuarioFinanceiroId, usuario_ativo: true, identidade_ativa: false, plataforma_ativa: true },
        { usuario_financeiro_id: usuarioFinanceiroId, usuario_ativo: true, identidade_ativa: true, plataforma_ativa: false }
    ]) {
        const client = criarClienteFalso({ identidade });
        const estadoOriginal = structuredClone(client.estado);

        await assert.rejects(
            provisionarRbac(client, 'CIGANA', usuarioIdExterno),
            /identidade externa, plataforma ou usuário financeiro não existe ou está inativo/
        );
        assert.deepEqual(client.estado, estadoOriginal);
        assert.equal(client.consultas.some(({ sql }) => sql.startsWith('INSERT INTO financeiro.identidades_externas')), false);
    }
});
