
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../../../../../services/api';

export default function AudiosCena() {
const params = useParams();
const router = useRouter();

const { id, capituloId, cenaId } = params;

const [audios, setAudios] = useState([]);

const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState('');

const [mostrarFormulario, setMostrarFormulario] =
useState(false);

const [editandoId, setEditandoId] = useState(null);

const [titulo, setTitulo] = useState('');
const [legenda, setLegenda] = useState('');
const [descricao, setDescricao] = useState('');
const [audioUrl, setAudioUrl] = useState('');
const [reproducaoAutomatica, setReproducaoAutomatica] =
useState(false);
const [reproducaoEmLoop, setReproducaoEmLoop] =
useState(false);
const [ordemExibicao, setOrdemExibicao] = useState('');

const [salvando, setSalvando] = useState(false);
const [erroFormulario, setErroFormulario] = useState('');
const [sucesso, setSucesso] = useState('');

useEffect(() => {
async function carregarAudios() {
try {
setCarregando(true);
setErro('');

    const resposta = await apiFetch(
      `/api/cena-audios/cena/${cenaId}`
    );

    setAudios(
      (resposta.data || []).filter(
        (audio) => audio.ativo !== false
      )
    );
  } catch (error) {
    setErro(error.message);
  } finally {
    setCarregando(false);
  }
}

if (cenaId) {
  carregarAudios();
}

}, [cenaId]);

function limparFormulario() {
setTitulo('');
setLegenda('');
setDescricao('');
setAudioUrl('');
setReproducaoAutomatica(false);
setReproducaoEmLoop(false);

if (audios.length === 0) {
  setOrdemExibicao('1');
} else {
  const maiorOrdem = Math.max(
    ...audios.map(
      (audio) => Number(audio.ordem_exibicao)
    )
  );

  setOrdemExibicao(String(maiorOrdem + 1));
}

setEditandoId(null);
setErroFormulario('');

}

function abrirNovoAudio() {
limparFormulario();
setMostrarFormulario(true);
setSucesso('');
}

function abrirEdicao(audio) {
setEditandoId(audio.id);

setTitulo(audio.titulo || '');
setLegenda(audio.legenda || '');
setDescricao(audio.descricao || '');
setAudioUrl(audio.audio_url || '');
setReproducaoAutomatica(
  Boolean(audio.reproducao_automatica)
);
setReproducaoEmLoop(
  Boolean(audio.reproducao_em_loop)
);
setOrdemExibicao(
  String(audio.ordem_exibicao)
);

setErroFormulario('');
setSucesso('');
setMostrarFormulario(true);

}

function fecharFormulario() {
setMostrarFormulario(false);
limparFormulario();
}

async function salvarAudio(event) {
event.preventDefault();

try {
  setSalvando(true);
  setErroFormulario('');
  setSucesso('');

  if (editandoId) {
    const resposta = await apiFetch(
      `/api/cena-audios/${editandoId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          titulo,
          legenda: legenda || null,
          descricao: descricao || null,
          reproducao_automatica:
            reproducaoAutomatica,
          reproducao_em_loop:
            reproducaoEmLoop,
          ordem_exibicao:
            Number(ordemExibicao),
        }),
      }
    );

    setAudios((atuais) =>
      atuais.map((audio) =>
        audio.id === editandoId
          ? {
              ...audio,
              ...resposta.data,
            }
          : audio
      )
    );

    const audioAtual = audios.find(
      (audio) => audio.id === editandoId
    );

    if (
      audioAtual &&
      audioAtual.audio_url !== audioUrl
    ) {
      const respostaAudio = await apiFetch(
        `/api/cena-audios/${editandoId}/audio`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            audio_url: audioUrl,
          }),
        }
      );

      setAudios((atuais) =>
        atuais.map((audio) =>
          audio.id === editandoId
            ? {
                ...audio,
                ...respostaAudio.data,
              }
            : audio
        )
      );
    }

    setSucesso(
      'Áudio atualizado com sucesso.'
    );
  } else {
    const resposta = await apiFetch(
      '/api/cena-audios',
      {
        method: 'POST',
        body: JSON.stringify({
          cena_id: cenaId,
          titulo,
          legenda: legenda || null,
          descricao: descricao || null,
          audio_url: audioUrl,
          reproducao_automatica:
            reproducaoAutomatica,
          reproducao_em_loop:
            reproducaoEmLoop,
          ordem_exibicao:
            Number(ordemExibicao),
        }),
      }
    );

    setAudios((atuais) =>
      [...atuais, resposta.data].sort(
        (a, b) =>
          a.ordem_exibicao -
          b.ordem_exibicao
      )
    );

    setSucesso(
      'Áudio criado com sucesso.'
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

async function removerAudio(audio) {
const confirmar = window.confirm(
`Deseja realmente remover o áudio "${audio.titulo}"?`
);

if (!confirmar) {
  return;
}

try {
  setErro('');
  setSucesso('');

  await apiFetch(
    `/api/cena-audios/${audio.id}`,
    {
      method: 'DELETE',
    }
  );

  setAudios((atuais) =>
    atuais.filter(
      (item) => item.id !== audio.id
    )
  );

  setSucesso(
    'Áudio removido com sucesso.'
  );
} catch (error) {
  setErro(error.message);
}

}

if (carregando) {
return ( <main className="flex min-h-screen items-center justify-center bg-gray-100"> <p className="text-gray-600">
Carregando áudios... </p> </main>
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
        Áudios da cena
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Cadastre e organize os áudios que poderão
        fazer parte da composição da cena.
      </p>

    </header>

    <section className="rounded-lg bg-white shadow">

      <div className="flex items-center justify-between border-b border-gray-200 p-5 sm:p-6">

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Áudios cadastrados
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Estes áudios ficam disponíveis para serem
            adicionados à composição da cena.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNovoAudio}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Novo áudio
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

        {audios.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">

            <p className="text-sm text-gray-500">
              Esta cena ainda não possui áudios
              cadastrados.
            </p>

            <button
              type="button"
              onClick={abrirNovoAudio}
              className="mt-4 text-sm font-medium text-gray-900 hover:underline"
            >
              + Cadastrar o primeiro áudio
            </button>

          </div>
        ) : (
          <div className="space-y-4">

            {audios
              .slice()
              .sort(
                (a, b) =>
                  a.ordem_exibicao -
                  b.ordem_exibicao
              )
              .map((audio) => (
                <article
                  key={audio.id}
                  className="rounded-lg border border-gray-200 p-4"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-3">

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                          {audio.ordem_exibicao}
                        </span>

                        <div className="min-w-0">

                          <h3 className="font-semibold text-gray-900">
                            {audio.titulo}
                          </h3>

                          {audio.legenda && (
                            <p className="mt-1 text-sm text-gray-500">
                              {audio.legenda}
                            </p>
                          )}

                        </div>

                      </div>

                      {audio.descricao && (
                        <p className="mt-3 text-sm text-gray-600">
                          {audio.descricao}
                        </p>
                      )}

                      <audio
                        controls
                        src={audio.audio_url}
                        className="mt-4 w-full"
                      >
                        Seu navegador não suporta
                        reprodução de áudio.
                      </audio>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {audio.reproducao_automatica && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                            Reprodução automática
                          </span>
                        )}

                        {audio.reproducao_em_loop && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                            Reprodução em loop
                          </span>
                        )}

                      </div>

                      <p className="mt-3 break-all text-xs text-gray-400">
                        {audio.audio_url}
                      </p>

                    </div>

                    <div className="flex shrink-0 gap-3 sm:flex-col">

                      <button
                        type="button"
                        onClick={() =>
                          abrirEdicao(audio)
                        }
                        className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removerAudio(audio)
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
              ? 'Editar áudio'
              : 'Novo áudio'}
          </h2>

        </div>

        <form
          onSubmit={salvarAudio}
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
                URL do áudio
              </label>

              <input
                type="url"
                required
                value={audioUrl}
                onChange={(event) =>
                  setAudioUrl(event.target.value)
                }
                placeholder="http://localhost:3001/media/audios/..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />

              {audioUrl && (
                <audio
                  controls
                  src={audioUrl}
                  className="mt-3 w-full"
                >
                  Seu navegador não suporta
                  reprodução de áudio.
                </audio>
              )}

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
                  : 'Criar áudio'}
            </button>

          </div>

        </form>

      </section>
    )}

  </div>
</main>

);
}
