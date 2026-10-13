import { apiFetch } from './api';

export async function usuarioTemPermissao(usuarioId, codigoPermissao) {
  if (!usuarioId || !codigoPermissao) {
    return false;
  }

  const respostaPapeis = await apiFetch(
    `/api/usuario-papeis/usuario/${usuarioId}`
  );
  const papeis = respostaPapeis.data || [];

  const permissoesPorPapel = await Promise.all(
    papeis.map(async ({ papel_id }) => {
      const resposta = await apiFetch(
        `/api/papel-permissoes/papel/${papel_id}`
      );
      return resposta.data || [];
    })
  );

  return permissoesPorPapel.some((permissoes) =>
    permissoes.some(
      ({ permissao_codigo }) => permissao_codigo === codigoPermissao
    )
  );
}
