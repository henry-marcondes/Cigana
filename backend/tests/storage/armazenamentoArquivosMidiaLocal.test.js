const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { Readable } = require('node:stream');
const test = require('node:test');

const armazenamento = require('../../src/storage/armazenamentoArquivosMidiaLocal');

const LIVRO_ID = '11111111-1111-4111-8111-111111111111';
const OUTRA_OBRA_ID = '99999999-9999-4999-8999-999999999999';

async function comRaizTemporaria(t) {
    const raiz = await fs.mkdtemp(path.join(os.tmpdir(), 'cigana-arquivos-'));
    const raizOriginal = process.env.CIGANA_STORAGE_ROOT;
    process.env.CIGANA_STORAGE_ROOT = raiz;

    t.after(async () => {
        if (raizOriginal === undefined) delete process.env.CIGANA_STORAGE_ROOT;
        else process.env.CIGANA_STORAGE_ROOT = raizOriginal;
        await fs.rm(raiz, { recursive: true, force: true });
    });

    return raiz;
}

test('grava bytes completos fora de media e calcula hash, tamanho e MIME', async (t) => {
    const raiz = await comRaizTemporaria(t);
    const bytes = Buffer.from([
        137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4
    ]);

    const metadados = await armazenamento.gravarStream(
        LIVRO_ID,
        Readable.from(bytes),
        'capa.png'
    );
    const objeto = await fs.readFile(
        path.join(raiz, LIVRO_ID, metadados.chave_armazenamento)
    );
    const arquivos = await fs.readdir(path.join(raiz, LIVRO_ID));

    assert.deepEqual(objeto, bytes);
    assert.equal(metadados.mime_type, 'image/png');
    assert.equal(metadados.tamanho_bytes, String(bytes.length));
    assert.equal(
        metadados.hash_sha256,
        crypto.createHash('sha256').update(bytes).digest('hex')
    );
    assert.equal(arquivos.length, 1);
});

test('abre objeto legado no layout intermediário durante a migração', async (t) => {
    const raiz = await comRaizTemporaria(t);
    const chave = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const bytes = Buffer.from('objeto legado');
    const caminhoLegado = path.join(raiz, 'arquivos_midia', LIVRO_ID, chave);
    await fs.mkdir(path.dirname(caminhoLegado), { recursive: true });
    await fs.writeFile(caminhoLegado, bytes);

    const objeto = await armazenamento.abrirObjeto(LIVRO_ID, chave);
    const partes = [];
    for await (const parte of objeto.criarStream()) partes.push(parte);

    assert.deepEqual(Buffer.concat(partes), bytes);
    assert.equal(objeto.tamanho, bytes.length);
});

test('mantém objetos em diretórios isolados por obra', async (t) => {
    const raiz = await comRaizTemporaria(t);
    const primeiro = await armazenamento.gravarStream(
        LIVRO_ID,
        Readable.from('conteúdo da primeira obra'),
        'arquivo.txt'
    );
    const segundo = await armazenamento.gravarStream(
        OUTRA_OBRA_ID,
        Readable.from('conteúdo da segunda obra'),
        'arquivo.txt'
    );

    assert.notEqual(primeiro.chave_armazenamento, segundo.chave_armazenamento);
    assert.deepEqual(
        await fs.readdir(path.join(raiz, LIVRO_ID)),
        [primeiro.chave_armazenamento]
    );
    assert.deepEqual(
        await fs.readdir(path.join(raiz, OUTRA_OBRA_ID)),
        [segundo.chave_armazenamento]
    );
    await assert.rejects(
        armazenamento.abrirObjeto(OUTRA_OBRA_ID, primeiro.chave_armazenamento),
        (error) => error.statusCode === 404 || error.code === 'ENOENT'
    );
});

test('exige caminho absoluto na configuração explícita da raiz', async (t) => {
    const raizOriginal = process.env.CIGANA_STORAGE_ROOT;
    process.env.CIGANA_STORAGE_ROOT = 'storage-relativo';
    t.after(() => {
        if (raizOriginal === undefined) delete process.env.CIGANA_STORAGE_ROOT;
        else process.env.CIGANA_STORAGE_ROOT = raizOriginal;
    });

    assert.throws(
        () => armazenamento.obterRaizConfigurada(),
        /caminho absoluto/
    );
});

test('preserva upload interrompido como temporário fora do acesso normal', async (t) => {
    const raiz = await comRaizTemporaria(t);
    async function* fluxoInterrompido() {
        yield Buffer.from('parte recebida');
        throw new Error('conexão interrompida');
    }

    await assert.rejects(
        armazenamento.gravarStream(
            LIVRO_ID,
            Readable.from(fluxoInterrompido()),
            'arquivo.txt'
        ),
        /conexão interrompida/
    );

    const arquivos = await fs.readdir(path.join(raiz, LIVRO_ID));
    assert.equal(arquivos.length, 1);
    assert.match(arquivos[0], /^\.pendente-/);
});

test('recusa corpo vazio e remove o temporário incompleto', async (t) => {
    const raiz = await comRaizTemporaria(t);

    await assert.rejects(
        armazenamento.gravarStream(
            LIVRO_ID,
            Readable.from([]),
            'vazio.txt'
        ),
        (error) => error.statusCode === 400
    );

    const arquivos = await fs.readdir(path.join(raiz, LIVRO_ID));
    assert.equal(arquivos.length, 0);
});
