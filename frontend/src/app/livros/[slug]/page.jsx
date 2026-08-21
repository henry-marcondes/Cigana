import Link from 'next/link';
import { apiFetch } from '../../../services/api';
import CapituloCard from '../../../components/CapituloCard';

export default async function LivroPage({ params }) {
  const { slug } = await params;

  const respostaLivro = await apiFetch(
    `/api/livros/slug/${slug}`
  );

  const livro = respostaLivro.data;

  const respostaCapitulos = await apiFetch(
    `/api/capitulos/livro/${livro.id}`
  );

  const capitulos = respostaCapitulos.data;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <Link
            href="/"
            className="mb-6 inline-block text-sm text-gray-600 hover:underline"
        >
            ← Voltar para a Biblioteca
        </Link>
        <section className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="flex min-h-64 items-center justify-center bg-gray-200">
            {livro.capa_url ? (
              <img
                src={livro.capa_url}
                alt={`Capa do livro ${livro.titulo}`}
                className="h-64 w-full object-cover"
              />
            ) : (
              <span className="text-gray-500">
                Capa não disponível
              </span>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {livro.titulo}
            </h1>

            {livro.resumo && (
              <p className="mt-4 text-gray-600">
                {livro.resumo}
              </p>
            )}

            {livro.ano_publicacao && (
              <p className="mt-4 text-sm text-gray-500">
                Publicado em {livro.ano_publicacao}
              </p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Capítulos
          </h2>

          {capitulos.length === 0 ? (
            <p className="text-gray-600">
              Nenhum capítulo disponível.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {capitulos.map((capitulo) => (
                <CapituloCard
                  key={capitulo.id}
                  livro={livro}
                  capitulo={capitulo}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
