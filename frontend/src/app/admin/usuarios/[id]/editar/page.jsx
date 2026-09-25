
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { estaAutenticado } from '../../../../../services/autenticacao';

import {
  buscarUsuarioPorId,
  atualizarUsuario,
} from '../../../../../services/usuario';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();

  const { id } = params;

  const [usuario, setUsuario] = useState(null);
  const [email, setEmail] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!estaAutenticado()) {
      router.push('/login');
      return;
    }

    carregarUsuario();
  }, [id, router]);

  async function carregarUsuario() {
    try {
      setCarregando(true);
      setErro('');

      const resposta =
        await buscarUsuarioPorId(id);

      setUsuario(resposta.data);
      setEmail(resposta.data.email);
    } catch (error) {
      console.error(
        'Erro ao carregar usuário:',
        error
      );

      setErro(
        error.message ||
          'Não foi possível carregar o usuário.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      await atualizarUsuario(id, email);

      setMensagem(
        'Usuário atualizado com sucesso.'
      );

      setTimeout(() => {
        router.push(`/admin/usuarios/${id}`);
      }, 800);
    } catch (error) {
      console.error(
        'Erro ao atualizar usuário:',
        error
      );

      setErro(
        error.message ||
          'Não foi possível atualizar o usuário.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-2xl">
          <p>Carregando usuário...</p>
        </div>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-2xl">
          <p>Usuário não encontrado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl">

        <div className="mb-6">
          <Link
            href={`/admin/usuarios/${id}`}
            className="text-sm underline"
          >
            ← Voltar para o usuário
          </Link>
        </div>

        <section className="rounded-lg bg-white p-6 shadow">
          <h1 className="mb-6 text-2xl font-bold">
            Alterar Usuário
          </h1>

          {erro && (
            <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-700">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="mb-6 rounded border border-green-300 bg-green-50 p-4 text-green-700">
              {mensagem}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1 block font-medium"
              >
                E-mail
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="w-full rounded border border-gray-300 p-3"
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="rounded bg-black px-5 py-3 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando
                ? 'Salvando...'
                : 'Salvar alterações'}
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}
