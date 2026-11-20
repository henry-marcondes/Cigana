import Link from 'next/link';
import { useEffect, useState } from 'react';
import { obterUrlAssinadaArquivo } from '../services/arquivoMidia';

export default function CapituloCard({ livro, capitulo, onSelect }) {
  const [urlCapa, setUrlCapa] = useState(capitulo.capa_url || '');

  useEffect(() => {
    let ativo = true;
    if (!capitulo.arquivo_capa_id) {
      setUrlCapa(capitulo.capa_url || '');
      return () => { ativo = false; };
    }
    obterUrlAssinadaArquivo(capitulo.arquivo_capa_id)
      .then((url) => { if (ativo) setUrlCapa(url); })
      .catch(() => { if (ativo) setUrlCapa(''); });
    return () => { ativo = false; };
  }, [capitulo.arquivo_capa_id, capitulo.capa_url]);

  const conteudo = (
    <article className="overflow-hidden rounded-lg bg-white text-left shadow-md transition hover:scale-[1.02]">
        <div className="flex h-40 items-center justify-center bg-gray-200">
          {urlCapa ? (
            <img
              src={urlCapa}
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
