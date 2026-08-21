import Link from 'next/link';

export default function LivroCard({ livro }) {
  return (
    <Link
      href={`/livros/${livro.slug}`}
      className="block overflow-hidden rounded-lg bg-white shadow-md transition hover:scale-[1.02]"
    >

    <article>
      <div className="flex h-48 items-center justify-center bg-gray-200">
        {livro.capa_url ? (
          <img
            src={livro.capa_url}
            alt={`Capa do livro ${livro.titulo}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-500">
            Capa não disponível
          </span>
        )}
      </div>

      <div className="p-4">
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
      </div>
    </article>
  </Link>

  );
}
