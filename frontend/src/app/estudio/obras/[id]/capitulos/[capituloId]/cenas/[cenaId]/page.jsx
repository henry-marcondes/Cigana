
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../../../../services/api';

export default function EditarCena() {
  const params = useParams();
  const router = useRouter();

  const { id, capituloId, cenaId } = params;

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [dadosCena, setDadosCena] = useState({
    titulo: '',
    slug: '',
    texto: '',
    ordem_exibicao: '',
  });

  const [salvando, setSalvando] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState('');
  const [sucessoSalvamento, setSucessoSalvamento] = useState('');

  useEffect(() => {
    async function carregarCena() {
      try {
        const resposta = await apiFetch(
          `/api/cenas/${cenaId}`
        );

        setDadosCena({
          titulo: resposta.data.titulo || '',
          slug: resposta.data.slug || '',
          texto: resposta.data.texto || '',
          ordem_exibicao: resposta.data.ordem_exibicao || '',
        });

      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    if (cenaId) {
      carregarCena();
    }
  }, [cenaId]);

  async function salvarAlteracoes(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErroSalvamento('');
      setSucessoSalvamento('');

      const resposta = await apiFetch(
        `/api/cenas/${cenaId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            titulo: dadosCena.titulo,
            slug: dadosCena.slug,
            texto: dadosCena.texto,
            ordem_exibicao: Number(
              dadosCena.ordem_exibicao
            ),
          }),
        }
      );

      setDadosCena({
        titulo: resposta.data.titulo || '',
        slug: resposta.data.slug || '',
        texto: resposta.data.texto || '',
        ordem_exibicao:
          resposta.data.ordem_exibicao || '',
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

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Carregando cena...
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
              router.push(
                `/estudio/obras/${id}/capitulos/${capituloId}`
              )
            }
            className="mb-6 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Voltar para o capítulo
          </button>

          <section className="rounded-lg bg-white p-6 shadow">

            <h1 className="text-2xl font-bold text-gray-900">
              Editar cena
            </h1>

            <p className="mt-4 text-red-600">
              {erro}
            </p>

          </section>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">

        <header className="mb-6">

          <button
            onClick={() =>
              router.push(
                `/estudio/obras/${id}/capitulos/${capituloId}`
              )
            }
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Capítulo
          </button>

          <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
            Editar cena
          </h1>

        </header>

        <form
          onSubmit={salvarAlteracoes}
          className="rounded-lg bg-white p-5 shadow sm:p-6"
        >

          <h2 className="text-lg font-semibold text-gray-900">
            Informações da cena
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
                required
                value={dadosCena.titulo}
                onChange={(event) =>
                  setDadosCena({
                    ...dadosCena,
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
                required
                value={dadosCena.slug}
                onChange={(event) =>
                  setDadosCena({
                    ...dadosCena,
                    slug: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Texto
              </label>

              <textarea
                required
                value={dadosCena.texto}
                onChange={(event) =>
                  setDadosCena({
                    ...dadosCena,
                    texto: event.target.value,
                  })
                }
                rows={12}
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

          <div className="border-b border-gray-200 p-5 sm:p-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Composição da cena
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Gerencie os conteúdos e as escolhas desta cena.
            </p>

          </div>

          <div className="divide-y divide-gray-200">

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cenaId}/composicao`
                )
              }
              className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 sm:p-6"
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  Composição
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Organizar os conteúdos da cena.
                </p>
              </div>

              <span className="text-xl text-gray-400">
                ›
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cenaId}/textos`
                )
              }
              className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 sm:p-6"
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  Textos
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Gerenciar os textos da cena.
                </p>
              </div>

              <span className="text-xl text-gray-400">
                ›
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cenaId}/imagens`
                )
              }
              className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 sm:p-6"
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  Imagens
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Gerenciar as imagens da cena.
                </p>
              </div>

              <span className="text-xl text-gray-400">
                ›
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cenaId}/audios`
                )
              }
              className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 sm:p-6"
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  Áudios
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Gerenciar os áudios da cena.
                </p>
              </div>

              <span className="text-xl text-gray-400">
                ›
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cenaId}/videos`
                )
              }
              className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 sm:p-6"
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  Vídeos
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Gerenciar os vídeos da cena.
                </p>
              </div>

              <span className="text-xl text-gray-400">
                ›
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cenaId}/escolhas`
                )
              }
              className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 sm:p-6"
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  Escolhas
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Gerenciar as escolhas e caminhos da cena.
                </p>
              </div>

              <span className="text-xl text-gray-400">
                ›
              </span>
            </button>

          </div>

        </section>

      </div>
    </main>
  );
}
