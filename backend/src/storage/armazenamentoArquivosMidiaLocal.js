const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { createWriteStream } = require('node:fs');
const { createReadStream } = require('node:fs');
const mimeTypes = require('mime-types');
const { v4: uuidv4 } = require('uuid');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LIMITE_UPLOAD_BYTES = 50 * 1024 * 1024;

function erroApi(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function estaDentro(diretorioPai, caminho) {
    const relativo = path.relative(diretorioPai, caminho);
    return relativo === '' || (
        relativo !== '..' &&
        !relativo.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativo)
    );
}

async function obterRaizPrivada() {
    const raizConfigurada = process.env.CIGANA_STORAGE_ROOT ||
        path.resolve(__dirname, '../../../storage/arquivos_midia');
    const raiz = path.resolve(raizConfigurada);
    const mediaPublica = path.resolve(__dirname, '../../../media');

    if (estaDentro(mediaPublica, raiz)) {
        throw new Error('CIGANA_STORAGE_ROOT não pode estar dentro de media/.');
    }

    await fs.mkdir(raiz, { recursive: true });
    const [raizReal, mediaReal] = await Promise.all([
        fs.realpath(raiz),
        fs.realpath(mediaPublica)
    ]);

    if (estaDentro(mediaReal, raizReal)) {
        throw new Error('O armazenamento de arquivos deve ficar fora de media/.');
    }

    return raizReal;
}

function identificarMime(prefixo, nomeOriginal) {
    if (
        prefixo.subarray(0, 8).equals(
            Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
        )
    ) return 'image/png';
    if (prefixo[0] === 0xff && prefixo[1] === 0xd8 && prefixo[2] === 0xff) {
        return 'image/jpeg';
    }
    if (
        prefixo.toString('ascii', 0, 4) === 'RIFF' &&
        prefixo.toString('ascii', 8, 12) === 'WEBP'
    ) return 'image/webp';
    if (
        prefixo.toString('ascii', 0, 6) === 'GIF87a' ||
        prefixo.toString('ascii', 0, 6) === 'GIF89a'
    ) return 'image/gif';
    if (prefixo.toString('ascii', 0, 5) === '%PDF-') return 'application/pdf';
    if (prefixo.toString('ascii', 0, 4) === 'OggS') return 'application/ogg';
    if (prefixo.toString('ascii', 0, 4) === 'fLaC') return 'audio/flac';
    if (
        prefixo.toString('ascii', 0, 3) === 'ID3' ||
        (prefixo[0] === 0xff && (prefixo[1] & 0xe0) === 0xe0)
    ) return 'audio/mpeg';
    if (
        prefixo.toString('ascii', 0, 4) === 'RIFF' &&
        prefixo.toString('ascii', 8, 12) === 'WAVE'
    ) return 'audio/wav';
    if (
        prefixo.length >= 12 &&
        prefixo.toString('ascii', 4, 8) === 'ftyp'
    ) return 'video/mp4';

    const texto = prefixo.toString('utf8').replace(/^\uFEFF/, '').trimStart();
    if (/^(<\?xml[^>]*>\s*)?<svg(?:\s|>)/i.test(texto)) {
        return 'image/svg+xml';
    }

    return mimeTypes.lookup(nomeOriginal) || 'application/octet-stream';
}

function validarIdentificador(valor, campo) {
    if (!UUID_RE.test(valor || '')) {
        throw erroApi(`${campo} inválido.`, 400);
    }
}

async function gravarStream(livro_id, stream, nomeOriginal) {
    validarIdentificador(livro_id, 'livro_id');

    const chave = uuidv4();
    const raiz = await obterRaizPrivada();
    const diretorioObra = path.join(raiz, livro_id);
    await fs.mkdir(diretorioObra, { recursive: true, mode: 0o700 });

    const temporario = path.join(diretorioObra, `.pendente-${chave}`);
    const destino = path.join(diretorioObra, chave);
    const hash = crypto.createHash('sha256');
    const partesPrefixo = [];
    let tamanhoBytes = 0n;
    let tamanhoPrefixo = 0;

    const medir = new Transform({
        transform(chunk, encoding, callback) {
            const dados = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
            if (tamanhoBytes + BigInt(dados.length) > BigInt(LIMITE_UPLOAD_BYTES)) {
                const erro = erroApi(
                    'O arquivo excede o limite máximo de upload de 50 MiB.',
                    413
                );
                return callback(erro);
            }
            tamanhoBytes += BigInt(dados.length);
            hash.update(dados);

            if (tamanhoPrefixo < 8192) {
                const parte = dados.subarray(0, 8192 - tamanhoPrefixo);
                partesPrefixo.push(parte);
                tamanhoPrefixo += parte.length;
            }

            callback(null, dados);
        }
    });

    try {
        await pipeline(
            stream,
            medir,
            createWriteStream(temporario, { flags: 'wx', mode: 0o600 })
        );
    } catch (error) {
        console.error(
            `Falha de gravação; objeto temporário preservado para reconciliação (livro ${livro_id}, chave ${chave}).`
        );
        throw error;
    }

    if (tamanhoBytes === 0n) {
        console.error(
            `Upload vazio preservado fora do acesso normal (livro ${livro_id}, chave ${chave}).`
        );
        throw erroApi('O arquivo enviado está vazio.', 400);
    }

    try {
        await fs.rename(temporario, destino);
    } catch (error) {
        console.error(
            `Falha ao efetivar objeto; temporário preservado para reconciliação (livro ${livro_id}, chave ${chave}).`
        );
        throw error;
    }

    return {
        chave_armazenamento: chave,
        mime_type: identificarMime(Buffer.concat(partesPrefixo), nomeOriginal),
        tamanho_bytes: tamanhoBytes.toString(),
        hash_sha256: hash.digest('hex')
    };
}

async function removerObjeto(livro_id, chave_armazenamento) {
    validarIdentificador(livro_id, 'livro_id');
    validarIdentificador(chave_armazenamento, 'chave_armazenamento');

    const raiz = await obterRaizPrivada();
    const diretorioObra = path.join(raiz, livro_id);
    const objeto = path.join(diretorioObra, chave_armazenamento);

    if (!estaDentro(diretorioObra, objeto)) {
        throw new Error('Chave de armazenamento fora do diretório da obra.');
    }

    try {
        await fs.unlink(objeto);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
}

async function abrirObjeto(livro_id, chave_armazenamento) {
    validarIdentificador(livro_id, 'livro_id');
    validarIdentificador(chave_armazenamento, 'chave_armazenamento');

    const raiz = await obterRaizPrivada();
    const diretorioObra = path.join(raiz, livro_id);
    const objeto = path.join(diretorioObra, chave_armazenamento);
    if (!estaDentro(diretorioObra, objeto)) {
        throw erroApi('Chave de armazenamento inválida.', 404);
    }

    const informacoes = await fs.lstat(objeto);
    if (!informacoes.isFile()) throw erroApi('Arquivo gerenciado indisponível.', 404);
    return {
        criarStream: (intervalo) => createReadStream(objeto, intervalo),
        tamanho: informacoes.size
    };
}

module.exports = {
    gravarStream,
    removerObjeto,
    abrirObjeto,
    identificarMime
};
