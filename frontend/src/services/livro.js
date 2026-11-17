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

export async function listarCotasArmazenamento() {
  return apiFetch('/api/livros/gestao/cotas-armazenamento');
}

export async function alterarCotaArmazenamento(id, cota_armazenamento_bytes) {
  return apiFetch(`/api/livros/${id}/cota-armazenamento`, {
    method: 'PATCH',
    body: JSON.stringify({ cota_armazenamento_bytes }),
  });
}
