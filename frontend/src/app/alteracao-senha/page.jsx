'use client';

import { useState } from 'react';
import {
  solicitarAlteracaoSenha,
  confirmarAlteracaoSenha
} from '../../services/autenticacao';

export default function AlteracaoSenha() {
  const [senha, setSenha] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenhaNova, setConfirmarSenhaNova] = useState('');

  const [token, setToken] = useState('');

  const [etapa, setEtapa] = useState(1);

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const usuarioId =
    'bf03c86c-de36-4409-9305-ba8752edd3b2';

  async function solicitarToken(event) {
    event.preventDefault();

    setErro('');
    setMensagem('');

    if (senhaNova !== confirmarSenhaNova) {
      setErro('A confirmação da nova senha não confere.');
      return;
    }

    if (senhaNova.length < 8) {
      setErro('A nova senha deve possuir no mínimo 8 caracteres.');
      return;
    }

    setCarregando(true);

    try {
      const resposta = await solicitarAlteracaoSenha(
        usuarioId,
        senha
      );

      setMensagem(resposta.message);
      setEtapa(2);

    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarAlteracao(event) {
    event.preventDefault();

    setErro('');
    setMensagem('');

    if (!token) {
      setErro('Informe o código recebido por e-mail.');
      return;
    }

    setCarregando(true);

    try {
      const resposta = await confirmarAlteracaoSenha(
        usuarioId,
        token,
        senhaNova
      );

      setMensagem(resposta.message);

      setSenha('');
      setSenhaNova('');
      setConfirmarSenhaNova('');
      setToken('');

    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">

        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Alteração de Senha
        </h1>

        {etapa === 1 && (
          <form onSubmit={solicitarToken}>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Senha atual
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nova senha
              </label>

              <input
                type="password"
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Confirmar nova senha
              </label>

              <input
                type="password"
                value={confirmarSenhaNova}
                onChange={(e) =>
                  setConfirmarSenhaNova(e.target.value)
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {carregando
                ? 'Enviando...'
                : 'Enviar'}
            </button>

          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={confirmarAlteracao}>

            <p className="mb-4 text-sm text-gray-600">
              Enviamos um código de segurança para o seu
              e-mail. Digite o código recebido para confirmar
              a alteração da senha.
            </p>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Código de segurança
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.replace(/\D/g, ''))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-center text-xl tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {carregando
                ? 'Confirmando...'
                : 'Confirmar alteração'}
            </button>

          </form>
        )}

        {erro && (
          <p className="mt-4 text-sm text-red-600">
            {erro}
          </p>
        )}

        {mensagem && (
          <p className="mt-4 text-sm text-green-600">
            {mensagem}
          </p>
        )}

      </div>

    </main>
  );
}
