'use client';

import { useState } from 'react';
import { login } from '../../services/autenticacao';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMensagem('');
    setErro('');
    setCarregando(true);

    try {
      const resposta = await login(email, senha);

      setMensagem(resposta.message);

      console.log('Login:', resposta.data);

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
          Entrar
        </h1>

        <form onSubmit={handleSubmit}>

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
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div className="mb-6">
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
              onChange={(event) => setSenha(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

        </form>

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
