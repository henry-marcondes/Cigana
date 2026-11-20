import { apiFetch } from './api';

export function listarNavegacoesEstruturaisPorCena(cenaOrigemId) {
  return apiFetch(`/api/navegacoes-estruturais/cena/${cenaOrigemId}`);
}

export function criarNavegacaoEstrutural(dados) {
  return apiFetch('/api/navegacoes-estruturais', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function alterarNavegacaoEstrutural(id, dados) {
  return apiFetch(`/api/navegacoes-estruturais/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function reordenarNavegacoesEstruturais(cenaOrigemId, ordem) {
  return apiFetch('/api/navegacoes-estruturais/reordenar', {
    method: 'PATCH',
    body: JSON.stringify({ cena_origem_id: cenaOrigemId, ordem }),
  });
}

export function excluirNavegacaoEstrutural(id) {
  return apiFetch(`/api/navegacoes-estruturais/${id}`, { method: 'DELETE' });
}
