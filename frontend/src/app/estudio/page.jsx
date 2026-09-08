'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
obterUsuario,
estaAutenticado,
logout,
} from '../../services/autenticacao';

import { buscarAutorPorUsuario } from '../../services/autor';
import { listarLivrosPorAutor } from '../../services/livroAutor';
import { apiFetch } from '../../services/api';

export default function Editor() {
const router = useRouter();

const [usuario, setUsuario] = useState(null);
const [autor, setAutor] = useState(null);
const [livros, setLivros] = useState([]);

const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState('');

useEffect(() => {
async function carregarEditor() {
if (!estaAutenticado()) {
router.push('/login');
return;
}

  const usuarioLogado = obterUsuario();

  if (!usuarioLogado) {
    router.push('/login');
    return;
  }

  setUsuario(usuarioLogado);

  try {
    // 1. Buscar o Autor do usuário autenticado
    const respostaAutor = await buscarAutorPorUsuario(
      usuarioLogado.id
    );

    const autorEncontrado = respostaAutor.data;

    setAutor(autorEncontrado);

    // 2. Buscar as relações livro-autor
    const respostaRelacoes = await listarLivrosPorAutor(
      autorEncontrado.id
    );

    const relacoes = respostaRelacoes.data || [];

    // 3. Buscar os dados dos livros
    const livrosEncontrados = await Promise.all(
      relacoes.map(async (relacao) => {
        const respostaLivro = await apiFetch(
          `/api/livros/${relacao.livro_id}`
        );

        return respostaLivro.data;
      })
    );

    setLivros(livrosEncontrados);

  } catch (error) {
    setErro(error.message);
  } finally {
    setCarregando(false);
  }
}

carregarEditor();

}, [router]);

function handleLogout() {
logout();
router.push('/login');
}

if (carregando) {
return ( <main className="flex min-h-screen items-center justify-center bg-gray-100"> <p className="text-gray-600">
Carregando... </p> </main>
);
}

if (erro) {
return ( <main className="min-h-screen bg-gray-100 p-6">

    <div className="mx-auto max-w-6xl">

      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Editor
          </h1>

          <p className="mt-2 text-gray-600">
            Espaço para criação e organização das suas obras.
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

        <h2 className="text-xl font-semibold text-gray-900">
          Editor
        </h2>

        <p className="mt-2 text-red-600">
          {erro}
        </p>

      </section>

    </div>

  </main>
);

}

return ( <main className="min-h-screen bg-gray-100 p-6">

  <div className="mx-auto max-w-6xl">

    <header className="mb-8 flex items-center justify-between">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Estúdio
        </h1>

        <p className="mt-2 text-gray-600">
          Espaço para criação e organização das suas obras.
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

      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Autor
        </h2>

        <p className="mt-1 text-gray-600">
          Perfil de criação associado à sua conta.
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 p-6">

        <p className="text-sm text-gray-500">
          Nome público
        </p>

        <p className="mt-1 text-lg font-semibold text-gray-900">
          {autor.nome_publico}
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Usuário
        </p>

        <p className="mt-1 text-gray-700">
          {usuario.email}
        </p>

      </div>

    </section>

    <section className="mt-6 rounded-lg bg-white p-6 shadow">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Minhas obras
          </h2>

          <p className="mt-1 text-gray-600">
            Crie, edite e organize suas obras.
          </p>
        </div>

       <button
         onClick={() => router.push('/estudio/nova-obra')}
         className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
            + Nova obra
        </button>
      </div>

      {livros.length === 0 ? (

        <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-10 text-center">

          <p className="text-gray-500">
            Nenhuma obra encontrada.
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Você ainda não possui livros associados ao seu perfil de Autor.
          </p>

        </div>

      ) : (

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {livros.map((livro) => (

            <article
              key={livro.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >

              {livro.capa_url && (
                <img
                  src={livro.capa_url}
                  alt={`Capa de ${livro.titulo}`}
                  className="h-56 w-full object-cover"
                />
              )}

              <div className="p-5">

                <h3 className="text-lg font-semibold text-gray-900">
                  {livro.titulo}
                </h3>

                {livro.resumo && (
                  <p className="mt-2 text-sm text-gray-600">
                    {livro.resumo}
                  </p>
                )}

        <div className="mt-4 flex gap-2">

            <button
                onClick={() =>
                router.push(`/estudio/obras/${livro.id}`)
                }
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
                Editar obra
            </button>

            <button
                onClick={() =>
                  router.push(`/livros/${livro.slug}`)
                }
              className="rounded bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
                Visualizar
            </button>

        </div>

              </div>

            </article>

          ))}

        </div>

      )}

    </section>

  </div>

</main>

);
}
