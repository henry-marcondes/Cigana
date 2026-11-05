'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../services/api';
import {
  listarArquivosPorLivro,
  listarPastasPorLivro,
  enviarArquivoParaLivro,
  renomearArquivo,
  moverArquivo,
  criarPastaObra,
  renomearPastaObra,
  moverPastaObra,
  excluirPastaObra,
} from '../../../../../services/arquivoMidia';

function respostaValidaPastas(pastas, pastaPaiEsperada = null) {
  if (!Array.isArray(pastas)) return false;

  return pastas.every((pasta) => (
    pasta &&
    typeof pasta.id === 'string' &&
    typeof pasta.nome === 'string' &&
    pasta.pasta_pai_id === pastaPaiEsperada &&
    Array.isArray(pasta.subpastas) &&
    respostaValidaPastas(pasta.subpastas, pasta.id)
  ));
}

function tamanhoLegivel(tamanho) {
  const valor = typeof tamanho === 'string' && tamanho.trim() !== ''
    ? Number(tamanho)
    : tamanho;

  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0) {
    return 'Tamanho não informado';
  }

  if (valor < 1024) return `${valor} B`;
  if (valor < 1024 ** 2) return `${(valor / 1024).toFixed(1)} KB`;
  if (valor < 1024 ** 3) return `${(valor / 1024 ** 2).toFixed(1)} MB`;
  return `${(valor / 1024 ** 3).toFixed(1)} GB`;
}

function mensagemErroAmigavel(error) {
  if (error?.status === 401) return 'Sua sessão expirou. Entre novamente para acessar os arquivos.';
  if (error?.status === 403) return 'Você não tem autorização para acessar os arquivos desta obra.';
  if (error?.status === 404) return 'A obra não foi encontrada ou não está disponível para você.';
  if (typeof error?.status === 'number' && error.status >= 500) {
    return 'O serviço não conseguiu carregar os arquivos agora. Tente novamente mais tarde.';
  }
  if (error instanceof TypeError && !error?.status) {
    return 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
  }
  return error.message || 'Não foi possível carregar os arquivos da obra.';
}

function mensagemErroUpload(error) {
  if (error?.status === 401) return 'Sua sessão expirou. Entre novamente para enviar arquivos.';
  if (error?.status === 403) return 'Você não tem autorização para enviar arquivos nesta obra.';
  if (error?.status === 413) return 'O servidor recusou o arquivo enviado. Verifique o arquivo e tente novamente.';

  const errosValidacao = error?.data?.errors;
  if (Array.isArray(errosValidacao) && errosValidacao.length > 0) {
    const mensagens = errosValidacao
      .map((item) => item.msg || item.message)
      .filter(Boolean);
    if (mensagens.length > 0) return mensagens.join(' ');
  }

  if (typeof error?.status === 'number' && error.status >= 500) {
    return 'Não foi possível concluir o envio agora. Tente novamente mais tarde.';
  }
  if (error instanceof TypeError && !error?.status) {
    return 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
  }
  return error?.data?.message || error?.data?.error || error.message || 'Não foi possível enviar o arquivo.';
}

function mensagemErroOperacaoArquivo(error) {
  if (error?.status === 401) return 'Sua sessão expirou. Entre novamente para gerenciar os arquivos.';
  if (error?.status === 403) return 'Você não tem autorização para alterar arquivos desta obra.';
  if (error?.status === 404) return 'O arquivo ou destino não está mais disponível nesta obra.';
  if (error?.status === 409) {
    return error?.data?.message || 'A operação entrou em conflito com o estado atual do arquivo.';
  }

  const errosValidacao = error?.data?.errors;
  if (Array.isArray(errosValidacao) && errosValidacao.length > 0) {
    const mensagens = errosValidacao
      .map((item) => item.msg || item.message)
      .filter(Boolean);
    if (mensagens.length > 0) return mensagens.join(' ');
  }

  if (typeof error?.status === 'number' && error.status >= 500) {
    return 'Não foi possível concluir a operação agora. Tente novamente mais tarde.';
  }
  if (error instanceof TypeError && !error?.status) {
    return 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
  }
  return error?.data?.message || error?.data?.error || error.message || 'Não foi possível alterar o arquivo.';
}

function mensagemErroPasta(error) {
  if (error?.status === 401) return 'Sua sessão expirou. Entre novamente para gerenciar as pastas.';
  if (error?.status === 403) return 'Você não tem autorização para alterar as pastas desta obra.';
  if (error?.status === 404) return 'A pasta ou destino não está mais disponível nesta obra.';

  const errosValidacao = error?.data?.errors;
  if (Array.isArray(errosValidacao) && errosValidacao.length > 0) {
    const mensagens = errosValidacao
      .map((item) => item.msg || item.message)
      .filter(Boolean);
    if (mensagens.length > 0) return mensagens.join(' ');
  }

  if (error?.status === 409) {
    return error?.data?.message || 'A pasta não pode ser movida ou renomeada nesse estado.';
  }
  if (typeof error?.status === 'number' && error.status >= 500) {
    return 'Não foi possível concluir a operação agora. Tente novamente mais tarde.';
  }
  if (error instanceof TypeError && !error?.status) {
    return 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
  }
  return error?.data?.message || error?.data?.error || error.message || 'Não foi possível alterar a pasta.';
}

function achatarPastas(pastas, caminhoPai = '') {
  return pastas.flatMap((pasta) => {
    const caminho = caminhoPai ? `${caminhoPai} / ${pasta.nome}` : pasta.nome;
    return [
      {
        id: pasta.id,
        nome: pasta.nome,
        caminho,
        pasta_pai_id: pasta.pasta_pai_id ?? null,
      },
      ...achatarPastas(pasta.subpastas, caminho),
    ];
  });
}

function idsDaPastaEDescendentes(pastaId, pastasPlanas) {
  const ids = new Set([pastaId]);
  let mudou = true;

  while (mudou) {
    mudou = false;
    for (const pasta of pastasPlanas) {
      if (pasta.pasta_pai_id && ids.has(pasta.pasta_pai_id) && !ids.has(pasta.id)) {
        ids.add(pasta.id);
        mudou = true;
      }
    }
  }

  return ids;
}

function atualizarPastaNaArvore(pastas, pastaId, atualizar) {
  return pastas.map((pasta) => {
    if (pasta.id === pastaId) return atualizar(pasta);
    return {
      ...pasta,
      subpastas: atualizarPastaNaArvore(pasta.subpastas, pastaId, atualizar),
    };
  });
}

function adicionarPastaNaArvore(pastas, pastaPaiId, novaPasta) {
  if (pastaPaiId === null) return [...pastas, novaPasta];

  let paiEncontrado = false;
  const novasPastas = pastas.map((pasta) => {
    if (pasta.id === pastaPaiId) {
      paiEncontrado = true;
      return { ...pasta, subpastas: [...pasta.subpastas, novaPasta] };
    }

    const subpastas = adicionarPastaNaArvore(pasta.subpastas, pastaPaiId, novaPasta);
    if (subpastas !== pasta.subpastas) paiEncontrado = true;
    return subpastas === pasta.subpastas ? pasta : { ...pasta, subpastas };
  });

  return paiEncontrado ? novasPastas : pastas;
}

function removerPastaDaArvore(pastas, pastaId) {
  const pastaEncontrada = pastas.find((pasta) => pasta.id === pastaId);
  if (pastaEncontrada) {
    return {
      pastas: pastas.filter((pasta) => pasta.id !== pastaId),
      removida: pastaEncontrada,
    };
  }

  for (let indice = 0; indice < pastas.length; indice += 1) {
    const resultado = removerPastaDaArvore(pastas[indice].subpastas, pastaId);
    if (resultado.removida) {
      const novasPastas = [...pastas];
      novasPastas[indice] = { ...pastas[indice], subpastas: resultado.pastas };
      return { pastas: novasPastas, removida: resultado.removida };
    }
  }

  return { pastas, removida: null };
}

function inserirPastaNaArvore(pastas, pastaPaiId, pastaInserir) {
  if (pastaPaiId === null) return { pastas: [...pastas, pastaInserir], inserida: true };

  let inserida = false;
  const novasPastas = pastas.map((pasta) => {
    if (pasta.id === pastaPaiId) {
      inserida = true;
      return { ...pasta, subpastas: [...pasta.subpastas, pastaInserir] };
    }

    const resultado = inserirPastaNaArvore(pasta.subpastas, pastaPaiId, pastaInserir);
    if (resultado.inserida) inserida = true;
    return resultado.inserida ? { ...pasta, subpastas: resultado.pastas } : pasta;
  });

  return { pastas: inserida ? novasPastas : pastas, inserida };
}

function ListaPastas({
  pastas,
  pastaSelecionada,
  aoSelecionar,
  aoRenomear,
  aoMover,
  aoExcluir,
  pastasEmAndamento,
  excluindoPastaId,
  criandoPasta = false,
  nivel = 0,
  selecaoDesabilitada = false,
}) {
  return pastas.map((pasta) => (
    <li key={pasta.id}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={selecaoDesabilitada}
          aria-current={pastaSelecionada === pasta.id ? 'true' : undefined}
          onClick={() => aoSelecionar(pasta.id)}
          style={{ paddingLeft: `${12 + nivel * 16}px` }}
          className={`min-w-0 flex-1 rounded-md py-2 pr-3 text-left text-sm hover:bg-gray-100 ${
            pastaSelecionada === pasta.id
              ? 'bg-gray-100 font-semibold text-gray-900'
              : 'text-gray-700'
          }`}
        >
          <span aria-hidden="true" className="mr-2">📁</span>
          {pasta.nome}
        </button>
        <div className="flex gap-1 pl-3 sm:pl-0">
          <button
            type="button"
            disabled={criandoPasta || Object.keys(pastasEmAndamento).length > 0}
            onClick={() => aoRenomear(pasta)}
            className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Renomear
          </button>
          <button
            type="button"
            disabled={criandoPasta || Object.keys(pastasEmAndamento).length > 0}
            onClick={() => aoMover(pasta)}
            className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mover
          </button>
          <button
            type="button"
            disabled={criandoPasta || Object.keys(pastasEmAndamento).length > 0}
            onClick={() => aoExcluir(pasta)}
            className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {excluindoPastaId === pasta.id ? 'Excluindo...' : 'Excluir pasta'}
          </button>
        </div>
      </div>
      {pasta.subpastas.length > 0 && (
        <ul className="mt-1 space-y-1">
          <ListaPastas
            pastas={pasta.subpastas}
            pastaSelecionada={pastaSelecionada}
            aoSelecionar={aoSelecionar}
            aoRenomear={aoRenomear}
            aoMover={aoMover}
            aoExcluir={aoExcluir}
            pastasEmAndamento={pastasEmAndamento}
            excluindoPastaId={excluindoPastaId}
            criandoPasta={criandoPasta}
            nivel={nivel + 1}
            selecaoDesabilitada={selecaoDesabilitada}
          />
        </ul>
      )}
    </li>
  ));
}

export default function ArquivosObra() {
  const { id } = useParams();
  const router = useRouter();
  const [obra, setObra] = useState(null);
  const [arquivos, setArquivos] = useState([]);
  const [pastas, setPastas] = useState([]);
  const [pastaSelecionada, setPastaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erroUpload, setErroUpload] = useState('');
  const [sucessoUpload, setSucessoUpload] = useState('');
  const inputArquivoRef = useRef(null);
  const uploadEmAndamento = useRef(false);
  const [renomeandoId, setRenomeandoId] = useState(null);
  const [nomeParaRenomear, setNomeParaRenomear] = useState('');
  const [movendoId, setMovendoId] = useState(null);
  const [pastaDestino, setPastaDestino] = useState('');
  const [operacoesEmAndamento, setOperacoesEmAndamento] = useState({});
  const operacoesEmAndamentoRef = useRef(new Set());
  const [errosOperacao, setErrosOperacao] = useState({});
  const [sucessoOperacao, setSucessoOperacao] = useState('');
  const [mostrarCriarPasta, setMostrarCriarPasta] = useState(false);
  const [nomeNovaPasta, setNomeNovaPasta] = useState('');
  const [criandoPasta, setCriandoPasta] = useState(false);
  const criandoPastaRef = useRef(false);
  const [pastaRenomeandoId, setPastaRenomeandoId] = useState(null);
  const [nomeParaRenomearPasta, setNomeParaRenomearPasta] = useState('');
  const [pastaMovendoId, setPastaMovendoId] = useState(null);
  const [destinoPastaId, setDestinoPastaId] = useState('');
  const [pastasEmAndamento, setPastasEmAndamento] = useState({});
  const pastasEmAndamentoRef = useRef(new Set());
  const [erroPasta, setErroPasta] = useState('');
  const [sucessoPasta, setSucessoPasta] = useState('');
  const [excluindoPastaId, setExcluindoPastaId] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro('');

      try {
        const [respostaObra, respostaArquivos, respostaPastas] = await Promise.all([
          apiFetch(`/api/livros/${id}`),
          listarArquivosPorLivro(id),
          listarPastasPorLivro(id),
        ]);

        if (!Array.isArray(respostaArquivos.data)) {
          throw new Error('A resposta de arquivos da obra está em formato inválido.');
        }
        if (!respostaValidaPastas(respostaPastas.data)) {
          throw new Error('A estrutura de pastas recebida está em formato inválido.');
        }
        const arquivosValidos = respostaArquivos.data.every((arquivo) => (
          arquivo &&
          typeof arquivo.id === 'string' &&
          typeof arquivo.nome_original === 'string' &&
          (arquivo.pasta_id === null || typeof arquivo.pasta_id === 'string')
        ));
        if (!arquivosValidos) {
          throw new Error('A lista de arquivos recebida está em formato inválido.');
        }

        if (ativo) {
          setObra(respostaObra.data);
          setArquivos(respostaArquivos.data);
          setPastas(respostaPastas.data);
        }
      } catch (errorCarregamento) {
        if (ativo) setErro(mensagemErroAmigavel(errorCarregamento));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    if (id) carregarDados();
    return () => {
      ativo = false;
    };
  }, [id]);

  const arquivosFiltrados = useMemo(
    () => arquivos.filter((arquivo) => arquivo.pasta_id === pastaSelecionada),
    [arquivos, pastaSelecionada]
  );
  const pastasDestinos = useMemo(() => achatarPastas(pastas), [pastas]);
  const pastaParaRenomear = pastasDestinos.find((pasta) => pasta.id === pastaRenomeandoId);
  const pastaParaMover = pastasDestinos.find((pasta) => pasta.id === pastaMovendoId);
  const idsProibidosComoDestino = pastaMovendoId
    ? idsDaPastaEDescendentes(pastaMovendoId, pastasDestinos)
    : new Set();
  const destinosMovimentacao = pastasDestinos.filter(
    (pasta) => !idsProibidosComoDestino.has(pasta.id)
  );

  function iniciarOperacaoArquivo(arquivoId) {
    if (operacoesEmAndamentoRef.current.has(arquivoId)) return false;

    operacoesEmAndamentoRef.current.add(arquivoId);
    setOperacoesEmAndamento((atuais) => ({ ...atuais, [arquivoId]: true }));
    setErrosOperacao((atuais) => ({ ...atuais, [arquivoId]: '' }));
    setSucessoOperacao('');
    return true;
  }

  function finalizarOperacaoArquivo(arquivoId) {
    operacoesEmAndamentoRef.current.delete(arquivoId);
    setOperacoesEmAndamento((atuais) => {
      const proximas = { ...atuais };
      delete proximas[arquivoId];
      return proximas;
    });
  }

  function abrirRenomeacao(arquivo) {
    setRenomeandoId(arquivo.id);
    setNomeParaRenomear(arquivo.nome_original);
    setMovendoId(null);
    setErrosOperacao((atuais) => ({ ...atuais, [arquivo.id]: '' }));
    setSucessoOperacao('');
  }

  function abrirMovimentacao(arquivo) {
    setMovendoId(arquivo.id);
    setPastaDestino(arquivo.pasta_id || '');
    setRenomeandoId(null);
    setErrosOperacao((atuais) => ({ ...atuais, [arquivo.id]: '' }));
    setSucessoOperacao('');
  }

  async function salvarRenomeacao(event, arquivo) {
    event.preventDefault();
    const nomeNovo = nomeParaRenomear.trim();
    if (!nomeNovo || nomeNovo === arquivo.nome_original) return;
    if (!iniciarOperacaoArquivo(arquivo.id)) return;

    try {
      const resposta = await renomearArquivo(arquivo.id, nomeNovo);
      const nomeConfirmado = resposta.data?.nome_original || nomeNovo;
      setArquivos((atuais) => atuais.map((item) => (
        item.id === arquivo.id ? { ...item, nome_original: nomeConfirmado } : item
      )));
      setRenomeandoId((atual) => (atual === arquivo.id ? null : atual));
      setSucessoOperacao(resposta.message || 'Arquivo renomeado com sucesso.');
    } catch (error) {
      setErrosOperacao((atuais) => ({
        ...atuais,
        [arquivo.id]: mensagemErroOperacaoArquivo(error),
      }));
    } finally {
      finalizarOperacaoArquivo(arquivo.id);
    }
  }

  async function salvarMovimentacao(event, arquivo) {
    event.preventDefault();
    const destino = pastaDestino || null;
    if (destino === arquivo.pasta_id) return;
    if (!iniciarOperacaoArquivo(arquivo.id)) return;

    try {
      const resposta = await moverArquivo(arquivo.id, destino);
      const pastaConfirmada = resposta.data &&
        Object.prototype.hasOwnProperty.call(resposta.data, 'pasta_id')
        ? resposta.data.pasta_id
        : destino;
      setArquivos((atuais) => atuais.map((item) => (
        item.id === arquivo.id ? { ...item, pasta_id: pastaConfirmada } : item
      )));
      setMovendoId((atual) => (atual === arquivo.id ? null : atual));
      setSucessoOperacao(resposta.message || 'Arquivo movido com sucesso.');
    } catch (error) {
      setErrosOperacao((atuais) => ({
        ...atuais,
        [arquivo.id]: mensagemErroOperacaoArquivo(error),
      }));
    } finally {
      finalizarOperacaoArquivo(arquivo.id);
    }
  }

  function abrirCriacaoPasta() {
    setMostrarCriarPasta(true);
    setPastaRenomeandoId(null);
    setPastaMovendoId(null);
    setNomeNovaPasta('');
    setErroPasta('');
    setSucessoPasta('');
  }

  function abrirRenomeacaoPasta(pasta) {
    setPastaRenomeandoId(pasta.id);
    setNomeParaRenomearPasta(pasta.nome);
    setPastaMovendoId(null);
    setMostrarCriarPasta(false);
    setErroPasta('');
    setSucessoPasta('');
  }

  function abrirMovimentacaoPasta(pasta) {
    setPastaMovendoId(pasta.id);
    setDestinoPastaId(pasta.pasta_pai_id || '');
    setPastaRenomeandoId(null);
    setMostrarCriarPasta(false);
    setErroPasta('');
    setSucessoPasta('');
  }

  function iniciarOperacaoPasta(pastaId) {
    if (pastasEmAndamentoRef.current.size > 0 || criandoPastaRef.current) return false;

    pastasEmAndamentoRef.current.add(pastaId);
    setPastasEmAndamento((atuais) => ({ ...atuais, [pastaId]: true }));
    setErroPasta('');
    setSucessoPasta('');
    return true;
  }

  function finalizarOperacaoPasta(pastaId) {
    pastasEmAndamentoRef.current.delete(pastaId);
    setPastasEmAndamento((atuais) => {
      const proximas = { ...atuais };
      delete proximas[pastaId];
      return proximas;
    });
  }

  async function salvarNovaPasta(event) {
    event.preventDefault();
    const nome = nomeNovaPasta.trim();
    if (!nome || criandoPastaRef.current || pastasEmAndamentoRef.current.size > 0) return;

    criandoPastaRef.current = true;
    setCriandoPasta(true);
    setErroPasta('');
    setSucessoPasta('');
    const pastaPaiId = pastaSelecionada;

    try {
      const resposta = await criarPastaObra(id, nome, pastaPaiId);
      const pastaCriada = resposta.data;
      if (!pastaCriada || typeof pastaCriada.id !== 'string' || typeof pastaCriada.nome !== 'string') {
        throw new Error('A API confirmou a criação, mas retornou dados de pasta inválidos. Atualize a árvore para conferir.');
      }

      const novaPasta = {
        ...pastaCriada,
        pasta_pai_id: pastaPaiId,
        subpastas: [],
      };
      setPastas((atuais) => adicionarPastaNaArvore(atuais, pastaPaiId, novaPasta));
      setMostrarCriarPasta(false);
      setNomeNovaPasta('');
      setSucessoPasta(resposta.message || 'Pasta criada com sucesso.');
    } catch (error) {
      setErroPasta(mensagemErroPasta(error));
    } finally {
      criandoPastaRef.current = false;
      setCriandoPasta(false);
    }
  }

  async function salvarRenomeacaoPasta(event) {
    event.preventDefault();
    const pasta = pastasDestinos.find((item) => item.id === pastaRenomeandoId);
    const nome = nomeParaRenomearPasta.trim();
    if (!pasta || !nome || nome === pasta.nome) return;
    if (!iniciarOperacaoPasta(pasta.id)) return;

    try {
      const resposta = await renomearPastaObra(pasta.id, nome);
      const nomeConfirmado = resposta.data?.nome || nome;
      setPastas((atuais) => atualizarPastaNaArvore(atuais, pasta.id, (atual) => ({
        ...atual,
        nome: nomeConfirmado,
      })));
      setPastaRenomeandoId(null);
      setSucessoPasta(resposta.message || 'Pasta renomeada com sucesso.');
    } catch (error) {
      setErroPasta(mensagemErroPasta(error));
    } finally {
      finalizarOperacaoPasta(pasta.id);
    }
  }

  async function salvarMovimentacaoPasta(event) {
    event.preventDefault();
    const pasta = pastasDestinos.find((item) => item.id === pastaMovendoId);
    const destino = destinoPastaId || null;
    if (!pasta || destino === pasta.pasta_pai_id) return;
    if (destino && idsProibidosComoDestino.has(destino)) return;
    if (!iniciarOperacaoPasta(pasta.id)) return;

    try {
      const resposta = await moverPastaObra(pasta.id, destino);
      const pastaAtualizada = removerPastaDaArvore(pastas, pasta.id);
      if (!pastaAtualizada.removida) {
        throw new Error('A pasta foi movida, mas não foi localizada para atualizar a árvore. Atualize a página para conferir.');
      }

      const subpastasPreservadas = pastaAtualizada.removida.subpastas;
      const pastaMovida = {
        ...pastaAtualizada.removida,
        ...(resposta.data || {}),
        pasta_pai_id: destino,
        subpastas: subpastasPreservadas,
      };
      const resultadoInsercao = inserirPastaNaArvore(
        pastaAtualizada.pastas,
        destino,
        pastaMovida
      );
      if (!resultadoInsercao.inserida) {
        throw new Error('A pasta foi movida, mas não foi possível atualizar a árvore. Atualize a página para conferir.');
      }

      setPastas(resultadoInsercao.pastas);
      setPastaMovendoId(null);
      setSucessoPasta(resposta.message || 'Pasta movida com sucesso.');
    } catch (error) {
      setErroPasta(mensagemErroPasta(error));
    } finally {
      finalizarOperacaoPasta(pasta.id);
    }
  }

  async function excluirPasta(pasta) {
    if (pastasEmAndamentoRef.current.size > 0 || criandoPastaRef.current) return;

    const confirmar = window.confirm(
      `Excluir a pasta “${pasta.nome}”? Somente pastas vazias podem ser excluídas.`
    );
    if (!confirmar || !iniciarOperacaoPasta(pasta.id)) return;

    setExcluindoPastaId(pasta.id);
    try {
      const resposta = await excluirPastaObra(pasta.id);
      setPastas((atuais) => removerPastaDaArvore(atuais, pasta.id).pastas);
      setPastaSelecionada((atual) => (atual === pasta.id ? null : atual));
      setPastaRenomeandoId((atual) => (atual === pasta.id ? null : atual));
      setPastaMovendoId((atual) => (atual === pasta.id ? null : atual));
      setSucessoPasta(resposta.message || `Pasta “${pasta.nome}” excluída com sucesso.`);
      setErroPasta('');
    } catch (error) {
      setErroPasta(mensagemErroPasta(error));
      setSucessoPasta('');
    } finally {
      setExcluindoPastaId(null);
      finalizarOperacaoPasta(pasta.id);
    }
  }

  function selecionarArquivo(event) {
    setArquivoSelecionado(event.target.files?.[0] || null);
    setErroUpload('');
    setSucessoUpload('');
  }

  async function enviarArquivo(event) {
    event.preventDefault();
    if (!arquivoSelecionado || uploadEmAndamento.current) return;

    uploadEmAndamento.current = true;
    setEnviando(true);
    setErroUpload('');
    setSucessoUpload('');

    const destino = pastaSelecionada;

    try {
      const resposta = await enviarArquivoParaLivro(id, arquivoSelecionado, destino);
      const arquivo = resposta.data;

      if (
        !arquivo ||
        typeof arquivo.id !== 'string' ||
        typeof arquivo.nome_original !== 'string' ||
        (arquivo.pasta_id !== null && typeof arquivo.pasta_id !== 'string')
      ) {
        throw new Error('O serviço confirmou o envio, mas retornou dados de arquivo inválidos. Atualize a página para conferir a listagem.');
      }

      setArquivos((atuais) => (
        atuais.some((item) => item.id === arquivo.id)
          ? atuais.map((item) => (item.id === arquivo.id ? arquivo : item))
          : [...atuais, arquivo]
      ));
      setArquivoSelecionado(null);
      if (inputArquivoRef.current) inputArquivoRef.current.value = '';
      setSucessoUpload(resposta.message || 'Arquivo enviado com sucesso.');
    } catch (errorEnvio) {
      setErroUpload(mensagemErroUpload(errorEnvio));
    } finally {
      uploadEmAndamento.current = false;
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <p className="text-gray-600">Carregando arquivos da obra...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <button
            type="button"
            onClick={() => router.push(`/estudio/obras/${id}`)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Voltar para a obra
          </button>
          <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
            Arquivos da obra
          </h1>
          {obra?.titulo && <p className="mt-1 text-gray-600">{obra.titulo}</p>}
        </header>

        {erro ? (
          <section className="rounded-lg bg-white p-5 shadow sm:p-6">
            <p role="alert" className="text-sm text-red-700">{erro}</p>
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(220px,1fr)_2fr]">
            <nav aria-label="Pastas da obra" className="rounded-lg bg-white p-4 shadow sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pastas</h2>
                {!mostrarCriarPasta && (
                  <button
                    type="button"
                    disabled={criandoPasta || Object.keys(pastasEmAndamento).length > 0}
                    onClick={abrirCriacaoPasta}
                    className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pastaSelecionada === null ? 'Nova pasta' : 'Nova subpasta'}
                  </button>
                )}
              </div>
              {sucessoPasta && (
                <p role="status" className="mt-3 text-sm text-green-700">{sucessoPasta}</p>
              )}
              {erroPasta && (
                <p role="alert" className="mt-3 text-sm text-red-700">{erroPasta}</p>
              )}
              <ul className="mt-3 space-y-1">
                <li>
                  <button
                    type="button"
                    disabled={enviando || criandoPasta}
                    aria-current={pastaSelecionada === null ? 'true' : undefined}
                    onClick={() => setPastaSelecionada(null)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                      pastaSelecionada === null
                        ? 'bg-gray-100 font-semibold text-gray-900'
                        : 'text-gray-700'
                    }`}
                  >
                    <span aria-hidden="true" className="mr-2">📂</span>
                    Raiz da obra
                  </button>
                </li>
                {pastas.length > 0 ? (
                  <ListaPastas
                    pastas={pastas}
                    pastaSelecionada={pastaSelecionada}
                    aoSelecionar={setPastaSelecionada}
                    aoRenomear={abrirRenomeacaoPasta}
                    aoMover={abrirMovimentacaoPasta}
                    aoExcluir={excluirPasta}
                    pastasEmAndamento={pastasEmAndamento}
                    excluindoPastaId={excluindoPastaId}
                    criandoPasta={criandoPasta}
                    selecaoDesabilitada={enviando || criandoPasta}
                  />
                ) : (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    Esta obra ainda não possui pastas.
                  </li>
                )}
              </ul>

              {mostrarCriarPasta && (
                <form onSubmit={salvarNovaPasta} className="mt-4 rounded-md bg-gray-50 p-3">
                  <label htmlFor="nome-nova-pasta" className="block text-sm font-medium text-gray-700">
                    Nome da {pastaSelecionada === null ? 'pasta na raiz' : 'subpasta'}
                  </label>
                  <input
                    id="nome-nova-pasta"
                    type="text"
                    required
                    value={nomeNovaPasta}
                    disabled={criandoPasta}
                    onChange={(event) => setNomeNovaPasta(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Destino: {pastaSelecionada === null
                      ? 'raiz da obra'
                      : pastasDestinos.find((pasta) => pasta.id === pastaSelecionada)?.caminho || 'pasta selecionada'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={criandoPasta || !nomeNovaPasta.trim() || Object.keys(pastasEmAndamento).length > 0}
                      className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {criandoPasta ? 'Criando pasta...' : 'Criar pasta'}
                    </button>
                    <button
                      type="button"
                      disabled={criandoPasta}
                      onClick={() => setMostrarCriarPasta(false)}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {pastaParaRenomear && (
                <form onSubmit={salvarRenomeacaoPasta} className="mt-4 rounded-md bg-gray-50 p-3">
                  <label htmlFor="nome-pasta-renomear" className="block text-sm font-medium text-gray-700">
                    Renomear pasta: {pastaParaRenomear.caminho}
                  </label>
                  <input
                    id="nome-pasta-renomear"
                    type="text"
                    required
                    value={nomeParaRenomearPasta}
                    disabled={Boolean(pastasEmAndamento[pastaRenomeandoId])}
                    onChange={(event) => setNomeParaRenomearPasta(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-100"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={
                        Boolean(pastasEmAndamento[pastaRenomeandoId]) ||
                        !nomeParaRenomearPasta.trim() ||
                        nomeParaRenomearPasta.trim() === pastaParaRenomear.nome
                      }
                      className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pastasEmAndamento[pastaRenomeandoId] ? 'Renomeando...' : 'Salvar nome'}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(pastasEmAndamento[pastaRenomeandoId])}
                      onClick={() => setPastaRenomeandoId(null)}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {pastaParaMover && (
                <form onSubmit={salvarMovimentacaoPasta} className="mt-4 rounded-md bg-gray-50 p-3">
                  <label htmlFor="destino-pasta" className="block text-sm font-medium text-gray-700">
                    Mover pasta: {pastaParaMover.caminho}
                  </label>
                  <select
                    id="destino-pasta"
                    value={destinoPastaId}
                    disabled={Boolean(pastasEmAndamento[pastaMovendoId])}
                    onChange={(event) => setDestinoPastaId(event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-100"
                  >
                    <option value="">Raiz da obra</option>
                    {destinosMovimentacao.map((destino) => (
                      <option key={destino.id} value={destino.id}>{destino.caminho}</option>
                    ))}
                  </select>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={
                        Boolean(pastasEmAndamento[pastaMovendoId]) ||
                        (destinoPastaId || null) === pastaParaMover.pasta_pai_id
                      }
                      className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pastasEmAndamento[pastaMovendoId] ? 'Movendo pasta...' : 'Mover pasta'}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(pastasEmAndamento[pastaMovendoId])}
                      onClick={() => setPastaMovendoId(null)}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </nav>

            <section className="min-w-0 rounded-lg bg-white p-4 shadow sm:p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {pastaSelecionada === null ? 'Arquivos na raiz' : 'Arquivos da pasta'}
              </h2>
              <form onSubmit={enviarArquivo} className="mt-4 rounded-lg border border-gray-200 p-4">
                <label htmlFor="arquivo-obra" className="block text-sm font-medium text-gray-700">
                  Selecionar arquivo para {pastaSelecionada === null ? 'a raiz da obra' : 'a pasta selecionada'}
                </label>
                <input
                  ref={inputArquivoRef}
                  id="arquivo-obra"
                  type="file"
                  disabled={enviando}
                  onChange={selecionarArquivo}
                  className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:font-medium file:text-gray-700 hover:file:bg-gray-200 disabled:opacity-60"
                />
                {arquivoSelecionado && (
                  <p className="mt-2 break-words text-sm text-gray-600">
                    Selecionado: {arquivoSelecionado.name}
                  </p>
                )}
                {erroUpload && (
                  <p role="alert" className="mt-3 text-sm text-red-700">{erroUpload}</p>
                )}
                {sucessoUpload && (
                  <p role="status" className="mt-3 text-sm text-green-700">{sucessoUpload}</p>
                )}
                <button
                  type="submit"
                  disabled={!arquivoSelecionado || enviando}
                  className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enviando ? 'Enviando arquivo...' : 'Enviar arquivo'}
                </button>
              </form>
              {sucessoOperacao && (
                <p role="status" className="mt-4 text-sm text-green-700">
                  {sucessoOperacao}
                </p>
              )}
              {arquivosFiltrados.length === 0 ? (
                <p className="mt-4 rounded-md border border-dashed border-gray-300 p-5 text-sm text-gray-500">
                  Não há arquivos nesta localização.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-gray-200">
                  {arquivosFiltrados.map((arquivo) => (
                    <li key={arquivo.id} className="py-4">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words font-medium text-gray-900">
                            {arquivo.nome_original}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {arquivo.mime_type || 'Tipo MIME não informado'}
                            {' · '}
                            {tamanhoLegivel(arquivo.tamanho_bytes)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={Boolean(operacoesEmAndamento[arquivo.id])}
                            onClick={() => abrirRenomeacao(arquivo)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Renomear
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(operacoesEmAndamento[arquivo.id])}
                            onClick={() => abrirMovimentacao(arquivo)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Mover
                          </button>
                        </div>
                      </div>

                      {renomeandoId === arquivo.id && (
                        <form
                          onSubmit={(event) => salvarRenomeacao(event, arquivo)}
                          className="mt-3 rounded-md bg-gray-50 p-3"
                        >
                          <label htmlFor={`nome-arquivo-${arquivo.id}`} className="block text-sm font-medium text-gray-700">
                            Novo nome
                          </label>
                          <input
                            id={`nome-arquivo-${arquivo.id}`}
                            type="text"
                            required
                            value={nomeParaRenomear}
                            disabled={Boolean(operacoesEmAndamento[arquivo.id])}
                            onChange={(event) => {
                              setNomeParaRenomear(event.target.value);
                              setErrosOperacao((atuais) => ({ ...atuais, [arquivo.id]: '' }));
                            }}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-100"
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="submit"
                              disabled={
                                Boolean(operacoesEmAndamento[arquivo.id]) ||
                                !nomeParaRenomear.trim() ||
                                nomeParaRenomear.trim() === arquivo.nome_original
                              }
                              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {operacoesEmAndamento[arquivo.id] ? 'Renomeando...' : 'Salvar nome'}
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(operacoesEmAndamento[arquivo.id])}
                              onClick={() => setRenomeandoId(null)}
                              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}

                      {movendoId === arquivo.id && (
                        <form
                          onSubmit={(event) => salvarMovimentacao(event, arquivo)}
                          className="mt-3 rounded-md bg-gray-50 p-3"
                        >
                          <label htmlFor={`pasta-destino-${arquivo.id}`} className="block text-sm font-medium text-gray-700">
                            Mover para
                          </label>
                          <select
                            id={`pasta-destino-${arquivo.id}`}
                            value={pastaDestino}
                            disabled={Boolean(operacoesEmAndamento[arquivo.id])}
                            onChange={(event) => {
                              setPastaDestino(event.target.value);
                              setErrosOperacao((atuais) => ({ ...atuais, [arquivo.id]: '' }));
                            }}
                            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-100"
                          >
                            <option value="">Raiz da obra</option>
                            {pastasDestinos.map((pasta) => (
                              <option key={pasta.id} value={pasta.id}>
                                {pasta.caminho}
                              </option>
                            ))}
                          </select>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="submit"
                              disabled={
                                Boolean(operacoesEmAndamento[arquivo.id]) ||
                                (pastaDestino || null) === arquivo.pasta_id
                              }
                              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {operacoesEmAndamento[arquivo.id] ? 'Movendo...' : 'Mover arquivo'}
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(operacoesEmAndamento[arquivo.id])}
                              onClick={() => setMovendoId(null)}
                              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}

                      {errosOperacao[arquivo.id] && (
                        <p role="alert" className="mt-3 text-sm text-red-700">
                          {errosOperacao[arquivo.id]}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
