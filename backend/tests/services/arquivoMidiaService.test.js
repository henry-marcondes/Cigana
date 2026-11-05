const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const test = require('node:test');

const pool = require('../../src/db/connection');
const ArquivoMidia = require('../../src/models/ArquivoMidia');
const PastaObra = require('../../src/models/PastaObra');
const armazenamento = require('../../src/storage/armazenamentoArquivosMidiaLocal');
const ArquivoMidiaService = require('../../src/services/arquivoMidiaService');

const LIVRO_ID = '11111111-1111-4111-8111-111111111111';
const OUTRA_OBRA_ID = '99999999-9999-4999-8999-999999999999';
const PASTA_ID = '22222222-2222-4222-8222-222222222222';
const ARQUIVO_ID = '33333333-3333-4333-8333-333333333333';

function criarCliente(chamadas) {
    return {
        async query(sql) {
            const consulta = sql.trim();
            chamadas.queries.push(consulta);
            if (consulta.includes('SELECT id FROM livros')) {
                return { rowCount: 1, rows: [{ id: LIVRO_ID }] };
            }
            return { rowCount: 0, rows: [] };
        },
        release() {
            chamadas.released = true;
        }
    };
}

function configurarDublês(t, opcoes = {}) {
    const chamadas = {
        queries: [],
        inserir: 0,
        substituir: 0,
        desativar: 0,
        gravar: 0,
        remover: 0,
        chamadasGravacao: [],
        chamadasRemocao: []
    };
    const originais = {
        connect: pool.connect,
        pasta: PastaObra.buscarPorId,
        buscar: ArquivoMidia.buscarPorId,
        buscarLivro: ArquivoMidia.buscarLivroIdPorId,
        criar: ArquivoMidia.criar,
        substituir: ArquivoMidia.substituirConteudo,
        desativar: ArquivoMidia.desativar,
        gravar: armazenamento.gravarStream,
        remover: armazenamento.removerObjeto
    };

    pool.connect = async () => criarCliente(chamadas);
    PastaObra.buscarPorId = async (id) => ({
        id,
        livro_id: opcoes.livroDaPasta || LIVRO_ID,
        ativo: true
    });
    ArquivoMidia.buscarPorId = async () => opcoes.arquivoAtual || ({
        id: ARQUIVO_ID,
        livro_id: LIVRO_ID,
        pasta_id: PASTA_ID,
        nome_original: 'original.txt',
        chave_armazenamento: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        mime_type: 'text/plain',
        tamanho_bytes: '8',
        hash_sha256: 'a'.repeat(64),
        ativo: true
    });
    ArquivoMidia.criar = async (dados) => {
        chamadas.inserir += 1;
        chamadas.dadosCriacao = dados;
        return { id: ARQUIVO_ID, ...dados, ativo: true };
    };
    ArquivoMidia.substituirConteudo = async (id, dados) => {
        chamadas.substituir += 1;
        chamadas.idSubstituido = id;
        chamadas.dadosSubstituicao = dados;
        return { id, livro_id: LIVRO_ID, ...dados, ativo: true };
    };
    ArquivoMidia.desativar = async (id) => {
        chamadas.desativar += 1;
        return { id, ativo: false };
    };
    armazenamento.gravarStream = async (...args) => {
        chamadas.gravar += 1;
        chamadas.chamadasGravacao.push(args);
        if (opcoes.erroGravacao) throw opcoes.erroGravacao;
        return opcoes.novoObjeto || {
            chave_armazenamento: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            mime_type: 'text/markdown',
            tamanho_bytes: '12',
            hash_sha256: 'b'.repeat(64)
        };
    };
    armazenamento.removerObjeto = async (...args) => {
        chamadas.remover += 1;
        chamadas.chamadasRemocao.push(args);
    };

    t.after(() => {
        pool.connect = originais.connect;
        PastaObra.buscarPorId = originais.pasta;
        ArquivoMidia.buscarPorId = originais.buscar;
        ArquivoMidia.buscarLivroIdPorId = originais.buscarLivro;
        ArquivoMidia.criar = originais.criar;
        ArquivoMidia.substituirConteudo = originais.substituir;
        ArquivoMidia.desativar = originais.desativar;
        armazenamento.gravarStream = originais.gravar;
        armazenamento.removerObjeto = originais.remover;
    });

    return chamadas;
}

test('upload associa metadados à obra e pasta após concluir gravação', async (t) => {
    const chamadas = configurarDublês(t);
    const arquivo = await ArquivoMidiaService.criar(
        LIVRO_ID,
        PASTA_ID,
        'capitulo.md',
        Readable.from('conteúdo')
    );

    assert.equal(chamadas.gravar, 1);
    assert.equal(chamadas.inserir, 1);
    assert.equal(chamadas.dadosCriacao.livro_id, LIVRO_ID);
    assert.equal(chamadas.dadosCriacao.pasta_id, PASTA_ID);
    assert.equal(chamadas.dadosCriacao.hash_sha256, 'b'.repeat(64));
    assert.equal(arquivo.id, ARQUIVO_ID);
    assert.equal(chamadas.remover, 0);
    assert.ok(chamadas.queries.includes('COMMIT'));
});

test('recusa pasta de outra obra antes de gravar o upload', async (t) => {
    const chamadas = configurarDublês(t, { livroDaPasta: OUTRA_OBRA_ID });

    await assert.rejects(
        ArquivoMidiaService.criar(
            LIVRO_ID,
            PASTA_ID,
            'capitulo.md',
            Readable.from('conteúdo')
        ),
        (error) => error.statusCode === 400
    );

    assert.equal(chamadas.gravar, 0);
    assert.equal(chamadas.inserir, 0);
});

test('falha na gravação não cria metadados', async (t) => {
    const chamadas = configurarDublês(t, {
        erroGravacao: new Error('falha de disco simulada')
    });

    await assert.rejects(
        ArquivoMidiaService.criar(
            LIVRO_ID,
            null,
            'capitulo.md',
            Readable.from('conteúdo')
        ),
        (error) => error.statusCode === 500
    );

    assert.equal(chamadas.inserir, 0);
    assert.equal(chamadas.remover, 0);
});

test('substituição mantém arquivo_id, atualiza hash e remove conteúdo antigo após commit', async (t) => {
    const chamadas = configurarDublês(t);
    const resultado = await ArquivoMidiaService.substituirConteudo(
        ARQUIVO_ID,
        LIVRO_ID,
        Readable.from('novo conteúdo')
    );

    assert.equal(chamadas.idSubstituido, ARQUIVO_ID);
    assert.equal(chamadas.dadosSubstituicao.hash_sha256, 'b'.repeat(64));
    assert.equal(chamadas.dadosSubstituicao.tamanho_bytes, '12');
    assert.equal(chamadas.dadosSubstituicao.mime_type, 'text/markdown');
    assert.equal(resultado.id, ARQUIVO_ID);
    assert.equal(chamadas.remover, 1);
    assert.ok(chamadas.queries.indexOf('COMMIT') >= 0);
});

test('falha de gravação na substituição preserva metadados e conteúdo anterior', async (t) => {
    const chamadas = configurarDublês(t, {
        erroGravacao: new Error('falha de disco simulada')
    });

    await assert.rejects(
        ArquivoMidiaService.substituirConteudo(
            ARQUIVO_ID,
            LIVRO_ID,
            Readable.from('novo conteúdo')
        ),
        (error) => error.statusCode === 500
    );

    assert.equal(chamadas.substituir, 0);
    assert.equal(chamadas.remover, 0);
});

test('falha ao atualizar metadados preserva ambos os objetos para reconciliação', async (t) => {
    const chamadas = configurarDublês(t);
    ArquivoMidia.substituirConteudo = async () => {
        throw new Error('falha de banco simulada');
    };

    await assert.rejects(
        ArquivoMidiaService.substituirConteudo(
            ARQUIVO_ID,
            LIVRO_ID,
            Readable.from('novo conteúdo')
        ),
        /falha de banco simulada/
    );

    assert.equal(chamadas.gravar, 1);
    assert.equal(chamadas.remover, 0);
    assert.ok(chamadas.queries.includes('ROLLBACK'));
});

test('registro desativado durante a substituição preserva os dois objetos', async (t) => {
    const chamadas = configurarDublês(t);
    ArquivoMidia.substituirConteudo = async () => null;

    await assert.rejects(
        ArquivoMidiaService.substituirConteudo(
            ARQUIVO_ID,
            LIVRO_ID,
            Readable.from('novo conteúdo')
        ),
        (error) => error.statusCode === 404
    );

    assert.equal(chamadas.remover, 0);
    assert.ok(chamadas.queries.includes('ROLLBACK'));
});

test('desativação lógica não remove o objeto físico', async (t) => {
    const chamadas = configurarDublês(t);
    const resultado = await ArquivoMidiaService.desativar(ARQUIVO_ID, LIVRO_ID);

    assert.equal(resultado.ativo, false);
    assert.equal(chamadas.desativar, 1);
    assert.equal(chamadas.remover, 0);
});
