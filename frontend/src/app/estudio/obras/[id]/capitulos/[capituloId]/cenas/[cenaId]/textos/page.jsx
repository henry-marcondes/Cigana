'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../../../../../services/api';

export default function TextosCena() {
  const params = useParams();
  const router = useRouter();

  const { id, capituloId, cenaId } = params;

  const [textos, setTextos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [textoUrl, setTextoUrl] = useState('');
  const [criando, setCriando] = useState(false);
  const [erroCriacao, setErroCriacao] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [editandoId, setEditandoId] = useState(null);
  const [textoUrlEdicao, setTextoUrlEdicao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');

  useEffect(() => {
    async function carregarTextos() {
      try {
        setCarregando(true);
        setErro('');

        const resposta = await apiFetch(
          `/api/cena-textos/cena/${cenaId}`
        );

        setTextos(resposta.data || []);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    if (cenaId) {
      carregarTextos();
    }
  }, [cenaId]);

  async function criarTexto(event) {
    event.preventDefault();

    try {
      setCriando(true);
      setErroCriacao('');
      setSucesso('');

      const resposta = await apiFetch(
        '/api/cena-textos',
        {
          method: 'POST',
          body: JSON.stringify({
            cena_id: cenaId,
            texto_url: textoUrl,
          }),
        }
      );

      setTextos((atuais) => [
        ...atuais,
        resposta.data,
      ]);

      setTextoUrl('');
      setMostrarNovo(false);

      setSucesso(
        'Texto adicionado com sucesso.'
      );
    } catch (error) {
      setErroCriacao(error.message);
    } finally {
      setCriando(false);
    }
  }

  function iniciarEdicao(texto) {
    setErroEdicao('');
    setEditandoId(texto.id);
    setTextoUrlEdicao(texto.texto_url);
  }

  function cancelarEdicao() {
    if (salvando) {
      return;
    }

    setEditandoId(null);
    setTextoUrlEdicao('');
    setErroEdicao('');
  }

  async function salvarEdicao(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErroEdicao('');
      setSucesso('');

      const resposta = await apiFetch(
        `/api/cena-textos/${editandoId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            texto_url: textoUrlEdicao,
          }),
        }
      );

      setTextos((atuais) =>
        atuais.map((texto) =>
          texto.id === editandoId
            ? resposta.data
            : texto
        )
      );

      setEditandoId(null);
      setTextoUrlEdicao('');

      setSucesso(
        'Texto alterado com sucesso.'
      );
    } catch (error) {
      setErroEdicao(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function desativarTexto(textoId) {
    const confirmar = window.confirm(
      'Deseja realmente remover este texto da cena?'
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro('');
      setSucesso('');

      await apiFetch(
        `/api/cena-textos/${textoId}`,
        {
          method: 'DELETE',
        }
      );

      setTextos((atuais) =>
        atuais.filter(
          (texto) => texto.id !== textoId
        )
      );

      setSucesso(
        'Texto removido com sucesso.'
      );
    } catch (error) {
      setErro(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">

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
            Textos da cena
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Gerencie os arquivos de texto associados a esta cena.
          </p>

        </header>

        <section className="rounded-lg bg-white shadow">

          <div className="flex items-center justify-between border-b border-gray-200 p-5 sm:p-6">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Textos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Arquivos de texto utilizados pela cena.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMostrarNovo(!mostrarNovo);
                setErroCriacao('');
                setSucesso('');
              }}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              + Novo texto
            </button>

          </div>

          {sucesso && (
            <p className="border-b border-gray-200 px-5 py-4 text-sm text-green-700 sm:px-6">
              ✓ {sucesso}
            </p>
          )}

          {mostrarNovo && (
            <form
              onSubmit={criarTexto}
              className="border-b border-gray-200 bg-gray-50 p-5 sm:p-6"
            >

              <h3 className="font-semibold text-gray-900">
                Novo texto
              </h3>

              {erroCriacao && (
                <p className="mt-4 text-sm text-red-600">
                  {erroCriacao}
                </p>
              )}

              <div className="mt-5">

                <label className="block text-sm font-medium text-gray-700">
                  URL do texto
                </label>

                <input
                  type="text"
                  required
                  value={textoUrl}
                  onChange={(event) =>
                    setTextoUrl(event.target.value)
                  }
                  placeholder="/media/textos/..."
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                />

              </div>

              <div className="mt-5 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setMostrarNovo(false)}
                  disabled={criando}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={criando}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {criando ? 'Adicionando...' : 'Adicionar texto'}
                </button>

              </div>

            </form>
          )}

          <div className="p-5 sm:p-6">

            {carregando && (
              <p className="text-sm text-gray-500">
                Carregando textos...
              </p>
            )}

            {erro && (
              <p className="text-sm text-red-600">
                {erro}
              </p>
            )}

            {!carregando &&
              !erro &&
              textos.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Esta cena ainda não possui textos.
                  </p>
                </div>
              )}

            {!carregando &&
              textos.length > 0 && (
                <div className="space-y-3">

                  {textos.map((texto) => (

                    <div
                      key={texto.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >

                      {editandoId === texto.id ? (

                        <form onSubmit={salvarEdicao}>

                          <label className="block text-sm font-medium text-gray-700">
                            URL do texto
                          </label>

                          <input
                            type="text"
                            required
                            value={textoUrlEdicao}
                            onChange={(event) =>
                              setTextoUrlEdicao(
                                event.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                          />

                          {erroEdicao && (
                            <p className="mt-3 text-sm text-red-600">
                              {erroEdicao}
                            </p>
                          )}

                          <div className="mt-4 flex justify-end gap-3">

                            <button
                              type="button"
                              onClick={cancelarEdicao}
                              disabled={salvando}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Cancelar
                            </button>

                            <button
                              type="submit"
                              disabled={salvando}
                              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              {salvando
                                ? 'Salvando...'
                                : 'Salvar'}
                            </button>

                          </div>

                        </form>

                      ) : (

                        <div className="flex items-center justify-between gap-4">

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {texto.texto_url}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-3">

                            <button
                              type="button"
                              onClick={() =>
                                iniciarEdicao(texto)
                              }
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                desativarTexto(texto.id)
                              }
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remover
                            </button>

                          </div>

                        </div>

                      )}

                    </div>

                  ))}

                </div>
              )}

          </div>

        </section>

      </div>
    </main>
  );
}
