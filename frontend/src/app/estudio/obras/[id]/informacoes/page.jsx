'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { apiFetch } from '../../../../../services/api';

export default function InformacoesObra() {
    const params = useParams();
    const router = useRouter();

    const { id } = params;

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const [dados, setDados] = useState({
        titulo: '',
        slug: '',
        resumo: '',
        isbn: '',
        ano_publicacao: '',
        data_publicacao: '',
        ordem_exibicao: 0,
    });

    useEffect(() => {
        async function carregarObra() {
            try {
                setErro('');

                const resposta = await apiFetch(
                    `/api/livros/${id}`
                );

                const obra = resposta.data;

                setDados({
                    titulo: obra.titulo || '',
                    slug: obra.slug || '',
                    resumo: obra.resumo || '',
                    isbn: obra.isbn || '',
                    ano_publicacao:
                        obra.ano_publicacao ?? '',
                    data_publicacao:
                        obra.data_publicacao
                            ? obra.data_publicacao.substring(0, 10)
                            : '',
                    ordem_exibicao:
                        obra.ordem_exibicao ?? 0,
                });
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

    function alterarCampo(campo, valor) {
        setDados((dadosAtuais) => ({
            ...dadosAtuais,
            [campo]: valor,
        }));

        setSucesso('');

        if (erro) {
            setErro('');
        }
    }

    async function salvar(event) {
        event.preventDefault();

        setErro('');
        setSucesso('');
        setSalvando(true);

        try {
            const resposta = await apiFetch(
                `/api/livros/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        titulo: dados.titulo,
                        slug: dados.slug,
                        resumo: dados.resumo || null,
                        isbn: dados.isbn || null,
                        ano_publicacao:
                            dados.ano_publicacao
                                ? Number(dados.ano_publicacao)
                                : null,
                        data_publicacao:
                            dados.data_publicacao || null,
                        ordem_exibicao:
                            Number(dados.ordem_exibicao) || 0,
                    }),
                }
            );

            const obra = resposta.data;

            setDados({
                titulo: obra.titulo || '',
                slug: obra.slug || '',
                resumo: obra.resumo || '',
                isbn: obra.isbn || '',
                ano_publicacao:
                    obra.ano_publicacao ?? '',
                data_publicacao:
                    obra.data_publicacao
                        ? obra.data_publicacao.substring(0, 10)
                        : '',
                ordem_exibicao:
                    obra.ordem_exibicao ?? 0,
            });

            setSucesso(
                'Informações da obra salvas com sucesso.'
            );
        } catch (error) {
            setErro(error.message);
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-600">
                    Carregando informações da obra...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
            <div className="mx-auto max-w-4xl">

                <header className="mb-6">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(`/estudio/obras/${id}`)
                        }
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Voltar para a obra
                    </button>

                    <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Informações da obra
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Dados gerais e configurações da obra.
                    </p>
                </header>

                <form
                    onSubmit={salvar}
                    className="rounded-lg bg-white p-5 shadow sm:p-6"
                >
                    <div className="space-y-5">

                        <div>
                            <label
                                htmlFor="titulo"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Título
                            </label>

                            <input
                                id="titulo"
                                type="text"
                                value={dados.titulo}
                                onChange={(event) =>
                                    alterarCampo(
                                        'titulo',
                                        event.target.value
                                    )
                                }
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="slug"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Slug
                            </label>

                            <input
                                id="slug"
                                type="text"
                                value={dados.slug}
                                onChange={(event) =>
                                    alterarCampo(
                                        'slug',
                                        event.target.value
                                    )
                                }
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Identificador utilizado na URL pública da obra.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="resumo"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Resumo
                            </label>

                            <textarea
                                id="resumo"
                                value={dados.resumo}
                                onChange={(event) =>
                                    alterarCampo(
                                        'resumo',
                                        event.target.value
                                    )
                                }
                                rows={5}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="isbn"
                                className="block text-sm font-medium text-gray-700"
                            >
                                ISBN
                            </label>

                            <input
                                id="isbn"
                                type="text"
                                value={dados.isbn}
                                onChange={(event) =>
                                    alterarCampo(
                                        'isbn',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                            <div>
                                <label
                                    htmlFor="ano_publicacao"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Ano de publicação
                                </label>

                                <input
                                    id="ano_publicacao"
                                    type="number"
                                    value={dados.ano_publicacao}
                                    onChange={(event) =>
                                        alterarCampo(
                                            'ano_publicacao',
                                            event.target.value
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="data_publicacao"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Data de publicação
                                </label>

                                <input
                                    id="data_publicacao"
                                    type="date"
                                    value={dados.data_publicacao}
                                    onChange={(event) =>
                                        alterarCampo(
                                            'data_publicacao',
                                            event.target.value
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                                />
                            </div>

                        </div>

                        <div>
                            <label
                                htmlFor="ordem_exibicao"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Ordem de exibição
                            </label>

                            <input
                                id="ordem_exibicao"
                                type="number"
                                min="0"
                                value={dados.ordem_exibicao}
                                onChange={(event) =>
                                    alterarCampo(
                                        'ordem_exibicao',
                                        event.target.value
                                    )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />
                        </div>

                        {erro && (
                            <p className="text-sm text-red-600">
                                {erro}
                            </p>
                        )}

                        {sucesso && (
                            <p className="text-sm text-green-600">
                                {sucesso}
                            </p>
                        )}

                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">

                            <button
                                type="submit"
                                disabled={salvando}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {salvando
                                    ? 'Salvando...'
                                    : 'Salvar alterações'}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        `/estudio/obras/${id}`
                                    )
                                }
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>
                </form>

            </div>
        </main>
    );
}
