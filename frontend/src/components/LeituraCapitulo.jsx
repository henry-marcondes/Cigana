import Link from 'next/link';

export default function LeituraCapitulo({
  livro,
  capitulo,
  cenaInicial,
  onStart,
  linkVoltar,
  textoVoltar = '← Voltar para o livro',
}) {
  return (
    <main className="min-h-screen bg-gray-200 p-6">
      <div className="mx-auto max-w-4xl">
        {onStart ? (
          <button
            type="button"
            onClick={linkVoltar}
            className="mb-6 inline-block text-sm text-gray-500 hover:underline"
          >
            {textoVoltar}
          </button>
        ) : (
          <Link
            href={linkVoltar}
            className="mb-6 inline-block text-sm text-gray-500 hover:underline"
          >
            {textoVoltar}
          </Link>
        )}

        <article className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="p-6">
            <p className="text-sm font-medium text-gray-500">
              {livro.titulo}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {capitulo.titulo}
            </h1>
            {capitulo.resumo && (
              <p className="mt-4 text-gray-600">{capitulo.resumo}</p>
            )}
            {capitulo.texto_introdutorio && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <p className="whitespace-pre-line leading-8 text-gray-700">
                  {capitulo.texto_introdutorio}
                </p>
              </div>
            )}
            {onStart ? (
              <button
                type="button"
                onClick={() => onStart(cenaInicial)}
                className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
              >
                Começar leitura
              </button>
            ) : (
              <Link
                href={`/livros/${livro.slug}/capitulos/${capitulo.slug}/cenas/${cenaInicial.slug}`}
                className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
              >
                Começar leitura
              </Link>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
