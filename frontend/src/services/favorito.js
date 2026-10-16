import { apiFetch } from './api';

export async function listarFavoritos() {
  return apiFetch('/api/favoritos');
}

export async function buscarFavoritoPorLivro(livro_id) {
  return apiFetch(
    `/api/favoritos/livro/${livro_id}`
  );
}

export async function adicionarFavorito(livro_id) {
  return apiFetch('/api/favoritos', {
    method: 'POST',
    body: JSON.stringify({ livro_id }),
  });
}

export async function removerFavorito(livro_id) {
  return apiFetch(
    `/api/favoritos/livro/${livro_id}`,
    { method: 'DELETE' }
  );
}
