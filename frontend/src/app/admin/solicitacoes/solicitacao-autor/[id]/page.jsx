'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
    estaAutenticado,
} from '../../../../../services/autenticacao';

import {
    buscarSolicitacaoAutorParaAvaliacao,
    aprovarSolicitacaoAutor,
    recusarSolicitacaoAutor,
} from '../../../../../services/solicitacaoAutor';

export default function SolicitacaoAutorDetalhePage() {
    const router = useRouter();
    const params = useParams();

    const [solicitacao, setSolicitacao] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [motivoRecusa, setMotivoRecusa] = useState('');
    const [processando, setProcessando] = useState(false);

    useEffect(() => {
        if (!estaAutenticado()) {
            router.push('/login');
            return;
        }

        if (!params.id) {
            return;
        }

        carregarSolicitacao();
    }, [router, params.id]);

    async function carregarSolicitacao() {
        try {
            setCarregando(true);
            setErro('');
            setMensagem('');

            const resposta =
                await buscarSolicitacaoAutorParaAvaliacao(params.id);

            setSolicitacao(resposta.data);
        } catch (error) {
            console.error(error);

            setErro(
                error.message ||
                'Erro ao carregar a solicitação.'
            );
        } finally {
            setCarregando(false);
        }
    }

    async function aprovar() {
        const confirmar = window.confirm(
            'Deseja realmente aprovar esta solicitação de Autor?'
        );

        if (!confirmar) {
            return;
        }

        try {
            setProcessando(true);
            setErro('');
            setMensagem('');

            await aprovarSolicitacaoAutor(params.id);

            setMensagem(
                'Solicitação aprovada com sucesso.'
            );

            await carregarSolicitacao();
        } catch (error) {
            console.error(error);

            setErro(
                error.message ||
                'Erro ao aprovar a solicitação.'
            );
        } finally {
            setProcessando(false);
        }
    }

    async function recusar() {
        if (!motivoRecusa.trim()) {
            setErro(
                'Informe o motivo da recusa.'
            );
            return;
        }

        const confirmar = window.confirm(
            'Deseja realmente recusar esta solicitação de Autor?'
        );

        if (!confirmar) {
            return;
        }

        try {
            setProcessando(true);
            setErro('');
            setMensagem('');

            await recusarSolicitacaoAutor(
                params.id,
                motivoRecusa.trim()
            );

            setMensagem(
                'Solicitação recusada com sucesso.'
            );

            setMotivoRecusa('');

            await carregarSolicitacao();
        } catch (error) {
            console.error(error);

            setErro(
                error.message ||
                'Erro ao recusar a solicitação.'
            );
        } finally {
            setProcessando(false);
        }
    }

    function formatarData(data) {
        if (!data) {
            return '-';
        }

        return new Date(data).toLocaleString('pt-BR');
    }

    function obterClasseStatus(status) {
        switch (status) {
            case 'PENDENTE':
                return 'bg-yellow-100 text-yellow-800';

            case 'APROVADA':
                return 'bg-green-100 text-green-800';

            case 'RECUSADA':
                return 'bg-red-100 text-red-800';

            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    if (carregando) {
        return (
            <main className="min-h-screen bg-gray-100 p-4">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg bg-white p-6 text-center shadow">
                        Carregando solicitação...
                    </div>
                </div>
            </main>
        );
    }

    if (!solicitacao) {
        return (
            <main className="min-h-screen bg-gray-100 p-4">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg bg-white p-6 shadow">

                        <p className="text-gray-700">
                            Solicitação não encontrada.
                        </p>

                        <Link
                            href="/admin/solicitacoes/solicitacao-autor"
                            className="mt-4 inline-block rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
                        >
                            Voltar
                        </Link>

                    </div>
                </div>
            </main>
        );
    }

    const pendente =
        solicitacao.status === 'PENDENTE';

    return (
        <main className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-4xl">

                <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-5 shadow sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Análise da Solicitação de Autor
                        </h1>

                        <p className="mt-1 text-sm text-gray-600">
                            Avaliação dos dados apresentados pelo solicitante.
                        </p>
                    </div>

                    <Link
                        href="/admin/solicitacoes/solicitacao-autor"
                        className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300"
                    >
                        Voltar
                    </Link>

                </div>

                {erro && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-800">
                        {erro}
                    </div>
                )}

                {mensagem && (
                    <div className="mb-6 rounded-lg bg-green-100 p-4 text-sm text-green-800">
                        {mensagem}
                    </div>
                )}

                <div className="space-y-6">

                    <section className="rounded-lg bg-white p-5 shadow">

                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <h2 className="text-lg font-semibold text-gray-900">
                                Solicitação
                            </h2>

                            <span
                                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${obterClasseStatus(
                                    solicitacao.status
                                )}`}
                            >
                                {solicitacao.status}
                            </span>

                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">

                            <div>
                                <p className="text-xs text-gray-500">
                                    ID da solicitação
                                </p>

                                <p className="break-all text-sm text-gray-900">
                                    {solicitacao.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Usuário
                                </p>

                                <p className="break-all text-sm text-gray-900">
                                    {solicitacao.usuario_id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Criada em
                                </p>

                                <p className="text-sm text-gray-900">
                                    {formatarData(
                                        solicitacao.criado_em
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Avaliada em
                                </p>

                                <p className="text-sm text-gray-900">
                                    {formatarData(
                                        solicitacao.avaliado_em
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Avaliado por
                                </p>

                                <p className="break-all text-sm text-gray-900">
                                    {solicitacao.avaliado_por || '-'}
                                </p>
                            </div>

                        </div>

                    </section>

                    <section className="rounded-lg bg-white p-5 shadow">

                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Dados do Autor
                        </h2>

                        <div className="space-y-4">

                            <div>
                                <p className="text-xs text-gray-500">
                                    Nome público
                                </p>

                                <p className="text-sm text-gray-900">
                                    {solicitacao.nome_publico || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Foto
                                </p>

                                {solicitacao.foto_url ? (
                                    <p className="break-all text-sm text-gray-900">
                                        {solicitacao.foto_url}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Não informada.
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Biografia
                                </p>

                                <div className="whitespace-pre-wrap text-sm text-gray-900">
                                    {solicitacao.biografia || '-'}
                                </div>
                            </div>

                        </div>

                    </section>

                    <section className="rounded-lg bg-white p-5 shadow">

                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Obra proposta
                        </h2>

                        <div className="space-y-4">

                            <div>
                                <p className="text-xs text-gray-500">
                                    Título provisório
                                </p>

                                <p className="text-sm text-gray-900">
                                    {solicitacao.titulo_provisorio || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Resumo
                                </p>

                                <div className="whitespace-pre-wrap text-sm text-gray-900">
                                    {solicitacao.resumo || '-'}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Categoria
                                    </p>

                                    <p className="break-all text-sm text-gray-900">
                                        {solicitacao.categoria_id || '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Classificação indicativa
                                    </p>

                                    <p className="break-all text-sm text-gray-900">
                                        {solicitacao.classificacao_indicativa_id || '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Idioma
                                    </p>

                                    <p className="break-all text-sm text-gray-900">
                                        {solicitacao.idioma_id || '-'}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </section>

                    {solicitacao.motivo_recusa && (
                        <section className="rounded-lg bg-white p-5 shadow">

                            <h2 className="mb-3 text-lg font-semibold text-gray-900">
                                Motivo da recusa
                            </h2>

                            <p className="whitespace-pre-wrap text-sm text-gray-700">
                                {solicitacao.motivo_recusa}
                            </p>

                        </section>
                    )}

                    {pendente && (
                        <section className="rounded-lg bg-white p-5 shadow">

                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Avaliação
                            </h2>

                            <div className="mb-5">

                                <label
                                    htmlFor="motivoRecusa"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Motivo da recusa
                                </label>

                                <textarea
                                    id="motivoRecusa"
                                    value={motivoRecusa}
                                    onChange={(event) =>
                                        setMotivoRecusa(
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="Informe o motivo caso a solicitação seja recusada."
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    disabled={processando}
                                />

                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={aprovar}
                                    disabled={processando}
                                    className="rounded bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processando
                                        ? 'Processando...'
                                        : 'Aprovar solicitação'}
                                </button>

                                <button
                                    type="button"
                                    onClick={recusar}
                                    disabled={processando}
                                    className="rounded bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processando
                                        ? 'Processando...'
                                        : 'Recusar solicitação'}
                                </button>

                            </div>

                        </section>
                    )}

                </div>

            </div>
        </main>
    );
}
