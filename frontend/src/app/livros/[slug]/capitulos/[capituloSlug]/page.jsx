import Link from 'next/link';
import { apiFetch } from '../../../../../services/api';

export default async function CapituloPage({ params }) {
  const { slug, capituloSlug } = await params;

  const respostaLivro = await apiFetch(
    `/api/livros/slug/${slug}`
  );

  const livro = respostaLivro.data;

  const respostaCapitulo = await apiFetch(
    `/api/capitulos/livro/${livro.id}/slug/${capituloSlug}`
  );

  const capitulo = respostaCapitulo.data;
  
  const respostaCenaInicial = await apiFetch(
    `/api/cenas/capitulo/${capitulo.id}/inicial`
  );

  const cenaInicial = respostaCenaInicial.data;

  return (
    <main className="min-h-screen bg-gray-200 p-6">
      <div className="mx-auto max-w-4xl">
       <Link 
        href={`/livros/${slug}`}
        className="mb-6 inline-block text-sm text-gray-500 hover:underline"
       >
          ← Voltar para o livro
       </Link> 

        <article className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="p-6">
            <p className="text-sm font-medium text-gray-500">
              {livro.titulo}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {capitulo.titulo}
            </h1>

            {capitulo.resumo && (
              <p className="mt-4 text-gray-600">
                {capitulo.resumo}
              </p>
            )}

            {capitulo.texto_introdutorio && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <p className="whitespace-pre-line leading-8 text-gray-700">
                  {capitulo.texto_introdutorio}
                </p>
              </div>
            )}
           <Link
              href={`/livros/${slug}/capitulos/${capituloSlug}/cenas/${cenaInicial.slug}`}
              className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
                Começar leitura
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
