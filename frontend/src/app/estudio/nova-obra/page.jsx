'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../services/api';

export default function NovaObra() {
    const router = useRouter();

    const [categorias, setCategorias] = useState([]);
    const [classificacoes, setClassificacoes] = useState([]);
    const [idiomas, setIdiomas] = useState([]);

    const [formulario, setFormulario] = useState({
        titulo: '',
        slug: '',
        resumo: '',
        categoria_id: '',
        classificacao_indicativa_id: '',
        idioma_id: ''
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        async function carregarDados() {
            try {
                const [
                    respostaCategorias,
                    respostaClassificacoes,
                    respostaIdiomas
                ] = await Promise.all([
                    apiFetch('/api/categorias'),
                    apiFetch('/api/classificacoes-indicativas'),
                    apiFetch('/api/idiomas')
                ]);

                setCategorias(respostaCategorias.data || []);
                setClassificacoes(respostaClassificacoes.data || []);
                setIdiomas(respostaIdiomas.data || []);

            } catch (error) {
                console.error(error);

                setErro(
                    error.message ||
                    'Não foi possível carregar os dados necessários.'
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    function gerarSlug(valor) {
        return valor
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function alterarCampo(event) {
        const { name, value } = event.target;

        setFormulario((atual) => ({
            ...atual,
            [name]: value
        }));
    }

    function alterarTitulo(event) {
        const titulo = event.target.value;

        setFormulario((atual) => ({
            ...atual,
            titulo,
            slug: gerarSlug(titulo)
        }));
    }

    async function criarObra(event) {
        event.preventDefault();

        setErro('');
        setSalvando(true);

        try {
            const resposta = await apiFetch('/api/livros/autor', {
                method: 'POST',
                body: JSON.stringify(formulario)
            });

            const livro = resposta.data?.livro;

            if (!livro?.id) {
                throw new Error(
                    'A API criou a obra, mas não retornou o identificador.'
                );
            }

            router.push(`/estudio/obras/${livro.id}`);

        } catch (error) {
            console.error(error);

            const mensagem = error.message || '';

            if (
                mensagem.toLowerCase().includes('slug') &&
                (
                    mensagem.toLowerCase().includes('exist') ||
                    mensagem.toLowerCase().includes('duplicate') ||
                    mensagem.toLowerCase().includes('unique')
                )
            ) {
                setErro(
                    'Este slug já está sendo utilizado por outra obra. ' +
                    'Altere o slug e tente novamente.'
                );
            } else {
                setErro(
                    mensagem ||
                    'Não foi possível criar a obra.'
                );
            }

        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <main className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-4xl">
                    <p className="text-gray-600">
                        Carregando...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Nova obra
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Comece a criação de uma nova obra.
                    </p>
                </div>

                <form
                    onSubmit={criarObra}
                    className="rounded-lg bg-white p-6 shadow"
                >
                    <div className="grid gap-6">

                        <div>
                            <label
                                htmlFor="titulo"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Título
                            </label>

                            <input
                                id="titulo"
                                name="titulo"
                                type="text"
                                value={formulario.titulo}
                                onChange={alterarTitulo}
                                required
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
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
                                name="slug"
                                type="text"
                                value={formulario.slug}
                                onChange={alterarCampo}
                                required
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Identificador utilizado nas URLs da obra.
                                Deve ser único na plataforma.
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
                                name="resumo"
                                value={formulario.resumo}
                                onChange={alterarCampo}
                                rows={5}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="categoria_id"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Categoria
                            </label>

                            <select
                                id="categoria_id"
                                name="categoria_id"
                                value={formulario.categoria_id}
                                onChange={alterarCampo}
                                required
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="">
                                    Selecione uma categoria
                                </option>

                                {categorias.map((categoria) => (
                                    <option
                                        key={categoria.id}
                                        value={categoria.id}
                                    >
                                        {categoria.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="classificacao_indicativa_id"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Classificação indicativa
                            </label>

                            <select
                                id="classificacao_indicativa_id"
                                name="classificacao_indicativa_id"
                                value={formulario.classificacao_indicativa_id}
                                onChange={alterarCampo}
                                required
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="">
                                    Selecione uma classificação
                                </option>

                                {classificacoes.map((classificacao) => (
                                    <option
                                        key={classificacao.id}
                                        value={classificacao.id}
                                    >
                                        {classificacao.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="idioma_id"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Idioma
                            </label>

                            <select
                                id="idioma_id"
                                name="idioma_id"
                                value={formulario.idioma_id}
                                onChange={alterarCampo}
                                required
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="">
                                    Selecione o idioma
                                </option>

                                {idiomas.map((idioma) => (
                                    <option
                                        key={idioma.id}
                                        value={idioma.id}
                                    >
                                        {idioma.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {erro && (
                        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {erro}
                        </div>
                    )}

                    <div className="mt-8 flex gap-3">

                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={salvando}
                            className="rounded-md border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={salvando}
                            className="rounded-md bg-gray-900 px-5 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {salvando
                                ? 'Criando...'
                                : 'Criar obra'}
                        </button>

                    </div>
                </form>
            </div>
        </main>
    );
}
