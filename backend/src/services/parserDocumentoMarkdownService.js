const pool = require('../db/connection');

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const RE_CAPITULO = new RegExp(`<!--[\\t ]*cigana:capitulo[\\t ]+id="(${UUID})"[\\t ]*-->`, 'gi');
const RE_CAPITULO_FIM = /<!--[\t ]*\/cigana:capitulo[\t ]*-->/gi;
const RE_CAPITULO_MALFORMADO = /<!--[\t ]*\/?cigana:capitulo\b[^>]*-->/gi;
const RE_TRECHO = new RegExp(`<!--[\\t ]*cigana:trecho[\\t ]+id="(${UUID})"[\\t ]*-->`, 'gi');
const RE_TRECHO_FIM = /<!--[\t ]*\/cigana:trecho[\t ]*-->/gi;
const RE_TRECHO_MALFORMADO = /<!--[\t ]*\/?cigana:trecho\b[^>]*-->/gi;

function erro(mensagem, statusCode = 400) {
    const e = new Error(mensagem); e.statusCode = statusCode; return e;
}

function ocorrencias(regex, conteudo) {
    regex.lastIndex = 0;
    return [...conteudo.matchAll(regex)].map((m) => ({ id: m[1]?.toLowerCase(), inicio: m.index, fim: m.index + m[0].length, texto: m[0] }));
}

function analisar(conteudo) {
    if (typeof conteudo !== 'string') throw erro('O documento Markdown deve ser uma string.');
    const caps = ocorrencias(RE_CAPITULO, conteudo);
    const capsAll = ocorrencias(RE_CAPITULO_MALFORMADO, conteudo);
    const capsFim = ocorrencias(RE_CAPITULO_FIM, conteudo);
    const trAbre = ocorrencias(RE_TRECHO, conteudo);
    const trFim = ocorrencias(RE_TRECHO_FIM, conteudo);
    const trAll = ocorrencias(RE_TRECHO_MALFORMADO, conteudo);
    if (caps.length + capsFim.length !== capsAll.length || trAbre.length + trFim.length !== trAll.length) throw erro('Há marcador de capítulo ou trecho malformado.');
    if (caps.length !== capsFim.length) throw erro('Marcadores de abertura e fechamento de capítulo não correspondem.');
    if (trAbre.length !== trFim.length) throw erro('Marcadores de abertura e fechamento de trecho não correspondem.');
    const idsCap = new Set();
    for (const c of caps) { if (idsCap.has(c.id)) throw erro(`UUID de capítulo duplicado: ${c.id}`); idsCap.add(c.id); }
    const idsTrecho = new Set();
    const trechos = [];
    let capituloAtual = null; let indiceCapFim = 0; let indiceTrechoFim = 0;
    const eventos = [...caps.map((x) => ({ ...x, tipo: 'cap_abre' })), ...capsFim.map((x) => ({ ...x, tipo: 'cap_fecha' })), ...trAbre.map((x) => ({ ...x, tipo: 'abre' })), ...trFim.map((x) => ({ ...x, tipo: 'fecha' }))].sort((a, b) => a.inicio - b.inicio);
    let aberto = null;
    for (const ev of eventos) {
        if (ev.tipo === 'cap_abre') {
            if (aberto || capituloAtual) throw erro('Marcadores de capítulo não podem ser aninhados.');
            capituloAtual = ev.id;
        } else if (ev.tipo === 'cap_fecha') {
            if (aberto || !capituloAtual) throw erro('Marcador de fechamento de capítulo sem abertura ou dentro de um trecho.');
            capituloAtual = null; indiceCapFim++;
        } else if (ev.tipo === 'abre') {
            if (aberto) throw erro('Trechos não podem ser aninhados.');
            if (!capituloAtual) throw erro('Todo trecho deve estar dentro de um marcador de capítulo.');
            if (idsTrecho.has(ev.id)) throw erro(`UUID de trecho duplicado: ${ev.id}`);
            idsTrecho.add(ev.id); aberto = { id: ev.id, inicio: ev.fim, capitulo_id: capituloAtual };
        } else {
            if (!aberto) throw erro('Marcador de fechamento de trecho sem abertura.');
            trechos.push({ ...aberto, fim: ev.inicio, corpo: conteudo.slice(aberto.inicio, ev.inicio) });
            aberto = null; indiceTrechoFim++;
        }
    }
    if (aberto) throw erro('Trecho sem marcador de fechamento.');
    if (capituloAtual || indiceCapFim !== capsFim.length || indiceTrechoFim !== trFim.length) throw erro('Estrutura Markdown inválida.');
    return { capitulos: caps.map(({ id }) => id), trechos };
}

async function validarParaObra(livro_id, conteudo, client = pool, arquivo_id = null) {
    const indice = analisar(conteudo);
    const [capitulos, textos] = await Promise.all([
        client.query('SELECT id FROM capitulos WHERE livro_id = $1 AND ativo = TRUE', [livro_id]),
        client.query(`SELECT ct.id, ct.cena_id, cap.id AS capitulo_id
            FROM cena_textos ct JOIN cenas c ON c.id = ct.cena_id
            JOIN capitulos cap ON cap.id = c.capitulo_id
            WHERE cap.livro_id = $1 AND ct.ativo = TRUE AND c.ativo = TRUE AND cap.ativo = TRUE
              AND ($2::uuid IS NULL OR ct.arquivo_id = $2)`, [livro_id, arquivo_id])
    ]);
    const capsExistentes = new Set(capitulos.rows.map((r) => r.id.toLowerCase()));
    for (const id of indice.capitulos) if (!capsExistentes.has(id)) throw erro(`Capítulo inexistente ou de outra obra: ${id}`);
    const porId = new Map(textos.rows.map((r) => [r.id.toLowerCase(), r]));
    for (const trecho of indice.trechos) {
        const texto = porId.get(trecho.id);
        if (!texto) throw erro(`Texto de cena inexistente ou de outra obra: ${trecho.id}`);
        if (texto.capitulo_id.toLowerCase() !== trecho.capitulo_id) throw erro(`O trecho ${trecho.id} está dentro do capítulo incorreto.`);
    }
    if (arquivo_id) {
        const idsNoDocumento = new Set(indice.trechos.map((trecho) => trecho.id));
        for (const texto of porId.values()) {
            if (!idsNoDocumento.has(texto.id.toLowerCase())) throw erro(`O texto ${texto.id} associado ao documento não possui marcador.`);
        }
    }
    return indice;
}

function extrair(conteudo, trecho_id) {
    const id = String(trecho_id).toLowerCase();
    const trecho = analisar(conteudo).trechos.find((item) => item.id === id);
    if (!trecho) throw erro('Trecho não encontrado no documento.', 404);
    return trecho;
}

module.exports = { analisar, validarParaObra, extrair };
