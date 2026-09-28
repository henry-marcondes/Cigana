import { apiFetch } from './api';

export async function buscarAutorPorUsuario(usuario_id) {
  try {
    return await apiFetch(
      `/api/autores/usuario/${usuario_id}`,
      {
        silenciarErro: true
      }
    );
  } catch (error) {
    if (error.status === 404) {
      return {
        success: true,
        data: null
      };
    }

    throw error;
  }
}
