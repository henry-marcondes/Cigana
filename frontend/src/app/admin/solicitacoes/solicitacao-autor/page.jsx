'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    estaAutenticado,
} from '../../../../services/autenticacao';

import {
    listarSolicitacoesAutorGestao,
    listarSolicitacoesAutorPendentes,
} from '../../../../services/solicitacaoAutor';

export default function SolicitacoesAutorPage() {
    const router = useRouter();

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [status, setStatus] = useState('PENDENTE');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (!estaAutenticado()) {
            router.push('/login');
            return;
        }

        async function carregarInicial() {
            try {
                setCarregando(true);
                setErro('');

                const resposta =
                    await listarSolicitacoesAutorPendentes();

                setSolicitacoes(resposta.data || []);
            } catch (error) {
                console.error(error);

                setErro(
                    error.message ||
                    'Erro ao carregar solicitações.'
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarInicial();
    }, [router]);

    async function carregarSolicitacoes(filtro) {
        try {
            setCarregando(true);
            setErro('');

            let resposta;

            if (filtro === 'PENDENTE') {
                resposta =
                    await listarSolicitacoesAutorPendentes();
            } else if (filtro === 'TODAS') {
                resposta =
                    await listarSolicitacoesAutorGestao();
            } else {
                resposta =
                    await listarSolicitacoesAutorGestao(filtro);
            }

            setSolicitacoes(resposta.data || []);
        } catch (error) {
            console.error(error);

            setErro(
                error.message ||
                'Erro ao carregar solicitações.'
            );
        } finally {
            setCarregando(false);
        }
    }

    function alterarFiltro(novoStatus) {
        setStatus(novoStatus);
        carregarSolicitacoes(novoStatus);
    }

    function formatarData(data) {
        if (!data) return '-';

        return new Date(data).toLocaleString('pt-BR');
    }

    function obterClasseStatus(valor) {
        switch (valor) {
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

    return (
        <main className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-5xl">

                <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-5 shadow sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Solicitações de Autor
                        </h1>

                        <p className="mt-1 text-sm text-gray-600">
                            Gestão das solicitações para atuar como Autor.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300"
                    >
                        Administração
                    </Link>

                </div>

                <div className="mb-6 flex flex-wrap gap-2 rounded-lg bg-white p-4 shadow">

                    <button
                        type="button"
                        onClick={() => alterarFiltro('PENDENTE')}
                        className={`rounded px-4 py-2 text-sm ${
                            status === 'PENDENTE'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Pendentes
                    </button>

                    <button
                        type="button"
                        onClick={() => alterarFiltro('APROVADA')}
                        className={`rounded px-4 py-2 text-sm ${
                            status === 'APROVADA'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Aprovadas
                    </button>

                    <button
                        type="button"
                        onClick={() => alterarFiltro('RECUSADA')}
                        className={`rounded px-4 py-2 text-sm ${
                            status === 'RECUSADA'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Recusadas
                    </button>

                    <button
                        type="button"
                        onClick={() => alterarFiltro('TODAS')}
                        className={`rounded px-4 py-2 text-sm ${
                            status === 'TODAS'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Todas
                    </button>

                </div>

                {erro && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-800">
                        {erro}
                    </div>
                )}

                {carregando ? (
                    <div className="rounded-lg bg-white p-6 text-center shadow">
                        Carregando solicitações...
                    </div>
                ) : solicitacoes.length === 0 ? (
                    <div className="rounded-lg bg-white p-6 text-center text-gray-600 shadow">
                        Nenhuma solicitação encontrada.
                    </div>
                ) : (
                    <div className="space-y-4">

                        {solicitacoes.map((solicitacao) => (
                            <Link
                                key={solicitacao.id}
                                href={`/admin/solicitacoes/solicitacao-autor/${solicitacao.id}`}
                                className="block rounded-lg bg-white p-5 shadow transition hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                    <div className="min-w-0">

                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {solicitacao.nome_publico ||
                                                'Sem nome público'}
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-600">
                                            {solicitacao.titulo_provisorio ||
                                                'Sem título provisório'}
                                        </p>

                                        <p className="mt-2 break-all text-xs text-gray-500">
                                            Usuário: {solicitacao.usuario_id}
                                        </p>

                                    </div>

                                    <span
                                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${obterClasseStatus(
                                            solicitacao.status
                                        )}`}
                                    >
                                        {solicitacao.status}
                                    </span>

                                </div>

                                <div className="mt-4 border-t pt-3 text-xs text-gray-500">

                                    <span>
                                        Criada em:{' '}
                                        {formatarData(
                                            solicitacao.criado_em
                                        )}
                                    </span>

                                    {solicitacao.avaliado_em && (
                                        <span className="ml-4">
                                            Avaliada em:{' '}
                                            {formatarData(
                                                solicitacao.avaliado_em
                                            )}
                                        </span>
                                    )}

                                </div>

                            </Link>
                        ))}

                    </div>
                )}

            </div>
        </main>
    );
}
