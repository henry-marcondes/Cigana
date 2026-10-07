'use client';

import { useEffect, useState } from 'react';
import pessoaService from '../../../../services/pessoa';

const estadoInicialFisica = {
    nome: '',
    sobrenome: '',
    data_nascimento: '',
    cpf: '',
    rg: '',
    orgao_expedidor_rg: '',
    uf_expedidor_rg: '',
};

const estadoInicialJuridica = {
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
};

export default function RegularizacaoAutorPage() {
    const [tipoPessoa, setTipoPessoa] = useState('');
    const [possuiPessoaFisica, setPossuiPessoaFisica] = useState(false);
    const [possuiPessoaJuridica, setPossuiPessoaJuridica] = useState(false);
    const [pessoaFisica, setPessoaFisica] = useState(estadoInicialFisica);
    const [pessoaJuridica, setPessoaJuridica] = useState(estadoInicialJuridica);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [cadastrada, setCadastrada] = useState(false);

    useEffect(() => {
        carregarPessoa();
    }, []);

    async function carregarPessoa() {
        try {
            setCarregando(true);
            setErro('');

            const resposta = await pessoaService.buscarMinhaPessoa();

            if (!resposta?.success || !resposta.data) {
                return;
            }

            const pessoa = resposta.data;
            const temPessoaFisica = !!pessoa.pessoa_fisica;
            const temPessoaJuridica = !!pessoa.pessoa_juridica;

            setPossuiPessoaFisica(temPessoaFisica);
            setPossuiPessoaJuridica(temPessoaJuridica);

            if (temPessoaFisica) {
                setPessoaFisica({
                    nome: pessoa.pessoa_fisica.nome || '',
                    sobrenome: pessoa.pessoa_fisica.sobrenome || '',
                    data_nascimento: pessoa.pessoa_fisica.data_nascimento
                    ? pessoa.pessoa_fisica.data_nascimento.substring(0, 10)
                    : '',
                    cpf: pessoa.pessoa_fisica.cpf || '',
                    rg: pessoa.pessoa_fisica.rg || '',
                    orgao_expedidor_rg:
                    pessoa.pessoa_fisica.orgao_expedidor_rg || '',
                    uf_expedidor_rg:
                    pessoa.pessoa_fisica.uf_expedidor_rg || '',
                });
            }

            if (temPessoaJuridica) {
                setPessoaJuridica({
                    razao_social: pessoa.pessoa_juridica.razao_social || '',
                    nome_fantasia: pessoa.pessoa_juridica.nome_fantasia || '',
                    cnpj: pessoa.pessoa_juridica.cnpj || '',
                    inscricao_estadual:
                    pessoa.pessoa_juridica.inscricao_estadual || '',
                    inscricao_municipal:
                    pessoa.pessoa_juridica.inscricao_municipal || '',
                });
            }
        setCadastrada(true);
        } catch (error) {
            console.error(error);
            setErro('Não foi possível carregar o cadastro.');
        } finally {
            setCarregando(false);
        }
    }

    function alterarPessoaFisica(event) {
        const { name, value } = event.target;

        setPessoaFisica((estadoAtual) => ({
            ...estadoAtual,
            [name]: value,
        }));
    }

    function alterarPessoaJuridica(event) {
        const { name, value } = event.target;

        setPessoaJuridica((estadoAtual) => ({
            ...estadoAtual,
            [name]: value,
        }));
    }

    function selecionarTipo(tipo) {
        setTipoPessoa(tipo);
        setErro('');
        setMensagem('');
    }

    async function salvar(event) {
        event.preventDefault();

        setSalvando(true);
        setErro('');
        setMensagem('');

        try {
            const dados = {};

            if (tipoPessoa === 'FISICA') {
                dados.pessoa_fisica = pessoaFisica;
            }

            if (tipoPessoa === 'JURIDICA') {
                dados.pessoa_juridica = pessoaJuridica;
            }

            const resposta = cadastrada
                ? await pessoaService.atualizar(dados)
                : await pessoaService.criar({tipo_pessoa: tipoPessoa, ...dados,});

            if (!resposta?.success) {
                throw new Error(
                    resposta?.message || 'Não foi possível salvar o cadastro.'
                );
            }

            setCadastrada(true);
            setMensagem(
                cadastrada
                    ? 'Cadastro atualizado com sucesso.'
                    : 'Cadastro realizado com sucesso.'
            );
            if (tipoPessoa === 'FISICA') {
                setPossuiPessoaFisica(true);
            }

            if (tipoPessoa === 'JURIDICA') {
                setPossuiPessoaJuridica(true);
            }
            setTipoPessoa('');

        } catch (error) {
            console.error(error);
            setErro(
                error.message || 'Não foi possível salvar o cadastro.'
            );
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <main className="p-6">
                <p>Carregando cadastro...</p>
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto p-6">
           <div className="mb-8 flex items-center justify-between">
             <div>
                <h1 className="text-2xl font-bold">
                    Regularização cadastral
                </h1>

            <p className="mt-2 text-gray-600">
                Complete seus dados cadastrais para atuar como Autor na
                plataforma.
            </p>
        </div>

        <a
            href="/dashboard"
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
            Voltar ao Dashboard
        </a>
    </div> 


            {mensagem && (
                <div className="mb-6 rounded-md border border-green-300 bg-green-50 p-4 text-green-800">
                    {mensagem}
                </div>
            )}

            {erro && (
                <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-800">
                    {erro}
                </div>
            )}

            {!tipoPessoa && (
                <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4">
                    Cadastro de pessoa
                </h2>
                <p className="mb-4 text-gray-600">
                    Selecione o cadastro que deseja preencher.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    {!possuiPessoaFisica && (
                        <button
                            type="button"
                            onClick={() => selecionarTipo('FISICA')}
                            className="rounded-lg border p-6 text-left hover:bg-gray-50"
                        >
                    <h3 className="font-semibold">
                        Pessoa Física
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        Cadastro para atuação como pessoa física.
                    </p>
                </button>
            )}

            {!possuiPessoaJuridica && (
                <button
                    type="button"
                    onClick={() => selecionarTipo('JURIDICA')}
                    className="rounded-lg border p-6 text-left hover:bg-gray-50"
                >
                    <h3 className="font-semibold">
                        Pessoa Jurídica
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        Cadastro para atuação por empresa ou organização.
                    </p>
                </button>
                )}
            </div>
          </section>
        )}

            {tipoPessoa && (
                <form onSubmit={salvar} className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                {tipoPessoa === 'FISICA'
                                    ? 'Pessoa Física'
                                    : 'Pessoa Jurídica'}
                            </h2>

                            <p className="text-sm text-gray-600">
                                Preencha os dados necessários para seu cadastro.
                            </p>
                        </div>

                        {!cadastrada && (
                            <button
                                type="button"
                                onClick={() => selecionarTipo('')}
                                className="text-sm underline"
                            >
                                Alterar tipo
                            </button>
                        )}
                    </div>

                    {tipoPessoa === 'FISICA' && (
                        <section className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nome *
                                </label>

                                <input
                                    name="nome"
                                    value={pessoaFisica.nome}
                                    onChange={alterarPessoaFisica}
                                    required
                                    maxLength={100}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Sobrenome *
                                </label>

                                <input
                                    name="sobrenome"
                                    value={pessoaFisica.sobrenome}
                                    onChange={alterarPessoaFisica}
                                    required
                                    maxLength={100}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Data de nascimento
                                </label>

                                <input
                                    type="date"
                                    name="data_nascimento"
                                    value={pessoaFisica.data_nascimento}
                                    onChange={alterarPessoaFisica}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    CPF
                                </label>

                                <input
                                    name="cpf"
                                    value={pessoaFisica.cpf}
                                    onChange={alterarPessoaFisica}
                                    inputMode="numeric"
                                    maxLength={11}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    RG
                                </label>

                                <input
                                    name="rg"
                                    value={pessoaFisica.rg}
                                    onChange={alterarPessoaFisica}
                                    maxLength={30}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Órgão expedidor
                                </label>

                                <input
                                    name="orgao_expedidor_rg"
                                    value={pessoaFisica.orgao_expedidor_rg}
                                    onChange={alterarPessoaFisica}
                                    maxLength={100}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    UF expedidora
                                </label>

                                <input
                                    name="uf_expedidor_rg"
                                    value={pessoaFisica.uf_expedidor_rg}
                                    onChange={alterarPessoaFisica}
                                    maxLength={2}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>
                        </section>
                    )}

                    {tipoPessoa === 'JURIDICA' && (
                        <section className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                    Razão social *
                                </label>

                                <input
                                    name="razao_social"
                                    value={pessoaJuridica.razao_social}
                                    onChange={alterarPessoaJuridica}
                                    required
                                    maxLength={150}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nome fantasia
                                </label>

                                <input
                                    name="nome_fantasia"
                                    value={pessoaJuridica.nome_fantasia}
                                    onChange={alterarPessoaJuridica}
                                    maxLength={150}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    CNPJ
                                </label>

                                <input
                                    name="cnpj"
                                    value={pessoaJuridica.cnpj}
                                    onChange={alterarPessoaJuridica}
                                    inputMode="numeric"
                                    maxLength={14}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Inscrição estadual
                                </label>

                                <input
                                    name="inscricao_estadual"
                                    value={pessoaJuridica.inscricao_estadual}
                                    onChange={alterarPessoaJuridica}
                                    maxLength={30}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Inscrição municipal
                                </label>

                                <input
                                    name="inscricao_municipal"
                                    value={pessoaJuridica.inscricao_municipal}
                                    onChange={alterarPessoaJuridica}
                                    maxLength={30}
                                    className="w-full rounded-md border p-2"
                                />
                            </div>
                        </section>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={salvando}
                            className="rounded-md bg-black px-6 py-3 text-white disabled:opacity-50"
                        >
                            {salvando
                              ? 'Salvando...'
                              : possuiPessoaFisica && tipoPessoa === 'FISICA'
                                 ? 'Atualizar Pessoa Física'
                                 : possuiPessoaJuridica && tipoPessoa === 'JURIDICA'
                                   ? 'Atualizar Pessoa Jurídica'
                                   : 'Cadastrar'}
                        </button>
                    </div>
                </form>
            )}
        </main>
    );
}
