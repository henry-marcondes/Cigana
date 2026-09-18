import { apiFetch } from './api';

/**
 * Cria uma solicitação para atuar como Autor.
 */
export async function criarSolicitacaoAutor(dados) {
  return apiFetch('/api/solicitacoes-autor', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

/**
 * Lista as solicitações do usuário autenticado.
 */
export async function listarMinhasSolicitacoesAutor() {
  return apiFetch('/api/solicitacoes-autor/minhas');
}

/**
 * Busca uma solicitação específica do usuário autenticado.
 */
export async function buscarMinhaSolicitacaoAutor(id) {
  return apiFetch(`/api/solicitacoes-autor/minhas/${id}`);
}

/**
 * Lista solicitações para gestão da Plataforma.
 *
 * @param {string|null} status
 */
export async function listarSolicitacoesAutorGestao(status = null) {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : '';

  return apiFetch(`/api/solicitacoes-autor/gestao${query}`);
}

/**
 * Lista somente solicitações pendentes para gestão.
 */
export async function listarSolicitacoesAutorPendentes() {
  return apiFetch('/api/solicitacoes-autor/gestao/pendentes');
}

/**
 * Busca uma solicitação para avaliação administrativa.
 */
export async function buscarSolicitacaoAutorParaAvaliacao(id) {
  return apiFetch(`/api/solicitacoes-autor/gestao/${id}`);
}

/**
 * Aprova uma solicitação de Autor.
 */
export async function aprovarSolicitacaoAutor(id) {
  return apiFetch(`/api/solicitacoes-autor/gestao/${id}/aprovar`, {
    method: 'PATCH',
  });
}

/**
 * Recusa uma solicitação de Autor.
 */
export async function recusarSolicitacaoAutor(id, motivo_recusa) {
  return apiFetch(`/api/solicitacoes-autor/gestao/${id}/recusar`, {
    method: 'PATCH',
    body: JSON.stringify({
      motivo_recusa,
    }),
  });
}
