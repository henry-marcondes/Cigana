import { apiFetch } from './api';

export async function buscarPorUsuarioELivro(
  usuario_id,
  livro_id
) {
  return apiFetch(
    `/api/progresso-leitura/usuario/${usuario_id}/livro/${livro_id}`
  );
}

export async function criarProgresso(dados) {
  return apiFetch('/api/progresso-leitura', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function atualizarCenaAtual(
  id,
  cena_atual_id
) {
  return apiFetch(
    `/api/progresso-leitura/${id}/cena`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        cena_atual_id,
      }),
    }
  );
}

export async function atualizarPercentual(
  id,
  percentual_concluido
) {
  return apiFetch(
    `/api/progresso-leitura/${id}/percentual`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        percentual_concluido,
      }),
    }
  );
}

export async function concluirLeitura(id) {
  return apiFetch(
    `/api/progresso-leitura/${id}/concluir`,
    {
      method: 'PATCH',
    }
  );
}
