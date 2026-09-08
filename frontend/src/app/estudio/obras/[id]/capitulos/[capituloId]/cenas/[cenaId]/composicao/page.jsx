'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../../../../../services/api';

export default function ComposicaoCena() {
    const params = useParams();
    const router = useRouter();

    const { id, capituloId, cenaId } = params;

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [conteudos, setConteudos] = useState([]);
    const [ordemOriginal, setOrdemOriginal] = useState([]);

    const [salvando, setSalvando] = useState(false);

    const [erroAcao, setErroAcao] = useState('');
    const [sucessoAcao, setSucessoAcao] = useState('');

    useEffect(() => {
        async function carregarDados() {
            try {
                setCarregando(true);
                setErro('');

                const resposta = await apiFetch(
                    `/api/cena-conteudos/cena/${cenaId}`
                );

                const lista = (resposta.data || []).sort(
                    (a, b) =>
                        a.ordem_exibicao -
                        b.ordem_exibicao
                );

                setConteudos(lista);

                setOrdemOriginal(
                    lista.map(
                        (conteudo) => conteudo.id
                    )
                );
            } catch (error) {
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        if (cenaId) {
            carregarDados();
        }
    }, [cenaId]);

    function obterOrdemAtual() {
        return conteudos.map(
            (conteudo) => conteudo.id
        );
    }

    function possuiAlteracoes() {
        const atual = obterOrdemAtual();

        if (
            atual.length !==
            ordemOriginal.length
        ) {
            return true;
        }

        return atual.some(
            (id, indice) =>
                id !== ordemOriginal[indice]
        );
    }

    function moverConteudo(indiceAtual, indiceDestino) {
        if (salvando) {
            return;
        }

        if (
            indiceDestino < 0 ||
            indiceDestino >= conteudos.length
        ) {
            return;
        }

        setErroAcao('');
        setSucessoAcao('');

        const novaOrdem = [...conteudos];

        const [conteudoMovido] =
            novaOrdem.splice(indiceAtual, 1);

        novaOrdem.splice(
            indiceDestino,
            0,
            conteudoMovido
        );

        setConteudos(novaOrdem);
    }

    async function salvarAlteracoes() {
        if (salvando || !possuiAlteracoes()) {
            return;
        }

        try {
            setSalvando(true);
            setErroAcao('');
            setSucessoAcao('');

            await apiFetch(
                '/api/cena-conteudos/reordenar',
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        cena_id: cenaId,
                        ordem: conteudos.map(
                            (conteudo) => ({
                                id: conteudo.id
                            })
                        )
                    })
                }
            );

            const novaOrdem = obterOrdemAtual();

            setOrdemOriginal(novaOrdem);

            setConteudos(
                conteudos.map(
                    (conteudo, indice) => ({
                        ...conteudo,
                        ordem_exibicao:
                            indice + 1
                    })
                )
            );

            setSucessoAcao(
                'Ordem dos conteúdos salva com sucesso.'
            );
        } catch (error) {
            setErroAcao(error.message);
        } finally {
            setSalvando(false);
        }
    }

    function voltarParaCena() {
        if (salvando) {
            return;
        }

        router.push(
            `/estudio/obras/${id}/capitulos/${capituloId}/cenas/${cenaId}`
        );
    }

    if (carregando) {
        return (
            <main className="p-8">
                <p>
                    Carregando composição da cena...
                </p>
            </main>
        );
    }

    if (erro) {
        return (
            <main className="p-8">
                <p className="text-red-600">
                    {erro}
                </p>
            </main>
        );
    }

    const alteracoesPendentes =
        possuiAlteracoes();

    return (
        <main className="p-8 max-w-5xl mx-auto">

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">
                        Composição da cena
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Organize a sequência dos conteúdos
                        que serão apresentados na cena.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={voltarParaCena}
                    disabled={salvando}
                    className="px-4 py-2 border rounded disabled:opacity-40"
                >
                    Voltar para cena
                </button>
            </div>

            {erroAcao && (
                <div className="mb-4 p-3 border border-red-300 rounded text-red-700">
                    {erroAcao}
                </div>
            )}

            {sucessoAcao && (
                <div className="mb-4 p-3 border border-green-300 rounded text-green-700">
                    {sucessoAcao}
                </div>
            )}

            <section>

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Conteúdos da cena
                        </h2>

                        {alteracoesPendentes && (
                            <p className="text-sm text-amber-600 mt-1">
                                Existem alterações não salvas.
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={salvarAlteracoes}
                        disabled={
                            !alteracoesPendentes ||
                            salvando
                        }
                        className="px-4 py-2 rounded bg-black text-white disabled:opacity-40"
                    >
                        {salvando
                            ? 'Salvando...'
                            : 'Salvar alterações'}
                    </button>
                </div>

                {conteudos.length === 0 ? (
                    <div className="border rounded p-6 text-gray-600">
                        Esta cena ainda não possui conteúdo
                        na composição.
                    </div>
                ) : (
                    <div className="space-y-3">

                        {conteudos.map(
                            (conteudo, indice) => (
                                <div
                                    key={conteudo.id}
                                    className="border rounded p-4 flex justify-between items-center"
                                >

                                    <div>
                                        <p className="font-semibold">
                                            {indice + 1}.
                                            {' '}
                                            {conteudo.tipo_conteudo}
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            ID: {conteudo.conteudo_id}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">

                                        <button
                                            type="button"
                                            disabled={
                                                indice === 0 ||
                                                salvando
                                            }
                                            onClick={() =>
                                                moverConteudo(
                                                    indice,
                                                    indice - 1
                                                )
                                            }
                                            className="px-3 py-2 border rounded disabled:opacity-40"
                                            title="Mover para cima"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                indice ===
                                                    conteudos.length - 1 ||
                                                salvando
                                            }
                                            onClick={() =>
                                                moverConteudo(
                                                    indice,
                                                    indice + 1
                                                )
                                            }
                                            className="px-3 py-2 border rounded disabled:opacity-40"
                                            title="Mover para baixo"
                                        >
                                            ↓
                                        </button>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </section>

        </main>
    );
}
