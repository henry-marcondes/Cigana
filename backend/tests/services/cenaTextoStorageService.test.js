const assert = require('node:assert/strict');
const test = require('node:test');

const pool = require('../../src/db/connection');
const CenaTexto = require('../../src/models/CenaTexto');
const CenaConteudo = require('../../src/models/CenaConteudo');
const CenaTextoService = require('../../src/services/cenaTextoService');

const CENA_ID = '11111111-1111-4111-8111-111111111111';
const LIVRO_ID = '22222222-2222-4222-8222-222222222222';
const ARQUIVO_ID = '33333333-3333-4333-8333-333333333333';

function prepararBanco({ usado = false, ativo = true, mime = 'text/markdown', nome = 'capitulo.md' } = {}) {
  const chamadas = [];
  const client = {
    async query(sql) {
      const consulta = sql.replace(/\s+/g, ' ').trim();
      chamadas.push(consulta);
      if (consulta.startsWith('SELECT c.id, cap.livro_id')) return { rows: [{ id: CENA_ID, livro_id: LIVRO_ID }] };
      if (consulta.startsWith('SELECT id, nome_original, mime_type, ativo')) return { rows: [{ id: ARQUIVO_ID, nome_original: nome, mime_type: mime, ativo }] };
      if (consulta.startsWith('SELECT 1 FROM cena_textos')) return { rowCount: usado ? 1 : 0, rows: usado ? [{}] : [] };
      if (consulta.startsWith('SELECT COALESCE(MAX(ordem_exibicao)')) return { rows: [{ ordem: 3 }] };
      return { rows: [] };
    },
    release() { chamadas.push('RELEASE'); }
  };
  const originais = {
    connect: pool.connect,
    criarTexto: CenaTexto.criar,
    criarAssociacao: CenaConteudo.criar,
  };
  pool.connect = async () => client;
  CenaTexto.criar = async (dados, transacao) => {
    assert.equal(transacao, client);
    chamadas.push(['TEXTO', dados]);
    return { id: '44444444-4444-4444-8444-444444444444', ...dados };
  };
  CenaConteudo.criar = async (dados, transacao) => {
    assert.equal(transacao, client);
    chamadas.push(['ASSOCIACAO', dados]);
    return { id: '55555555-5555-4555-8555-555555555555', ...dados };
  };
  return {
    chamadas,
    restaurar() {
      pool.connect = originais.connect;
      CenaTexto.criar = originais.criarTexto;
      CenaConteudo.criar = originais.criarAssociacao;
    }
  };
}

test('associa arquivo Markdown ativo da mesma obra ao texto e à composição, em uma transação', async () => {
  const banco = prepararBanco();
  try {
    const resultado = await CenaTextoService.associarArquivoMarkdown({ cena_id: CENA_ID, arquivo_id: ARQUIVO_ID });
    assert.equal(resultado.texto.arquivo_id, ARQUIVO_ID);
    assert.equal(resultado.associacao.tipo_conteudo, 'TEXTO');
    assert.equal(resultado.associacao.ordem_exibicao, 3);
    assert.ok(banco.chamadas.includes('COMMIT'));
    assert.ok(!banco.chamadas.includes('ROLLBACK'));
  } finally { banco.restaurar(); }
});

test('recusa reutilizar um arquivo já registrado em cena_textos', async () => {
  const banco = prepararBanco({ usado: true });
  try {
    await assert.rejects(
      CenaTextoService.associarArquivoMarkdown({ cena_id: CENA_ID, arquivo_id: ARQUIVO_ID }),
      (error) => error.status === 409
    );
    assert.ok(banco.chamadas.includes('ROLLBACK'));
    assert.equal(banco.chamadas.some((item) => Array.isArray(item)), false);
  } finally { banco.restaurar(); }
});

test('recusa arquivo inativo e arquivo que não seja Markdown', async () => {
  for (const opcoes of [{ ativo: false }, { mime: 'image/png' }]) {
    const banco = prepararBanco(opcoes);
    try {
      await assert.rejects(
        CenaTextoService.associarArquivoMarkdown({ cena_id: CENA_ID, arquivo_id: ARQUIVO_ID }),
        (error) => error.status === (opcoes.ativo === false ? 404 : 400)
      );
      assert.ok(banco.chamadas.includes('ROLLBACK'));
    } finally { banco.restaurar(); }
  }
});
