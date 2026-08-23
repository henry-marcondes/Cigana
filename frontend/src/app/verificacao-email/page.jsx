'use client';

import { useState } from 'react';
import {
  solicitarVerificacaoEmail,
  confirmarVerificacaoEmail
} from '../../services/autenticacao';

export default function VerificacaoEmail() {
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
    setCarregando(true);

    try {
      const resposta =
        await solicitarVerificacaoEmail(usuarioId);

      setMensagem(resposta.message);
      setEtapa(2);

    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarEmail(event) {
    event.preventDefault();

    setErro('');
    setMensagem('');

    if (!token) {
      setErro('Informe o código recebido por e-mail.');
      return;
    }

    setCarregando(true);

    try {
      const resposta =
        await confirmarVerificacaoEmail(
          usuarioId,
          token
        );

      setMensagem(resposta.message);
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
          Verificação de E-mail
        </h1>

        {etapa === 1 && (
          <form onSubmit={solicitarToken}>

            <p className="mb-6 text-sm text-gray-600">
              Clique no botão abaixo para receber um código
              de verificação no seu e-mail.
            </p>

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {carregando
                ? 'Enviando...'
                : 'Enviar código'}
            </button>

          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={confirmarEmail}>

            <p className="mb-4 text-sm text-gray-600">
              Enviamos um código de segurança para o seu
              e-mail. Digite o código recebido abaixo.
            </p>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Código de verificação
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={token}
                onChange={(e) =>
                  setToken(
                    e.target.value.replace(/\D/g, '')
                  )
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
                ? 'Verificando...'
                : 'Confirmar e-mail'}
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
