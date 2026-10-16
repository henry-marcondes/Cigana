
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    estaAutenticado,
} from '../../services/autenticacao';

import { apiFetch } from '../../services/api';
import { listarFavoritos } from '../../services/favorito';
import LivroCard from '../../components/LivroCard';

export default function FavoritosPage() {
    const router = useRouter();

    const [livros, setLivros] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;

        async function carregarFavoritos() {
            if (!estaAutenticado()) {
                router.push('/login');
                return;
            }

            try {
                const [respostaFavoritos, respostaLivros] =
                    await Promise.all([
                        listarFavoritos(),
                        apiFetch('/api/livros'),
                    ]);

                if (!ativo) return;

                const listaFavoritos = respostaFavoritos.data || [];
                const listaLivros = respostaLivros.data || [];

                const idsFavoritos = listaFavoritos.map(
                    (favorito) => favorito.livro_id
                );

                setFavoritos(idsFavoritos);

                const livrosFavoritos = listaLivros.filter(
                    (livro) => idsFavoritos.includes(livro.id)
                );

                setLivros(livrosFavoritos);
            } catch (error) {
                if (!ativo) return;

                if (error.status === 401) {
                    router.push('/login');
                    return;
                }

                console.error(
                    'Erro ao carregar favoritos:',
                    error
                );

                setErro(
                    'Não foi possível carregar seus favoritos. Tente novamente.'
                );
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarFavoritos();

        return () => {
            ativo = false;
        };
    }, [router]);

    function atualizarFavorito(livro_id, favoritado) {
        if (!favoritado) {
            setFavoritos((atuais) =>
                atuais.filter((id) => id !== livro_id)
            );

            setLivros((atuais) =>
                atuais.filter((livro) => livro.id !== livro_id)
            );

            return;
        }

        setFavoritos((atuais) =>
            atuais.includes(livro_id)
                ? atuais
                : [...atuais, livro_id]
        );
    }

    if (carregando) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-600">
                    Carregando seus favoritos...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Meus favoritos
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Suas obras favoritas em um só lugar.
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                        Voltar à Biblioteca
                    </Link>
                </header>

                {erro && (
                    <section
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                    >
                        {erro}
                    </section>
                )}

                {!erro && livros.length === 0 && (
                    <section className="rounded-lg bg-white p-8 text-center shadow">
                        <p className="text-lg text-gray-700">
                            Você ainda não tem obras favoritas.
                        </p>

                        <p className="mt-2 text-gray-500">
                            Explore a Biblioteca e marque as obras
                            que deseja guardar.
                        </p>

                        <Link
                            href="/"
                            className="mt-5 inline-block rounded bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                        >
                            Explorar a Biblioteca
                        </Link>
                    </section>
                )}

                {!erro && livros.length > 0 && (
                    <>
                        <p className="mb-5 text-sm text-gray-600">
                            {livros.length === 1
                                ? '1 obra favorita'
                                : `${livros.length} obras favoritas`}
                        </p>

                        <section
                            aria-label="Lista de obras favoritas"
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {livros.map((livro) => (
                                <LivroCard
                                    key={livro.id}
                                    livro={livro}
                                    favoritoInicial={favoritos.includes(
                                        livro.id
                                    )}
                                    autenticado={true}
                                    onFavoritoAlterado={atualizarFavorito}
                                />
                            ))}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
