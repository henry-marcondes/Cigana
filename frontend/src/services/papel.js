import { apiFetch } from './api';

export async function listarPapeis() {
  return apiFetch('/api/papeis');
}

export async function buscarPapelPorId(id) {
  return apiFetch(`/api/papeis/${id}`);
}
