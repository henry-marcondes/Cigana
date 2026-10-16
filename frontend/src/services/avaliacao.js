import { apiFetch } from './api';

export async function listarAvaliacoesPorLivro(livroId) {
  return apiFetch(`/api/avaliacoes/livro/${livroId}`);
}

export async function buscarMinhaAvaliacao(usuarioId, livroId) {
  return apiFetch(
    `/api/avaliacoes/usuario/${usuarioId}/livro/${livroId}`,
    { silenciarErro: true }
  );
}

export async function criarAvaliacao(livroId, nota, comentario) {
  return apiFetch('/api/avaliacoes', {
    method: 'POST',
    body: JSON.stringify({ livro_id: livroId, nota, comentario }),
  });
}

export async function alterarNotaAvaliacao(id, nota) {
  return apiFetch(`/api/avaliacoes/${id}/nota`, {
    method: 'PATCH',
    body: JSON.stringify({ nota }),
  });
}

export async function alterarComentarioAvaliacao(id, comentario) {
  return apiFetch(`/api/avaliacoes/${id}/comentario`, {
    method: 'PATCH',
    body: JSON.stringify({ comentario }),
  });
}
