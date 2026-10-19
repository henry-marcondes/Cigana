'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { estaAutenticado, logout, obterUsuario } from '../../services/autenticacao';
import { usuarioTemPermissao } from '../../services/permissoesEfetivas';

export default function AdminPage() {
    const router = useRouter();
    const [podeVisualizarAnalise, setPodeVisualizarAnalise] = useState(false);

    function sair() {
        logout();
        router.push('/login');
    }

    useEffect(() => {
        if (!estaAutenticado()) {
            router.push('/login');
            return;
        }

        const usuario = obterUsuario();
        if (usuario?.id) {
            usuarioTemPermissao(usuario.id, 'analise_dados.visualizar')
                .then(setPodeVisualizarAnalise)
                .catch(() => setPodeVisualizarAnalise(false));
        }
    }, [router]);

    return (
        <main className="min-h-screen p-6">
           
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">
                Administração
            </h1>

            <p className="mt-2 text-gray-600">
                Gestão da plataforma
            </p>
        </div>

            <div className="flex gap-2">
                <Link
                    href="/dashboard"
                    className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300"
                >
                    Dashboard
                </Link>

                <button
                    type="button"
                    onClick={sair}
                    className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                    Sair
                </button>
                </div>
            </header>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                    <Link
                        href="admin/usuarios"
                        className="rounded-lg border p-5 transition hover:bg-gray-50"
                    >
                        <h2 className="text-xl font-semibold">
                            Usuários
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            Gerenciar usuários da plataforma.
                        </p>
                    </Link>

                    <Link
                        href="admin/solicitacoes/solicitacao-autor"
                        className="rounded-lg border p-5 transition hover:bg-gray-50"
                    >
                        <h2 className="text-xl font-semibold">
                            Solicitações
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            Avaliar solicitações para atuação como Autor.
                        </p>
                    </Link>

                    <Link
                        href="/admin/obras"
                        className="rounded-lg border p-5 transition hover:bg-gray-50"
                    >
                        <h2 className="text-xl font-semibold">
                            Obras
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            Analisar, aprovar ou rejeitar obras e publicar as aprovadas.
                        </p>
                    </Link>

                    {podeVisualizarAnalise && (
                        <Link
                            href="/admin/analise-dados"
                            className="rounded-lg border p-5 transition hover:bg-gray-50"
                        >
                            <h2 className="text-xl font-semibold">
                                Análise de Dados
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Consultar indicadores administrativos da plataforma.
                            </p>
                        </Link>
                    )}

                </div>
        </main>
    );
}
