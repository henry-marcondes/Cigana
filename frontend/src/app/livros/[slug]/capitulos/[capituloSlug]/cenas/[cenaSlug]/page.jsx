import Link from 'next/link';
import { apiFetch } from '../../../../../../../services/api';

export default async function CenaPage({ params }) {
  const { slug, capituloSlug, cenaSlug } = await params;

  const respostaLivro = await apiFetch(
    `/api/livros/slug/${slug}`
  );

  const livro = respostaLivro.data;

  const respostaCapitulo = await apiFetch(
    `/api/capitulos/livro/${livro.id}/slug/${capituloSlug}`
  );

  const capitulo = respostaCapitulo.data;

  const respostaCena = await apiFetch(
    `/api/cenas/capitulo/${capitulo.id}/slug/${cenaSlug}`
  );

  const cena = respostaCena.data;

  const respostaVideos = await apiFetch(
    `/api/cena-videos/cena/${cena.id}`
  );

  const videos = respostaVideos.data;

  const respostaAudios = await apiFetch(
    `/api/cena-audios/cena/${cena.id}`
  );

  const audios = respostaAudios.data;

  const respostaImagens = await apiFetch(
    `/api/cena-imagens/cena/${cena.id}`
  );

  const imagens = respostaImagens.data;

  const respostaEscolhas = await apiFetch(
    `/api/escolhas/cena/${cena.id}`
  );

  const escolhas = respostaEscolhas.data;

  const escolhasComDestino = await Promise.all(
  escolhas.map(async (escolha) => {
    const respostaDestino = await apiFetch(
      `/api/cenas/${escolha.cena_destino_id}`
    );

    return {
      ...escolha,
      cenaDestino: respostaDestino.data,
    };
  })
);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/livros/${slug}/capitulos/${capituloSlug}`}
          className="mb-6 inline-block text-sm text-gray-600 hover:underline"
        >
          ← Voltar para o capítulo
        </Link>

        <article className="rounded-lg bg-white p-8 shadow-md">
          <p className="text-sm font-medium text-gray-500">
            {livro.titulo}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {capitulo.titulo}
          </p>

          {imagens.length > 0 && (
            <div className="mt-6 space-y-6">
              {imagens.map((imagem) => (
                <figure key={imagem.id}>
                  <img
                    src={imagem.imagem_url}
                    alt={imagem.texto_alternativo || imagem.titulo}
                    className="mx-auto max-h-[600px] w-auto rounded-lg object-contain"
                  />

                  {imagem.legenda && (
                    <figcaption className="mt-2 text-center text-sm text-gray-500">
                      {imagem.legenda}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        
          {audios.length > 0 && (
            <div className="mt-8 space-y-4">
              {audios.map((audio) => (
                <div key={audio.id}>
                  <p className="mb-2 font-medium text-gray-800">
                    {audio.titulo}
                  </p>

                  {audio.legenda && (
                    <p className="mb-2 text-sm text-gray-500">
                      {audio.legenda}
                    </p>
                  )}

                  <audio
                    controls
                    autoPlay={audio.reproducao_automatica}
                    loop={audio.reproducao_em_loop}
                    className="w-full"
                  >
                  <source
                    src={
                        audio.audio_url.startsWith('http')
                        ? audio.audio_url
                        : `http://localhost:3001/${audio.audio_url
                        .replace(/^.*?media\//, 'media/')
                        .replace(/^\/+/, '')}`
                    }
                    type="audio/mpeg"
                  />
                     Seu navegador não suporta o elemento de áudio.
                 ':w-full</audio>
              </div>
            ))}
          </div>
          )}

          {videos.length > 0 && (
            <div className="mt-8 space-y-6">
                {videos.map((video) => (
                    <figure key={video.id}>
                    <video
                        controls
                        autoPlay={video.reproducao_automatica}
                        loop={video.reproducao_em_loop}
                        poster={
                            video.miniatura_url
                            ? `http://localhost:3001/${video.miniatura_url
                            .replace(/^.*?media\//, 'media/')
                            .replace(/^\/+/, '')}`
                            : undefined
                        }
                    className="mx-auto w-full rounded-lg"
                    >
                    <source
                        src={
                            video.video_url.startsWith('http')
                            ? video.video_url
                            : `http://localhost:3001/${video.video_url
                            .replace(/^.*?media\//, 'media/')
                            .replace(/^\/+/, '')}`
                        }
                    type="video/mp4"
                    />

                     Seu navegador não suporta o elemento de vídeo.
                    </video>

                {video.legenda && (
                    <figcaption className="mt-2 text-center text-sm text-gray-500">
                        {video.legenda}
                    </figcaption>
                )}
            </figure>
            ))}
            </div>
        )}

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {cena.titulo}
          </h1>

          <div className="mt-8 whitespace-pre-line text-lg leading-8 text-gray-700">
            {cena.texto}
            {escolhasComDestino.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  O que deseja fazer?
                </h2>

                <div className="flex flex-col gap-3">
                  {escolhasComDestino.map((escolha) => (
                    <Link
                      key={escolha.id}
                      href={`/livros/${slug}/capitulos/${capituloSlug}/cenas/${escolha.cenaDestino.slug}`}
                      className="rounded-lg bg-primary px-5 py-3 text-center font-medium text-white transition hover:opacity-90"
                    >
                      {escolha.texto}
                   </Link>
                ))}
            </div>
          </div>
        )}
        {escolhasComDestino.length === 0 && (
          <div className="mt-10 border-t border-gray-200 pt-6">
            <p className="text-center text-gray-600">
                Fim desta cena.
            </p>

            <div className="mt-4 text-center">
              <Link
                href={`/livros/${slug}/capitulos/${capituloSlug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                ← Voltar para o capítulo
              </Link>
            </div>
          </div>
        )}
          </div>
        </article>
      </div>
    </main>
  );
}
