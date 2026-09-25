import { apiFetch } from './api';

export async function listarUsuarios() {
  return apiFetch('/api/usuarios');
}

export async function buscarUsuarioPorId(id) {
  return apiFetch(`/api/usuarios/${id}`);
}

export async function criarUsuario(email, senha) {
  return apiFetch('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      email,
      senha,
    }),
  });
}

export async function atualizarUsuario(id, email) {
  return apiFetch(`/api/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      email,
    }),
  });
}

export async function desativarUsuario(id) {
  return apiFetch(`/api/usuarios/${id}`, {
    method: 'DELETE',
  });
}
