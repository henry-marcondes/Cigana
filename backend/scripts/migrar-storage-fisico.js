const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

require('dotenv').config();

const pool = require('../src/db/connection');
const armazenamento = require('../src/storage/armazenamentoArquivosMidiaLocal');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function caminhoDoObjeto(base, livroId, chave) {
    if (!UUID_RE.test(livroId || '') || !UUID_RE.test(chave || '')) {
        throw new Error(`UUID inválido nos metadados do arquivo ${livroId || '(obra desconhecida)'}.`);
    }
    const caminho = path.resolve(base, livroId, chave);
    const relativo = path.relative(base, caminho);
    if (relativo.startsWith('..') || path.isAbsolute(relativo)) {
        throw new Error('Caminho do objeto fora da raiz de Storage.');
    }
    return caminho;
}

async function hashArquivo(caminho) {
    const hash = crypto.createHash('sha256');
    const stream = require('node:fs').createReadStream(caminho);
    for await (const parte of stream) hash.update(parte);
    return hash.digest('hex');
}

async function inspecionarObjeto(arquivo, origem, destino, aplicar) {
    const relatorio = {
        livro_id: arquivo.livro_id,
        arquivo_id: arquivo.id,
        chave_armazenamento: arquivo.chave_armazenamento,
        origem,
        destino,
        status: 'pendente'
    };

    let statOrigem;
    try {
        statOrigem = await fs.stat(origem);
    } catch (error) {
        if (error.code === 'ENOENT') {
            relatorio.status = 'origem_ausente';
            return relatorio;
        }
        throw error;
    }
    if (!statOrigem.isFile()) {
        relatorio.status = 'origem_nao_e_arquivo';
        return relatorio;
    }

    relatorio.tamanho_origem = statOrigem.size;
    relatorio.hash_origem = await hashArquivo(origem);
    if (String(statOrigem.size) !== arquivo.tamanho_bytes || relatorio.hash_origem !== arquivo.hash_sha256) {
        relatorio.status = 'origem_diverge_do_banco';
        return relatorio;
    }

    try {
        const statDestino = await fs.stat(destino);
        if (!statDestino.isFile()) {
            relatorio.status = 'destino_nao_e_arquivo';
            return relatorio;
        }
        const hashDestino = await hashArquivo(destino);
        relatorio.status = statDestino.size === statOrigem.size && hashDestino === relatorio.hash_origem
            ? 'destino_ja_verificado'
            : 'conflito_destino';
        return relatorio;
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }

    if (!aplicar) {
        relatorio.status = 'pronto_para_copiar';
        return relatorio;
    }

    await fs.mkdir(path.dirname(destino), { recursive: true, mode: 0o700 });
    try {
        await fs.copyFile(origem, destino, require('node:fs').constants.COPYFILE_EXCL);
    } catch (error) {
        if (error.code === 'EEXIST') {
            relatorio.status = 'conflito_destino';
            return relatorio;
        }
        throw error;
    }

    const statDestino = await fs.stat(destino);
    const hashDestino = await hashArquivo(destino);
    if (statDestino.size !== statOrigem.size || hashDestino !== relatorio.hash_origem) {
        relatorio.status = 'destino_copiado_com_falha_de_integridade';
        return relatorio;
    }
    relatorio.status = 'copiado_e_verificado_origem_preservada';
    return relatorio;
}

async function listarOrfaos(raizLegada, arquivosBanco) {
    const conhecidos = new Set(arquivosBanco.map((item) => `${item.livro_id}/${item.chave_armazenamento}`));
    const orfaos = [];
    let obras;
    try {
        obras = await fs.readdir(raizLegada, { withFileTypes: true });
    } catch (error) {
        if (error.code === 'ENOENT') return orfaos;
        throw error;
    }

    for (const obra of obras) {
        if (!obra.isDirectory()) {
            orfaos.push({ caminho: path.join(raizLegada, obra.name), motivo: 'entrada_fora_de_diretorio_de_obra' });
            continue;
        }
        const diretorio = path.join(raizLegada, obra.name);
        for (const entrada of await fs.readdir(diretorio, { withFileTypes: true })) {
            const caminho = path.join(diretorio, entrada.name);
            if (!entrada.isFile() || !conhecidos.has(`${obra.name}/${entrada.name}`)) {
                orfaos.push({ caminho, motivo: entrada.name.startsWith('.pendente-') ? 'temporario_pendente' : 'sem_registro_correspondente' });
            }
        }
    }
    return orfaos;
}

async function main() {
    const argumentos = process.argv.slice(2);
    const desconhecidos = argumentos.filter((arg) => arg !== '--apply');
    if (desconhecidos.length) throw new Error(`Argumentos desconhecidos: ${desconhecidos.join(', ')}`);

    const aplicar = argumentos.includes('--apply');
    const raiz = armazenamento.obterRaizConfigurada();
    const raizLegada = path.join(raiz, 'arquivos_midia');
    const linhas = await pool.query(`
        SELECT id::text, livro_id::text, chave_armazenamento,
               tamanho_bytes::text, hash_sha256
          FROM arquivos_midia
         ORDER BY livro_id, id
    `);
    const arquivos = linhas.rows;
    const itens = [];

    for (const arquivo of arquivos) {
        const origem = caminhoDoObjeto(raizLegada, arquivo.livro_id, arquivo.chave_armazenamento);
        const destino = caminhoDoObjeto(raiz, arquivo.livro_id, arquivo.chave_armazenamento);
        itens.push(await inspecionarObjeto(arquivo, origem, destino, aplicar));
    }

    const orfaos = await listarOrfaos(raizLegada, arquivos);
    console.log(JSON.stringify({
        modo: aplicar ? 'copia_sem_remocao' : 'dry_run',
        raiz_storage: raiz,
        raiz_legada: raizLegada,
        registros_banco: arquivos.length,
        itens,
        orfaos
    }, null, 2));
}

main()
    .catch((error) => {
        console.error(`Migração interrompida: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
