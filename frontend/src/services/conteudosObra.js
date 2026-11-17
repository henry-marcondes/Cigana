import { apiFetch } from './api';
import { obterUrlAssinadaArquivo } from './arquivoMidia';

const ROTAS_TIPO = {
  TEXTO: 'cena-textos',
  IMAGEM: 'cena-imagens',
  AUDIO: 'cena-audios',
  VIDEO: 'cena-videos',
};

export async function listarConteudosDisponiveis(livroId) {
  return apiFetch(`/api/cena-conteudos/livro/${livroId}/disponiveis`);
}

export async function cadastrarConteudo(tipo, dados) {
  const rota = ROTAS_TIPO[tipo];
  if (!rota) throw new Error('Tipo de conteúdo inválido.');
  return apiFetch(`/api/${rota}`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function carregarPreviaConteudo(item) {
  if (item.origem === 'ARQUIVO_STORAGE') {
    const url = await obterUrlAssinadaArquivo(item.arquivo_id);
    const campoUrl = { IMAGEM: 'imagem_url', AUDIO: 'audio_url', VIDEO: 'video_url' }[item.tipo_conteudo];
    return { titulo: item.titulo, [campoUrl]: url };
  }
  if (item.tipo_conteudo === 'TEXTO' && item.arquivo_id) {
    const url = await obterUrlAssinadaArquivo(item.arquivo_id);
    const resposta = await fetch(url, { cache: 'no-store' });
    if (!resposta.ok) throw new Error('Não foi possível carregar o arquivo Markdown.');
    return { texto: await resposta.text() };
  }
  const rota = ROTAS_TIPO[item.tipo_conteudo];
  if (!rota) throw new Error('Tipo de conteúdo inválido.');
  const resposta = await apiFetch(`/api/${rota}/${item.id}`);
  const dados = resposta.data || {};

  if (item.tipo_conteudo === 'TEXTO') {
    return { ...dados, texto: dados.conteudo || '' };
  }

  const campoUrl = { IMAGEM: 'imagem_url', AUDIO: 'audio_url', VIDEO: 'video_url' }[item.tipo_conteudo];
  let url;
  if (dados.arquivo_id) {
    url = await obterUrlAssinadaArquivo(dados.arquivo_id);
  } else {
    const urlLegada = dados[campoUrl];
    if (!/^https?:\/\//i.test(urlLegada || '')) {
      throw new Error('Este conteúdo não possui arquivo gerenciado para pré-visualização.');
    }
    url = urlLegada;
  }
  return { ...dados, [campoUrl]: url };
}
