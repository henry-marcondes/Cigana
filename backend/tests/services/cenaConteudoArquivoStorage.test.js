const assert = require('node:assert/strict');
const test = require('node:test');

const pool = require('../../src/db/connection');
const CenaConteudo = require('../../src/models/CenaConteudo');
const CenaConteudoService = require('../../src/services/cenaConteudoService');
const CenaImagem = require('../../src/models/CenaImagem');
const CenaAudio = require('../../src/models/CenaAudio');
const CenaVideo = require('../../src/models/CenaVideo');

const CENA_ID = '11111111-1111-4111-8111-111111111111';
const ARQUIVO_ID = '22222222-2222-4222-8222-222222222222';
const LIVRO_ID = '33333333-3333-4333-8333-333333333333';

function instalarDoubles(t, mimeType) {
  const chamadas = [];
  const criacoes = [];
  const client = {
    async query(sql, parametros) {
      chamadas.push({ sql, parametros });
      if (sql.includes('FROM cenas c')) return { rows: [{ cena_id: CENA_ID, livro_id: LIVRO_ID }] };
      if (sql.includes('FROM arquivos_midia')) return { rows: [{
        id: ARQUIVO_ID, livro_id: LIVRO_ID, nome_original: `midia.${mimeType.split('/')[1]}`,
        mime_type: mimeType, ativo: true,
      }] };
      if (sql.includes('AS utilizado')) return { rows: [{ utilizado: false }] };
      return { rows: [] };
    },
    release() {},
  };
  const originais = {
    connect: pool.connect,
    criarComposicao: CenaConteudo.criar,
    criarImagem: CenaImagem.criar,
    criarAudio: CenaAudio.criar,
    criarVideo: CenaVideo.criar,
  };
  pool.connect = async () => client;
  for (const [tipo, modelo] of Object.entries({ IMAGEM: CenaImagem, AUDIO: CenaAudio, VIDEO: CenaVideo })) {
    modelo.criar = async (dados, transacao) => {
      assert.equal(transacao, client);
      criacoes.push({ tipo, dados });
      return { id: `id-${tipo}` };
    };
  }
  CenaConteudo.criar = async (dados, transacao) => {
    assert.equal(transacao, client);
    criacoes.push({ tipo: 'COMPOSICAO', dados });
    return dados;
  };
  t.after(() => {
    pool.connect = originais.connect;
    CenaConteudo.criar = originais.criarComposicao;
    CenaImagem.criar = originais.criarImagem;
    CenaAudio.criar = originais.criarAudio;
    CenaVideo.criar = originais.criarVideo;
  });
  return { chamadas, criacoes };
}

for (const caso of [
  { tipo: 'IMAGEM', mime: 'image/png' },
  { tipo: 'AUDIO', mime: 'audio/mpeg' },
  { tipo: 'VIDEO', mime: 'video/mp4' },
]) {
  test(`associa arquivo Storage como ${caso.tipo} e cria composição narrativa`, async (t) => {
    const { chamadas, criacoes } = instalarDoubles(t, caso.mime);
    const resultado = await CenaConteudoService.criar({
      cena_id: CENA_ID,
      tipo_conteudo: caso.tipo,
      arquivo_id: ARQUIVO_ID,
      ordem_exibicao: 3,
    });

    assert.equal(criacoes[0].tipo, caso.tipo);
    assert.equal(criacoes[0].dados.arquivo_id, ARQUIVO_ID);
    assert.equal(criacoes[0].dados.livro_id, LIVRO_ID);
    assert.equal(criacoes[1].tipo, 'COMPOSICAO');
    assert.equal(criacoes[1].dados.conteudo_id, `id-${caso.tipo}`);
    assert.equal(resultado.ordem_exibicao, 1);
    assert.ok(chamadas.some(({ sql }) => sql === 'COMMIT'));
  });
}

test('rejeita arquivo já utilizado antes de criar mídia ou composição', async (t) => {
  const { chamadas, criacoes } = instalarDoubles(t, 'image/png');
  const client = await pool.connect();
  const queryOriginal = client.query;
  client.query = async (sql, parametros) => {
    if (sql.includes('AS utilizado')) return { rows: [{ utilizado: true }] };
    return queryOriginal.call(client, sql, parametros);
  };
  pool.connect = async () => client;
  await assert.rejects(
    CenaConteudoService.criar({ cena_id: CENA_ID, tipo_conteudo: 'IMAGEM', arquivo_id: ARQUIVO_ID, ordem_exibicao: 1 }),
    (erro) => erro.status === 409 && /já foi utilizado/.test(erro.message),
  );
  assert.deepEqual(criacoes, []);
  assert.ok(chamadas.some(({ sql }) => sql === 'ROLLBACK'));
});
