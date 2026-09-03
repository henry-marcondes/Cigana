import { apiFetch } from './api';

export async function listarLivrosPorAutor(autor_id) {
  return apiFetch(`/api/livro-autores/autor/${autor_id}`);
}
