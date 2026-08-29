import { apiFetch } from './api';

// ========================================
// TOKENS
// ========================================

export async function criarToken(usuario_id, finalidade) {
  return apiFetch('/api/tokens-usuario', {
    method: 'POST',
    body: JSON.stringify({
      usuario_id,
      finalidade,
    }),
  });
}

export async function validarToken(usuario_id, token, finalidade) {
  return apiFetch('/api/tokens-usuario/validar', {
    method: 'POST',
    body: JSON.stringify({
      usuario_id,
      token,
      finalidade,
    }),
  });
}

export async function invalidarToken(usuario_id, finalidade) {
  return apiFetch('/api/tokens-usuario/invalidar', {
    method: 'PATCH',
    body: JSON.stringify({
      usuario_id,
      finalidade,
    }),
  });
}

// ========================================
// RECUPERAÇÃO DE SENHA
// ========================================

export async function solicitarRecuperacaoSenha(email) {
  return apiFetch('/api/usuarios/recuperacao-senha', {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  });
}

export async function confirmarRecuperacaoSenha(
  email,
  token,
  senha
) {
  return apiFetch('/api/usuarios/recuperacao-senha/confirmar', {
    method: 'POST',
    body: JSON.stringify({
      email,
      token,
      senha,
    }),
  });
}

// ========================================
// ALTERAÇÃO DE SENHA
// ========================================

export async function solicitarAlteracaoSenha(
  usuario_id,
  senha
) {
  return apiFetch(`/api/usuarios/${usuario_id}/alteracao-senha`, {
    method: 'POST',
    body: JSON.stringify({
      senha,
    }),
  });
}

export async function confirmarAlteracaoSenha(
  usuario_id,
  token,
  senha
) {
  return apiFetch(
    `/api/usuarios/${usuario_id}/alteracao-senha/confirmar`,
    {
      method: 'POST',
      body: JSON.stringify({
        token,
        senha,
      }),
    }
  );
}

// ========================================
// VERIFICAÇÃO DE E-MAIL
// ========================================

export async function solicitarVerificacaoEmail(usuario_id) {
  return apiFetch(`/api/usuarios/${usuario_id}/verificacao-email`, {
    method: 'POST',
  });
}

export async function confirmarVerificacaoEmail(usuario_id, token) {
  return apiFetch(
    `/api/usuarios/${usuario_id}/verificacao-email/confirmar`,
    {
      method: 'POST',
      body: JSON.stringify({
        token,
      }),
    }
  );
}

// ========================================
// LOGIN
// ========================================

export async function login(email, senha) {
  const resposta = await apiFetch('/api/usuarios/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      senha,
    }),
  });

  localStorage.setItem('token', resposta.data.token);

  localStorage.setItem(
    'usuario',
    JSON.stringify(resposta.data.usuario)
  );

  return resposta;
}

// ========================================
// SESSÃO
// ========================================

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function obterUsuario() {
  const usuario = localStorage.getItem('usuario');

  if (!usuario) {
    return null;
  }

  return JSON.parse(usuario);
}

export function estaAutenticado() {
  return !!localStorage.getItem('token');
}
