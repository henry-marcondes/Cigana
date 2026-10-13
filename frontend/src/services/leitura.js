import { apiFetch } from './api';

const API_URL = 'http://localhost:3001';

function montarUrlMedia(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;

  const caminho = url
    .replace(/^.*?media\//, 'media/')
    .replace(/^\/+/, '');

  return `${API_URL}/${caminho}`;
}

async function carregarTexto(textoUrl) {
  const url = montarUrlMedia(textoUrl);
  if (!url) return '';

  const resposta = await fetch(url, { cache: 'no-store' });
  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar o texto: ${textoUrl}`);
  }

  return resposta.text();
}

export async function carregarDadosLeituraCena(cena) {
  const respostaConteudos = await apiFetch(
    `/api/cena-conteudos/cena/${cena.id}`
  );
  const itens = (respostaConteudos.data || [])
    .filter((item) => item.ativo)
    .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao);

  const conteudos = await Promise.all(itens.map(async (item) => {
    let dados = null;

    if (item.tipo_conteudo === 'TEXTO') {
      const resposta = await apiFetch(`/api/cena-textos/${item.conteudo_id}`);
      dados = {
        ...resposta.data,
        texto: await carregarTexto(resposta.data.texto_url),
      };
    } else if (item.tipo_conteudo === 'IMAGEM') {
      const resposta = await apiFetch(`/api/cena-imagens/${item.conteudo_id}`);
      dados = {
        ...resposta.data,
        imagem_url: montarUrlMedia(resposta.data.imagem_url),
      };
    } else if (item.tipo_conteudo === 'AUDIO') {
      const resposta = await apiFetch(`/api/cena-audios/${item.conteudo_id}`);
      dados = {
        ...resposta.data,
        audio_url: montarUrlMedia(resposta.data.audio_url),
      };
    } else if (item.tipo_conteudo === 'VIDEO') {
      const resposta = await apiFetch(`/api/cena-videos/${item.conteudo_id}`);
      dados = {
        ...resposta.data,
        video_url: montarUrlMedia(resposta.data.video_url),
        miniatura_url: montarUrlMedia(resposta.data.miniatura_url),
      };
    }

    return { ...item, dados };
  }));

  const respostaEscolhas = await apiFetch(`/api/escolhas/cena/${cena.id}`);
  const escolhas = await Promise.all((respostaEscolhas.data || []).map(
    async (escolha) => {
      const respostaCena = await apiFetch(
        `/api/cenas/${escolha.cena_destino_id}`
      );
      const cenaDestino = respostaCena.data;
      const respostaCapitulo = await apiFetch(
        `/api/capitulos/${cenaDestino.capitulo_id}`
      );

      return {
        ...escolha,
        cenaDestino,
        capituloDestino: respostaCapitulo.data,
      };
    }
  ));

  return { conteudos, escolhas };
}
