
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    estaAutenticado,
} from '../../../services/autenticacao';

import {
    listarUsuarios,
} from '../../../services/usuario';

export default function AdminUsuariosPage() {
    const router = useRouter();

    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (!estaAutenticado()) {
            router.push('/login');
            return;
        }

        carregarUsuarios();
    }, [router]);

    async function carregarUsuarios() {
        try {
            setCarregando(true);
            setErro('');

            const resposta = await listarUsuarios();

            setUsuarios(resposta.data || []);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);

            setErro(
                error.message ||
                'Não foi possível carregar os usuários.'
            );
        } finally {
            setCarregando(false);
        }
    }

    if (carregando) {
        return (
            <main className="min-h-screen p-6">
                <div className="mx-auto max-w-5xl">
                    <p>Carregando usuários...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-5xl">

                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Administração de Usuários
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Gerencie as contas cadastradas na Plataforma.
                        </p>
                    </div>

                    <Link
                        href="/admin/usuarios/novo"
                        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
                    >
                        Novo usuário
                    </Link>
                </header>

                {erro && (
                    <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-700">
                        {erro}
                    </div>
                )}

                {usuarios.length === 0 ? (
                    <div className="rounded-lg bg-white p-6 shadow">
                        <p className="text-gray-600">
                            Nenhum usuário encontrado.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {usuarios.map((usuario) => (
                            <div
                                key={usuario.id}
                                className="rounded-lg bg-white p-5 shadow"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {usuario.email}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Criado em:{' '}
                                            {new Date(
                                                usuario.criado_em
                                            ).toLocaleString('pt-BR')}
                                        </p>

                                        <p className="mt-1 text-sm">
                                            Status:{' '}
                                            <span
                                                className={
                                                    usuario.ativo
                                                        ? 'font-medium text-green-600'
                                                        : 'font-medium text-red-600'
                                                }
                                            >
                                                {usuario.ativo
                                                    ? 'Ativo'
                                                    : 'Desativado'}
                                            </span>
                                        </p>
                                    </div>

                                    <Link
                                        href={`/admin/usuarios/${usuario.id}`}
                                        className="rounded bg-gray-700 px-4 py-2 text-center text-sm text-white hover:bg-gray-800"
                                    >
                                        Administrar
                                    </Link>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </main>
    );
}
