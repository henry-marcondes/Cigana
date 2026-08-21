import Link from 'next/link';

export default function CapituloCard({ livro, capitulo }) {
  return (
    <Link
      href={`/livros/${livro.slug}/capitulos/${capitulo.slug}`}
      className="block overflow-hidden rounded-lg bg-white shadow-md transition hover:scale-[1.02]"
    >
      <article>
        <div className="flex h-40 items-center justify-center bg-gray-200">
          {capitulo.capa_url ? (
            <img
              src={capitulo.capa_url}
              alt={`Capa do capítulo ${capitulo.titulo}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-500">
              Capa não disponível
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-sm font-medium text-gray-500">
            Capítulo {capitulo.ordem_exibicao}
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900">
            {capitulo.titulo}
          </h2>

          {capitulo.resumo && (
            <p className="mt-2 text-gray-600">
              {capitulo.resumo}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
