'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import {
    listarContratos,
    buscarContratoPorId,
    criarContrato,
    atualizarContrato,
    ativarContrato,
    desativarContrato,
    listarVersoesContrato,
    buscarVersaoPorId,
    criarVersaoContrato,
    atualizarVersaoContrato,
    publicarVersaoContrato,
    encerrarVersaoContrato,
    buscarVersaoAtiva,
    aceitarContrato,
    listarAceitesPorUsuario,
} from '../../../services/contratos';

export default function ContratosPage() {
    const [contratos, setContratos] = useState([]);
    const [versoes, setVersoes] = useState([]);

    const [contratoSelecionado, setContratoSelecionado] = useState(null);
    const [versaoSelecionada, setVersaoSelecionada] = useState(null);

    const [aceites, setAceites] = useState([]);
    const [aceiteConfirmado, setAceiteConfirmado] = useState(false);

    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const [formContrato, setFormContrato] = useState({
        tipo: 'DIREITOS_AUTORAIS',
        codigo: '',
        nome: '',
        descricao: '',
    });

    const [formVersao, setFormVersao] = useState({
        versao: '',
        titulo: '',
        conteudo: '',
    });

    function limparMensagens() {
        setMensagem('');
        setErro('');
    }

    function mostrarErro(error) {
        setErro(
            error?.data?.message ||
            error?.message ||
            'Ocorreu um erro na operação.'
        );
    }

    async function executar(operacao) {
        limparMensagens();
        setCarregando(true);

        try {
            await operacao();
        } catch (error) {
            console.error(error);
            mostrarErro(error);
        } finally {
            setCarregando(false);
        }
    }

    // =====================================================
    // CONTRATOS
    // =====================================================

    async function carregarContratos() {
        await executar(async () => {
            const resposta = await listarContratos();

            setContratos(resposta.data || []);
            setMensagem('Contratos carregados com sucesso.');
        });
    }

    async function selecionarContrato(contrato) {
        await executar(async () => {
            const resposta = await buscarContratoPorId(contrato.id);

            setContratoSelecionado(resposta.data);

            setFormContrato({
                tipo: resposta.data.tipo || '',
                codigo: resposta.data.codigo || '',
                nome: resposta.data.nome || '',
                descricao: resposta.data.descricao || '',
            });

            setVersaoSelecionada(null);

            const respostaVersoes =
                await listarVersoesContrato(contrato.id);

            setVersoes(respostaVersoes.data || []);

            setMensagem(
                'Contrato selecionado e suas versões carregadas.'
            );
        });
    }

    async function criarNovoContrato() {
        await executar(async () => {
            const resposta = await criarContrato(formContrato);

            setContratoSelecionado(resposta.data);

            await carregarContratos();

            setMensagem('Contrato criado com sucesso.');
        });
    }

    async function salvarContrato() {
        if (!contratoSelecionado) {
            setErro('Selecione um contrato primeiro.');
            return;
        }

        await executar(async () => {
            const resposta = await atualizarContrato(
                contratoSelecionado.id,
                {
                    tipo: formContrato.tipo,
                    codigo: formContrato.codigo,
                    nome: formContrato.nome,
                    descricao: formContrato.descricao,
                }
            );

            setContratoSelecionado(resposta.data);

            await carregarContratos();

            setMensagem('Contrato atualizado com sucesso.');
        });
    }

    async function ativar() {
        if (!contratoSelecionado) return;

        await executar(async () => {
            const resposta = await ativarContrato(
                contratoSelecionado.id
            );

            setContratoSelecionado(resposta.data);

            await carregarContratos();

            setMensagem('Contrato ativado com sucesso.');
        });
    }

    async function desativar() {
        if (!contratoSelecionado) return;

        await executar(async () => {
            const resposta = await desativarContrato(
                contratoSelecionado.id
            );

            setContratoSelecionado(resposta.data);

            await carregarContratos();

            setMensagem('Contrato desativado com sucesso.');
        });
    }

    // =====================================================
    // VERSÕES
    // =====================================================

    async function selecionarVersao(versao) {
        await executar(async () => {
            const resposta = await buscarVersaoPorId(
                versao.id
            );

            setVersaoSelecionada(resposta.data);

            setFormVersao({
                versao: resposta.data.versao || '',
                titulo: resposta.data.titulo || '',
                conteudo: resposta.data.conteudo || '',
            });

            setMensagem('Versão selecionada.');
        });
    }

    async function carregarVersoes() {
        if (!contratoSelecionado) {
            setErro('Selecione um contrato primeiro.');
            return;
        }

        await executar(async () => {
            const resposta = await listarVersoesContrato(
                contratoSelecionado.id
            );

            setVersoes(resposta.data || []);

            setMensagem('Versões carregadas.');
        });
    }

    async function criarNovaVersao() {
        if (!contratoSelecionado) {
            setErro('Selecione um contrato primeiro.');
            return;
        }

        await executar(async () => {
            const resposta = await criarVersaoContrato(
                contratoSelecionado.id,
                formVersao
            );

            setVersaoSelecionada(resposta.data);

            await carregarVersoes();

            setMensagem('Versão criada com sucesso.');
        });
    }

    async function salvarVersao() {
        if (!versaoSelecionada) {
            setErro('Selecione uma versão primeiro.');
            return;
        }

        await executar(async () => {
            const resposta = await atualizarVersaoContrato(
                versaoSelecionada.id,
                {
                    versao: formVersao.versao,
                    titulo: formVersao.titulo,
                    conteudo: formVersao.conteudo,
                }
            );

            setVersaoSelecionada(resposta.data);

            await carregarVersoes();

            setMensagem('Versão atualizada com sucesso.');
        });
    }

    async function publicarVersao() {
        if (!versaoSelecionada) {
            setErro('Selecione uma versão primeiro.');
            return;
        }

        await executar(async () => {
            const resposta = await publicarVersaoContrato(
                versaoSelecionada.id
            );

            setVersaoSelecionada(resposta.data);

            await carregarVersoes();

            setMensagem('Versão publicada com sucesso.');
        });
    }

    async function encerrarVersao() {
        if (!versaoSelecionada) {
            setErro('Selecione uma versão primeiro.');
            return;
        }

        await executar(async () => {
            const resposta = await encerrarVersaoContrato(
                versaoSelecionada.id
            );

            setVersaoSelecionada(resposta.data);

            await carregarVersoes();

            setMensagem('Versão encerrada com sucesso.');
        });
    }

    async function carregarVersaoAtiva() {
        if (!contratoSelecionado) {
            setErro('Selecione um contrato primeiro.');
            return;
        }

        await executar(async () => {
            const resposta = await buscarVersaoAtiva(
                contratoSelecionado.id
            );

            setVersaoSelecionada(resposta.data);

            setFormVersao({
                versao: resposta.data.versao || '',
                titulo: resposta.data.titulo || '',
                conteudo: resposta.data.conteudo || '',
            });

            setMensagem('Versão ativa carregada.');
        });
    }

    async function registrarAceite() {
        if (!versaoSelecionada) {
            setErro('Nenhuma versão selecionada.');
            return;
        }

        if (versaoSelecionada.status !== 'ATIVA') {
            setErro('Somente uma versão ATIVA pode ser aceita.');
            return;
        }

        if (!aceiteConfirmado) {
            setErro(
            'É necessário confirmar que você leu e concorda com o Termo.'
            );
            return;
        }

        await executar(async () => {
            const resposta = await aceitarContrato(
                versaoSelecionada.id,
                {
                    livro_id: '8733e2c9-2a5b-49a6-a6fe-1a4ac988cc45'
                }
            );

            setMensagem(
                'Aceite registrado com sucesso.'
            );

            setAceiteConfirmado(false);

            console.log('Aceite registrado:', resposta.data);
        });
    }

    async function carregarMeusAceites() {
        await executar(async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error(
                    'Nenhum usuário autenticado.'
                );
            }

            const partes = token.split('.');

            if (partes.length !== 3) {
                throw new Error(
                    'Token de autenticação inválido.'
                );
            }

            const payload = JSON.parse(
                atob(partes[1])
            );

            if (!payload.id) {
                throw new Error(
                    'O token não contém a identificação do usuário.'
                );
            }

            const resposta = await listarAceitesPorUsuario(
                payload.id
            );

            setAceites(resposta.data || []);

            setMensagem(
                'Aceites do usuário carregados.'
            );
        });
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl space-y-6">

                <header>
                    <h1 className="text-2xl font-bold">
                        Validação de Contratos
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Validação funcional de contratos e versões.
                    </p>
                </header>

                {mensagem && (
                    <div className="rounded border border-green-300 bg-green-50 p-3 text-green-700">
                        {mensagem}
                    </div>
                )}

                {erro && (
                    <div className="rounded border border-red-300 bg-red-50 p-3 text-red-700">
                        {erro}
                    </div>
                )}

                {/* =====================================================
                    LISTAGEM
                ===================================================== */}

                <section className="rounded-lg bg-white p-5 shadow">

                    <div className="mb-4 flex items-center justify-between">

                        <h2 className="text-lg font-semibold">
                            1. Contratos cadastrados
                        </h2>

                        <button
                            onClick={carregarContratos}
                            disabled={carregando}
                            className="rounded bg-gray-700 px-4 py-2 text-white disabled:opacity-50"
                        >
                            Atualizar lista
                        </button>

                    </div>

                    {contratos.length === 0 ? (
                        <p className="text-gray-500">
                            Nenhum contrato carregado.
                        </p>
                    ) : (
                        <div className="space-y-3">

                            {contratos.map((contrato) => (
                                <button
                                    key={contrato.id}
                                    onClick={() =>
                                        selecionarContrato(contrato)
                                    }
                                    className={`block w-full rounded border p-4 text-left ${
                                        contratoSelecionado?.id === contrato.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex flex-wrap justify-between gap-3">

                                        <div>
                                            <strong>
                                                {contrato.nome}
                                            </strong>

                                            <div className="mt-1 text-sm text-gray-600">
                                                Código: {contrato.codigo}
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                Tipo: {contrato.tipo}
                                            </div>
                                        </div>

                                        <div>
                                            <span
                                                className={`rounded px-3 py-1 text-sm ${
                                                    contrato.ativo
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-200 text-gray-700'
                                                }`}
                                            >
                                                {contrato.ativo
                                                    ? 'ATIVO'
                                                    : 'INATIVO'}
                                            </span>
                                        </div>

                                    </div>
                                </button>
                            ))}

                        </div>
                    )}

                </section>

                {/* =====================================================
                    CONTRATO SELECIONADO
                ===================================================== */}

                {contratoSelecionado && (
                    <section className="rounded-lg bg-white p-5 shadow">

                        <h2 className="mb-4 text-lg font-semibold">
                            2. Editar contrato
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Tipo
                                </label>

                                <input
                                    className="w-full rounded border p-2"
                                    value={formContrato.tipo}
                                    onChange={(e) =>
                                        setFormContrato({
                                            ...formContrato,
                                            tipo: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Código
                                </label>

                                <input
                                    className="w-full rounded border p-2"
                                    value={formContrato.codigo}
                                    onChange={(e) =>
                                        setFormContrato({
                                            ...formContrato,
                                            codigo: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Nome
                                </label>

                                <input
                                    className="w-full rounded border p-2"
                                    value={formContrato.nome}
                                    onChange={(e) =>
                                        setFormContrato({
                                            ...formContrato,
                                            nome: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Descrição
                                </label>

                                <input
                                    className="w-full rounded border p-2"
                                    value={formContrato.descricao}
                                    onChange={(e) =>
                                        setFormContrato({
                                            ...formContrato,
                                            descricao: e.target.value,
                                        })
                                    }
                                />
                            </div>

                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">

                            <button
                                onClick={salvarContrato}
                                disabled={carregando}
                                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                            >
                                Salvar alterações
                            </button>

                            {contratoSelecionado.ativo ? (
                                <button
                                    onClick={desativar}
                                    disabled={carregando}
                                    className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                                >
                                    Desativar contrato
                                </button>
                            ) : (
                                <button
                                    onClick={ativar}
                                    disabled={carregando}
                                    className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                                >
                                    Ativar contrato
                                </button>
                            )}

                        </div>

                    </section>
                )}

                {/* =====================================================
                    VERSÕES
                ===================================================== */}

                {contratoSelecionado && (
                    <section className="rounded-lg bg-white p-5 shadow">

                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                            <h2 className="text-lg font-semibold">
                                3. Versões do contrato
                            </h2>

                            <div className="flex flex-wrap gap-2">

                                <button
                                    onClick={carregarVersoes}
                                    disabled={carregando}
                                    className="rounded bg-gray-700 px-3 py-2 text-sm text-white disabled:opacity-50"
                                >
                                    Atualizar versões
                                </button>

                                <button
                                    onClick={carregarVersaoAtiva}
                                    disabled={carregando}
                                    className="rounded bg-purple-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                                >
                                    Buscar versão ativa
                                </button>

                            </div>

                        </div>

                        <div className="space-y-3">

                            {versoes.map((versao) => (
                                <div
                                    key={versao.id}
                                    className={`rounded border p-4 ${
                                        versaoSelecionada?.id === versao.id
                                            ? 'border-purple-500 bg-purple-50'
                                            : ''
                                    }`}
                                >

                                    <div className="flex flex-wrap items-center justify-between gap-3">

                                        <div>
                                            <strong>
                                                {versao.titulo}
                                            </strong>

                                            <div className="text-sm text-gray-600">
                                                Versão: {versao.versao}
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                Status: {versao.status}
                                            </div>

                                            {versao.publicado_em && (
                                                <div className="text-sm text-gray-600">
                                                    Publicado em:{' '}
                                                    {versao.publicado_em}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() =>
                                                selecionarVersao(versao)
                                            }
                                            className="rounded bg-gray-600 px-3 py-2 text-sm text-white"
                                        >
                                            Selecionar
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>

                    </section>
                )}

                {/* =====================================================
                    EDIÇÃO DA VERSÃO
                ===================================================== */}

                {versaoSelecionada && (
                    <section className="rounded-lg bg-white p-5 shadow">

                        <h2 className="mb-4 text-lg font-semibold">
                            4. Versão selecionada
                        </h2>

                        <div className="mb-4 rounded bg-gray-50 p-3 text-sm">

                            <strong>
                                Status atual:
                            </strong>{' '}

                            {versaoSelecionada.status}

                            {versaoSelecionada.status === 'ATIVA' && (
                                <p className="mt-1 text-yellow-700">
                                    Esta versão está ATIVA e não deve ser
                                    alterada.
                                </p>
                            )}

                        </div>

                        <div className="space-y-4">

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Versão
                                </label>

                                <input
                                    className="w-full rounded border p-2"
                                    value={formVersao.versao}
                                    onChange={(e) =>
                                        setFormVersao({
                                            ...formVersao,
                                            versao: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Título
                                </label>

                                <input
                                    className="w-full rounded border p-2"
                                    value={formVersao.titulo}
                                    onChange={(e) =>
                                        setFormVersao({
                                            ...formVersao,
                                            titulo: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Conteúdo
                                </label>

                                <textarea
                                    rows={12}
                                    className="w-full rounded border p-2 font-mono text-sm"
                                    value={formVersao.conteudo}
                                    onChange={(e) =>
                                        setFormVersao({
                                            ...formVersao,
                                            conteudo: e.target.value,
                                        })
                                    }
                                />
                            </div>

                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">

                            <button
                                onClick={salvarVersao}
                                disabled={carregando}
                                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                            >
                                Salvar versão
                            </button>

                            {versaoSelecionada.status === 'RASCUNHO' && (
                                <button
                                    onClick={publicarVersao}
                                    disabled={carregando}
                                    className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                                >
                                    Publicar versão
                                </button>
                            )}

                            {versaoSelecionada.status === 'ATIVA' && (
                                <button
                                    onClick={encerrarVersao}
                                    disabled={carregando}
                                    className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50"
                                >
                                    Encerrar versão
                                </button>
                            )}

                        </div>

                    </section>
                )}

{/* =====================================================
    ACEITE ELETRÔNICO
===================================================== */}

{versaoSelecionada?.status === 'ATIVA' && (
    <section className="rounded-lg bg-white p-5 shadow">

        <h2 className="mb-4 text-lg font-semibold">
            5. Aceite eletrônico
        </h2>

        <div className="mb-5 rounded border bg-gray-50 p-5">

            <h3 className="mb-3 text-xl font-semibold">
                {versaoSelecionada.titulo}
            </h3>

            <div className="mb-4 text-sm text-gray-600">
                Versão: {versaoSelecionada.versao}
            </div>

            <div className="max-h-[500px] overflow-y-auto rounded border bg-white p-5">
                <div className="prose max-w-none text-lg leading-8">
                  <ReactMarkdown>
                    {versaoSelecionada.conteudo}
                  </ReactMarkdown>
                </div>
            </div>

        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded border p-4 hover:bg-gray-50">

            <input
                type="checkbox"
                checked={aceiteConfirmado}
                onChange={(e) =>
                    setAceiteConfirmado(e.target.checked)
                }
                className="mt-1 h-5 w-5"
            />

            <span className="text-sm">
                Li e concordo com o Termo de Autorização para
                Publicação e Disponibilização de Obra na
                Plataforma Leitura.
            </span>

        </label>

        <div className="mt-4 flex flex-wrap gap-3">

            <button
                onClick={registrarAceite}
                disabled={
                    carregando ||
                    !aceiteConfirmado
                }
                className="rounded bg-green-600 px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
                Confirmar aceite
            </button>

            <button
                onClick={carregarMeusAceites}
                disabled={carregando}
                className="rounded bg-gray-600 px-5 py-2 text-white disabled:opacity-50"
            >
                Consultar meus aceites
            </button>

        </div>

        {aceites.length > 0 && (
            <div className="mt-6">

                <h3 className="mb-3 font-semibold">
                    Aceites registrados
                </h3>

                <div className="space-y-3">

                    {aceites.map((aceite) => (
                        <div
                            key={aceite.id}
                            className="rounded border p-4 text-sm"
                        >

                            <div>
                                <strong>ID:</strong>{' '}
                                {aceite.id}
                            </div>

                            <div>
                                <strong>Versão:</strong>{' '}
                                {aceite.contrato_versao_id}
                            </div>

                            <div>
                                <strong>Aceito em:</strong>{' '}
                                {aceite.aceito_em}
                            </div>

                            <div>
                                <strong>Registro eletrônico:</strong>{' '}
                                {aceite.registro_eletronico}
                            </div>

                            <div>
                                <strong>IP:</strong>{' '}
                                {aceite.ip_origem || 'não informado'}
                            </div>

                        </div>
                    ))}

                </div>

            </div>
        )}

    </section>
)}

            </div>
        </main>
    );

}

