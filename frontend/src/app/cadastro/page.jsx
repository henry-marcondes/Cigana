'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  solicitarVerificacaoEmail,
  confirmarVerificacaoEmail
} from '../../services/autenticacao';

import { apiFetch } from '../../services/api';

export default function Cadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [token, setToken] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);

  const [etapa, setEtapa] = useState(1);

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();

  async function criarConta(event) {
    event.preventDefault();

    setErro('');
    setMensagem('');

    if (senha !== confirmarSenha) {
      setErro('A confirmação da senha não confere.');
      return;
    }

    if (senha.length < 8) {
      setErro('A senha deve possuir no mínimo 8 caracteres.');
      return;
    }

    setCarregando(true);

    try {
      const resposta = await apiFetch('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          email,
          senha
        })
      });

      const id = resposta.data.id;

      setUsuarioId(id);

      await solicitarVerificacaoEmail(id);

      setMensagem(
        'Conta criada com sucesso. Enviamos um código de verificação para o seu e-mail.'
      );

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

    if (token.length !== 6) {
      setErro('O código deve possuir 6 dígitos.');
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

      setTimeout(() => {
        router.push('/login');
      }, 1500);

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
          Criar conta
        </h1>

        {etapa === 1 && (
          <form onSubmit={criarConta}>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="senha"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Senha
              </label>

              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmarSenha"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirmar senha
              </label>

              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
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
                ? 'Criando conta...'
                : 'Criar conta'}
            </button>

          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={confirmarEmail}>

            <p className="mb-4 text-sm text-gray-600">
              Enviamos um código de segurança para o seu
              e-mail. Digite o código recebido abaixo para
              confirmar sua conta.
            </p>

            <div className="mb-6">
              <label
                htmlFor="token"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Código de verificação
              </label>

              <input
                id="token"
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
