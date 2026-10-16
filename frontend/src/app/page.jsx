'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import LivroCard from '../components/LivroCard';
import { apiFetch } from '../services/api';
import { listarFavoritos } from '../services/favorito';

export default function Home() {
  const [livros, setLivros] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const respostaLivros = await apiFetch('/api/livros');

        if (!ativo) return;

        setLivros(respostaLivros.data);

        const token = localStorage.getItem('token');

        if (token) {
          try {
            const respostaFavoritos = await listarFavoritos();

            if (!ativo) return;

            setFavoritos(
              respostaFavoritos.data.map((favorito) => favorito.livro_id)
            );
            setAutenticado(true);
          } catch (error) {
            if (!ativo) return;

            if (error.status === 401) {
              setAutenticado(false);
              setFavoritos([]);
            } else {
              console.error(
                'Não foi possível carregar os favoritos:',
                error.message
              );
            }
          }
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  function atualizarFavorito(livro_id, favoritado) {
    setFavoritos((atuais) => {
      if (favoritado) {
        return atuais.includes(livro_id)
          ? atuais
          : [...atuais, livro_id];
      }

      return atuais.filter((id) => id !== livro_id);
    });
  }

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
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Biblioteca
            </h1>

            <p className="mt-2 text-gray-900">
              Livros disponíveis na plataforma Ciganas.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
            >
              Dashboard
            </Link>

            {autenticado ? (
              <Link
                href="/favoritos"
                className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
              >
                ♥ Meus favoritos
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
                >
                  Login
                </Link>

                <Link
                  href="/cadastro"
                  className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
                >
                  Cadastro
                </Link>
              </>
            )}
          </nav>
        </header>

        {livros.length === 0 ? (
          <p className="text-gray-100">
            Nenhuma obra disponível.
          </p>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {livros.map((livro) => (
              <LivroCard
                key={livro.id}
                livro={livro}
                favoritoInicial={favoritos.includes(livro.id)}
                autenticado={autenticado}
                onFavoritoAlterado={atualizarFavorito}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
