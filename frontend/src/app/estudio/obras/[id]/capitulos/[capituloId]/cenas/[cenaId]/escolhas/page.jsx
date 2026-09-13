'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { apiFetch } from '../../../../../../../../../services/api';
import { listarCapitulosPorLivro } from '../../../../../../../../../services/capitulo';

export default function EscolhasCenaPage() {
    const params = useParams();
    const router = useRouter();

    const { id, capituloId, cenaId } = params;

    const [obra, setObra] = useState(null);
    const [capituloAtual, setCapituloAtual] = useState(null);
    const [cenaAtual, setCenaAtual] = useState(null);

    const [capitulos, setCapitulos] = useState([]);
    const [cenasPorCapitulo, setCenasPorCapitulo] = useState({});

    const [escolhas, setEscolhas] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [formAberto, setFormAberto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    const [texto, setTexto] = useState('');
    const [capituloDestinoId, setCapituloDestinoId] = useState('');
    const [cenaDestinoId, setCenaDestinoId] = useState('');

    const [salvando, setSalvando] = useState(false);
    const [processandoId, setProcessandoId] = useState(null);
    const [reordenando, setReordenando] = useState(false);

    const cenasDoCapituloDestino = useMemo(() => {
        if (!capituloDestinoId) {
            return [];
        }

        return cenasPorCapitulo[capituloDestinoId] || [];
    }, [capituloDestinoId, cenasPorCapitulo]);

    const mapaCenas = useMemo(() => {
        const mapa = {};

        Object.values(cenasPorCapitulo).forEach((cenas) => {
            cenas.forEach((cena) => {
                mapa[cena.id] = cena;
            });
        });

        return mapa;
    }, [cenasPorCapitulo]);

    const mapaCapitulos = useMemo(() => {
        const mapa = {};

        capitulos.forEach((capitulo) => {
            mapa[capitulo.id] = capitulo;
        });

        return mapa;
    }, [capitulos]);

    async function carregarEscolhas() {
        const resposta = await apiFetch(`/api/escolhas/cena/${cenaId}`);

        if (!resposta.success) {
            throw new Error(
                resposta.message || 'Não foi possível carregar as escolhas.'
            );
        }

        setEscolhas(resposta.data || []);
    }

    async function carregarEstrutura() {
        const respostaObra = await apiFetch(`/api/livros/${id}`);

        if (!respostaObra.success) {
            throw new Error(
                respostaObra.message || 'Não foi possível carregar a obra.'
            );
        }

        const respostaCapitulo = await apiFetch(
            `/api/capitulos/${capituloId}`
        );

        if (!respostaCapitulo.success) {
            throw new Error(
                respostaCapitulo.message ||
                    'Não foi possível carregar o capítulo.'
            );
        }

        const respostaCena = await apiFetch(`/api/cenas/${cenaId}`);

        if (!respostaCena.success) {
            throw new Error(
                respostaCena.message || 'Não foi possível carregar a cena.'
            );
        }

        const respostaCapitulos = await listarCapitulosPorLivro(id);

        if (!respostaCapitulos.success) {
            throw new Error(
                respostaCapitulos.message ||
                    'Não foi possível carregar os capítulos da obra.'
            );
        }

        const capitulosCarregados = [...(respostaCapitulos.data || [])].sort(
            (a, b) => a.ordem_exibicao - b.ordem_exibicao
        );

        const resultadosCenas = await Promise.all(
            capitulosCarregados.map(async (capitulo) => {
                const resposta = await apiFetch(
                    `/api/cenas/capitulo/${capitulo.id}`
                );

                if (!resposta.success) {
                    throw new Error(
                        resposta.message ||
                            `Não foi possível carregar as cenas do capítulo "${capitulo.titulo}".`
                    );
                }

                const cenas = [...(resposta.data || [])].sort(
                    (a, b) => a.ordem_exibicao - b.ordem_exibicao
                );

                return {
                    capituloId: capitulo.id,
                    cenas,
                };
            })
        );

        const estruturaCenas = {};

        resultadosCenas.forEach(({ capituloId: idCapitulo, cenas }) => {
            estruturaCenas[idCapitulo] = cenas;
        });

        setObra(respostaObra.data);
        setCapituloAtual(respostaCapitulo.data);
        setCenaAtual(respostaCena.data);
        setCapitulos(capitulosCarregados);
        setCenasPorCapitulo(estruturaCenas);
    }

    async function carregarDados() {
        try {
            setCarregando(true);
            setErro('');

            await Promise.all([
                carregarEstrutura(),
                carregarEscolhas(),
            ]);
        } catch (error) {
            console.error(error);
            setErro(
                error.message || 'Não foi possível carregar a página.'
            );
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        if (!id || !capituloId || !cenaId) {
            return;
        }

        carregarDados();
    }, [id, capituloId, cenaId]);

    function abrirNovaEscolha() {
        setEditandoId(null);
        setTexto('');
        setCapituloDestinoId('');
        setCenaDestinoId('');
        setErro('');
        setFormAberto(true);
    }

    function abrirEdicao(escolha) {
        const cenaDestino = mapaCenas[escolha.cena_destino_id];

        if (!cenaDestino) {
            setErro(
                'A cena de destino desta escolha não foi encontrada na estrutura da obra.'
            );
            return;
        }

        setEditandoId(escolha.id);
        setTexto(escolha.texto || '');
        setCapituloDestinoId(cenaDestino.capitulo_id);
        setCenaDestinoId(cenaDestino.id);
        setErro('');
        setFormAberto(true);
    }

    function cancelarFormulario() {
        if (salvando) {
            return;
        }

        setFormAberto(false);
        setEditandoId(null);
        setTexto('');
        setCapituloDestinoId('');
        setCenaDestinoId('');
    }

    function alterarCapituloDestino(valor) {
        setCapituloDestinoId(valor);
        setCenaDestinoId('');
    }

    async function salvarEscolha(event) {
        event.preventDefault();

        if (!texto.trim()) {
            setErro('Informe o texto da escolha.');
            return;
        }

        if (!capituloDestinoId) {
            setErro('Selecione o capítulo de destino.');
            return;
        }

        if (!cenaDestinoId) {
            setErro('Selecione a cena de destino.');
            return;
        }

        try {
            setSalvando(true);
            setErro('');

            if (editandoId) {
                const escolhaAtual = escolhas.find(
                    (escolha) => escolha.id === editandoId
                );

                if (!escolhaAtual) {
                    throw new Error(
                        'A escolha que está sendo editada não foi encontrada.'
                    );
                }

                const textoAlterado =
                    escolhaAtual.texto !== texto.trim();

                const destinoAlterado =
                    escolhaAtual.cena_destino_id !== cenaDestinoId;

                if (textoAlterado) {
                    const respostaTexto = await apiFetch(
                        `/api/escolhas/${editandoId}/texto`,
                        {
                            method: 'PATCH',
                            body: JSON.stringify({
                                texto: texto.trim(),
                            }),
                        }
                    );

                    if (!respostaTexto.success) {
                        throw new Error(
                            respostaTexto.message ||
                                'Não foi possível alterar o texto da escolha.'
                        );
                    }
                }

                if (destinoAlterado) {
                    const respostaDestino = await apiFetch(
                        `/api/escolhas/${editandoId}/destino`,
                        {
                            method: 'PATCH',
                            body: JSON.stringify({
                                cena_destino_id: cenaDestinoId,
                            }),
                        }
                    );

                    if (!respostaDestino.success) {
                        throw new Error(
                            respostaDestino.message ||
                                'Não foi possível alterar o destino da escolha.'
                        );
                    }
                }
            } else {
                const proximaOrdem =
                    escolhas.length > 0
                        ? Math.max(
                              ...escolhas.map(
                                  (escolha) =>
                                      Number(escolha.ordem_exibicao) || 0
                              )
                          ) + 1
                        : 1;

                const resposta = await apiFetch('/api/escolhas', {
                    method: 'POST',
                    body: JSON.stringify({
                        cena_origem_id: cenaId,
                        cena_destino_id: cenaDestinoId,
                        texto: texto.trim(),
                        ordem_exibicao: proximaOrdem,
                    }),
                });

                if (!resposta.success) {
                    throw new Error(
                        resposta.message ||
                            'Não foi possível criar a escolha.'
                    );
                }
            }

            await carregarEscolhas();
            cancelarFormulario();
        } catch (error) {
            console.error(error);
            setErro(
                error.message || 'Não foi possível salvar a escolha.'
            );
        } finally {
            setSalvando(false);
        }
    }

    async function excluirEscolha(escolha) {
        const confirmou = window.confirm(
            `Deseja realmente excluir a escolha "${escolha.texto}"?`
        );

        if (!confirmou) {
            return;
        }

        try {
            setProcessandoId(escolha.id);
            setErro('');

            const resposta = await apiFetch(
                `/api/escolhas/${escolha.id}`,
                {
                    method: 'DELETE',
                }
            );

            if (!resposta.success) {
                throw new Error(
                    resposta.message ||
                        'Não foi possível excluir a escolha.'
                );
            }

            if (editandoId === escolha.id) {
                cancelarFormulario();
            }

            await carregarEscolhas();
        } catch (error) {
            console.error(error);
            setErro(
                error.message || 'Não foi possível excluir a escolha.'
            );
        } finally {
            setProcessandoId(null);
        }
    }

    async function moverEscolha(indice, direcao) {
        const novoIndice = indice + direcao;

        if (
            novoIndice < 0 ||
            novoIndice >= escolhas.length ||
            reordenando
        ) {
            return;
        }

        const novaOrdem = [...escolhas];

        const temporaria = novaOrdem[indice];
        novaOrdem[indice] = novaOrdem[novoIndice];
        novaOrdem[novoIndice] = temporaria;

        try {
            setReordenando(true);
            setErro('');

            const resposta = await apiFetch('/api/escolhas/reordenar', {
                method: 'PATCH',
                body: JSON.stringify({
                    cena_origem_id: cenaId,
                    ordem: novaOrdem.map((escolha) => ({
                        id: escolha.id,
                    })),
                }),
            });

            if (!resposta.success) {
                throw new Error(
                    resposta.message ||
                        'Não foi possível reordenar as escolhas.'
                );
            }

            setEscolhas(resposta.data || []);
        } catch (error) {
            console.error(error);
            setErro(
                error.message ||
                    'Não foi possível reordenar as escolhas.'
            );
        } finally {
            setReordenando(false);
        }
    }

    function visualizarObra() {
        if (!obra?.slug || !capituloAtual?.slug || !cenaAtual?.slug) {
            setErro(
                'Não foi possível montar o endereço de visualização da obra.'
            );
            return;
        }

        router.push(
            `/livros/${obra.slug}/capitulos/${capituloAtual.slug}/cenas/${cenaAtual.slug}`
        );
    }

    function voltarParaCena() {
        router.push(
            `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cenaId}`
        );
    }

    function obterDestino(escolha) {
        const cena = mapaCenas[escolha.cena_destino_id];

        if (!cena) {
            return {
                capitulo: null,
                cena: null,
            };
        }

        return {
            capitulo: mapaCapitulos[cena.capitulo_id] || null,
            cena,
        };
    }

    if (carregando) {
        return (
            <main className="mx-auto max-w-6xl p-6">
                <p className="text-gray-600">
                    Carregando escolhas...
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-6xl p-6">
            <div className="mb-6">
                <button
                    type="button"
                    onClick={voltarParaCena}
                    className="mb-4 text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Voltar para a cena
                </button>

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-sm text-gray-500">
                            {obra?.titulo || 'Obra'}
                        </p>

                        <h1 className="text-3xl font-bold">
                            Escolhas
                        </h1>

                        <p className="mt-1 text-gray-600">
                            {capituloAtual?.titulo || 'Capítulo'} ·{' '}
                            {cenaAtual?.titulo || 'Cena'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={visualizarObra}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                        Visualizar a Obra Inteira
                    </button>
                </div>
            </div>

            {erro && (
                <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {erro}
                </div>
            )}

            <section className="mb-8 rounded-lg border bg-white p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Visão Estrutural da Obra
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Use esta estrutura para se orientar na obra e
                        identificar as cenas que podem ser utilizadas como
                        destino das escolhas.
                    </p>
                </div>

                <div className="space-y-5">
                    {capitulos.map((capitulo, indiceCapitulo) => {
                        const cenas =
                            cenasPorCapitulo[capitulo.id] || [];

                        const capituloAtualDestaque =
                            capitulo.id === capituloId;

                        return (
                            <div key={capitulo.id}>
                                <div
                                    className={`mb-2 font-semibold ${
                                        capituloAtualDestaque
                                            ? 'text-blue-700'
                                            : 'text-gray-800'
                                    }`}
                                >
                                    Capítulo {indiceCapitulo + 1}
                                    {' · '}
                                    {capitulo.titulo}

                                    {capituloAtualDestaque && (
                                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                            capítulo atual
                                        </span>
                                    )}
                                </div>

                                <div className="ml-4 space-y-1 border-l pl-4">
                                    {cenas.map((cena) => {
                                        const atual =
                                            cena.id === cenaId;

                                        return (
                                            <div
                                                key={cena.id}
                                                className={`rounded-md px-3 py-2 text-sm ${
                                                    atual
                                                        ? 'border border-blue-200 bg-blue-50 font-medium text-blue-800'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                <span className="mr-2 text-gray-400">
                                                    {cena.ordem_exibicao}.
                                                </span>

                                                {cena.titulo}

                                                {atual && (
                                                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        cena atual
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {cenas.length === 0 && (
                                        <p className="text-sm text-gray-500">
                                            Nenhuma cena encontrada.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Escolhas da Cena
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            Defina os caminhos disponíveis para o leitor a
                            partir desta cena.
                        </p>
                    </div>

                    {!formAberto && (
                        <button
                            type="button"
                            onClick={abrirNovaEscolha}
                            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            + Nova escolha
                        </button>
                    )}
                </div>

                {formAberto && (
                    <form
                        onSubmit={salvarEscolha}
                        className="mb-6 rounded-md border bg-gray-50 p-5"
                    >
                        <h3 className="mb-4 font-semibold">
                            {editandoId
                                ? 'Editar escolha'
                                : 'Nova escolha'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="texto-escolha"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Texto da escolha
                                </label>

                                <input
                                    id="texto-escolha"
                                    type="text"
                                    value={texto}
                                    onChange={(event) =>
                                        setTexto(event.target.value)
                                    }
                                    placeholder="Ex.: Seguir pela esquerda"
                                    disabled={salvando}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="capitulo-destino"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Capítulo de destino
                                </label>

                                <select
                                    id="capitulo-destino"
                                    value={capituloDestinoId}
                                    onChange={(event) =>
                                        alterarCapituloDestino(
                                            event.target.value
                                        )
                                    }
                                    disabled={salvando}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                                >
                                    <option value="">
                                        Selecione o capítulo
                                    </option>

                                    {capitulos.map((capitulo, indice) => (
                                        <option
                                            key={capitulo.id}
                                            value={capitulo.id}
                                        >
                                            Capítulo {indice + 1} ·{' '}
                                            {capitulo.titulo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="cena-destino"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Cena de destino
                                </label>

                                <select
                                    id="cena-destino"
                                    value={cenaDestinoId}
                                    onChange={(event) =>
                                        setCenaDestinoId(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        salvando ||
                                        !capituloDestinoId
                                    }
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 disabled:bg-gray-100"
                                >
                                    <option value="">
                                        {capituloDestinoId
                                            ? 'Selecione a cena'
                                            : 'Selecione primeiro o capítulo'}
                                    </option>

                                    {cenasDoCapituloDestino.map(
                                        (cena) => (
                                            <option
                                                key={cena.id}
                                                value={cena.id}
                                            >
                                                Cena {cena.ordem_exibicao}{' '}
                                                · {cena.titulo}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                onClick={cancelarFormulario}
                                disabled={salvando}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={salvando}
                                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {salvando
                                    ? 'Salvando...'
                                    : editandoId
                                      ? 'Salvar alterações'
                                      : 'Criar escolha'}
                            </button>
                        </div>
                    </form>
                )}

                {escolhas.length === 0 ? (
                    <div className="rounded-md border border-dashed p-8 text-center">
                        <p className="font-medium text-gray-700">
                            Esta cena ainda não possui escolhas.
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Crie uma escolha para definir um caminho
                            narrativo para o leitor.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {escolhas.map((escolha, indice) => {
                            const destino = obterDestino(escolha);

                            return (
                                <article
                                    key={escolha.id}
                                    className="rounded-md border p-4"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="min-w-0">
                                            <div className="mb-2 flex items-center gap-2">
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                                    {indice + 1}
                                                </span>

                                                <span className="text-xs text-gray-500">
                                                    ordem{' '}
                                                    {
                                                        escolha.ordem_exibicao
                                                    }
                                                </span>
                                            </div>

                                            <p className="font-medium text-gray-900">
                                                {escolha.texto}
                                            </p>

                                            <div className="mt-2 text-sm text-gray-600">
                                                <span className="font-medium">
                                                    →
                                                </span>{' '}
                                                {destino.capitulo ? (
                                                    <>
                                                        {
                                                            destino
                                                                .capitulo
                                                                .titulo
                                                        }{' '}
                                                        ·{' '}
                                                        {destino.cena
                                                            ?.titulo ||
                                                            'Cena não encontrada'}
                                                    </>
                                                ) : (
                                                    <span className="text-red-600">
                                                        Destino não encontrado
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moverEscolha(
                                                        indice,
                                                        -1
                                                    )
                                                }
                                                disabled={
                                                    indice === 0 ||
                                                    reordenando
                                                }
                                                title="Mover para cima"
                                                className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                ↑
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moverEscolha(
                                                        indice,
                                                        1
                                                    )
                                                }
                                                disabled={
                                                    indice ===
                                                        escolhas.length -
                                                            1 ||
                                                    reordenando
                                                }
                                                title="Mover para baixo"
                                                className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                ↓
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    abrirEdicao(
                                                        escolha
                                                    )
                                                }
                                                disabled={
                                                    processandoId ===
                                                        escolha.id ||
                                                    reordenando
                                                }
                                                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    excluirEscolha(
                                                        escolha
                                                    )
                                                }
                                                disabled={
                                                    processandoId ===
                                                        escolha.id ||
                                                    reordenando
                                                }
                                                className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {processandoId ===
                                                escolha.id
                                                    ? 'Excluindo...'
                                                    : 'Excluir'}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
