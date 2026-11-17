const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const pool = require('../db/connection');
const ArquivoMidia = require('../models/ArquivoMidia');
const LivroDocumento = require('../models/LivroDocumento');
const ArquivoMidiaService = require('./arquivoMidiaService');
const armazenamento = require('../storage/armazenamentoArquivosMidiaLocal');
const parser = require('./parserDocumentoMarkdownService');

function erro(message, statusCode = 400) { const e = new Error(message); e.statusCode = statusCode; return e; }

async function conteudoArquivo(arquivo) {
    const obj = await armazenamento.abrirObjeto(arquivo.livro_id, arquivo.chave_armazenamento);
    const partes = [];
    for await (const parte of obj.criarStream()) partes.push(parte);
    return Buffer.concat(partes).toString('utf8');
}

class LivroDocumentoService {
    static async buscarLivroIdPorTexto(texto_id) {
        const result = await pool.query(`SELECT ct.livro_id FROM cena_textos ct
            JOIN livro_documentos ld ON ld.livro_id=ct.livro_id AND ld.arquivo_id=ct.arquivo_id AND ld.ativo=TRUE
            JOIN arquivos_midia a ON a.id=ct.arquivo_id AND a.ativo=TRUE
            JOIN cenas c ON c.id=ct.cena_id AND c.ativo=TRUE
            JOIN capitulos cap ON cap.id=c.capitulo_id AND cap.ativo=TRUE
            WHERE ct.id=$1 AND ct.ativo=TRUE`, [texto_id]);
        return result.rows[0]?.livro_id;
    }

    static async listar(livro_id) { return LivroDocumento.listarPorLivro(livro_id); }

    static async principal(livro_id) {
        const principal = await LivroDocumento.buscarPrincipal(livro_id);
        if (!principal) throw erro('Documento principal não encontrado.', 404);
        return principal;
    }

    static async criar(livro_id, papel, nome_original, stream) {
        if (!['PRINCIPAL', 'SECUNDARIO'].includes(papel)) throw erro('Papel documental inválido.');
        if (!/\.(md|markdown)$/i.test(nome_original || '')) throw erro('O nome do documento deve terminar em .md ou .markdown.');
        // Arquivo e vínculo editorial são confirmados na mesma transação já usada pelo serviço de mídia.
        const arquivo = await ArquivoMidiaService.criar(livro_id, null, nome_original, stream, async (client, criado) => {
            const arquivoCompleto = await ArquivoMidia.buscarPorId(criado.id, client);
            const conteudo = await conteudoArquivo(arquivoCompleto);
            const indice = parser.analisar(conteudo);
            await parser.validarParaObra(livro_id, conteudo, client, criado.id);
            const documento = await LivroDocumento.criar({ livro_id, arquivo_id: criado.id, papel }, client);
            return { documento, indice: { capitulos: indice.capitulos.length, trechos: indice.trechos.length } };
        });
        return { ...arquivo.resultado_vinculo.documento, indice: arquivo.resultado_vinculo.indice };
    }

    static async promover(livro_id, arquivo_id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT id FROM livros WHERE id = $1 FOR UPDATE', [livro_id]);
            const doc = await LivroDocumento.buscar(livro_id, arquivo_id, client, true);
            if (!doc || !doc.ativo || !doc.arquivo_ativo) throw erro('Documento ativo não encontrado nesta obra.', 404);
            const promovido = await LivroDocumento.promover(livro_id, arquivo_id, client);
            await client.query('COMMIT'); return promovido;
        } catch (e) { await client.query('ROLLBACK'); throw e; }
        finally { client.release(); }
    }

    static async desativar(livro_id, arquivo_id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT id FROM livros WHERE id = $1 FOR UPDATE', [livro_id]);
            const vinculados = await client.query('SELECT 1 FROM cena_textos WHERE arquivo_id=$1 AND ativo=TRUE LIMIT 1', [arquivo_id]);
            if (vinculados.rowCount) throw erro('Documento possui textos de cena ativos e não pode ser desativado.', 409);
            const documento = await LivroDocumento.desativar(livro_id, arquivo_id, client);
            if (!documento) throw erro('Documento não encontrado nesta obra.', 404);
            await client.query('COMMIT'); return documento;
        } catch (e) { await client.query('ROLLBACK'); throw e; }
        finally { client.release(); }
    }

    static async lerTrecho(livro_id, texto_id) {
        const result = await pool.query(`SELECT ct.id AS trecho_id, ct.cena_id, ct.arquivo_id,
                ct.livro_id, ld.ativo AS documento_ativo, a.ativo AS arquivo_ativo,
                a.chave_armazenamento, c.capitulo_id
            FROM cena_textos ct JOIN cenas c ON c.id=ct.cena_id
            JOIN capitulos cap ON cap.id=c.capitulo_id
            JOIN livro_documentos ld ON ld.livro_id=ct.livro_id AND ld.arquivo_id=ct.arquivo_id
            JOIN arquivos_midia a ON a.id=ct.arquivo_id
            WHERE ct.id=$1 AND ct.ativo=TRUE AND c.ativo=TRUE AND cap.ativo=TRUE`, [texto_id]);
        const row = result.rows[0];
        if (!row || row.livro_id !== livro_id || !row.documento_ativo || !row.arquivo_ativo) throw erro('Trecho não encontrado ou indisponível nesta obra.', 404);
        const arquivo = await ArquivoMidia.buscarPorId(row.arquivo_id);
        const trecho = parser.extrair(await conteudoArquivo(arquivo), texto_id);
        if (trecho.capitulo_id !== row.capitulo_id.toLowerCase()) throw erro('Marcador do trecho pertence a capítulo incompatível.', 409);
        return { trecho_id: row.trecho_id, cena_id: row.cena_id, conteudo_markdown: trecho.corpo };
    }

    static async salvar(livro_id, arquivo_id, conteudo, hash_esperado) {
        if (typeof conteudo !== 'string' || Buffer.byteLength(conteudo, 'utf8') > 50 * 1024 * 1024) throw erro('Conteúdo inválido ou superior a 50 MiB.');
        if (!/^[a-f0-9]{64}$/i.test(hash_esperado || '')) throw erro('Hash esperado inválido.');
        const lock = await pool.connect();
        const chave = `markdown:${arquivo_id}`;
        try {
            await lock.query('SELECT pg_advisory_lock(hashtext($1))', [chave]);
            const doc = await LivroDocumento.buscar(livro_id, arquivo_id);
            if (!doc || !doc.ativo || !doc.arquivo_ativo) throw erro('Documento não encontrado ou inativo.', 404);
            const arquivo = await ArquivoMidia.buscarPorId(arquivo_id);
            const atual = await conteudoArquivo(arquivo);
            const hashAtual = crypto.createHash('sha256').update(atual, 'utf8').digest('hex');
            if (hashAtual !== hash_esperado.toLowerCase()) throw erro('O documento foi alterado desde a última leitura. Recarregue antes de salvar.', 409);
            await parser.validarParaObra(livro_id, conteudo, pool, arquivo_id);
            const novoArquivo = await ArquivoMidiaService.substituirConteudo(arquivo_id, livro_id, Readable.from([conteudo]), { documentoMarkdown: true });
            return { arquivo_id, hash_sha256: novoArquivo.hash_sha256, tamanho_bytes: novoArquivo.tamanho_bytes };
        } finally {
            await lock.query('SELECT pg_advisory_unlock(hashtext($1))', [chave]).catch(() => {});
            lock.release();
        }
    }
}

module.exports = LivroDocumentoService;
