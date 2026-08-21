'use client';

import { useEffect, useState } from 'react';
import LivroCard from '../components/LivroCard';
import { apiFetch } from '../services/api';

export default function Home() {
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarLivros() {
      try {
        const resposta = await apiFetch('/api/livros');
        setLivros(resposta.data);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarLivros();
  }, []);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Carregando livros...</p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Erro: {erro}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-600 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Biblioteca
          </h1>

          <p className="mt-2 text-pink-600">
            Livros disponíveis na plataforma Ciganas.
          </p>
        </header>

        {livros.length === 0 ? (
          <p className="text-gray-600">
            Nenhum livro disponível.
          </p>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {livros.map((livro) => (
              <LivroCard key={livro.id} livro={livro} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
