'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  obterUsuario,
  estaAutenticado,
  logout,
} from '../../services/autenticacao';

export default function Dashboard() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    if (!estaAutenticado()) {
      router.push('/login');
      return;
    }

    const usuarioLogado = obterUsuario();
    setUsuario(usuarioLogado);
  }, [router]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (!usuario) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Carregando...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-4xl">

        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Área do usuário
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
          >
            Sair
          </button>
        </header>

        <section className="rounded-lg bg-white p-6 shadow">

          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Minha conta
          </h2>

          <div className="space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                E-mail
              </p>

              <p className="text-gray-900">
                {usuario.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status do e-mail
              </p>

              <p className="text-green-600">
                {usuario.email_verificado_em
                  ? 'E-mail verificado'
                  : 'E-mail não verificado'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Conta
              </p>

              <p className="text-gray-900">
                {usuario.ativo ? 'Ativa' : 'Inativa'}
              </p>
            </div>

          </div>

        </section>

        <section className="mt-6 rounded-lg bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Segurança
          </h2>

          <button
            onClick={() => router.push('/alteracao-senha')}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Alterar senha
          </button>

        </section>

      </div>

    </main>
  );
}
