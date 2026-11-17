import { apiFetch } from './api';

const LIMITE_UPLOAD_BYTES = 50 * 1024 * 1024;
const CANAL_ARQUIVOS = 'cigana-arquivos-midia';

export function notificarArquivosMidiaAtualizados(livroId) {
  if (typeof window === 'undefined' || !livroId) return;
  window.dispatchEvent(new CustomEvent('cigana:arquivos-midia-atualizados', {
    detail: { livroId },
  }));
  if (typeof BroadcastChannel !== 'undefined') {
    const canal = new BroadcastChannel(CANAL_ARQUIVOS);
    canal.postMessage({ livroId });
    canal.close();
  }
}

export async function obterResumoArmazenamento(livroId) {
  return apiFetch(`/api/arquivos-midia/livro/${livroId}/armazenamento`);
}

export async function listarArquivosPorLivro(livroId) {
  return apiFetch(`/api/arquivos-midia/livro/${livroId}`);
}

export async function obterUrlAssinadaArquivo(arquivoId) {
  const resposta = await apiFetch(`/api/arquivos-midia/${arquivoId}/url`);
  return resposta.data.url;
}

export async function listarPastasPorLivro(livroId) {
  return apiFetch(`/api/pastas-obra/livro/${livroId}`);
}

export async function criarPastaObra(livroId, nome, pastaPaiId = null) {
  return apiFetch(`/api/pastas-obra/livro/${livroId}`, {
    method: 'POST',
    body: JSON.stringify({ nome, pasta_pai_id: pastaPaiId }),
  });
}

export async function renomearPastaObra(pastaId, nome) {
  return apiFetch(`/api/pastas-obra/${pastaId}`, {
    method: 'PATCH',
    body: JSON.stringify({ nome }),
  });
}

export async function moverPastaObra(pastaId, pastaPaiId) {
  return apiFetch(`/api/pastas-obra/${pastaId}/mover`, {
    method: 'PATCH',
    body: JSON.stringify({ pasta_pai_id: pastaPaiId }),
  });
}

export async function excluirPastaObra(pastaId) {
  return apiFetch(`/api/pastas-obra/${pastaId}`, {
    method: 'DELETE',
  });
}

export async function enviarArquivoParaLivro(livroId, arquivo, pastaId = null) {
  if (arquivo.size > LIMITE_UPLOAD_BYTES) {
    throw new Error('O arquivo excede o limite máximo de upload de 50 MiB.');
  }

  const query = pastaId
    ? `?${new URLSearchParams({ pasta_id: pastaId })}`
    : '';

  const resposta = await apiFetch(`/api/arquivos-midia/livro/${livroId}${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Nome-Original': arquivo.name,
    },
    body: arquivo,
  });
  notificarArquivosMidiaAtualizados(livroId);
  return resposta;
}

export async function substituirArquivoGerenciado(arquivoId, livroId, arquivo) {
  if (arquivo.size > LIMITE_UPLOAD_BYTES) {
    throw new Error('O arquivo excede o limite máximo de upload de 50 MiB.');
  }
  const resposta = await apiFetch(`/api/arquivos-midia/${arquivoId}/conteudo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: arquivo,
  });
  notificarArquivosMidiaAtualizados(livroId);
  return resposta;
}

export async function desativarArquivoGerenciado(arquivoId, livroId) {
  const resposta = await apiFetch(`/api/arquivos-midia/${arquivoId}`, {
    method: 'DELETE',
  });
  notificarArquivosMidiaAtualizados(livroId);
  return resposta;
}

export async function renomearArquivo(arquivoId, nomeOriginal) {
  return apiFetch(`/api/arquivos-midia/${arquivoId}/nome`, {
    method: 'PATCH',
    body: JSON.stringify({ nome_original: nomeOriginal }),
  });
}

export async function moverArquivo(arquivoId, pastaId) {
  return apiFetch(`/api/arquivos-midia/${arquivoId}/pasta`, {
    method: 'PATCH',
    body: JSON.stringify({ pasta_id: pastaId }),
  });
}
