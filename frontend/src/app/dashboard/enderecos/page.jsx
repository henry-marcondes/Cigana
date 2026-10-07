'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    listarMeusEnderecos,
    criarEndereco,
    atualizarEndereco,
    definirEnderecoPrincipal,
    desativarEndereco,
} from '../../../services/enderecos';

const TIPOS = [
    'RESIDENCIAL',
    'COBRANCA',
    'ENTREGA',
    'FISCAL',
    'COMERCIAL',
    'OUTRO',
];

const enderecoInicial = {
    tipo: 'RESIDENCIAL',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    pais: 'Brasil',
    principal: false,
};

export default function EnderecosPage() {
    const router = useRouter();

    const [enderecos, setEnderecos] = useState([]);
    const [formulario, setFormulario] = useState(enderecoInicial);
    const [enderecoEditando, setEnderecoEditando] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    useEffect(() => {
        carregarEnderecos();
    }, []);

    async function carregarEnderecos() {
        try {
            setCarregando(true);
            setErro('');

            const resposta = await listarMeusEnderecos();

            setEnderecos(resposta.data || []);
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
            setErro(error.message || 'Erro ao carregar endereços.');
        } finally {
            setCarregando(false);
        }
    }

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormulario((atual) => ({
            ...atual,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    function limparFormulario() {
        setFormulario(enderecoInicial);
        setEnderecoEditando(null);
    }

    function editarEndereco(endereco) {
        setMensagem('');
        setErro('');

        setEnderecoEditando(endereco.id);

        setFormulario({
            tipo: endereco.tipo || 'RESIDENCIAL',
            cep: endereco.cep || '',
            logradouro: endereco.logradouro || '',
            numero: endereco.numero || '',
            complemento: endereco.complemento || '',
            bairro: endereco.bairro || '',
            cidade: endereco.cidade || '',
            uf: endereco.uf || '',
            pais: endereco.pais || 'Brasil',
            principal: endereco.principal || false,
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    async function salvarEndereco(event) {
        event.preventDefault();

        try {
            setSalvando(true);
            setErro('');
            setMensagem('');

            const dados = {
                ...formulario,
                cep: formulario.cep.trim(),
                logradouro: formulario.logradouro.trim(),
                numero: formulario.numero.trim(),
                complemento: formulario.complemento.trim() || null,
                bairro: formulario.bairro.trim(),
                cidade: formulario.cidade.trim(),
                uf: formulario.uf.trim().toUpperCase(),
                pais: formulario.pais.trim(),
            };

            if (enderecoEditando) {
                await atualizarEndereco(
                    enderecoEditando,
                    dados
                );

                setMensagem(
                    'Endereço atualizado com sucesso.'
                );
            } else {
                await criarEndereco(dados);

                setMensagem(
                    'Endereço cadastrado com sucesso.'
                );
            }

            limparFormulario();
            await carregarEnderecos();

        } catch (error) {
            console.error('Erro ao salvar endereço:', error);

            setErro(
                error.message ||
                'Erro ao salvar endereço.'
            );
        } finally {
            setSalvando(false);
        }
    }

    async function tornarPrincipal(id) {
        try {
            setErro('');
            setMensagem('');

            await definirEnderecoPrincipal(id);

            setMensagem(
                'Endereço definido como principal.'
            );

            await carregarEnderecos();

        } catch (error) {
            console.error(
                'Erro ao definir endereço principal:',
                error
            );

            setErro(
                error.message ||
                'Erro ao definir endereço principal.'
            );
        }
    }

    async function removerEndereco(id) {
        const confirmar = window.confirm(
            'Deseja realmente desativar este endereço?'
        );

        if (!confirmar) {
            return;
        }

        try {
            setErro('');
            setMensagem('');

            await desativarEndereco(id);

            setMensagem(
                'Endereço desativado com sucesso.'
            );

            if (enderecoEditando === id) {
                limparFormulario();
            }

            await carregarEnderecos();

        } catch (error) {
            console.error(
                'Erro ao desativar endereço:',
                error
            );

            setErro(
                error.message ||
                'Erro ao desativar endereço.'
            );
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-5xl">

                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Meus endereços
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Gerencie os endereços vinculados ao seu cadastro.
                        </p>
                    </div>

                    <Link
                        href="/dashboard"
                        className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                    >
                        Voltar ao Dashboard
                    </Link>
                </header>

                {mensagem && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                        {mensagem}
                    </div>
                )}

                {erro && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {erro}
                    </div>
                )}

                {/* Formulário */}
                <section className="mb-6 rounded-lg bg-white p-6 shadow">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {enderecoEditando
                                    ? 'Editar endereço'
                                    : 'Cadastrar endereço'}
                            </h2>

                            <p className="mt-1 text-sm text-gray-600">
                                Preencha os dados do endereço.
                            </p>
                        </div>

                        {enderecoEditando && (
                            <button
                                type="button"
                                onClick={limparFormulario}
                                className="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
                            >
                                Cancelar edição
                            </button>
                        )}
                    </div>

                    <form
                        onSubmit={salvarEndereco}
                        className="space-y-5"
                    >
                        <div className="grid gap-4 md:grid-cols-2">

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Tipo *
                                </label>

                                <select
                                    name="tipo"
                                    value={formulario.tipo}
                                    onChange={handleChange}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    required
                                >
                                    {TIPOS.map((tipo) => (
                                        <option
                                            key={tipo}
                                            value={tipo}
                                        >
                                            {tipo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    CEP *
                                </label>

                                <input
                                    type="text"
                                    name="cep"
                                    value={formulario.cep}
                                    onChange={handleChange}
                                    maxLength={8}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                        </div>

                        <div className="grid gap-4 md:grid-cols-4">

                            <div className="md:col-span-3">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Logradouro *
                                </label>

                                <input
                                    type="text"
                                    name="logradouro"
                                    value={formulario.logradouro}
                                    onChange={handleChange}
                                    maxLength={200}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Número *
                                </label>

                                <input
                                    type="text"
                                    name="numero"
                                    value={formulario.numero}
                                    onChange={handleChange}
                                    maxLength={20}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Complemento
                            </label>

                            <input
                                type="text"
                                name="complemento"
                                value={formulario.complemento}
                                onChange={handleChange}
                                maxLength={100}
                                className="w-full rounded border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Bairro *
                                </label>

                                <input
                                    type="text"
                                    name="bairro"
                                    value={formulario.bairro}
                                    onChange={handleChange}
                                    maxLength={100}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Cidade *
                                </label>

                                <input
                                    type="text"
                                    name="cidade"
                                    value={formulario.cidade}
                                    onChange={handleChange}
                                    maxLength={100}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    UF *
                                </label>

                                <input
                                    type="text"
                                    name="uf"
                                    value={formulario.uf}
                                    onChange={handleChange}
                                    maxLength={2}
                                    className="w-full rounded border border-gray-300 px-3 py-2 uppercase"
                                    required
                                />
                            </div>

                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                País *
                            </label>

                            <input
                                type="text"
                                name="pais"
                                value={formulario.pais}
                                onChange={handleChange}
                                maxLength={100}
                                className="w-full rounded border border-gray-300 px-3 py-2"
                                required
                            />
                        </div>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="principal"
                                checked={formulario.principal}
                                onChange={handleChange}
                                className="h-4 w-4"
                            />

                            <span className="text-sm text-gray-700">
                                Definir como endereço principal
                            </span>
                        </label>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={salvando}
                                className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {salvando
                                    ? 'Salvando...'
                                    : enderecoEditando
                                        ? 'Salvar alterações'
                                        : 'Cadastrar endereço'}
                            </button>

                            {enderecoEditando && (
                                <button
                                    type="button"
                                    onClick={limparFormulario}
                                    className="rounded bg-gray-500 px-5 py-2 text-white hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {/* Lista */}
                <section className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-6 text-xl font-semibold text-gray-900">
                        Endereços cadastrados
                    </h2>

                    {carregando ? (
                        <p className="text-gray-600">
                            Carregando endereços...
                        </p>
                    ) : enderecos.length === 0 ? (
                        <p className="text-gray-600">
                            Nenhum endereço cadastrado.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {enderecos.map((endereco) => (
                                <div
                                    key={endereco.id}
                                    className="rounded-lg border border-gray-200 p-5"
                                >
                                    <div className="flex flex-col justify-between gap-4 md:flex-row">

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {endereco.tipo}
                                                </h3>

                                                {endereco.principal && (
                                                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                        Principal
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 text-gray-800">
                                                {endereco.logradouro}, {endereco.numero}
                                                {endereco.complemento &&
                                                    ` - ${endereco.complemento}`}
                                            </p>

                                            <p className="text-gray-600">
                                                {endereco.bairro} - {endereco.cidade}/{endereco.uf}
                                            </p>

                                            <p className="text-gray-600">
                                                CEP: {endereco.cep} — {endereco.pais}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-start gap-2">
                                            <button
                                                type="button"
                                                onClick={() => editarEndereco(endereco)}
                                                className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                            >
                                                Editar
                                            </button>

                                            {!endereco.principal && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        tornarPrincipal(endereco.id)
                                                    }
                                                    className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                                                >
                                                    Tornar principal
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removerEndereco(endereco.id)
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

            </div>
        </main>
    );
}
