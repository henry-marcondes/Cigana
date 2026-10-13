import Link from 'next/link';

export default function CapituloCard({ livro, capitulo, onSelect }) {
  const conteudo = (
    <article className="overflow-hidden rounded-lg bg-white text-left shadow-md transition hover:scale-[1.02]">
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
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(capitulo)}
        className="block w-full"
      >
        {conteudo}
      </button>
    );
  }

  return (
    <Link href={`/livros/${livro.slug}/capitulos/${capitulo.slug}`}>
      {conteudo}
    </Link>
  );
}
