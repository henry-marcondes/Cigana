'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { listarCapitulosPorLivro } from '../../../../services/capitulo';

import { apiFetch } from '../../../../services/api';

export default function EditarObra() {
  const params = useParams();
  const router = useRouter();

  const { id } = params;

  const [obra, setObra] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [capitulos, setCapitulos] = useState([]);
  const [carregandoCapitulos, setCarregandoCapitulos] = useState(false);
  const [erroCapitulos, setErroCapitulos] = useState('');
  const [mostrarNovoCapitulo, setMostrarNovoCapitulo] = useState(false);
  const [novoCapitulo, setNovoCapitulo] = useState({
    titulo: '',
    slug: '',
    resumo: '',
    texto_introdutorio: '',
    capa_url: '',
  });
  const [criandoCapitulo, setCriandoCapitulo] = useState(false);
  const [erroCriacaoCapitulo, setErroCriacaoCapitulo] = useState('');

  useEffect(() => {
    async function carregarObra() {
      try {
        const resposta = await apiFetch(`/api/livros/${id}`);

        setObra(resposta.data);
        const respostaCapitulos = await listarCapitulosPorLivro(id);
        setCapitulos(respostaCapitulos.data);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    if (id) {
      carregarObra();
    }
  }, [id]);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Carregando obra...
        </p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">

          <button
            onClick={() => router.push('/estudio')}
            className="mb-6 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Voltar para o Estúdio
          </button>

          <section className="rounded-lg bg-white p-6 shadow">
            <h1 className="text-2xl font-bold text-gray-900">
              Editar obra
            </h1>

            <p className="mt-4 text-red-600">
              {erro}
            </p>
          </section>

        </div>
      </main>
    );
  }

  async function carregarCapitulos() {
    try {
      setCarregandoCapitulos(true);
      setErroCapitulos('');

      const resposta = await listarCapitulosPorLivro(id);

      setCapitulos(resposta.data);
      setMostrarCapitulos(true);
    } catch (error) {
      setErroCapitulos(error.message);
    } finally {
      setCarregandoCapitulos(false);
    }
  }

  async function criarCapitulo(event) {
  event.preventDefault();

  try {
    setCriandoCapitulo(true);
    setErroCriacaoCapitulo('');

    const maiorOrdem = capitulos.reduce(
      (maior, capitulo) =>
        Math.max(maior, Number(capitulo.ordem_exibicao) || 0),
      0
    );

    const resposta = await apiFetch('/api/capitulos', {
      method: 'POST',
      body: JSON.stringify({
        livro_id: id,
        titulo: novoCapitulo.titulo,
        slug: novoCapitulo.slug,
        resumo: novoCapitulo.resumo || null,
        texto_introdutorio: novoCapitulo.texto_introdutorio || null,
        capa_url: novoCapitulo.capa_url || null,
        ordem_exibicao: maiorOrdem + 1,
      }),
    });

    setCapitulos((capitulosAtuais) => [
      ...capitulosAtuais,
      resposta.data,
    ]);

    setNovoCapitulo({
      titulo: '',
      slug: '',
      resumo: '',
      texto_introdutorio: '',
      capa_url: '',
    });

    setMostrarNovoCapitulo(false);

  } catch (error) {
    setErroCriacaoCapitulo(error.message);
  } finally {
    setCriandoCapitulo(false);
  }
}

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">

        {/* Cabeçalho */}
        <header className="mb-6">

          <div className="flex items-center justify-between">

            <button
              onClick={() => router.push('/estudio')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Estúdio
            </button>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-red-200 text-gray-700 hover:bg-red-50"
              aria-label="Ajuda"
              title="Ajuda"
            >
              ?
            </button>

          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
            Editar obra
          </h1>

        </header>

        {/* Identificação da obra */}
        <section className="rounded-lg bg-white p-5 shadow sm:p-6">

          {obra.capa_url && (
            <div className="mb-6 flex justify-center">
              <img
                src={obra.capa_url}
                alt={`Capa de ${obra.titulo}`}
                className="h-56 w-auto max-w-full rounded-lg object-cover shadow sm:h-64"
              />
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900">
            {obra.titulo}
          </h2>

          {obra.resumo && (
            <p className="mt-3 text-gray-600">
              {obra.resumo}
            </p>
          )}

        </section>

{/* Estrutura da obra — Capítulos */}
<section className="mt-5 rounded-lg bg-white shadow">

  <div className="border-b border-gray-200 p-5 sm:p-6">

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Capítulos
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Criar e organizar os capítulos da obra.
        </p>
      </div>

      <div className="flex gap-2">

        <button
          type="button"
          onClick={() => setMostrarNovoCapitulo(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Novo capítulo
        </button>

        <button
          type="button"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Organizar
        </button>

      </div>

    </div>

  </div>

    {/* Formulário de novo capítulo */}
{mostrarNovoCapitulo && (
  <form
    onSubmit={criarCapitulo}
    className="border-b border-gray-200 p-5 sm:p-6"
  >

    <div className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Título
        </label>

        <input
          type="text"
          value={novoCapitulo.titulo}
          onChange={(e) =>
            setNovoCapitulo({
              ...novoCapitulo,
              titulo: e.target.value,
            })
          }
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Slug
        </label>

        <input
          type="text"
          value={novoCapitulo.slug}
          onChange={(e) =>
            setNovoCapitulo({
              ...novoCapitulo,
              slug: e.target.value,
            })
          }
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Resumo
        </label>

        <textarea
          value={novoCapitulo.resumo}
          onChange={(e) =>
            setNovoCapitulo({
              ...novoCapitulo,
              resumo: e.target.value,
            })
          }
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Texto introdutório
        </label>

        <textarea
          value={novoCapitulo.texto_introdutorio}
          onChange={(e) =>
            setNovoCapitulo({
              ...novoCapitulo,
              texto_introdutorio: e.target.value,
            })
          }
          rows={4}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          URL da capa
        </label>

        <input
          type="text"
          value={novoCapitulo.capa_url}
          onChange={(e) =>
            setNovoCapitulo({
              ...novoCapitulo,
              capa_url: e.target.value,
            })
          }
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      {erroCriacaoCapitulo && (
        <p className="text-sm text-red-600">
          {erroCriacaoCapitulo}
        </p>
      )}

      <div className="flex gap-2 pt-2">

        <button
          type="submit"
          disabled={criandoCapitulo}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {criandoCapitulo ? 'Criando...' : 'Criar capítulo'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMostrarNovoCapitulo(false);
            setErroCriacaoCapitulo('');
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>

      </div>

    </div>

  </form>
)}

  {/* Lista de capítulos */}
  <div className="p-5 sm:p-6">

    {carregandoCapitulos && (
      <p className="text-sm text-gray-500">
        Carregando capítulos...
      </p>
    )}

    {erroCapitulos && (
      <p className="text-sm text-red-600">
        {erroCapitulos}
      </p>
    )}

    {!carregandoCapitulos &&
      !erroCapitulos &&
      capitulos.length === 0 && (
        <p className="text-sm text-gray-500">
          Esta obra ainda não possui capítulos.
        </p>
      )}

    {!carregandoCapitulos &&
      !erroCapitulos &&
      capitulos.length > 0 && (
        <div className="space-y-3">

          {capitulos.map((capitulo) => (
            <button
              key={capitulo.id}
              type="button"
              onClick={() =>
                router.push(
                  `/estudio/obras/${id}/capitulos/${capitulo.id}`
                )
              }
              className="w-full rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
            >

              <h3 className="font-medium text-gray-900">
                {capitulo.titulo}
              </h3>

              {capitulo.resumo && (
                <p className="mt-1 text-sm text-gray-500">
                  {capitulo.resumo}
                </p>
              )}

            </button>
          ))}

        </div>
      )}

  </div>

</section>

        {/* Informações */}
        <section className="mt-5 rounded-lg bg-white shadow">

          <button
            type="button"
            className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 sm:p-6"
          >
            <div>
              <h2 className="font-semibold text-gray-900">
                Informações da obra
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Dados gerais e configurações da obra.
              </p>
            </div>

            <span className="ml-4 text-xl text-gray-400">
              ›
            </span>
          </button>

        </section>

        {/* Autores */}
        <section className="mt-5 rounded-lg bg-white shadow">

          <button
            type="button"
            className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 sm:p-6"
          >
            <div>
              <h2 className="font-semibold text-gray-900">
                Autores
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Gerencie os autores relacionados à obra.
              </p>
            </div>

            <span className="ml-4 text-xl text-gray-400">
              ›
            </span>
          </button>

        </section>

      </div>
    </main>
  );
}
