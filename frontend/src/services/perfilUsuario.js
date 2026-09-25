import { apiFetch } from './api';

export async function buscarPerfilPorUsuario(usuario_id) {
  return apiFetch(`/api/perfis/usuario/${usuario_id}`);
}

export async function criarPerfil(dados) {
  return apiFetch('/api/perfis', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function alterarDadosPessoais(id, dados) {
  return apiFetch(`/api/perfis/${id}/dados-pessoais`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
}

export async function alterarNomeUsuario(id, nome_usuario) {
  return apiFetch(`/api/perfis/${id}/nome-usuario`, {
    method: 'PATCH',
    body: JSON.stringify({
      nome_usuario,
    }),
  });
}

export async function alterarBiografia(id, biografia) {
  return apiFetch(`/api/perfis/${id}/biografia`, {
    method: 'PATCH',
    body: JSON.stringify({
      biografia,
    }),
  });
}

export async function alterarAvatar(id, avatar_url) {
  return apiFetch(`/api/perfis/${id}/avatar`, {
    method: 'PATCH',
    body: JSON.stringify({
      avatar_url,
    }),
  });
}

export async function alterarIdioma(id, idioma_id) {
  return apiFetch(`/api/perfis/${id}/idioma`, {
    method: 'PATCH',
    body: JSON.stringify({
      idioma_id,
    }),
  });
}
