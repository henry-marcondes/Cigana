
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../../../../../services/api';

export default function ImagensCena() {
  const params = useParams();
  const router = useRouter();

  const { id, capituloId, cenaId } = params;

  const [imagens, setImagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [mostrarNova, setMostrarNova] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [legenda, setLegenda] = useState('');
  const [textoAlternativo, setTextoAlternativo] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [ordemExibicao, setOrdemExibicao] = useState(1);

  const [criando, setCriando] = useState(false);
  const [erroCriacao, setErroCriacao] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [editandoId, setEditandoId] = useState(null);

  const [tituloEdicao, setTituloEdicao] = useState('');
  const [legendaEdicao, setLegendaEdicao] = useState('');
  const [textoAlternativoEdicao, setTextoAlternativoEdicao] = useState('');
  const [ordemExibicaoEdicao, setOrdemExibicaoEdicao] = useState(1);
  const [imagemUrlEdicao, setImagemUrlEdicao] = useState('');

  const [salvandoInformacoes, setSalvandoInformacoes] = useState(false);
  const [salvandoImagem, setSalvandoImagem] = useState(false);

  const [erroEdicao, setErroEdicao] = useState('');

  useEffect(() => {
    async function carregarImagens() {
      try {
        setCarregando(true);
        setErro('');

        const resposta = await apiFetch(
          `/api/cena-imagens/cena/${cenaId}`
        );

        setImagens(resposta.data || []);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    if (cenaId) {
      carregarImagens();
    }
  }, [cenaId]);

  async function criarImagem(event) {
    event.preventDefault();

    try {
      setCriando(true);
      setErroCriacao('');
      setSucesso('');

      const resposta = await apiFetch(
        '/api/cena-imagens',
        {
          method: 'POST',
          body: JSON.stringify({
            cena_id: cenaId,
            titulo,
            legenda: legenda || null,
            texto_alternativo: textoAlternativo,
            imagem_url: imagemUrl,
            ordem_exibicao: Number(ordemExibicao),
          }),
        }
      );

      setImagens((atuais) => [
        ...atuais,
        resposta.data,
      ]);

      setTitulo('');
      setLegenda('');
      setTextoAlternativo('');
      setImagemUrl('');
      setOrdemExibicao(1);
      setMostrarNova(false);

      setSucesso(
        'Imagem adicionada com sucesso.'
      );
    } catch (error) {
      setErroCriacao(error.message);
    } finally {
      setCriando(false);
    }
  }

  function iniciarEdicao(imagem) {
    setErroEdicao('');
    setEditandoId(imagem.id);

    setTituloEdicao(imagem.titulo || '');
    setLegendaEdicao(imagem.legenda || '');
    setTextoAlternativoEdicao(
      imagem.texto_alternativo || ''
    );
    setOrdemExibicaoEdicao(
      imagem.ordem_exibicao || 1
    );
    setImagemUrlEdicao(
      imagem.imagem_url || ''
    );
  }

  function cancelarEdicao() {
    if (salvandoInformacoes || salvandoImagem) {
      return;
    }

    setEditandoId(null);

    setTituloEdicao('');
    setLegendaEdicao('');
    setTextoAlternativoEdicao('');
    setOrdemExibicaoEdicao(1);
    setImagemUrlEdicao('');

    setErroEdicao('');
  }

  async function salvarInformacoes(event) {
    event.preventDefault();

    try {
      setSalvandoInformacoes(true);
      setErroEdicao('');
      setSucesso('');

      const resposta = await apiFetch(
        `/api/cena-imagens/${editandoId}/informacoes`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            titulo: tituloEdicao,
            legenda: legendaEdicao || null,
            texto_alternativo: textoAlternativoEdicao,
            ordem_exibicao: Number(
              ordemExibicaoEdicao
            ),
          }),
        }
      );

      setImagens((atuais) =>
        atuais.map((imagem) =>
          imagem.id === editandoId
            ? resposta.data
            : imagem
        )
      );

      setSucesso(
        'Informações da imagem alteradas com sucesso.'
      );
    } catch (error) {
      setErroEdicao(error.message);
    } finally {
      setSalvandoInformacoes(false);
    }
  }

  async function salvarImagem(event) {
    event.preventDefault();

    try {
      setSalvandoImagem(true);
      setErroEdicao('');
      setSucesso('');

      const resposta = await apiFetch(
        `/api/cena-imagens/${editandoId}/imagem`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            imagem_url: imagemUrlEdicao,
          }),
        }
      );

      setImagens((atuais) =>
        atuais.map((imagem) =>
          imagem.id === editandoId
            ? resposta.data
            : imagem
        )
      );

      setSucesso(
        'Imagem alterada com sucesso.'
      );
    } catch (error) {
      setErroEdicao(error.message);
    } finally {
      setSalvandoImagem(false);
    }
  }

  async function desativarImagem(imagemId) {
    const confirmar = window.confirm(
      'Deseja realmente remover esta imagem da cena?'
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro('');
      setSucesso('');

      await apiFetch(
        `/api/cena-imagens/${imagemId}`,
        {
          method: 'DELETE',
        }
      );

      setImagens((atuais) =>
        atuais.filter(
          (imagem) => imagem.id !== imagemId
        )
      );

      if (editandoId === imagemId) {
        cancelarEdicao();
      }

      setSucesso(
        'Imagem removida com sucesso.'
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
            Imagens da cena
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Gerencie as imagens associadas a esta cena.
          </p>

        </header>

        <section className="rounded-lg bg-white shadow">

          <div className="flex items-center justify-between border-b border-gray-200 p-5 sm:p-6">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Imagens
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Imagens utilizadas pela cena.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMostrarNova(!mostrarNova);
                setErroCriacao('');
                setSucesso('');
              }}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              + Nova imagem
            </button>

          </div>

          {sucesso && (
            <p className="border-b border-gray-200 px-5 py-4 text-sm text-green-700 sm:px-6">
              ✓ {sucesso}
            </p>
          )}

          {mostrarNova && (
            <form
              onSubmit={criarImagem}
              className="border-b border-gray-200 bg-gray-50 p-5 sm:p-6"
            >

              <h3 className="font-semibold text-gray-900">
                Nova imagem
              </h3>

              {erroCriacao && (
                <p className="mt-4 text-sm text-red-600">
                  {erroCriacao}
                </p>
              )}

              <div className="mt-5 grid gap-5">

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
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
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
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Texto alternativo
                  </label>

                  <input
                    type="text"
                    required
                    value={textoAlternativo}
                    onChange={(event) =>
                      setTextoAlternativo(
                        event.target.value
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URL da imagem
                  </label>

                  <input
                    type="text"
                    required
                    value={imagemUrl}
                    onChange={(event) =>
                      setImagemUrl(event.target.value)
                    }
                    placeholder="http://localhost:3001/media/imagens/..."
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                  />
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
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                  />
                </div>

              </div>

              <div className="mt-5 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setMostrarNova(false)}
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
                  {criando
                    ? 'Adicionando...'
                    : 'Adicionar imagem'}
                </button>

              </div>

            </form>
          )}

          <div className="p-5 sm:p-6">

            {carregando && (
              <p className="text-sm text-gray-500">
                Carregando imagens...
              </p>
            )}

            {erro && (
              <p className="text-sm text-red-600">
                {erro}
              </p>
            )}

            {!carregando &&
              !erro &&
              imagens.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Esta cena ainda não possui imagens.
                  </p>
                </div>
              )}

            {!carregando &&
              imagens.length > 0 && (
                <div className="space-y-3">

                  {imagens.map((imagem) => (

                    <div
                      key={imagem.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >

                      {editandoId === imagem.id ? (

                        <div>

                          <form onSubmit={salvarInformacoes}>

                            <h3 className="font-semibold text-gray-900">
                              Editar informações
                            </h3>

                            <div className="mt-5 grid gap-5">

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Título
                                </label>

                                <input
                                  type="text"
                                  required
                                  value={tituloEdicao}
                                  onChange={(event) =>
                                    setTituloEdicao(
                                      event.target.value
                                    )
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
                                  value={legendaEdicao}
                                  onChange={(event) =>
                                    setLegendaEdicao(
                                      event.target.value
                                    )
                                  }
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Texto alternativo
                                </label>

                                <input
                                  type="text"
                                  required
                                  value={textoAlternativoEdicao}
                                  onChange={(event) =>
                                    setTextoAlternativoEdicao(
                                      event.target.value
                                    )
                                  }
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Ordem de exibição
                                </label>

                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={ordemExibicaoEdicao}
                                  onChange={(event) =>
                                    setOrdemExibicaoEdicao(
                                      event.target.value
                                    )
                                  }
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                                />
                              </div>

                            </div>

                            {erroEdicao && (
                              <p className="mt-4 text-sm text-red-600">
                                {erroEdicao}
                              </p>
                            )}

                            <div className="mt-5 flex justify-end gap-3">

                              <button
                                type="button"
                                onClick={cancelarEdicao}
                                disabled={
                                  salvandoInformacoes ||
                                  salvandoImagem
                                }
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                Cancelar
                              </button>

                              <button
                                type="submit"
                                disabled={salvandoInformacoes}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                              >
                                {salvandoInformacoes
                                  ? 'Salvando...'
                                  : 'Salvar informações'}
                              </button>

                            </div>

                          </form>

                          <form
                            onSubmit={salvarImagem}
                            className="mt-8 border-t border-gray-200 pt-6"
                          >

                            <h3 className="font-semibold text-gray-900">
                              Imagem
                            </h3>

                            <div className="mt-5">

                              <label className="block text-sm font-medium text-gray-700">
                                URL da imagem
                              </label>

                              <input
                                type="text"
                                required
                                value={imagemUrlEdicao}
                                onChange={(event) =>
                                  setImagemUrlEdicao(
                                    event.target.value
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                              />

                            </div>

                            <div className="mt-5 flex justify-end">

                              <button
                                type="submit"
                                disabled={salvandoImagem}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                              >
                                {salvandoImagem
                                  ? 'Salvando...'
                                  : 'Salvar imagem'}
                              </button>

                            </div>

                          </form>

                        </div>

                      ) : (

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div className="min-w-0">

                            <div className="mb-3 overflow-hidden rounded-lg bg-gray-100">
                              <img
                                src={imagem.imagem_url}
                                alt={
                                  imagem.texto_alternativo ||
                                  imagem.titulo ||
                                  'Imagem da cena'
                                }
                                className="max-h-64 w-full object-contain"
                              />
                            </div>

                            <p className="text-sm font-medium text-gray-900">
                              {imagem.titulo}
                            </p>

                            {imagem.legenda && (
                              <p className="mt-1 text-sm text-gray-500">
                                {imagem.legenda}
                              </p>
                            )}

                            <p className="mt-1 text-xs text-gray-400">
                              Ordem: {imagem.ordem_exibicao}
                            </p>

                            <p className="mt-2 break-all text-xs text-gray-400">
                              {imagem.imagem_url}
                            </p>

                          </div>

                          <div className="flex shrink-0 gap-3">

                            <button
                              type="button"
                              onClick={() =>
                                iniciarEdicao(imagem)
                              }
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                desativarImagem(imagem.id)
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
