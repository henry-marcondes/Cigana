const assert = require('node:assert/strict');
const test = require('node:test');

const CenaTexto = require('../../src/models/CenaTexto');

test('buscarPorId informa se o texto pertence a um documento Markdown ativo', async () => {
  const resultados = [true, false];
  const consultas = [];
  const client = {
    async query(sql, parametros) {
      consultas.push({ sql: sql.replace(/\s+/g, ' ').trim(), parametros });
      return { rows: [{ id: parametros[0], arquivo_id: 'arquivo', documento_markdown_ativo: resultados.shift() }] };
    },
  };

  const legado = await CenaTexto.buscarPorId('texto-legado', client);
  const storage = await CenaTexto.buscarPorId('texto-storage', client);

  assert.equal(legado.documento_markdown_ativo, true);
  assert.equal(storage.documento_markdown_ativo, false);
  assert.ok(consultas.every(({ sql }) => /FROM livro_documentos ld/.test(sql)));
  assert.ok(consultas.every(({ sql }) => /ld\.ativo = TRUE/.test(sql)));
});
