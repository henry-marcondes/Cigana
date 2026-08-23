import {
  solicitarAlteracaoSenha,
  confirmarAlteracaoSenha
} from './autenticacao';

const usuarioId = 'bf03c86c-de36-4409-9305-ba8752edd3b2';

async function testar() {
  try {
    const resultado = await solicitarAlteracaoSenha(
      usuarioId,
      'SENHA_ATUAL'
    );

    console.log('SOLICITAÇÃO:', resultado);

    const token = prompt('Digite o token recebido por e-mail:');

    const confirmacao = await confirmarAlteracaoSenha(
      usuarioId,
      token,
      'NOVA_SENHA_123'
    );

    console.log('CONFIRMAÇÃO:', confirmacao);

  } catch (err) {
    console.error('ERRO:', err.message);
  }
}

testar();
