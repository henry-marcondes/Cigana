'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../../services/api';

export default function EditarCapitulo() {
  const params = useParams();
  const router = useRouter();

  const { id, capituloId } = params;

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [dadosCapitulo, setDadosCapitulo] = useState({
    titulo: '',
    slug: '',
    resumo: '',
    texto_introdutorio: '',
    capa_url: '',
  });

  const [salvando, setSalvando] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState('');
  const [sucessoSalvamento, setSucessoSalvamento] = useState('');

  const [mostrarCenas, setMostrarCenas] = useState(false);
  const [cenas, setCenas] = useState([]);
  const [carregandoCenas, setCarregandoCenas] = useState(true);
  const [mostrarNovaCena, setMostrarNovaCena] = useState(false);
  const [dadosNovaCena, setDadosNovaCena] = useState({
    titulo: '',
    slug: '',
    texto: '',
    cena_inicial: false,
  });

  const [criandoCena, setCriandoCena] = useState(false);
  const [erroCriacaoCena, setErroCriacaoCena] = useState('');
  const [sucessoCriacaoCena, setSucessoCriacaoCena] = useState('');

  useEffect(() => {
    async function carregarCapitulo() {
      try {
        const resposta = await apiFetch(
          `/api/capitulos/${capituloId}`
        );

        setDadosCapitulo({
            titulo: resposta.data.titulo || '',
            slug: resposta.data.slug || '',
            resumo: resposta.data.resumo || '',
            texto_introdutorio: resposta.data.texto_introdutorio || '',
            capa_url: resposta.data.capa_url || '',
        });

      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    if (capituloId) {
      carregarCapitulo();
    }
  }, [capituloId]);

useEffect(() => {
  async function carregarCenas() {
    try {
      setCarregandoCenas(true);

      const resposta = await apiFetch(
        `/api/cenas/capitulo/${capituloId}`
      );

      setCenas(resposta.data || []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregandoCenas(false);
    }
  }

  if (capituloId) {
    carregarCenas();
  }
}, [capituloId]);

function abrirNovaCena() {
  setErroCriacaoCena('');
  setSucessoCriacaoCena('');

  setDadosNovaCena({
    titulo: '',
    slug: '',
    texto: '',
    cena_inicial: cenas.length === 0,
  });

  setMostrarNovaCena(true);
}

function fecharNovaCena() {
  if (criandoCena) {
    return;
  }

  setMostrarNovaCena(false);
  setErroCriacaoCena('');
  setSucessoCriacaoCena('');
}

async function criarCena(event) {
  event.preventDefault();

  try {
    setCriandoCena(true);
    setErroCriacaoCena('');
    setSucessoCriacaoCena('');

    const proximaOrdem =
      cenas.length > 0
        ? Math.max(
            ...cenas.map(
              (cena) => cena.ordem_exibicao
            )
          ) + 1
        : 1;

    const resposta = await apiFetch(
      '/api/cenas',
      {
        method: 'POST',
        body: JSON.stringify({
          capitulo_id: capituloId,
          titulo: dadosNovaCena.titulo,
          slug: dadosNovaCena.slug,
          texto: dadosNovaCena.texto,
          ordem_exibicao: proximaOrdem,
          cena_inicial: dadosNovaCena.cena_inicial,
        }),
      }
    );

    setCenas((cenasAtuais) =>
      [
        ...cenasAtuais,
        resposta.data,
      ].sort(
        (a, b) =>
          a.ordem_exibicao - b.ordem_exibicao
      )
    );

    setSucessoCriacaoCena(
      'Cena criada com sucesso.'
    );

    setDadosNovaCena({
      titulo: '',
      slug: '',
      texto: '',
      cena_inicial: false,
    });

  } catch (error) {
    setErroCriacaoCena(error.message);
  } finally {
    setCriandoCena(false);
  }
}

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Carregando capítulo...
        </p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">

          <button
            onClick={() =>
              router.push(`/estudio/obras/${id}`)
            }
            className="mb-6 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Voltar para os capítulos
          </button>

          <section className="rounded-lg bg-white p-6 shadow">

            <h1 className="text-2xl font-bold text-gray-900">
              Editar capítulo
            </h1>

            <p className="mt-4 text-red-600">
              {erro}
            </p>

          </section>

        </div>
      </main>
    );
  }
  
  async function salvarAlteracoes(event) {
  event.preventDefault();

  try {
    setSalvando(true);
    setErroSalvamento('');
    setSucessoSalvamento('');

    const resposta = await apiFetch(
      `/api/capitulos/${capituloId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          titulo: dadosCapitulo.titulo,
          slug: dadosCapitulo.slug,
          resumo: dadosCapitulo.resumo || null,
          texto_introdutorio:
            dadosCapitulo.texto_introdutorio || null,
        }),
      }
    );

    setDadosCapitulo({
      titulo: resposta.data.titulo || '',
      slug: resposta.data.slug || '',
      resumo: resposta.data.resumo || '',
      texto_introdutorio:
        resposta.data.texto_introdutorio || '',
      capa_url: resposta.data.capa_url || '',
    });

    setSucessoSalvamento(
      'Alterações salvas com sucesso.'
    );

  } catch (error) {
    setErroSalvamento(error.message);
  } finally {
    setSalvando(false);
  }
}

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">

        <header className="mb-6">

          <div className="flex items-center justify-between">

            <button
              onClick={() =>
                router.push(`/estudio/obras/${id}`)
              }
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Capítulos
            </button>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              aria-label="Ajuda"
              title="Ajuda"
            >
              ?
            </button>

          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
            Editar capítulo
          </h1>

        </header>

<form
  onSubmit={salvarAlteracoes}
  className="rounded-lg bg-white p-5 shadow sm:p-6"
>

<h2 className="text-lg font-semibold text-gray-900">
  Informações do capítulo
</h2>

{erroSalvamento && (
  <p className="mt-4 text-sm text-red-600">
    {erroSalvamento}
  </p>
)}

{sucessoSalvamento && (
  <p className="mt-4 text-sm text-green-700">
    ✓ {sucessoSalvamento}
  </p>
)}

<div className="mt-5 space-y-5">

  <div>
    <label className="block text-sm font-medium text-gray-700">
      Título
    </label>

    <input
      type="text"
      value={dadosCapitulo.titulo}
      onChange={(event) =>
        setDadosCapitulo({
          ...dadosCapitulo,
          titulo: event.target.value,
        })
      }
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700">
      Slug
    </label>

    <input
      type="text"
      value={dadosCapitulo.slug}
      onChange={(event) =>
        setDadosCapitulo({
          ...dadosCapitulo,
          slug: event.target.value,
        })
      }
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700">
      Resumo
    </label>

    <textarea
      value={dadosCapitulo.resumo}
      onChange={(event) =>
        setDadosCapitulo({
          ...dadosCapitulo,
          resumo: event.target.value,
        })
      }
      rows={3}
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700">
      Texto introdutório
    </label>

    <textarea
      value={dadosCapitulo.texto_introdutorio}
      onChange={(event) =>
        setDadosCapitulo({
          ...dadosCapitulo,
          texto_introdutorio: event.target.value,
        })
      }
      rows={6}
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700">
      Capa
    </label>

    <input
      type="text"
      value={dadosCapitulo.capa_url}
      onChange={(event) =>
        setDadosCapitulo({
          ...dadosCapitulo,
          capa_url: event.target.value,
        })
      }
      placeholder="URL da capa"
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
    />
  </div>

</div>

<div className="mt-6 flex justify-end">

  <button
    type="submit"
    disabled={salvando}
    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {salvando
      ? 'Salvando...'
      : 'Salvar alterações'}
  </button>

</div>
      </form>


<section className="mt-5 rounded-lg bg-white shadow">

<button
type="button"
onClick={() => setMostrarCenas(!mostrarCenas)}
className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 sm:p-6"

>

<div>

  <h3 className="font-medium text-gray-900">
    Cenas
  </h3>

  <p className="mt-1 text-sm text-gray-500">
    Criar e organizar as cenas do capítulo.
  </p>

</div>

<span className="ml-4 text-xl text-gray-400">
  {mostrarCenas ? '⌄' : '›'}
</span>

  </button>

{mostrarCenas && ( <div className="border-t border-gray-200 p-5 sm:p-6">

  <div className="flex items-start justify-between gap-4">

    <div>
      <h4 className="text-lg font-semibold text-gray-900">
        Cenas do capítulo
      </h4>

      <p className="mt-1 text-sm text-gray-500">
        Crie e organize as cenas deste capítulo.
      </p>
    </div>

    <button
      type="button"
      onClick={abrirNovaCena}
      className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      + Nova cena
    </button>

  </div>

  {mostrarNovaCena && (
    <form
      onSubmit={criarCena}
      className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5"
    >

      <h4 className="text-base font-semibold text-gray-900">
        Nova cena
      </h4>

      {erroCriacaoCena && (
        <p className="mt-4 text-sm text-red-600">
          {erroCriacaoCena}
        </p>
      )}

      {sucessoCriacaoCena && (
        <p className="mt-4 text-sm text-green-700">
          ✓ {sucessoCriacaoCena}
        </p>
      )}

      <div className="mt-5 space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título
          </label>

          <input
            type="text"
            required
            value={dadosNovaCena.titulo}
            onChange={(event) =>
              setDadosNovaCena({
                ...dadosNovaCena,
                titulo: event.target.value,
              })
            }
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug
          </label>

          <input
            type="text"
            required
            value={dadosNovaCena.slug}
            onChange={(event) =>
              setDadosNovaCena({
                ...dadosNovaCena,
                slug: event.target.value,
              })
            }
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Texto
          </label>

          <textarea
            required
            value={dadosNovaCena.texto}
            onChange={(event) =>
              setDadosNovaCena({
                ...dadosNovaCena,
                texto: event.target.value,
              })
            }
            rows={8}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">

          <input
            type="checkbox"
            checked={dadosNovaCena.cena_inicial}
            onChange={(event) =>
              setDadosNovaCena({
                ...dadosNovaCena,
                cena_inicial: event.target.checked,
              })
            }
            className="h-4 w-4 rounded border-gray-300"
          />

          Definir como cena inicial

        </label>

      </div>

      <div className="mt-6 flex justify-end gap-3">

        <button
          type="button"
          onClick={fecharNovaCena}
          disabled={criandoCena}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={criandoCena}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {criandoCena ? 'Criando...' : 'Criar cena'}
        </button>

      </div>

    </form>
  )}

  <div className="mt-6">

    {carregandoCenas ? (
      <p className="text-sm text-gray-500">
        Carregando cenas...
      </p>
    ) : cenas.length === 0 ? (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
        <p className="text-sm text-gray-500">
          Este capítulo ainda não possui cenas.
        </p>
      </div>
    ) : (
      <div className="space-y-3">

        {cenas.map((cena) => (
          <div
            key={cena.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <span className="text-sm font-medium text-gray-500">
                    {cena.ordem_exibicao}.
                  </span>

                  <h4 className="font-medium text-gray-900">
                    {cena.titulo}
                  </h4>

                  {cena.cena_inicial && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      Inicial
                    </span>
                  )}

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {cena.slug}
                </p>

              </div>

<button
  type="button"
  onClick={() =>
    router.push(
      `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cena.id}`
    )
  }
  className="shrink-0 text-sm text-gray-600 hover:text-gray-900"
>
  Editar cena
</button>

            </div>

          </div>
        ))}

      </div>
    )}

  </div>

</div>

)}

</section>


      </div>
    </main>
  );
}
