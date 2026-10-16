import { apiFetch } from './api';

export async function listarFinaisConquistados(livroId) {
  return apiFetch(`/api/finais-leitura/livro/${livroId}`, {
    silenciarErro: true,
  });
}

export async function registrarFinal(livroId, cenaId) {
  return apiFetch('/api/finais-leitura', {
    method: 'POST',
    body: JSON.stringify({ livro_id: livroId, cena_id: cenaId }),
  });
}
