import { apiFetch } from './api';

export function listarEscolhasPorCena(cenaId) {
  return apiFetch(`/api/escolhas/cena/${cenaId}`);
}

export function criarEscolha(dados) {
  return apiFetch('/api/escolhas', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function alterarTextoEscolha(id, texto) {
  return apiFetch(`/api/escolhas/${id}/texto`, {
    method: 'PATCH',
    body: JSON.stringify({ texto }),
  });
}

export function alterarDestinoEscolha(id, cena_destino_id) {
  return apiFetch(`/api/escolhas/${id}/destino`, {
    method: 'PATCH',
    body: JSON.stringify({ cena_destino_id }),
  });
}

export function excluirEscolha(id) {
  return apiFetch(`/api/escolhas/${id}`, { method: 'DELETE' });
}

export function reordenarEscolhas(cena_origem_id, ordem) {
  return apiFetch('/api/escolhas/reordenar', {
    method: 'PATCH',
    body: JSON.stringify({ cena_origem_id, ordem }),
  });
}
