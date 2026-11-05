const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { Readable } = require('node:stream');
const test = require('node:test');

const armazenamento = require('../../src/storage/armazenamentoArquivosMidiaLocal');

const LIVRO_ID = '11111111-1111-4111-8111-111111111111';

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

test('recusa corpo vazio e preserva o objeto incerto para reconciliação', async (t) => {
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
    assert.equal(arquivos.length, 1);
    assert.match(arquivos[0], /^\.pendente-/);
});
