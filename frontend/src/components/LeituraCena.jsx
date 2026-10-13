import Link from 'next/link';
import CenaConteudo from './CenaConteudo';

export default function LeituraCena({
  livro,
  capitulo,
  cena,
  conteudos,
  escolhas,
  onSelecionarEscolha,
  onVoltar,
  linkVoltar,
  textoVoltar = '← Voltar para o capítulo',
}) {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        {onVoltar ? (
          <button
            type="button"
            onClick={onVoltar}
            className="mb-6 inline-block text-sm text-gray-600 hover:underline"
          >
            {textoVoltar}
          </button>
        ) : (
          <Link
            href={linkVoltar}
            className="mb-6 inline-block text-sm text-gray-600 hover:underline"
          >
            {textoVoltar}
          </Link>
        )}

        <article className="overflow-hidden rounded-lg bg-white shadow-md">
          <header className="border-b border-gray-200 p-8">
            <p className="text-sm font-medium text-gray-500">
              {livro.titulo}
            </p>
            <p className="mt-1 text-sm text-gray-500">{capitulo.titulo}</p>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {cena.titulo}
            </h1>
          </header>

          <div className="p-8">
            {conteudos.length === 0 ? (
              <p className="text-gray-600">
                Esta cena ainda não possui conteúdo.
              </p>
            ) : (
              <div className="space-y-8">
                {conteudos.map((conteudo) => (
                  <CenaConteudo key={conteudo.id} conteudo={conteudo} />
                ))}
              </div>
            )}

            {escolhas.length > 0 && (
              <section className="mt-10 border-t border-gray-200 pt-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  O que deseja fazer?
                </h2>
                <div className="flex flex-col gap-3">
                  {escolhas.map((escolha) => (
                    onSelecionarEscolha ? (
                      <button
                        key={escolha.id}
                        type="button"
                        onClick={() => onSelecionarEscolha(escolha)}
                        className="rounded-lg bg-primary px-5 py-3 text-center font-medium text-white transition hover:opacity-90"
                      >
                        {escolha.texto}
                      </button>
                    ) : (
                      <Link
                        key={escolha.id}
                        href={`/livros/${livro.slug}/capitulos/${escolha.capituloDestino.slug}/cenas/${escolha.cenaDestino.slug}`}
                        className="rounded-lg bg-primary px-5 py-3 text-center font-medium text-white transition hover:opacity-90"
                      >
                        {escolha.texto}
                      </Link>
                    )
                  ))}
                </div>
              </section>
            )}

            {escolhas.length === 0 && (
              <section className="mt-10 border-t border-gray-200 pt-6">
                <p className="text-center text-gray-600">Fim desta cena.</p>
                {onVoltar ? (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={onVoltar}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      ← Voltar para o capítulo
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <Link
                      href={linkVoltar}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      ← Voltar para o capítulo
                    </Link>
                  </div>
                )}
              </section>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
