import { apiFetch } from './api';

const base = '/api/solicitacoes-inclusao-obras';

export function criarSolicitacaoInclusaoObra(dados) {
  return apiFetch(base, { method: 'POST', body: JSON.stringify(dados) });
}

export function listarMinhasSolicitacoesInclusaoObras() {
  return apiFetch(`${base}/minhas`);
}

export function buscarSolicitacaoInclusaoObra(id) {
  return apiFetch(`${base}/${id}`);
}

export function editarSolicitacaoInclusaoObra(id, dados) {
  return apiFetch(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
}

export function reenviarSolicitacaoInclusaoObra(id) {
  return apiFetch(`${base}/${id}/reenviar`, { method: 'POST' });
}

export function listarSolicitacoesInclusaoObrasGestao(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiFetch(`${base}/gestao${query}`);
}

export function buscarSolicitacaoInclusaoObraGestao(id) {
  return apiFetch(`${base}/gestao/${id}`);
}

export function aprovarSolicitacaoInclusaoObra(id) {
  return apiFetch(`${base}/gestao/${id}/aprovar`, { method: 'PATCH' });
}

export function rejeitarSolicitacaoInclusaoObra(id, motivo_rejeicao) {
  return apiFetch(`${base}/gestao/${id}/rejeitar`, {
    method: 'PATCH', body: JSON.stringify({ motivo_rejeicao }),
  });
}

export function criarObraDaSolicitacao(id) {
  return apiFetch(`/api/livros/autor`, {
    method: 'POST', body: JSON.stringify({ solicitacao_id: id }),
  });
}
