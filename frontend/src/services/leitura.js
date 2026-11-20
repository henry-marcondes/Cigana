import { apiFetch } from './api';
import { montarUrlMedia } from './media';
import { obterUrlAssinadaArquivo } from './arquivoMidia';
import { consultarTrechoMarkdown } from './livroDocumento';
import { listarNavegacoesEstruturaisPorCena } from './navegacaoEstrutural';

async function carregarTexto(textoUrl) {
  const url = montarUrlMedia(textoUrl);
  if (!url) return '';

  const resposta = await fetch(url, { cache: 'no-store' });
  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar o texto: ${textoUrl}`);
  }

  return resposta.text();
}

async function carregarConteudoTexto(texto, textoId) {
  if (typeof texto.texto_url === 'string' && texto.texto_url.trim()) {
    return carregarTexto(texto.texto_url);
  }

  if (texto.arquivo_id) {
    if (texto.documento_markdown_ativo) {
      try {
        const resposta = await consultarTrechoMarkdown(textoId);
        if (typeof resposta.data?.conteudo_markdown === 'string') return resposta.data.conteudo_markdown;
      } catch { /* Mantém o fallback gerenciado se o trecho legado estiver indisponível. */ }
    }
    const url = await obterUrlAssinadaArquivo(texto.arquivo_id);
    const respostaArquivo = await fetch(url, { cache: 'no-store' });
    if (!respostaArquivo.ok) throw new Error('Não foi possível carregar o arquivo Markdown da cena.');
    return respostaArquivo.text();
  }

  return typeof texto.conteudo === 'string' ? texto.conteudo : '';
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
        texto: await carregarConteudoTexto(resposta.data, item.conteudo_id),
      };
    } else if (item.tipo_conteudo === 'IMAGEM') {
      const resposta = await apiFetch(`/api/cena-imagens/${item.conteudo_id}`);
      const arquivoId = resposta.data.arquivo_id;
      dados = {
        ...resposta.data,
        imagem_url: arquivoId
          ? await obterUrlAssinadaArquivo(arquivoId)
          : null,
      };
    } else if (item.tipo_conteudo === 'AUDIO') {
      const resposta = await apiFetch(`/api/cena-audios/${item.conteudo_id}`);
      const arquivoId = resposta.data.arquivo_id;
      dados = {
        ...resposta.data,
        audio_url: arquivoId
          ? await obterUrlAssinadaArquivo(arquivoId)
          : null,
      };
    } else if (item.tipo_conteudo === 'VIDEO') {
      const resposta = await apiFetch(`/api/cena-videos/${item.conteudo_id}`);
      const arquivoId = resposta.data.arquivo_id;
      dados = {
        ...resposta.data,
        video_url: arquivoId
          ? await obterUrlAssinadaArquivo(arquivoId)
          : null,
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

  let navegacoesEstruturais = [];
  try {
    const respostaNavegacao = await listarNavegacoesEstruturaisPorCena(cena.id);
    navegacoesEstruturais = (respostaNavegacao.data || [])
      .filter((item) => item.destino_disponivel === true);
  } catch {
    // A navegação estrutural é opcional e não deve bloquear a leitura da cena.
  }

  return { conteudos, escolhas, navegacoesEstruturais };
}
