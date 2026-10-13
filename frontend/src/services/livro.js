import { apiFetch } from './api';

export async function publicarLivro(id) {
  return apiFetch(`/api/livros/${id}/publicar`, {
    method: 'POST',
  });
}

export async function enviarLivroParaRevisao(id) {
  return apiFetch(`/api/livros/${id}/enviar-revisao`, {
    method: 'POST',
  });
}

export async function listarLivrosParaDecisaoEditorial() {
  return apiFetch('/api/livros/gestao/editorial');
}

export async function decidirEditorial(id, decisao, motivo_rejeicao = null) {
  return apiFetch(`/api/livros/${id}/decisao-editorial`, {
    method: 'PATCH',
    body: JSON.stringify({ decisao, motivo_rejeicao }),
  });
}
