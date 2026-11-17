const assert = require('node:assert/strict');
const express = require('express');
const test = require('node:test');

const pool = require('../../src/db/connection');
const Livro = require('../../src/models/Livro');
const CenaConteudoService = require('../../src/services/cenaConteudoService');
const cenaConteudoRoutes = require('../../src/routes/cenaConteudoRoutes');

const LIVRO_ID = '11111111-1111-4111-8111-111111111111';
const RESULTADOS = [
  { id: '22222222-2222-4222-8222-222222222222', tipo_conteudo: 'TEXTO', titulo: 'cena.md', arquivo_id: '22222222-2222-4222-8222-222222222222' },
  { id: '33333333-3333-4333-8333-333333333333', tipo_conteudo: 'IMAGEM', titulo: 'Capa', arquivo_id: '44444444-4444-4444-8444-444444444444' },
  { id: '55555555-5555-4555-8555-555555555555', tipo_conteudo: 'AUDIO', titulo: 'Trilha', arquivo_id: '66666666-6666-4666-8666-666666666666' },
  { id: '77777777-7777-4777-8777-777777777777', tipo_conteudo: 'VIDEO', titulo: 'Abertura', arquivo_id: '88888888-8888-4888-8888-888888888888' },
];

function instalarDubles(t) {
  const chamadas = [];
  const originais = {
    query: pool.query,
    buscarLivro: Livro.buscarPorId,
    publico: Livro.estaDisponivelPublicamente,
  };
  pool.query = async (sql, parametros) => {
    chamadas.push({ sql, parametros });
    return { rows: RESULTADOS };
  };
  Livro.buscarPorId = async (id) => ({ id });
  Livro.estaDisponivelPublicamente = async () => true;
  t.after(() => {
    pool.query = originais.query;
    Livro.buscarPorId = originais.buscarLivro;
    Livro.estaDisponivelPublicamente = originais.publico;
  });
  return chamadas;
}

test('consulta direta devolve campos esperados e filtra arquivos usados', async (t) => {
  const chamadas = instalarDubles(t);
  const dados = await CenaConteudoService.listarDisponiveisPorLivro(LIVRO_ID);
  const { sql, parametros } = chamadas[0];

  assert.deepEqual(parametros, [LIVRO_ID]);
  assert.deepEqual(dados, RESULTADOS);
  for (const item of dados) {
    assert.deepEqual(Object.keys(item).sort(), ['arquivo_id', 'id', 'tipo_conteudo', 'titulo']);
  }
  assert.match(sql, /'TEXTO'::TEXT AS tipo_conteudo/);
  assert.match(sql, /'IMAGEM'::TEXT AS tipo_conteudo/);
  assert.match(sql, /'AUDIO'::TEXT AS tipo_conteudo/);
  assert.match(sql, /'VIDEO'::TEXT AS tipo_conteudo/);
  assert.match(sql, /disponiveis\.tipo_conteudo/);
  assert.match(sql, /NOT EXISTS \(SELECT 1 FROM cena_textos ct WHERE ct\.arquivo_id = a\.id\)/);
  assert.match(sql, /NOT EXISTS \(SELECT 1 FROM livro_documentos ld WHERE ld\.arquivo_id = a\.id\)/);
  assert.match(sql, /a\.livro_id = \$1 AND a\.ativo = TRUE/);
  assert.match(sql, /ci\.livro_id = \$1 AND ci\.ativo = TRUE/);
  assert.match(sql, /ca\.livro_id = \$1 AND ca\.ativo = TRUE/);
  assert.match(sql, /cv\.livro_id = \$1 AND cv\.ativo = TRUE/);
  assert.match(sql, /cc\.tipo_conteudo = 'IMAGEM'[\s\S]*?cc\.conteudo_id = ci\.id\s*\n\s*\)/);
  assert.match(sql, /cc\.tipo_conteudo = 'AUDIO'[\s\S]*?cc\.conteudo_id = ca\.id\s*\n\s*\)/);
  assert.match(sql, /cc\.tipo_conteudo = 'VIDEO'[\s\S]*?cc\.conteudo_id = cv\.id\s*\n\s*\)/);
  assert.match(sql, /ci\.ativo = TRUE[\s\S]*?cc\.tipo_conteudo = 'IMAGEM'/);
  assert.doesNotMatch(sql, /cc\.conteudo_id = (?:ci|ca|cv)\.id AND cc\.ativo = TRUE/);
});

test('endpoint REST devolve a lista com os quatro campos consumidos pelo frontend', async (t) => {
  instalarDubles(t);
  const app = express();
  app.use('/api/cena-conteudos', cenaConteudoRoutes);
  app.use((error, _req, res, _next) => res.status(500).json({ success: false, message: error.message }));
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));

  const resposta = await fetch(`http://127.0.0.1:${server.address().port}/api/cena-conteudos/livro/${LIVRO_ID}/disponiveis`);
  const corpo = await resposta.json();
  assert.equal(resposta.status, 200);
  assert.equal(corpo.success, true);
  assert.deepEqual(corpo.data, RESULTADOS);
  assert.ok(corpo.data.every((item) => ['id', 'tipo_conteudo', 'titulo', 'arquivo_id'].every((campo) => campo in item)));
});
