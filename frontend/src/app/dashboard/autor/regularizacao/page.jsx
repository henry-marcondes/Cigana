'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import pessoaService from '../../../../services/pessoa';
import { obterUsuario } from '../../../../services/autenticacao';
import { buscarAutorPorUsuario } from '../../../../services/autor';
import { listarLivrosPorAutor } from '../../../../services/livroAutor';
import { apiFetch } from '../../../../services/api';
import {
    buscarVersaoAtiva,
    listarContratos,
    verificarAceitePorObra,
} from '../../../../services/contratos';

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
    const searchParams = useSearchParams();
    const livroIdQuery = searchParams.get('livro_id');
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
    const [regularizacao, setRegularizacao] = useState(null);
    const [erroRegularizacao, setErroRegularizacao] = useState('');
    const [obrasAutor, setObrasAutor] = useState([]);
    const [carregandoObras, setCarregandoObras] = useState(true);
    const [erroObras, setErroObras] = useState('');
    const [livroSelecionadoId, setLivroSelecionadoId] = useState('');
    const [contratoObra, setContratoObra] = useState({ status: 'selecionar' });
    const [atualizacaoContrato, setAtualizacaoContrato] = useState(0);

    useEffect(() => {
        carregarPessoa();
    }, []);

    useEffect(() => {
        let ativa = true;

        async function carregarObrasAutor() {
            setCarregandoObras(true);
            setErroObras('');
            setLivroSelecionadoId('');
            setContratoObra({ status: 'selecionar' });

            try {
                const usuario = obterUsuario();
                if (!usuario?.id) {
                    throw new Error('Não foi possível identificar o usuário autenticado.');
                }

                const respostaAutor = await buscarAutorPorUsuario(usuario.id);
                const autor = respostaAutor?.data;
                if (!autor?.id) {
                    if (ativa) {
                        setObrasAutor([]);
                        setLivroSelecionadoId('');
                    }
                    return;
                }

                const respostaRelacoes = await listarLivrosPorAutor(autor.id);
                const livros = await Promise.all(
                    (respostaRelacoes?.data || []).map(async (relacao) => {
                        const respostaLivro = await apiFetch(`/api/livros/${relacao.livro_id}`);
                        return respostaLivro?.data;
                    })
                );
                const livrosValidos = livros.filter((livro) => livro?.id);

                if (ativa) {
                    setObrasAutor(livrosValidos);
                    setLivroSelecionadoId(
                        livroIdQuery && livrosValidos.some((livro) => livro.id === livroIdQuery)
                            ? livroIdQuery
                            : ''
                    );
                    if (livroIdQuery && !livrosValidos.some((livro) => livro.id === livroIdQuery)) {
                        setErroObras('A obra informada não foi encontrada entre as obras deste Autor.');
                    }
                }
            } catch (error) {
                if (ativa) {
                    setObrasAutor([]);
                    setLivroSelecionadoId('');
                    setErroObras(error.message || 'Não foi possível carregar suas obras.');
                }
            } finally {
                if (ativa) setCarregandoObras(false);
            }
        }

        carregarObrasAutor();
        return () => { ativa = false; };
    }, [livroIdQuery]);

    useEffect(() => {
        let ativa = true;
        const livroSelecionado = obrasAutor.find((livro) => livro.id === livroSelecionadoId);

        if (!livroSelecionadoId || !livroSelecionado) {
            setContratoObra({ status: 'selecionar' });
            return () => { ativa = false; };
        }

        async function carregarContratoObra() {
            setContratoObra({ status: 'carregando' });
            try {
                const respostaContratos = await listarContratos({
                    ativo: true,
                    tipo: 'DIREITOS_AUTORAIS'
                });
                const contratosDireitos = (respostaContratos?.data || []).filter(
                    (contrato) => contrato?.tipo === 'DIREITOS_AUTORAIS' && contrato.ativo
                );

                if (contratosDireitos.length === 0) {
                    if (ativa) setContratoObra({ status: 'pendente', mensagem: 'Não há contrato ativo de Direitos Autorais disponível.' });
                    return;
                }

                const contratosComVersaoAtiva = await Promise.all(
                    contratosDireitos.map(async (contrato) => {
                        const respostaVersao = await buscarVersaoAtiva(contrato.id);
                        return { contrato, versao: respostaVersao?.data || null };
                    })
                );
                const contratosComVersao = contratosComVersaoAtiva.filter(({ versao }) => versao?.id);

                if (contratosComVersao.length === 0) {
                    if (ativa) {
                        setContratoObra({
                            status: 'pendente',
                            mensagem: 'O contrato ativo disponível não possui versão ativa para aceite.'
                        });
                    }
                    return;
                }

                if (contratosComVersao.length > 1) {
                    if (ativa) setContratoObra({ status: 'erro', mensagem: 'Há mais de um contrato ativo de Direitos Autorais disponível. Não foi possível determinar qual se aplica.' });
                    return;
                }

                const { contrato, versao } = contratosComVersao[0];
                const respostaAceite = await verificarAceitePorObra(livroSelecionadoId, versao.id);
                if (typeof respostaAceite?.data?.aceito !== 'boolean') {
                    throw new Error('Resposta de aceite inválida.');
                }
                const aceito = respostaAceite.data.aceito;

                if (ativa) {
                    setContratoObra({
                        status: aceito ? 'concluido' : 'pendente',
                        contrato,
                        versao,
                        mensagem: aceito ? '' : 'O aceite desta versão ainda está pendente para esta obra.'
                    });
                }
            } catch (error) {
                if (ativa) {
                    setContratoObra({
                        status: 'erro',
                        mensagem: 'Não foi possível verificar o aceite desta obra. Tente atualizar a situação.'
                    });
                }
            }
        }

        carregarContratoObra();
        return () => { ativa = false; };
    }, [livroSelecionadoId, obrasAutor, atualizacaoContrato]);

    async function carregarPessoa() {
        try {
            setCarregando(true);
            setErro('');

            try {
                const resultadoRegularizacao = await pessoaService.verificarRegularizacao();
                setRegularizacao(resultadoRegularizacao?.data || null);
                setErroRegularizacao('');
            } catch (errorRegularizacao) {
                setRegularizacao(null);
                setErroRegularizacao('Não foi possível consultar a situação cadastral.');
            }

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
            setErroRegularizacao('Não foi possível consultar a situação cadastral.');
        } finally {
            setCarregando(false);
        }
    }

    const pendencias = regularizacao?.pendencias || [];
    const pendente = (prefixos) => pendencias.some(({ requisito = '' }) =>
        prefixos.some((prefixo) => requisito === prefixo || requisito.startsWith(`${prefixo}.`))
    );
    const statusPessoa = !regularizacao ? 'aguardando' :
        !pendente(['pessoa', 'especializacao', 'tipo_pessoa', 'pessoa_fisica', 'pessoa_juridica']) ? 'concluido' : 'pendente';
    const statusTelefone = !regularizacao ? 'aguardando' : pendente(['telefone']) ? 'pendente' : 'concluido';
    const statusEndereco = !regularizacao ? 'aguardando' : pendente(['endereco']) ? 'pendente' : 'concluido';

    function checkpointStatus(status) {
        if (status === 'concluido') return { texto: 'Concluído', classe: 'border-green-200 bg-green-50 text-green-800' };
        if (status === 'pendente') return { texto: 'Pendente', classe: 'border-amber-200 bg-amber-50 text-amber-900' };
        if (status === 'erro') return { texto: 'Não foi possível verificar', classe: 'border-red-200 bg-red-50 text-red-800' };
        if (status === 'carregando') return { texto: 'Verificando...', classe: 'border-blue-200 bg-blue-50 text-blue-800' };
        if (status === 'selecionar') return { texto: 'Selecione uma obra', classe: 'border-gray-200 bg-gray-100 text-gray-700' };
        return { texto: 'Aguardando integração', classe: 'border-gray-200 bg-gray-100 text-gray-700' };
    }

    function renderCheckpoint(numero, titulo, status, descricao, href, rotulo) {
        const visual = checkpointStatus(status);
        return (
            <li key={numero} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">Etapa {numero} — {titulo}</h3>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${visual.classe}`}>{visual.texto}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{descricao}</p>
                {href && <Link href={href} className="mt-3 inline-block text-sm font-medium text-blue-700 underline">{rotulo}</Link>}
            </li>
        );
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
            await carregarPessoa();

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

            <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Etapas da regularização</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            O cadastro regularizado é reutilizado nas suas obras. Cada obra, porém, exige seu próprio contrato assinado.
                        </p>
                    </div>
                    <button type="button" onClick={carregarPessoa} disabled={carregando} className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
                        {carregando ? 'Atualizando...' : 'Atualizar situação'}
                    </button>
                </div>
                {erroRegularizacao && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erroRegularizacao}</p>}
                {regularizacao && !regularizacao.regularizado && (
                    <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        Há pendências no cadastro. Consulte as etapas abaixo para saber o que falta.
                    </p>
                )}
                {regularizacao?.regularizado && (
                    <p className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        Cadastro do Autor regularizado. Essa situação pode ser aproveitada em novas obras.
                    </p>
                )}
                <div className="mt-5 max-w-xl">
                    <label htmlFor="obra-contrato" className="mb-2 block text-sm font-semibold text-gray-800">
                        Obra do contrato de Direitos Autorais
                    </label>
                    <select
                        id="obra-contrato"
                        value={livroSelecionadoId}
                        onChange={(event) => {
                            setContratoObra({ status: 'carregando' });
                            setLivroSelecionadoId(event.target.value);
                        }}
                        disabled={carregandoObras}
                        className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm disabled:bg-gray-100"
                    >
                        <option value="">{carregandoObras ? 'Carregando suas obras...' : 'Selecione uma obra'}</option>
                        {obrasAutor.map((livro) => (
                            <option key={livro.id} value={livro.id}>{livro.titulo}</option>
                        ))}
                    </select>
                    {erroObras && <p role="alert" className="mt-2 text-sm text-red-700">{erroObras}</p>}
                    {!carregandoObras && !erroObras && obrasAutor.length === 0 && (
                        <p className="mt-2 text-sm text-gray-600">Não há obras disponíveis para selecionar neste cadastro de Autor.</p>
                    )}
                </div>
                <ol className="mt-5 space-y-3">
                    {renderCheckpoint(1, 'Dados pessoais e documentos', statusPessoa,
                        `${possuiPessoaFisica ? 'Pessoa Física cadastrada' : ''}${possuiPessoaFisica && possuiPessoaJuridica ? ' e ' : ''}${possuiPessoaJuridica ? 'Pessoa Jurídica cadastrada' : ''}${!possuiPessoaFisica && !possuiPessoaJuridica ? 'Informe os dados e documentos da especialização cadastrada.' : '. CPF/CNPJ e os campos obrigatórios são conferidos pelo cadastro.'}`,
                        '/dashboard/autor/regularizacao', 'Completar ou corrigir cadastro')}
                    {renderCheckpoint(2, 'Telefone', statusTelefone,
                        statusTelefone === 'pendente' ? 'Cadastre ao menos um telefone ativo. Não é necessária verificação por SMS ou WhatsApp.' : 'É necessário manter ao menos um telefone ativo. Não há exigência de verificação por SMS ou WhatsApp.',
                        '/dashboard/telefones', 'Gerenciar telefones')}
                    {renderCheckpoint(3, 'Endereço', statusEndereco,
                        'É necessário manter ao menos um endereço ativo.', '/dashboard/enderecos', 'Gerenciar endereços')}
                    <li className="rounded-lg border border-gray-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="font-semibold text-gray-900">Etapa 4 — Contrato de Direitos Autorais</h3>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${checkpointStatus(contratoObra.status).classe}`}>
                                {checkpointStatus(contratoObra.status).texto}
                            </span>
                        </div>
                        {livroSelecionadoId ? (
                            <div className="mt-3 space-y-1 text-sm text-gray-700">
                                <p><span className="font-medium">Obra:</span> {obrasAutor.find((livro) => livro.id === livroSelecionadoId)?.titulo}</p>
                                {contratoObra.contrato && <p><span className="font-medium">Contrato:</span> {contratoObra.contrato.nome}</p>}
                                {contratoObra.versao && <p><span className="font-medium">Versão:</span> {contratoObra.versao.versao}{contratoObra.versao.titulo ? ` — ${contratoObra.versao.titulo}` : ''}</p>}
                                {contratoObra.mensagem && <p className={contratoObra.status === 'erro' ? 'text-red-700' : 'text-gray-600'}>{contratoObra.mensagem}</p>}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-gray-600">Selecione uma obra para consultar o contrato e o aceite específicos dela.</p>
                        )}
                        {contratoObra.status === 'pendente' && contratoObra.contrato && contratoObra.versao && (
                            <Link
                                href={`/dashboard/contratos?livro_id=${encodeURIComponent(livroSelecionadoId)}&contrato_id=${encodeURIComponent(contratoObra.contrato.id)}`}
                                className="mt-3 inline-block text-sm font-medium text-blue-700 underline"
                            >
                                Acessar fluxo de aceite desta obra
                            </Link>
                        )}
                        {livroSelecionadoId && (
                            <button
                                type="button"
                                onClick={() => setAtualizacaoContrato((valor) => valor + 1)}
                                disabled={contratoObra.status === 'carregando'}
                                className="mt-3 ml-4 text-sm text-gray-700 underline disabled:opacity-50"
                            >
                                Atualizar aceite
                            </button>
                        )}
                    </li>
                </ol>
                {regularizacao?.pendencias?.length > 0 && (
                    <div className="mt-5">
                        <h3 className="text-sm font-semibold text-gray-800">Pendências informadas pelo cadastro</h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                            {regularizacao.pendencias.map((item, index) => <li key={`${item.requisito}-${index}`}>{item.mensagem}</li>)}
                        </ul>
                    </div>
                )}
            </section>

            {!tipoPessoa && (
                <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4">
                    Cadastro de pessoa
                </h2>
                <p className="mb-4 text-gray-600">
                    Selecione o cadastro que deseja preencher.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    {(
                        <button
                            type="button"
                            onClick={() => selecionarTipo('FISICA')}
                            className="rounded-lg border p-6 text-left hover:bg-gray-50"
                        >
                    <h3 className="font-semibold">
                        Pessoa Física
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        {possuiPessoaFisica ? 'Revise ou corrija os dados da pessoa física.' : 'Cadastro para atuação como pessoa física.'}
                    </p>
                </button>
            )}

            {(
                <button
                    type="button"
                    onClick={() => selecionarTipo('JURIDICA')}
                    className="rounded-lg border p-6 text-left hover:bg-gray-50"
                >
                    <h3 className="font-semibold">
                        Pessoa Jurídica
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        {possuiPessoaJuridica ? 'Revise ou corrija os dados da pessoa jurídica.' : 'Cadastro para atuação por empresa ou organização.'}
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
