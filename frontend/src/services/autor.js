import { apiFetch } from './api';

export async function buscarAutorPorUsuario(usuario_id) {
  return apiFetch(`/api/autores/usuario/${usuario_id}`);
}
