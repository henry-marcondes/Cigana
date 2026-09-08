import { apiFetch } from './api';

export async function listarCapitulosPorLivro(livroId) {
  return await apiFetch(`/api/capitulos/livro/${livroId}`);
}
