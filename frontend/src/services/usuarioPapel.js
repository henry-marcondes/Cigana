import { apiFetch } from './api';

export async function listarPapeisDoUsuario(usuarioId) {
  return apiFetch(`/api/usuario-papeis/usuario/${usuarioId}`);
}

export async function vincularPapel(usuario_id, papel_id) {
  return apiFetch('/api/usuario-papeis', {
    method: 'POST',
    body: JSON.stringify({
      usuario_id,
      papel_id,
    }),
  });
}

export async function buscarVinculo(usuarioId, papelId) {
  return apiFetch(
    `/api/usuario-papeis/usuario/${usuarioId}/papel/${papelId}`
  );
}

export async function removerPapel(vinculoId) {
  return apiFetch(`/api/usuario-papeis/${vinculoId}`, {
    method: 'DELETE',
  });
}
