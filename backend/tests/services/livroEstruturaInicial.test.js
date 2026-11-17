const assert = require('node:assert/strict');
const test = require('node:test');

const pool = require('../../src/db/connection');
const Livro = require('../../src/models/Livro');
const Capitulo = require('../../src/models/Capitulo');
const Cena = require('../../src/models/Cena');
const Autor = require('../../src/models/Autor');
const Papel = require('../../src/models/Papel');
const UsuarioPapel = require('../../src/models/UsuarioPapel');
const LivroAutor = require('../../src/models/LivroAutor');
const SolicitacaoAutor = require('../../src/models/SolicitacaoAutor');
const StatusLivro = require('../../src/models/StatusLivro');
const VisibilidadeLivro = require('../../src/models/VisibilidadeLivro');
const LivroService = require('../../src/services/livroService');
const SolicitacaoAutorService = require('../../src/services/solicitacaoAutorService');

function configurar({ falharCapitulo = false, falharCena = false } = {}) {
    const chamadas = [];
    const client = {
        async query(sql, values) {
            chamadas.push({ sql: sql.trim(), values });
            if (sql.includes('FROM status_livro')) return { rows: [{ id: 1 }], rowCount: 1 };
            if (sql.includes('FROM visibilidade_livro')) return { rows: [{ id: 1 }], rowCount: 1 };
            return { rows: [] };
        },
        release() { chamadas.push({ sql: 'RELEASE' }); }
    };
    const originais = {
        connect: pool.connect,
        livroCriar: Livro.criar,
        capituloBuscar: Capitulo.buscarDestinosPendentes,
        capituloCriar: Capitulo.criarDestinosPendentes,
        cenaBuscar: Cena.buscarPadrao,
        cenaCriar: Cena.criarPadrao,
        status: StatusLivro.listar,
        visibilidade: VisibilidadeLivro.listar,
        autor: Autor.buscarPorUsuarioId
    };
    let capitulo;
    let cena;
    pool.connect = async () => client;
    Livro.criar = async (_dados, transacao) => {
        assert.equal(transacao, client);
        chamadas.push({ sql: 'LIVRO' });
        return { id: 'livro-1' };
    };
    Capitulo.buscarDestinosPendentes = async (id, transacao) => {
        assert.equal(id, 'livro-1'); assert.equal(transacao, client);
        return capitulo;
    };
    Capitulo.criarDestinosPendentes = async (id, transacao) => {
        assert.equal(id, 'livro-1'); assert.equal(transacao, client);
        if (falharCapitulo) throw new Error('falha capítulo');
        capitulo = { id: 'capitulo-1', livro_id: id, capitulo_destinos_pendentes: true };
        chamadas.push({ sql: 'CAPITULO' });
        return capitulo;
    };
    Cena.buscarPadrao = async (id, transacao) => {
        assert.equal(id, 'capitulo-1'); assert.equal(transacao, client);
        return cena;
    };
    Cena.criarPadrao = async (id, transacao) => {
        assert.equal(id, 'capitulo-1'); assert.equal(transacao, client);
        if (falharCena) throw new Error('falha cena');
        cena = { id: 'cena-1', capitulo_id: id, cena_padrao: true };
        chamadas.push({ sql: 'CENA' });
        return cena;
    };
    StatusLivro.listar = async () => [{ id: 1, slug: 'em-elaboracao' }];
    VisibilidadeLivro.listar = async () => [{ id: 1, slug: 'rascunho' }];
    Autor.buscarPorUsuarioId = async () => ({ id: 'autor-1' });

    return {
        chamadas,
        client,
        restaurar() {
            pool.connect = originais.connect;
            Livro.criar = originais.livroCriar;
            Capitulo.buscarDestinosPendentes = originais.capituloBuscar;
            Capitulo.criarDestinosPendentes = originais.capituloCriar;
            Cena.buscarPadrao = originais.cenaBuscar;
            Cena.criarPadrao = originais.cenaCriar;
            StatusLivro.listar = originais.status;
            VisibilidadeLivro.listar = originais.visibilidade;
            Autor.buscarPorUsuarioId = originais.autor;
        }
    };
}

const dados = { status_livro_id: 1, visibilidade_livro_id: 1 };

test('criação normal grava exatamente uma estrutura especial na transação da obra', async () => {
    const banco = configurar();
    try {
        assert.deepEqual(await LivroService.criar(dados), { id: 'livro-1' });
        assert.deepEqual(banco.chamadas.map(({ sql }) => sql), [
            'BEGIN', 'LIVRO', 'SELECT id FROM livros WHERE id = $1 FOR UPDATE',
            'CAPITULO', 'CENA', 'COMMIT', 'RELEASE'
        ]);
    } finally { banco.restaurar(); }
});

test('os marcadores técnicos e a relação capítulo, cena e obra são usados pelos models', async () => {
    const sqls = [];
    const client = { async query(sql, values) { sqls.push({ sql, values }); return { rows: [] }; } };
    await Capitulo.criarDestinosPendentes('livro-x', client);
    await Cena.criarPadrao('capitulo-x', client);
    assert.ok(sqls[0].sql.includes('capitulo_destinos_pendentes'));
    assert.match(sqls[0].sql, /VALUES\s*\(\$1, \$2, \$3, NULL, NULL, NULL, 1, TRUE\)/);
    assert.deepEqual(sqls[0].values, ['livro-x', 'Destinos pendentes', 'destinos-pendentes']);
    assert.ok(sqls[1].sql.includes('cena_padrao'));
    assert.match(sqls[1].sql, /VALUES\s*\(\$1, \$2, \$3, '', 1, FALSE, FALSE, TRUE\)/);
    assert.deepEqual(sqls[1].values, ['capitulo-x', 'Cena Padrão', 'cena-padrao']);
});

test('falha ao criar Cena Padrão reverte a obra e o capítulo', async () => {
    const banco = configurar({ falharCena: true });
    try {
        await assert.rejects(LivroService.criar(dados), /falha cena/);
        assert.ok(banco.chamadas.some(({ sql }) => sql === 'ROLLBACK'));
        assert.ok(!banco.chamadas.some(({ sql }) => sql === 'COMMIT'));
    } finally { banco.restaurar(); }
});

test('falha ao criar o capítulo interno reverte a obra', async () => {
    const banco = configurar({ falharCapitulo: true });
    try {
        await assert.rejects(LivroService.criar(dados), /falha capítulo/);
        assert.ok(banco.chamadas.some(({ sql }) => sql === 'ROLLBACK'));
        assert.ok(!banco.chamadas.some(({ sql }) => sql === 'COMMIT'));
    } finally { banco.restaurar(); }
});

test('criarParaAutorEmTransacao usa a mesma criação e mantém a transação recebida', async () => {
    const banco = configurar();
    const autorOriginal = Autor.buscarPorUsuarioId;
    try {
        const result = await LivroService.criarParaAutorEmTransacao('usuario-1', {
            categoria_id: 1, classificacao_indicativa_id: 1, idioma_id: 1, titulo: 'Obra', slug: 'obra'
        }, banco.client);
        assert.equal(result.livro.id, 'livro-1');
        assert.equal(banco.chamadas.some(({ sql }) => sql === 'BEGIN'), false);
        assert.equal(banco.chamadas.some(({ sql }) => sql === 'COMMIT'), false);
        assert.ok(banco.chamadas.some(({ sql }) => sql === 'CENA'));
    } finally {
        banco.restaurar();
        Autor.buscarPorUsuarioId = autorOriginal;
    }
});

test('criação direta para Autor também cria a estrutura antes do COMMIT', async () => {
    const banco = configurar();
    try {
        const resultado = await LivroService.criarParaAutor('usuario-1', {
            categoria_id: 1, classificacao_indicativa_id: 1, idioma_id: 1, titulo: 'Obra', slug: 'obra'
        });
        assert.equal(resultado.livro.id, 'livro-1');
        const comandos = banco.chamadas.map(({ sql }) => sql);
        assert.ok(comandos.indexOf('CENA') < comandos.indexOf('COMMIT'));
        assert.ok(comandos.includes('COMMIT'));
    } finally { banco.restaurar(); }
});

test('repetir a inicialização não duplica capítulo nem Cena Padrão', async () => {
    const banco = configurar();
    try {
        await LivroService.criarComEstruturaEmTransacao(dados, banco.client);
        await LivroService.criarComEstruturaEmTransacao(dados, banco.client);
        assert.equal(banco.chamadas.filter(({ sql }) => sql === 'CAPITULO').length, 1);
        assert.equal(banco.chamadas.filter(({ sql }) => sql === 'CENA').length, 1);
    } finally { banco.restaurar(); }
});

test('aprovação de solicitação de Autor encaminha a criação pela transação compartilhada', async () => {
    const chamadas = [];
    const client = {
        async query(sql) {
            chamadas.push(sql.trim());
            if (sql.includes('FROM solicitacoes_autor')) {
                return { rowCount: 1, rows: [{
                    id: 'solicitacao-1', usuario_id: 'usuario-1', nome_publico: 'Autora',
                    titulo_provisorio: 'Obra de Teste', resumo: null, categoria_id: 1,
                    classificacao_indicativa_id: 1, idioma_id: 1, status: 'PENDENTE'
                }] };
            }
            if (sql.includes('FROM status_livro')) return { rowCount: 1, rows: [{ id: 1 }] };
            if (sql.includes('FROM visibilidade_livro')) return { rowCount: 1, rows: [{ id: 1 }] };
            if (sql.includes('FROM livros')) return { rowCount: 0, rows: [] };
            return { rowCount: 1, rows: [] };
        },
        release() { chamadas.push('RELEASE'); }
    };
    const originais = {
        connect: pool.connect,
        papel: Papel.buscarPorCodigo,
        usuarioPapel: UsuarioPapel.buscarPorUsuarioEPapel,
        autor: Autor.buscarPorUsuarioId,
        criarLivro: LivroService.criar,
        livroAutor: LivroAutor.criar,
        aprovar: SolicitacaoAutor.aprovar
    };
    let criacaoRecebeuTransacao = false;
    pool.connect = async () => client;
    Papel.buscarPorCodigo = async () => ({ id: 'papel-autor' });
    UsuarioPapel.buscarPorUsuarioEPapel = async () => ({ id: 'vinculo-papel' });
    Autor.buscarPorUsuarioId = async () => ({ id: 'autor-1' });
    LivroService.criar = async (_dados, transacao) => {
        criacaoRecebeuTransacao = transacao === client;
        return { id: 'livro-1' };
    };
    LivroAutor.criar = async () => ({ id: 'livro-autor-1' });
    SolicitacaoAutor.aprovar = async () => ({ id: 'solicitacao-1', status: 'APROVADA' });
    try {
        await SolicitacaoAutorService.aprovar('solicitacao-1', 'avaliador-1');
        assert.ok(criacaoRecebeuTransacao);
        assert.ok(chamadas.includes('BEGIN'));
        assert.ok(chamadas.includes('COMMIT'));
        assert.ok(!chamadas.includes('ROLLBACK'));
    } finally {
        pool.connect = originais.connect;
        Papel.buscarPorCodigo = originais.papel;
        UsuarioPapel.buscarPorUsuarioEPapel = originais.usuarioPapel;
        Autor.buscarPorUsuarioId = originais.autor;
        LivroService.criar = originais.criarLivro;
        LivroAutor.criar = originais.livroAutor;
        SolicitacaoAutor.aprovar = originais.aprovar;
    }
});
