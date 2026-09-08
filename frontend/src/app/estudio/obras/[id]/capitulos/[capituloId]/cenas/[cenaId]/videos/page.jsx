
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../../../../../services/api';

export default function VideosCena() {
const params = useParams();
const router = useRouter();

const { id, capituloId, cenaId } = params;

const [videos, setVideos] = useState([]);

const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState('');

const [mostrarFormulario, setMostrarFormulario] =
useState(false);

const [editandoId, setEditandoId] = useState(null);

const [titulo, setTitulo] = useState('');
const [legenda, setLegenda] = useState('');
const [descricao, setDescricao] = useState('');
const [videoUrl, setVideoUrl] = useState('');
const [miniaturaUrl, setMiniaturaUrl] = useState('');
const [reproducaoAutomatica, setReproducaoAutomatica] =
useState(false);
const [reproducaoEmLoop, setReproducaoEmLoop] =
useState(false);
const [ordemExibicao, setOrdemExibicao] = useState('');

const [salvando, setSalvando] = useState(false);
const [erroFormulario, setErroFormulario] = useState('');
const [sucesso, setSucesso] = useState('');

useEffect(() => {
async function carregarVideos() {
try {
setCarregando(true);
setErro('');

    const resposta = await apiFetch(
      `/api/cena-videos/cena/${cenaId}`
    );

    setVideos(
      (resposta.data || []).filter(
        (video) => video.ativo !== false
      )
    );
  } catch (error) {
    setErro(error.message);
  } finally {
    setCarregando(false);
  }
}

if (cenaId) {
  carregarVideos();
}

}, [cenaId]);

function calcularProximaOrdem() {
if (videos.length === 0) {
return 1;
}

const maiorOrdem = Math.max(
  ...videos.map(
    (video) => Number(video.ordem_exibicao)
  )
);

return maiorOrdem + 1;

}

function limparFormulario() {
setTitulo('');
setLegenda('');
setDescricao('');
setVideoUrl('');
setMiniaturaUrl('');
setReproducaoAutomatica(false);
setReproducaoEmLoop(false);
setOrdemExibicao(
String(calcularProximaOrdem())
);

setEditandoId(null);
setErroFormulario('');

}

function abrirNovoVideo() {
limparFormulario();
setMostrarFormulario(true);
setSucesso('');
}

function abrirEdicao(video) {
setEditandoId(video.id);

setTitulo(video.titulo || '');
setLegenda(video.legenda || '');
setDescricao(video.descricao || '');
setVideoUrl(video.video_url || '');
setMiniaturaUrl(video.miniatura_url || '');
setReproducaoAutomatica(
  Boolean(video.reproducao_automatica)
);
setReproducaoEmLoop(
  Boolean(video.reproducao_em_loop)
);
setOrdemExibicao(
  String(video.ordem_exibicao)
);

setErroFormulario('');
setSucesso('');
setMostrarFormulario(true);

}

function fecharFormulario() {
setMostrarFormulario(false);
limparFormulario();
}

async function salvarVideo(event) {
event.preventDefault();

try {
  setSalvando(true);
  setErroFormulario('');
  setSucesso('');

  if (editandoId) {
    const resposta = await apiFetch(
      `/api/cena-videos/${editandoId}/informacoes`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          titulo,
          legenda: legenda || null,
          descricao: descricao || null,
          miniatura_url:
            miniaturaUrl || null,
          reproducao_automatica:
            reproducaoAutomatica,
          reproducao_em_loop:
            reproducaoEmLoop,
          ordem_exibicao:
            Number(ordemExibicao),
        }),
      }
    );

    setVideos((atuais) =>
      atuais.map((video) =>
        video.id === editandoId
          ? {
              ...video,
              ...resposta.data,
            }
          : video
      )
    );

    const videoAtual = videos.find(
      (video) => video.id === editandoId
    );

    if (
      videoAtual &&
      videoAtual.video_url !== videoUrl
    ) {
      const respostaVideo = await apiFetch(
        `/api/cena-videos/${editandoId}/video`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            video_url: videoUrl,
          }),
        }
      );

      setVideos((atuais) =>
        atuais.map((video) =>
          video.id === editandoId
            ? {
                ...video,
                ...respostaVideo.data,
              }
            : video
        )
      );
    }

    setSucesso(
      'Vídeo atualizado com sucesso.'
    );
  } else {
    const resposta = await apiFetch(
      '/api/cena-videos',
      {
        method: 'POST',
        body: JSON.stringify({
          cena_id: cenaId,
          titulo,
          legenda: legenda || null,
          descricao: descricao || null,
          video_url: videoUrl,
          miniatura_url:
            miniaturaUrl || null,
          reproducao_automatica:
            reproducaoAutomatica,
          reproducao_em_loop:
            reproducaoEmLoop,
          ordem_exibicao:
            Number(ordemExibicao),
        }),
      }
    );

    setVideos((atuais) =>
      [...atuais, resposta.data].sort(
        (a, b) =>
          a.ordem_exibicao -
          b.ordem_exibicao
      )
    );

    setSucesso(
      'Vídeo criado com sucesso.'
    );
  }

  setMostrarFormulario(false);
  limparFormulario();
} catch (error) {
  setErroFormulario(error.message);
} finally {
  setSalvando(false);
}

}

async function removerVideo(video) {
const confirmar = window.confirm(
`Deseja realmente remover o vídeo "${video.titulo}"?`
);

if (!confirmar) {
  return;
}

try {
  setErro('');
  setSucesso('');

  await apiFetch(
    `/api/cena-videos/${video.id}`,
    {
      method: 'DELETE',
    }
  );

  setVideos((atuais) =>
    atuais.filter(
      (item) => item.id !== video.id
    )
  );

  setSucesso(
    'Vídeo removido com sucesso.'
  );
} catch (error) {
  setErro(error.message);
}

}

if (carregando) {
return ( <main className="flex min-h-screen items-center justify-center bg-gray-100"> <p className="text-gray-600">
Carregando vídeos... </p> </main>
);
}

return ( <main className="min-h-screen bg-gray-100 p-4 sm:p-6"> <div className="mx-auto max-w-4xl">

    <header className="mb-6">

      <button
        type="button"
        onClick={() =>
          router.push(
            `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cenaId}`
          )
        }
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        ← Cena
      </button>

      <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        Vídeos da cena
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Cadastre e organize os vídeos que poderão
        fazer parte da composição da cena.
      </p>

    </header>

    <section className="rounded-lg bg-white shadow">

      <div className="flex items-center justify-between border-b border-gray-200 p-5 sm:p-6">

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Vídeos cadastrados
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Estes vídeos ficam disponíveis para serem
            adicionados à composição da cena.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNovoVideo}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Novo vídeo
        </button>

      </div>

      {erro && (
        <p className="border-b border-gray-200 px-5 py-4 text-sm text-red-600 sm:px-6">
          {erro}
        </p>
      )}

      {sucesso && (
        <p className="border-b border-gray-200 px-5 py-4 text-sm text-green-700 sm:px-6">
          ✓ {sucesso}
        </p>
      )}

      <div className="p-5 sm:p-6">

        {videos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">

            <p className="text-sm text-gray-500">
              Esta cena ainda não possui vídeos
              cadastrados.
            </p>

            <button
              type="button"
              onClick={abrirNovoVideo}
              className="mt-4 text-sm font-medium text-gray-900 hover:underline"
            >
              + Cadastrar o primeiro vídeo
            </button>

          </div>
        ) : (
          <div className="space-y-4">

            {videos
              .slice()
              .sort(
                (a, b) =>
                  a.ordem_exibicao -
                  b.ordem_exibicao
              )
              .map((video) => (
                <article
                  key={video.id}
                  className="rounded-lg border border-gray-200 p-4"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-3">

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                          {video.ordem_exibicao}
                        </span>

                        <div className="min-w-0">

                          <h3 className="font-semibold text-gray-900">
                            {video.titulo}
                          </h3>

                          {video.legenda && (
                            <p className="mt-1 text-sm text-gray-500">
                              {video.legenda}
                            </p>
                          )}

                        </div>

                      </div>

                      {video.descricao && (
                        <p className="mt-3 text-sm text-gray-600">
                          {video.descricao}
                        </p>
                      )}

                      <video
                        controls
                        src={video.video_url}
                        poster={
                          video.miniatura_url ||
                          undefined
                        }
                        className="mt-4 max-h-[500px] w-full rounded-lg bg-black"
                      >
                        Seu navegador não suporta
                        reprodução de vídeo.
                      </video>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {video.reproducao_automatica && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                            Reprodução automática
                          </span>
                        )}

                        {video.reproducao_em_loop && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                            Reprodução em loop
                          </span>
                        )}

                      </div>

                      <p className="mt-3 break-all text-xs text-gray-400">
                        {video.video_url}
                      </p>

                    </div>

                    <div className="flex shrink-0 gap-3 sm:flex-col">

                      <button
                        type="button"
                        onClick={() =>
                          abrirEdicao(video)
                        }
                        className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removerVideo(video)
                        }
                        className="text-sm text-red-600 hover:text-red-800 hover:underline"
                      >
                        Remover
                      </button>

                    </div>

                  </div>

                </article>
              ))}

          </div>
        )}

      </div>

    </section>

    {mostrarFormulario && (
      <section className="mt-6 rounded-lg bg-white shadow">

        <div className="border-b border-gray-200 p-5 sm:p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            {editandoId
              ? 'Editar vídeo'
              : 'Novo vídeo'}
          </h2>

        </div>

        <form
          onSubmit={salvarVideo}
          className="p-5 sm:p-6"
        >

          <div className="space-y-5">

            <div>

              <label className="block text-sm font-medium text-gray-700">
                Título
              </label>

              <input
                type="text"
                required
                value={titulo}
                onChange={(event) =>
                  setTitulo(event.target.value)
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700">
                Legenda
              </label>

              <input
                type="text"
                value={legenda}
                onChange={(event) =>
                  setLegenda(event.target.value)
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>

              <textarea
                value={descricao}
                onChange={(event) =>
                  setDescricao(event.target.value)
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700">
                URL do vídeo
              </label>

              <input
                type="url"
                required
                value={videoUrl}
                onChange={(event) =>
                  setVideoUrl(event.target.value)
                }
                placeholder="http://localhost:3001/media/videos/..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />

              {videoUrl && (
                <video
                  controls
                  src={videoUrl}
                  poster={
                    miniaturaUrl || undefined
                  }
                  className="mt-3 max-h-[400px] w-full rounded-lg bg-black"
                >
                  Seu navegador não suporta
                  reprodução de vídeo.
                </video>
              )}

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700">
                URL da miniatura
              </label>

              <input
                type="url"
                value={miniaturaUrl}
                onChange={(event) =>
                  setMiniaturaUrl(
                    event.target.value
                  )
                }
                placeholder="http://localhost:3001/media/imagens/..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />

            </div>

            <div className="space-y-3">

              <label className="flex items-center gap-3 text-sm text-gray-700">

                <input
                  type="checkbox"
                  checked={reproducaoAutomatica}
                  onChange={(event) =>
                    setReproducaoAutomatica(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                Reprodução automática

              </label>

              <label className="flex items-center gap-3 text-sm text-gray-700">

                <input
                  type="checkbox"
                  checked={reproducaoEmLoop}
                  onChange={(event) =>
                    setReproducaoEmLoop(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                Reprodução em loop

              </label>

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700">
                Ordem de exibição
              </label>

              <input
                type="number"
                min="1"
                required
                value={ordemExibicao}
                onChange={(event) =>
                  setOrdemExibicao(
                    event.target.value
                  )
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />

            </div>

          </div>

          {erroFormulario && (
            <p className="mt-5 text-sm text-red-600">
              {erroFormulario}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={fecharFormulario}
              disabled={salvando}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando
                ? 'Salvando...'
                : editandoId
                  ? 'Salvar alterações'
                  : 'Criar vídeo'}
            </button>

          </div>

        </form>

      </section>
    )}

  </div>
</main>

);
}
