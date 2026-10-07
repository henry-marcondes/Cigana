'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    listarMeusTelefones,
    criarTelefone,
    atualizarTelefone,
    definirTelefonePrincipal,
    desativarTelefone
} from '../../../services/telefones';

import {
    obterUsuario,
    estaAutenticado
} from '../../../services/autenticacao';

const TELEFONE_VAZIO = {
    tipo: 'CELULAR',
    codigo_pais: '55',
    ddd: '',
    numero: '',
    principal: false
};

export default function TelefonesPage() {
    const router = useRouter();

    const [telefones, setTelefones] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const [modoEdicao, setModoEdicao] = useState(false);
    const [telefoneEditando, setTelefoneEditando] = useState(null);
    const [formulario, setFormulario] = useState(TELEFONE_VAZIO);

    useEffect(() => {
        if (!estaAutenticado()) {
            router.push('/login');
            return;
        }

        const usuarioAtual = obterUsuario();

        if (!usuarioAtual) {
            router.push('/login');
            return;
        }

        setUsuario(usuarioAtual);
        carregarTelefones();
    }, [router]);

    async function carregarTelefones() {
        try {
            setCarregando(true);
            setErro('');

            const resposta = await listarMeusTelefones();

            setTelefones(resposta.data || []);
        } catch (error) {
            console.error('Erro ao carregar telefones:', error);

            if (error.status === 404) {
                setErro('Cadastro de pessoa não encontrado.');
            } else {
                setErro('Não foi possível carregar seus telefones.');
            }
        } finally {
            setCarregando(false);
        }
    }

    function iniciarNovoTelefone() {
        setFormulario({
            ...TELEFONE_VAZIO,
            principal: telefones.length === 0
        });

        setTelefoneEditando(null);
        setModoEdicao(true);
        setErro('');
        setMensagem('');
    }

    function iniciarEdicao(telefone) {
        setFormulario({
            tipo: telefone.tipo || 'CELULAR',
            codigo_pais: telefone.codigo_pais || '55',
            ddd: telefone.ddd || '',
            numero: telefone.numero || '',
            principal: telefone.principal || false
        });

        setTelefoneEditando(telefone);
        setModoEdicao(true);
        setErro('');
        setMensagem('');
    }

    function cancelarEdicao() {
        setModoEdicao(false);
        setTelefoneEditando(null);
        setFormulario(TELEFONE_VAZIO);
        setErro('');
    }

    function alterarCampo(event) {
        const { name, value, type, checked } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    async function salvarTelefone(event) {
        event.preventDefault();

        setSalvando(true);
        setErro('');
        setMensagem('');

        try {
            const dados = {
                tipo: formulario.tipo,
                codigo_pais: formulario.codigo_pais,
                ddd: formulario.ddd || null,
                numero: formulario.numero,
                principal: formulario.principal
            };

            if (telefoneEditando) {
                await atualizarTelefone(
                    telefoneEditando.id,
                    dados
                );

                setMensagem('Telefone atualizado com sucesso.');
            } else {
                await criarTelefone(dados);

                setMensagem('Telefone cadastrado com sucesso.');
            }

            setModoEdicao(false);
            setTelefoneEditando(null);
            setFormulario(TELEFONE_VAZIO);

            await carregarTelefones();

        } catch (error) {
            console.error('Erro ao salvar telefone:', error);

            if (error.status === 409) {
                setErro(
                    error.data?.message ||
                    'Este telefone já está cadastrado ou existe outro telefone principal.'
                );
            } else if (error.status === 400) {
                setErro(
                    error.data?.message ||
                    'Verifique os dados informados.'
                );
            } else {
                setErro('Não foi possível salvar o telefone.');
            }
        } finally {
            setSalvando(false);
        }
    }

    async function tornarPrincipal(id) {
        setErro('');
        setMensagem('');

        try {
            await definirTelefonePrincipal(id);

            setMensagem('Telefone definido como principal.');

            await carregarTelefones();
        } catch (error) {
            console.error(
                'Erro ao definir telefone principal:',
                error
            );

            setErro(
                error.data?.message ||
                'Não foi possível definir o telefone como principal.'
            );
        }
    }

    async function removerTelefone(id) {
        const confirmar = window.confirm(
            'Deseja realmente desativar este telefone?'
        );

        if (!confirmar) {
            return;
        }

        setErro('');
        setMensagem('');

        try {
            await desativarTelefone(id);

            setMensagem('Telefone desativado com sucesso.');

            await carregarTelefones();
        } catch (error) {
            console.error(
                'Erro ao desativar telefone:',
                error
            );

            setErro(
                error.data?.message ||
                'Não foi possível desativar o telefone.'
            );
        }
    }

    if (!usuario || carregando) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-600">
                    Carregando...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">

                <header className="mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Telefones
                            </h1>

                            <p className="mt-2 text-gray-600">
                                Gerencie os telefones vinculados ao seu cadastro.
                            </p>
                        </div>

                        <Link
                            href="/dashboard"
                            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Voltar ao Dashboard
                        </Link>
                    </div>
                </header>

                {erro && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {erro}
                    </div>
                )}

                {mensagem && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                        {mensagem}
                    </div>
                )}

                {!modoEdicao && (
                    <section className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Meus telefones
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    O cadastro de telefone é opcional para o usuário.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={iniciarNovoTelefone}
                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Adicionar telefone
                            </button>
                        </div>

                        {telefones.length === 0 ? (
                            <div className="rounded-lg border border-gray-200 p-6 text-center">
                                <p className="text-gray-600">
                                    Nenhum telefone cadastrado.
                                </p>

                                <button
                                    type="button"
                                    onClick={iniciarNovoTelefone}
                                    className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                >
                                    Cadastrar primeiro telefone
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {telefones.map((telefone) => (
                                    <div
                                        key={telefone.id}
                                        className="rounded-lg border border-gray-200 p-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {telefone.tipo}
                                                    </h3>

                                                    {telefone.principal && (
                                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                            Principal
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-2 text-gray-700">
                                                    +{telefone.codigo_pais}
                                                    {telefone.ddd
                                                        ? ` (${telefone.ddd})`
                                                        : ''}
                                                    {' '}
                                                    {telefone.numero}
                                                </p>

                                                {telefone.verificado && (
                                                    <p className="mt-1 text-sm text-green-600">
                                                        Telefone verificado
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        iniciarEdicao(telefone)
                                                    }
                                                    className="rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
                                                >
                                                    Editar
                                                </button>

                                                {!telefone.principal && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            tornarPrincipal(
                                                                telefone.id
                                                            )
                                                        }
                                                        className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                                    >
                                                        Tornar principal
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removerTelefone(
                                                            telefone.id
                                                        )
                                                    }
                                                    className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                                                >
                                                    Desativar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {modoEdicao && (
                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-6 text-xl font-semibold text-gray-900">
                            {telefoneEditando
                                ? 'Editar telefone'
                                : 'Novo telefone'}
                        </h2>

                        <form
                            onSubmit={salvarTelefone}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="tipo"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Tipo *
                                </label>

                                <select
                                    id="tipo"
                                    name="tipo"
                                    value={formulario.tipo}
                                    onChange={alterarCampo}
                                    required
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                >
                                    <option value="CELULAR">
                                        Celular
                                    </option>

                                    <option value="FIXO">
                                        Fixo
                                    </option>

                                    <option value="COMERCIAL">
                                        Comercial
                                    </option>

                                    <option value="OUTRO">
                                        Outro
                                    </option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label
                                        htmlFor="codigo_pais"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Código do país *
                                    </label>

                                    <input
                                        id="codigo_pais"
                                        name="codigo_pais"
                                        value={formulario.codigo_pais}
                                        onChange={alterarCampo}
                                        required
                                        maxLength={5}
                                        className="w-full rounded border border-gray-300 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="ddd"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        DDD
                                    </label>

                                    <input
                                        id="ddd"
                                        name="ddd"
                                        value={formulario.ddd}
                                        onChange={alterarCampo}
                                        maxLength={3}
                                        className="w-full rounded border border-gray-300 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="numero"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Número *
                                    </label>

                                    <input
                                        id="numero"
                                        name="numero"
                                        value={formulario.numero}
                                        onChange={alterarCampo}
                                        required
                                        maxLength={20}
                                        className="w-full rounded border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="principal"
                                    checked={formulario.principal}
                                    onChange={alterarCampo}
                                />

                                <span className="text-sm text-gray-700">
                                    Definir como telefone principal
                                </span>
                            </label>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {salvando
                                        ? 'Salvando...'
                                        : 'Salvar telefone'}
                                </button>

                                <button
                                    type="button"
                                    onClick={cancelarEdicao}
                                    disabled={salvando}
                                    className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </section>
                )}

            </div>
        </main>
    );
}
