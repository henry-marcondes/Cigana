'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  adicionarFavorito,
  removerFavorito,
} from '../services/favorito';

export default function LivroCard({
  livro,
  favoritoInicial = false,
  autenticado = false,
  onFavoritoAlterado,
}) {
  const [favorito, setFavorito] = useState(favoritoInicial);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function alternarFavorito() {
    if (!autenticado || carregando) return;

    setCarregando(true);
    setErro('');

    try {
      if (favorito) {
        await removerFavorito(livro.id);
        setFavorito(false);
        onFavoritoAlterado?.(livro.id, false);
      } else {
        await adicionarFavorito(livro.id);
        setFavorito(true);
        onFavoritoAlterado?.(livro.id, true);
      }
    } catch (error) {
      setErro(error.message || 'Não foi possível alterar o favorito.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-md transition hover:shadow-lg">
      <div className="relative">
        <Link
          href={`/livros/${livro.slug}`}
          className="block"
        >
          <div className="flex h-48 items-center justify-center bg-gray-200">
            {livro.capa_url ? (
              <img
                src={livro.capa_url}
                alt={`Capa da obra ${livro.titulo}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-500">
                Capa não disponível
              </span>
            )}
          </div>
        </Link>

        {autenticado && (
          <button
            type="button"
            onClick={alternarFavorito}
            disabled={carregando}
            aria-label={
              favorito
                ? `Remover ${livro.titulo} dos favoritos`
                : `Adicionar ${livro.titulo} aos favoritos`
            }
            aria-pressed={favorito}
            title={
              favorito
                ? 'Remover dos favoritos'
                : 'Adicionar aos favoritos'
            }
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 disabled:opacity-50"
          >
            <span
              className={`text-2xl ${
                favorito ? 'text-red-600' : 'text-gray-500'
              }`}
              aria-hidden="true"
            >
              {favorito ? '♥' : '♡'}
            </span>
          </button>
        )}
      </div>

      <Link
        href={`/livros/${livro.slug}`}
        className="block p-4"
      >
        <h2 className="text-xl font-bold text-gray-900">
          {livro.titulo}
        </h2>

        {livro.resumo && (
          <p className="mt-2 text-gray-600">
            {livro.resumo}
          </p>
        )}

        {livro.ano_publicacao && (
          <p className="mt-3 text-sm text-gray-500">
            Publicado em {livro.ano_publicacao}
          </p>
        )}
      </Link>

      {erro && (
        <p
          role="alert"
          className="px-4 pb-3 text-sm text-red-600"
        >
          {erro}
        </p>
      )}
    </article>
  );
}
