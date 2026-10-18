
'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { apiFetch } from '../../../services/api';

import {
    listarContratos,
    listarVersoesContrato,
    buscarVersaoAtiva,
    solicitarCodigoAceite,
    confirmarCodigoAceite,
    listarAceitesPorUsuario,
} from '../../../services/contratos';

function ContratosConteudo() {
    const searchParams = useSearchParams();
    const livroId = searchParams.get('livro_id');
    const contratoIdQuery = searchParams.get('contrato_id');
    const [contratos, setContratos] = useState([]);
    const [versoes, setVersoes] = useState([]);

    const [contratoSelecionado, setContratoSelecionado] = useState(null);
    const [versaoSelecionada, setVersaoSelecionada] = useState(null);

    const [aceites, setAceites] = useState([]);

    const [aceiteConfirmado, setAceiteConfirmado] = useState(false);
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [codigo, setCodigo] = useState('');

    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [tituloObra, setTituloObra] = useState('');

    useEffect(() => {
        carregarObra();
        carregarContratos();
        carregarMeusAceites();
    }, [livroId]);

    async function carregarObra() {
        setTituloObra('');
        if (!livroId) return;

        try {
            const resposta = await apiFetch(`/api/livros/${livroId}`);
            setTituloObra(resposta?.data?.titulo || 'Obra indisponível');
        } catch (err) {
            setTituloObra('Obra indisponível ou sem acesso.');
        }
    }

    async function executar(callback) {
        setCarregando(true);
        setMensagem('');
        setErro('');

        try {
            await callback();
        } catch (err) {
            console.error(err);

            setErro(
                err?.data?.message ||
                err?.message ||
                'Ocorreu um erro ao realizar a operação.'
            );
        } finally {
            setCarregando(false);
        }
    }

    async function carregarContratos() {
        await executar(async () => {
            let listaContratos = [];

            if (livroId) {
                const resposta = await listarContratos({
                    ativo: true,
                    tipo: 'DIREITOS_AUTORAIS'
                });
                listaContratos = (resposta?.data || []).filter(
                    (contrato) => contrato?.tipo === 'DIREITOS_AUTORAIS' && contrato.ativo
                );
            } else {
                const resposta = await listarContratos();
                listaContratos = resposta.data || [];
            }

            setContratos(listaContratos);

            const contratoPreselecionado = contratoIdQuery
                ? listaContratos.find((contrato) => contrato.id === contratoIdQuery)
                : listaContratos.length === 1 ? listaContratos[0] : null;

            if (contratoPreselecionado) {
                await selecionarContrato(contratoPreselecionado);
            } else if (livroId) {
                setContratoSelecionado(null);
                setVersaoSelecionada(null);
                setVersoes([]);
            }
        });
    }

    async function selecionarContrato(contrato) {
        setContratoSelecionado(contrato);
        setVersaoSelecionada(null);
        setVersoes([]);
        setAceiteConfirmado(false);
        setCodigoEnviado(false);
        setCodigo('');

        await executar(async () => {
            const resposta = await listarVersoesContrato(contrato.id);

            setVersoes(resposta.data || []);

            const ativa = await buscarVersaoAtiva(contrato.id);

            if (ativa?.data) {
                setVersaoSelecionada(ativa.data);
            }
        });
    }

    async function carregarMeusAceites() {
        const token =
            typeof window !== 'undefined'
                ? localStorage.getItem('token')
                : null;

        if (!token) {
            return;
        }

        try {
            const payload = JSON.parse(
                atob(token.split('.')[1])
            );

            const resposta = await listarAceitesPorUsuario(payload.id);

            setAceites(resposta.data || []);
        } catch (err) {
            console.error('Erro ao carregar aceites:', err);
        }
    }

    async function solicitarCodigo() {
        if (!livroId) {
            setErro('Selecione uma obra antes de solicitar o aceite do contrato.');
            return;
        }

        if (!versaoSelecionada) {
            setErro('Nenhuma versão selecionada.');
            return;
        }

        if (versaoSelecionada.status !== 'ATIVA') {
            setErro('Somente uma versão ATIVA pode receber aceite.');
            return;
        }

        if (!aceiteConfirmado) {
            setErro(
                'É necessário confirmar que você leu e concorda com o Termo.'
            );
            return;
        }

        await executar(async () => {
            const resposta = await solicitarCodigoAceite(
                versaoSelecionada.id,
                livroId
            );

            setCodigoEnviado(true);

            setMensagem(
                resposta.message ||
                'Código enviado para o e-mail cadastrado.'
            );
        });
    }

    async function confirmarCodigo() {
        if (codigo.length !== 6) {
            setErro(
                'Informe o código de 6 dígitos recebido por e-mail.'
            );
            return;
        }

        await executar(async () => {
            const resposta = await confirmarCodigoAceite(codigo);

            setMensagem(
                resposta.message ||
                'Código confirmado e aceite registrado com sucesso.'
            );

            setCodigo('');
            setCodigoEnviado(false);
            setAceiteConfirmado(false);

            await carregarMeusAceites();

            console.log(
                'Aceite registrado:',
                resposta.data
            );
        });
    }

    return (
        <main className="mx-auto max-w-6xl p-6">
            <h1 className="mb-6 text-3xl font-bold">
                Contratos
            </h1>

    <div className="mb-6 rounded border bg-blue-50 p-4">
        <h3 className="font-semibold">
            Obra
        </h3>

    <p className="mt-1">
        {livroId
            ? tituloObra || 'Carregando obra...'
            : 'Para solicitar um aceite, abra esta tela a partir da regularização de uma obra.'}
    </p>
</div>

            {mensagem && (
                <div className="mb-6 rounded border border-green-300 bg-green-50 p-4 text-green-800">
                    {mensagem}
                </div>
            )}

            {erro && (
                <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-800">
                    {erro}
                </div>
            )}

            <section className="mb-8">
                <h2 className="mb-3 text-xl font-semibold">
                    Contratos disponíveis
                </h2>

                {contratos.length === 0 ? (
                    <p>Nenhum contrato disponível.</p>
                ) : (
                    <div className="space-y-3">
                        {contratos.map((contrato) => (
                            <button
                                key={contrato.id}
                                onClick={() =>
                                    selecionarContrato(contrato)
                                }
                                className={`block w-full rounded border p-4 text-left hover:bg-gray-50 ${
                                    contratoSelecionado?.id === contrato.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : ''
                                }`}
                            >
                                <div className="font-semibold">
                                    {contrato.nome}
                                </div>

                                <div className="mt-1 text-sm text-gray-600">
                                    {contrato.codigo}
                                </div>

                                {contrato.descricao && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        {contrato.descricao}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {contratoSelecionado && (
                <section className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold">
                        Versões do contrato
                    </h2>

                    {versoes.length === 0 ? (
                        <p>Nenhuma versão encontrada.</p>
                    ) : (
                        <div className="space-y-3">
                            {versoes.map((versao) => (
                                <button
                                    key={versao.id}
                                    onClick={() =>
                                        setVersaoSelecionada(versao)
                                    }
                                    className={`block w-full rounded border p-4 text-left ${
                                        versaoSelecionada?.id === versao.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">
                                            Versão {versao.versao}
                                        </span>

                                        <span className="text-sm">
                                            {versao.status}
                                        </span>
                                    </div>

                                    <div className="mt-1 text-sm text-gray-600">
                                        {versao.titulo}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {versaoSelecionada && (
                <section className="mb-8 rounded border p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">
                            {versaoSelecionada.titulo}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Versão {versaoSelecionada.versao} —{' '}
                            {versaoSelecionada.status}
                        </p>
                    </div>

                    <div className="prose prose-lg max-w-none leading-8">
                        <ReactMarkdown>
                            {versaoSelecionada.conteudo}
                        </ReactMarkdown>
                    </div>

                    {versaoSelecionada.status === 'ATIVA' && (
                        <div className="mt-8 border-t pt-6">
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={aceiteConfirmado}
                                    disabled={codigoEnviado}
                                    onChange={(e) =>
                                        setAceiteConfirmado(
                                            e.target.checked
                                        )
                                    }
                                    className="mt-1 h-5 w-5"
                                />

                                <span>
                                    Declaro que li e concordo com os termos
                                    deste contrato.
                                </span>
                            </label>

                            {!codigoEnviado && (
                                <button
                                    onClick={solicitarCodigo}
                                    disabled={
                                        carregando ||
                                        !livroId ||
                                        !aceiteConfirmado
                                    }
                                    className="mt-5 rounded bg-blue-600 px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {!livroId
                                        ? 'Selecione uma obra para assinar'
                                        : carregando
                                        ? 'Enviando...'
                                        : 'Solicitar código de confirmação'}
                                </button>
                            )}

                            {codigoEnviado && (
                                <div className="mt-6 rounded border bg-gray-50 p-5">
                                    <h3 className="mb-2 font-semibold">
                                        Confirmação do aceite
                                    </h3>

                                    <p className="mb-4 text-sm text-gray-600">
                                        Enviamos um código de 6 dígitos para
                                        o seu e-mail cadastrado.
                                    </p>

                                    <div className="flex flex-wrap items-end gap-3">
                                        <div>
                                            <label
                                                htmlFor="codigo-aceite"
                                                className="mb-1 block text-sm font-medium"
                                            >
                                                Código de confirmação
                                            </label>

                                            <input
                                                id="codigo-aceite"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={codigo}
                                                onChange={(e) =>
                                                    setCodigo(
                                                        e.target.value
                                                            .replace(/\D/g, '')
                                                            .slice(0, 6)
                                                    )
                                                }
                                                placeholder="000000"
                                                className="w-40 rounded border px-3 py-2 text-center text-lg tracking-widest"
                                            />
                                        </div>

                                        <button
                                            onClick={confirmarCodigo}
                                            disabled={
                                                carregando ||
                                                codigo.length !== 6
                                            }
                                            className="rounded bg-green-600 px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {carregando
                                                ? 'Confirmando...'
                                                : 'Confirmar aceite'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}
{/* Cabeçalho flexível para alinhar título e botão */}
 <section>
    <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
            Meus aceites
        </h2>

        <Link
            href="/dashboard"
            className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
            Dashboard
        </Link>
    </div>

    {aceites.length === 0 ? (
        <p className="text-gray-600">
            Nenhum aceite registrado.
        </p>
    ) : (
        <div className="space-y-3">
            {aceites.map((aceite) => (
                <div
                    key={aceite.id}
                    className="rounded border p-4"
                >
                    <div className="font-semibold">
                        Aceite registrado
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                        Registro eletrônico:{' '}
                        {aceite.registro_eletronico}
                    </div>

                    <div className="text-sm text-gray-600">
                        Data:{' '}
                        {aceite.aceito_em
                            ? new Date(
                                  aceite.aceito_em
                              ).toLocaleString('pt-BR')
                            : '-'}
                    </div>

                    {aceite.hash_conteudo && (
                        <div className="mt-2 break-all text-xs text-gray-500">
                            SHA-256:{' '}
                            {aceite.hash_conteudo}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )}
</section>   

    </main>
    );
}

export default function ContratosPage() {
    return (
        <Suspense
            fallback={
                <main className="mx-auto max-w-6xl p-6">
                    Carregando contratos...
                </main>
            }
        >
            <ContratosConteudo />
        </Suspense>
    );
}
