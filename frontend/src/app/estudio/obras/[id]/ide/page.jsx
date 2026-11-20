'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../../services/api';
import { listarEscolhasPorCena } from '../../../../../services/escolha';
import EditorMarkdown from '../../../../../components/EditorMarkdown';
import EditorConteudosObra from '../../../../../components/EditorConteudosObra';
import EditorAtributosCapitulo from '../../../../../components/EditorAtributosCapitulo';
import EditorEscolhasObra from '../../../../../components/EditorEscolhasObra';
import EditorNavegacaoEstrutural from '../../../../../components/EditorNavegacaoEstrutural';
import {
  criarDocumentoMarkdown, desativarDocumentoMarkdown, enviarDocumentoMarkdown, listarDocumentosMarkdown,
  lerDocumentoMarkdown, salvarDocumentoMarkdown, consultarTrechoMarkdown,
} from '../../../../../services/livroDocumento';
import {
  desativarArquivoGerenciado,
  enviarArquivoParaLivro,
  obterResumoArmazenamento,
  substituirArquivoGerenciado,
} from '../../../../../services/arquivoMidia';

const icones = { obra: '📚', capitulo: '📖', cena: '🎬', texto: '¶', IMAGEM: '▧', AUDIO: '♫', VIDEO: '▶', escolha: '↳' };

function tamanhoLegivel(bytes) {
  let valor;
  try { valor = BigInt(bytes); } catch { return 'Tamanho indisponível'; }
  if (valor < 1024n) return `${valor} B`;
  const unidades = ['KiB', 'MiB', 'GiB', 'TiB'];
  let divisor = 1024n;
  let unidade = 0;
  while (valor >= divisor * 1024n && unidade < unidades.length - 1) {
    divisor *= 1024n;
    unidade += 1;
  }
  const arredondado = (valor * 10n + divisor / 2n) / divisor;
  const inteiro = arredondado / 10n;
  const decimal = arredondado % 10n;
  return `${inteiro}${decimal ? `,${decimal}` : ''} ${unidades[unidade]}`;
}

const nomesTipo = {
  TEXTO: 'Texto', IMAGEM: 'Imagem', AUDIO: 'Áudio', VIDEO: 'Vídeo',
  MULTIPLO: 'Múltiplas associações', OUTRO: 'Outro arquivo',
};

export default function IDEObra() {
  const { id } = useParams();
  const [obra, setObra] = useState(null);
  const [arvore, setArvore] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [trechoSelecionadoId, setTrechoSelecionadoId] = useState('');
  const [capituloSelecionadoId, setCapituloSelecionadoId] = useState('');
  const [erroDocumentos, setErroDocumentos] = useState('');
  const [operandoDocumento, setOperandoDocumento] = useState(false);
  const [rascunho, setRascunho] = useState('');
  const [rascunhoCarregado, setRascunhoCarregado] = useState(false);
  const [nomeRascunho, setNomeRascunho] = useState('rascunho.md');
  const [erroRascunho, setErroRascunho] = useState('');
  const [selecaoExtracao, setSelecaoExtracao] = useState(null);
  const [nomeArquivoExtracao, setNomeArquivoExtracao] = useState('');
  const [cenaExtracaoId, setCenaExtracaoId] = useState('');
  const [extraindo, setExtraindo] = useState(false);
  const [erroExtracao, setErroExtracao] = useState('');
  const [criacao, setCriacao] = useState(null);
  const [tituloCriacao, setTituloCriacao] = useState('');
  const [erroCriacao, setErroCriacao] = useState('');
  const inputDocumentoRef = useRef(null);
  const inputRascunhoRef = useRef(null);
  const editorDocumentoRef = useRef(null);
  const editorRascunhoRef = useRef(null);
  const [selecionado, setSelecionado] = useState({ tipo: 'obra', id: '', titulo: '' });
  const [cenaSelecionadaId, setCenaSelecionadaId] = useState('');
  const [modoEscolhas, setModoEscolhas] = useState(false);
  const [modoNavegacaoEstrutural, setModoNavegacaoEstrutural] = useState(false);
  const [pedidoNovaEscolha, setPedidoNovaEscolha] = useState(0);
  const [composicaoOcupada, setComposicaoOcupada] = useState(false);
  const [composicaoMovimentadaId, setComposicaoMovimentadaId] = useState('');
  const [erroNavegador, setErroNavegador] = useState('');
  const [versaoCatalogo, setVersaoCatalogo] = useState(0);
  const [aba, setAba] = useState('editor');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mostrarArvore, setMostrarArvore] = useState(true);
  const [mostrarPropriedades, setMostrarPropriedades] = useState(false);
  const [armazenamento, setArmazenamento] = useState(null);
  const [carregandoArmazenamento, setCarregandoArmazenamento] = useState(true);
  const [erroArmazenamento, setErroArmazenamento] = useState('');
  const [arquivoParaUpload, setArquivoParaUpload] = useState(null);
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [operacaoArquivoId, setOperacaoArquivoId] = useState('');
  const [mensagemArquivos, setMensagemArquivos] = useState('');
  const [erroArquivos, setErroArquivos] = useState('');
  const armazenamentoRequisicao = useRef(0);
  const operacaoEstruturalRef = useRef(false);

  const chaveRascunho = `cigana:rascunho:${id}`;

  useEffect(() => {
    try {
      setRascunho(window.localStorage.getItem(chaveRascunho) || '');
      setErroRascunho('');
    } catch {
      setErroRascunho('O navegador não permitiu carregar o Rascunho local.');
    } finally {
      setRascunhoCarregado(true);
    }
  }, [chaveRascunho]);

  useEffect(() => {
    if (!rascunhoCarregado) return;
    try {
      window.localStorage.setItem(chaveRascunho, rascunho);
      setErroRascunho('');
    } catch {
      setErroRascunho('O Rascunho excede o espaço local disponível. Baixe uma cópia antes de sair desta página.');
    }
  }, [chaveRascunho, rascunho, rascunhoCarregado]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [respostaObra, respostaCapitulos] = await Promise.all([
        apiFetch(`/api/livros/${id}`), apiFetch(`/api/capitulos/livro/${id}`),
      ]);
      setObra(respostaObra.data);
      setErroDocumentos('');
      setDocumentos([]);
      const capitulos = await Promise.all((respostaCapitulos.data || []).map(async (capitulo) => {
        const respostaCenas = await apiFetch(`/api/cenas/capitulo/${capitulo.id}`);
        const cenas = await Promise.all((respostaCenas.data || []).map(async (cena) => {
          const [respostaConteudos, respostaEscolhas] = await Promise.all([
            apiFetch(`/api/cena-conteudos/cena/${cena.id}`), apiFetch(`/api/escolhas/cena/${cena.id}`),
          ]);
          const conteudos = (respostaConteudos.data || []).map((item, indice) => {
            const tipo = item.tipo_conteudo;
            const titulo = item.titulo || (tipo === 'TEXTO' ? `Texto ${indice + 1}` : tipo);
            return { id: item.conteudo_id, composicaoId: item.id, tipo, titulo, url: item.texto_url, arquivoId: item.arquivo_id, ativo: item.ativo, ordem_exibicao: item.ordem_exibicao };
          });
          const escolhas = (respostaEscolhas.data || []).map((escolha) => ({ id: escolha.id, tipo: 'ESCOLHA', titulo: escolha.texto, dados: escolha }));
          return { ...cena, children: [...conteudos.map((item) => ({ ...item, tipo: item.tipo })), ...escolhas] };
        }));
        return { ...capitulo, children: cenas };
      }));
      setArvore(capitulos);
    } catch (errorCarregamento) {
      setErro(errorCarregamento.message || 'Não foi possível carregar a obra.');
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const carregarArmazenamento = useCallback(async () => {
    const requisicao = ++armazenamentoRequisicao.current;
    setCarregandoArmazenamento(true);
    setErroArmazenamento('');
    setArmazenamento(null);
    try {
      const resposta = await obterResumoArmazenamento(id);
      if (requisicao === armazenamentoRequisicao.current) {
        setArmazenamento(resposta.data || null);
      }
    } catch (errorCarregamento) {
      if (requisicao === armazenamentoRequisicao.current) {
        setErroArmazenamento(errorCarregamento.data?.message || errorCarregamento.message || 'Não foi possível consultar o armazenamento.');
      }
    } finally {
      if (requisicao === armazenamentoRequisicao.current) setCarregandoArmazenamento(false);
    }
  }, [id]);

  useEffect(() => {
    carregarArmazenamento();
    const aoAtualizar = (event) => {
      if (event.detail?.livroId === id) carregarArmazenamento();
    };
    window.addEventListener('cigana:arquivos-midia-atualizados', aoAtualizar);
    let canal;
    if (typeof BroadcastChannel !== 'undefined') {
      canal = new BroadcastChannel('cigana-arquivos-midia');
      canal.onmessage = (event) => {
        if (event.data?.livroId === id) carregarArmazenamento();
      };
    }
    return () => {
      window.removeEventListener('cigana:arquivos-midia-atualizados', aoAtualizar);
      canal?.close();
    };
  }, [carregarArmazenamento, id]);

  async function enviarArquivo(event) {
    event.preventDefault();
    if (!arquivoParaUpload || enviandoArquivo) return;
    const formulario = event.currentTarget;
    setEnviandoArquivo(true);
    setErroArquivos('');
    setMensagemArquivos('');
    try {
      await enviarArquivoParaLivro(id, arquivoParaUpload);
      setArquivoParaUpload(null);
      formulario.reset();
      setMensagemArquivos('Arquivo enviado. Consumo confirmado pelo servidor.');
      await carregarArmazenamento();
    } catch (errorEnvio) {
      setErroArquivos(errorEnvio.data?.message || errorEnvio.message || 'Não foi possível enviar o arquivo.');
      await carregarArmazenamento();
    } finally {
      setEnviandoArquivo(false);
    }
  }

  async function substituirArquivo(event, arquivo) {
    const novo = event.target.files?.[0];
    event.target.value = '';
    if (!novo || operacaoArquivoId) return;
    setOperacaoArquivoId(arquivo.id);
    setErroArquivos('');
    setMensagemArquivos('');
    try {
      await substituirArquivoGerenciado(arquivo.id, id, novo);
      setMensagemArquivos('Arquivo substituído. Consumo confirmado pelo servidor.');
      await carregarArmazenamento();
    } catch (errorSubstituicao) {
      setErroArquivos(errorSubstituicao.data?.message || errorSubstituicao.message || 'Não foi possível substituir o arquivo.');
      await carregarArmazenamento();
    } finally {
      setOperacaoArquivoId('');
    }
  }

  async function desativarArquivo(arquivo) {
    if (operacaoArquivoId || !window.confirm(`Desativar “${arquivo.nome_original}”? O arquivo físico continuará contabilizado enquanto permanecer armazenado.`)) return;
    setOperacaoArquivoId(arquivo.id);
    setErroArquivos('');
    setMensagemArquivos('');
    try {
      await desativarArquivoGerenciado(arquivo.id, id);
      setMensagemArquivos('Arquivo desativado. Ele continua na cota enquanto o arquivo físico permanecer armazenado.');
      await carregarArmazenamento();
    } catch (errorDesativacao) {
      setErroArquivos(errorDesativacao.data?.message || errorDesativacao.message || 'Não foi possível desativar o arquivo.');
      await carregarArmazenamento();
    } finally {
      setOperacaoArquivoId('');
    }
  }

  const documentosSecundarios = documentos.filter((doc) => doc.ativo && doc.papel !== 'PRINCIPAL');
  const nomesTrechos = useMemo(() => {
    const entradas = arvore.flatMap((capitulo) => (capitulo.children || []).flatMap((cena) => (cena.children || [])
      .filter((item) => item.tipo === 'TEXTO')
      .map((item) => [item.id, item.titulo])));
    return Object.fromEntries(entradas);
  }, [arvore]);
  const nomesCapitulos = useMemo(() => Object.fromEntries(
    arvore.map((capitulo) => [capitulo.id, capitulo.titulo]),
  ), [arvore]);
  const cenaDestino = useMemo(() => (
    arvore.flatMap((capitulo) => capitulo.children || []).find((cena) => cena.id === cenaSelecionadaId) || null
  ), [arvore, cenaSelecionadaId]);
  const atualizarEscolhasNavegador = useCallback(async (cenaId) => {
    const resposta = await listarEscolhasPorCena(cenaId);
    if (!resposta.success) throw new Error(resposta.message || 'Não foi possível atualizar as escolhas no Navegador.');
    const escolhas = (resposta.data || []).map((escolha) => ({ id: escolha.id, tipo: 'ESCOLHA', titulo: escolha.texto, dados: escolha }));
    setArvore((atual) => atual.map((capitulo) => ({
      ...capitulo,
      children: (capitulo.children || []).map((cena) => cena.id === cenaId
        ? { ...cena, children: [...(cena.children || []).filter((item) => item.tipo !== 'ESCOLHA'), ...escolhas] }
        : cena),
    })));
  }, []);
  const cenasParaExtracao = useMemo(() => arvore.flatMap((capitulo) => (capitulo.children || []).map((cena) => ({
    ...cena,
    capituloTitulo: capitulo.titulo || capitulo.slug,
  }))), [arvore]);

  function selecionarDocumento(doc, textoId = '', capituloId = '') {
    setModoEscolhas(false);
    setDocumentoSelecionado(doc);
    setTrechoSelecionadoId(textoId);
    setCapituloSelecionadoId(capituloId);
    setAba('editor');
    setSelecionado({ tipo: 'DOCUMENTO', id: doc.arquivo_id, titulo: doc.nome_original, arquivoId: doc.arquivo_id });
    setMostrarArvore(false);
    setMostrarPropriedades(false);
  }

  async function selecionarTextoGerenciado(item, doc, cena) {
    try {
      const resposta = await consultarTrechoMarkdown(item.id);
      if (resposta.data?.cena_id !== cena.id) throw new Error('O trecho retornado não corresponde à cena selecionada.');
      selecionarDocumento(doc, item.id, cena.capitulo_id);
    } catch (error) {
      setErroDocumentos(error.data?.message || error.message || 'Não foi possível consultar este trecho.');
    }
  }

  async function atualizarDocumentos() {
    setErroDocumentos('');
    try {
      const resposta = await listarDocumentosMarkdown(id);
      const lista = (resposta.data || []).filter((doc) => doc.papel !== 'PRINCIPAL');
      setDocumentos(lista);
      const ativo = lista.find((doc) => doc.arquivo_id === documentoSelecionado?.arquivo_id) || lista[0] || null;
      setDocumentoSelecionado(ativo);
      setTrechoSelecionadoId('');
    } catch (error) {
      setErroDocumentos(error.data?.message || error.message || 'Não foi possível listar os documentos.');
    }
  }

  async function enviarDocumento(event) {
    event.preventDefault();
    const arquivo = inputDocumentoRef.current?.files?.[0];
    if (!arquivo || operandoDocumento) return;
    setOperandoDocumento(true); setErroDocumentos('');
    try {
      const resposta = await enviarDocumentoMarkdown(id, arquivo, 'SECUNDARIO');
      const novoId = resposta.data?.arquivo_id;
      const atualizados = await listarDocumentosMarkdown(id);
      const lista = atualizados.data || [];
      setDocumentos(lista);
      const novo = lista.find((doc) => doc.arquivo_id === novoId) || null;
      if (novo) selecionarDocumento(novo);
      if (inputDocumentoRef.current) inputDocumentoRef.current.value = '';
      setMensagemArquivos('Documento Markdown gerenciado enviado.');
      await carregarArmazenamento();
    } catch (error) {
      setErroDocumentos(error.data?.message || error.message || 'Não foi possível enviar o documento.');
    } finally { setOperandoDocumento(false); }
  }

  async function criarDocumentoVazio() {
    if (operandoDocumento) return;
    const nome = window.prompt('Nome do novo documento Markdown independente:', 'documento.md');
    if (!nome) return;
    setOperandoDocumento(true); setErroDocumentos('');
    try {
      const resposta = await criarDocumentoMarkdown(id, 'SECUNDARIO', nome);
      const atualizados = await listarDocumentosMarkdown(id);
      const lista = atualizados.data || [];
      setDocumentos(lista);
      const novo = lista.find((doc) => doc.arquivo_id === resposta.data?.arquivo_id);
      if (novo) selecionarDocumento(novo);
      await carregarArmazenamento();
    } catch (error) { setErroDocumentos(error.data?.message || error.message || 'Não foi possível criar o documento.'); }
    finally { setOperandoDocumento(false); }
  }

  async function desativarDocumento(doc) {
    if (!window.confirm(`Desativar o documento secundário “${doc.nome_original}”?`)) return;
    setOperandoDocumento(true); setErroDocumentos('');
    try {
      await desativarDocumentoMarkdown(id, doc.arquivo_id);
      await atualizarDocumentos();
    } catch (error) { setErroDocumentos(error.data?.message || error.message || 'Não foi possível desativar o documento.'); }
    finally { setOperandoDocumento(false); }
  }

  function atualizarRascunho(conteudo) {
    setRascunho(conteudo);
  }

  async function carregarRascunho(event) {
    const arquivo = event.target.files?.[0];
    event.target.value = '';
    if (!arquivo) return;
    try {
      const conteudo = await arquivo.text();
      setRascunho(conteudo);
      setModoEscolhas(false);
      setNomeRascunho(arquivo.name || 'rascunho.md');
      setErroRascunho('');
      setSelecionado({ tipo: 'RASCUNHO', id: 'rascunho', titulo: 'Rascunho' });
      setAba('editor');
      setMostrarArvore(false);
      setMostrarPropriedades(false);
    } catch {
      setErroRascunho('Não foi possível carregar esse arquivo Markdown.');
    }
  }

  function baixarRascunho() {
    const blob = new Blob([rascunho], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeRascunho.toLowerCase().endsWith('.md') || nomeRascunho.toLowerCase().endsWith('.markdown') ? nomeRascunho : `${nomeRascunho}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function descartarRascunho() {
    if (!window.confirm('Descartar o Rascunho local? Os documentos já extraídos permanecerão na obra.')) return;
    try { window.localStorage.removeItem(chaveRascunho); } catch { /* conteúdo local será limpo em memória */ }
    setRascunho('');
    setModoEscolhas(false);
    setNomeRascunho('rascunho.md');
    setErroRascunho('');
    setSelecaoExtracao(null);
    setSelecionado({ tipo: 'RASCUNHO', id: 'rascunho', titulo: 'Rascunho' });
    setAba('editor');
    setMostrarArvore(false);
    setMostrarPropriedades(false);
  }

  function iniciarExtracao() {
    setErroExtracao('');
    try {
      const selecao = editorRascunhoRef.current?.obterSelecao();
      if (!selecao) throw new Error('Selecione o texto que deseja extrair.');
      setSelecaoExtracao(selecao);
      setNomeArquivoExtracao('');
      setCenaExtracaoId(cenaSelecionadaId || cenasParaExtracao[0]?.id || '');
    } catch (error) {
      setErroExtracao(error.message || 'Não foi possível obter a seleção do Rascunho.');
    }
  }

  async function extrairSelecao(event) {
    event.preventDefault();
    if (!selecaoExtracao || extraindo) return;
    const cena = cenasParaExtracao.find((item) => item.id === cenaExtracaoId);
    if (!cena) { setErroExtracao('Selecione a cena de destino.'); return; }
    const nomeInformado = nomeArquivoExtracao.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-');
    if (!nomeInformado) { setErroExtracao('Informe o nome do novo documento.'); return; }
    if (!nomeInformado.replace(/\.(md|markdown)$/i, '').trim()) { setErroExtracao('Informe um nome antes da extensão Markdown.'); return; }
    if (new TextEncoder().encode(selecaoExtracao.conteudo).byteLength > 50 * 1024 * 1024 - 1024) {
      setErroExtracao('A seleção excede o limite de 50 MiB para arquivos.');
      return;
    }
    const nomeArquivo = /\.(md|markdown)$/i.test(nomeInformado) ? nomeInformado : `${nomeInformado}.md`;
    setExtraindo(true);
    setErroExtracao('');
    let arquivoId = '';
    let textoId = '';
    try {
      const arquivoInicial = new File(['\n'], nomeArquivo, { type: 'text/markdown' });
      const respostaArquivo = await enviarDocumentoMarkdown(id, arquivoInicial, 'SECUNDARIO');
      arquivoId = respostaArquivo.data?.arquivo_id;
      if (!arquivoId) throw new Error('O servidor não confirmou o arquivo Markdown.');

      const respostaTexto = await apiFetch('/api/cena-textos', {
        method: 'POST',
        body: JSON.stringify({ cena_id: cena.id, arquivo_id: arquivoId, titulo: nomeArquivo.replace(/\.(md|markdown)$/i, '') }),
      });
      textoId = respostaTexto.data?.id;
      if (!textoId) throw new Error('O servidor não confirmou o conteúdo textual da cena.');

      const documentoRemoto = await lerDocumentoMarkdown(arquivoId);
      const documentoExtraido = `<!-- cigana:capitulo id="${cena.capitulo_id.toLowerCase()}" -->\n<!-- cigana:trecho id="${textoId.toLowerCase()}" -->\n${selecaoExtracao.conteudo}\n<!-- /cigana:trecho -->\n<!-- /cigana:capitulo -->\n`;
      await salvarDocumentoMarkdown(id, arquivoId, documentoExtraido, documentoRemoto.hash);

      const ordem = cena.children.reduce((max, item) => Math.max(max, Number(item.ordem_exibicao) || 0), 0) + 1;
      await apiFetch('/api/cena-conteudos', {
        method: 'POST',
        body: JSON.stringify({ cena_id: cena.id, tipo_conteudo: 'TEXTO', conteudo_id: textoId, ordem_exibicao: ordem }),
      });

      const anotacao = `Documento extraído: ${nomeArquivo} — arquivo ${arquivoId}; cena ${cena.capituloTitulo} / ${cena.titulo || cena.slug} (${cena.id}).`;
      editorRascunhoRef.current?.anotar(anotacao);
      await carregar();
      setSelecaoExtracao(null);
      setMensagemArquivos(`“${nomeArquivo}” foi criado e associado à cena “${cena.titulo || cena.slug}”.`);
    } catch (error) {
      if (textoId) await apiFetch(`/api/cena-textos/${textoId}`, { method: 'DELETE' }).catch(() => {});
      if (arquivoId) await desativarDocumentoMarkdown(id, arquivoId).catch(() => {});
      setErroExtracao(error.data?.message || error.message || 'Não foi possível extrair o documento.');
      await carregarArmazenamento();
    } finally {
      setExtraindo(false);
    }
  }

  const slugificar = (valor) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `item-${Date.now()}`;

async function criarElemento(event) {
  event.preventDefault();

  if (!criacao || !tituloCriacao.trim()) return;

  setErroCriacao('');

  try {
    if (criacao.tipo === 'capitulo') {
      const ordem =
        arvore.reduce(
          (max, item) =>
            Math.max(max, Number(item.ordem_exibicao) || 0),
          0
        ) + 1;

      await apiFetch('/api/capitulos', {
        method: 'POST',
        body: JSON.stringify({
          livro_id: id,
          titulo: tituloCriacao.trim(),
          slug: slugificar(tituloCriacao),
          ordem_exibicao: ordem,
        }),
      });
    } else if (criacao.tipo === 'cena') {
      const capitulo = arvore.find(
        (item) => item.id === criacao.capituloId
      );

      if (!capitulo) {
        throw new Error('Selecione um capítulo válido.');
      }

      const ordem =
        (capitulo.children || []).reduce(
          (max, item) =>
            Math.max(max, Number(item.ordem_exibicao) || 0),
          0
        ) + 1;

      await apiFetch('/api/cenas', {
        method: 'POST',
        body: JSON.stringify({
          capitulo_id: capitulo.id,
          titulo: tituloCriacao.trim(),
          slug: slugificar(tituloCriacao),
          texto: 'Conteúdo organizado no documento Markdown.',
          ordem_exibicao: ordem,
          cena_inicial: !capitulo.children?.length,
        }),
      });
    }

    setTituloCriacao('');
    setCriacao(null);

    await carregar();
  } catch (error) {
    setErroCriacao(
      error.data?.message ||
      error.message ||
      'Não foi possível criar o elemento editorial.'
    );
  }
}
  const itemSelecionado = useMemo(() => {
    if (!selecionado) return { tipo: 'obra', titulo: obra?.titulo || 'Obra' };
    if (selecionado.tipo === 'obra') return { ...selecionado, titulo: obra?.titulo || 'Obra' };
    return selecionado;
  }, [selecionado, obra]);

  const capituloSelecionado = useMemo(() => (
    arvore.find((capitulo) => capitulo.id === selecionado?.id) || null
  ), [arvore, selecionado]);

  function atualizarCapitulo(atualizado) {
    setArvore((atuais) => atuais.map((capitulo) => capitulo.id === atualizado.id ? { ...capitulo, ...atualizado } : capitulo));
    setSelecionado((atual) => atual?.id === atualizado.id ? { ...atual, ...atualizado, tipo: 'capitulo' } : atual);
  }

  function abrir(item, tipo, url, extra = {}) {
    setAba('editor');
    setModoNavegacaoEstrutural(false);
    if (tipo === 'cena') setCenaSelecionadaId(item.id);
    else {
      setCenaSelecionadaId('');
      setModoEscolhas(false);
    }
    setSelecionado({ ...item, tipo, url, ...extra });
    setMostrarArvore(false);
    setMostrarPropriedades(false);
  }

  function selecionarConteudoEditor(item) {
    setAba('editor');
    setModoEscolhas(false);
    setModoNavegacaoEstrutural(false);
    setSelecionado({ ...item, tipo: 'CONTEUDO' });
    setMostrarArvore(false);
    setMostrarPropriedades(false);
  }

  function abrirEscolhasDaCena() {
    if (!cenaDestino) {
      setErroNavegador('Selecione uma cena no Navegador antes de adicionar uma escolha.');
      return;
    }
    setModoNavegacaoEstrutural(false);
    setModoEscolhas(true);
    setSelecionado({ tipo: 'ESCOLHAS', id: cenaDestino.id, cenaId: cenaDestino.id, titulo: 'Escolhas' });
    setPedidoNovaEscolha((atual) => atual + 1);
    setAba('editor');
    setMostrarArvore(false);
    setMostrarPropriedades(false);
  }

  function abrirNavegacaoEstruturalDaCena() {
    if (!cenaDestino) {
      setErroNavegador('Selecione uma cena no Navegador para configurar a navegação estrutural.');
      return;
    }
    setModoEscolhas(false);
    setModoNavegacaoEstrutural(true);
    setSelecionado({ tipo: 'NAVEGACAO_ESTRUTURAL', id: cenaDestino.id, cenaId: cenaDestino.id, titulo: 'Navegação estrutural' });
    setAba('editor');
    setMostrarArvore(false);
    setMostrarPropriedades(false);
  }

  async function reordenarConteudo(cena, item, direcao) {
    if (composicaoOcupada) return;
    const conteudos = (cena.children || []).filter((filho) => filho.tipo !== 'ESCOLHA');
    const atual = conteudos.findIndex((filho) => filho.composicaoId === item.composicaoId);
    const destino = atual + direcao;
    if (atual < 0 || destino < 0 || destino >= conteudos.length) return;
    const novaOrdem = [...conteudos];
    [novaOrdem[atual], novaOrdem[destino]] = [novaOrdem[destino], novaOrdem[atual]];
    setComposicaoOcupada(true);
    setCenaSelecionadaId(cena.id);
    setErroNavegador('');
    try {
      await apiFetch('/api/cena-conteudos/reordenar', {
        method: 'PATCH',
        body: JSON.stringify({
          cena_id: cena.id,
          ordem: novaOrdem.map((conteudo) => ({ id: conteudo.composicaoId })),
        }),
      });
      setComposicaoMovimentadaId(item.composicaoId);
      window.setTimeout(() => setComposicaoMovimentadaId(''), 2000);
      await carregar();
    } catch (error) {
      setErroNavegador(error.data?.message || error.message || 'Não foi possível reordenar os conteúdos.');
    } finally {
      setComposicaoOcupada(false);
    }
  }

  async function retirarConteudo(cena, item) {
    const perguntaRetirada = item.tipo === 'TEXTO' && item.arquivoId
      ? `Retirar “${item.titulo}” da cena “${cena.titulo}”? O arquivo permanecerá no Storage e não poderá ser reutilizado.`
      : `Retirar “${item.titulo}” da cena “${cena.titulo}”? O conteúdo e o arquivo permanecerão na obra.`;
    if (composicaoOcupada || !window.confirm(perguntaRetirada)) return;
    setComposicaoOcupada(true);
    setCenaSelecionadaId(cena.id);
    setErroNavegador('');
    try {
      if (item.tipo === 'TEXTO' && item.arquivoId) {
        await apiFetch(`/api/cena-textos/${item.id}`, { method: 'DELETE' });
      } else {
        await apiFetch(`/api/cena-conteudos/${item.composicaoId}`, { method: 'DELETE' });
      }
      setVersaoCatalogo((versao) => versao + 1);
      if (selecionado?.tipo === 'CONTEUDO' && selecionado.id === item.id && selecionado.tipo_conteudo === item.tipo) {
        setSelecionado({ ...cena, tipo: 'cena' });
      }
      await carregar();
    } catch (error) {
      setErroNavegador(error.data?.message || error.message || 'Não foi possível retirar o conteúdo.');
    } finally {
      setComposicaoOcupada(false);
    }
  }

  async function aposIncluirConteudo() {
    setCenaSelecionadaId(cenaDestino?.id || '');
    if (cenaDestino) setSelecionado({ ...cenaDestino, tipo: 'cena' });
    await carregar();
    setSelecionado((atual) => (cenaDestino ? { ...cenaDestino, tipo: 'cena' } : atual));
  }

  function rotaEditor() {
    if (!selecionado || selecionado.tipo === 'obra') return `/estudio/obras/${id}`;
    if (selecionado.tipo === 'capitulo') return `/estudio/obras/${id}/capitulos/${selecionado.id}`;
    if (selecionado.tipo === 'cena') return `/estudio/obras/${id}/capitulos/${selecionado.capituloId}/cenas/${selecionado.id}`;
    if (selecionado.tipo === 'ESCOLHA') return `/estudio/obras/${id}/capitulos/${selecionado.capituloId}/cenas/${selecionado.cenaId}/escolhas`;
    const pagina = { TEXTO: 'textos', IMAGEM: 'imagens', AUDIO: 'audios', VIDEO: 'videos' }[selecionado.tipo];
    if (pagina) return `/estudio/obras/${id}/capitulos/${selecionado.capituloId}/cenas/${selecionado.cenaId}/${pagina}`;
    return `/estudio/obras/${id}`;
  }

  function renderConteudo(item, capitulo, cena) {
    const selecionadoMesmo = (selecionado?.id === item.id && (selecionado?.tipo === item.tipo || (selecionado?.tipo === 'CONTEUDO' && selecionado.tipo_conteudo === item.tipo))) || (item.tipo === 'TEXTO' && trechoSelecionadoId === item.id);
    const documentoDoTexto = item.tipo === 'TEXTO' && item.arquivoId ? (documentos.find((doc) => doc.arquivo_id === item.arquivoId) || { arquivo_id: item.arquivoId }) : null;
    const indiceNaCena = (cena.children || []).filter((filho) => filho.tipo !== 'ESCOLHA').findIndex((filho) => filho.composicaoId === item.composicaoId);
    return (
      <div key={`${item.tipo}-${item.id}`} className={`ml-5 rounded ${composicaoMovimentadaId === item.composicaoId ? 'bg-emerald-900/70 text-emerald-100 ring-1 ring-emerald-400' : ''}`}>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => {
            setCenaSelecionadaId(cena.id);
            if (item.tipo === 'ESCOLHA') {
              setModoNavegacaoEstrutural(false);
              setModoEscolhas(true);
              setSelecionado({ ...item, tipo: 'ESCOLHAS', cenaId: cena.id, titulo: 'Escolhas' });
              setAba('editor'); setMostrarArvore(false); setMostrarPropriedades(false);
              return;
            }
            setModoEscolhas(false);
            if (item.tipo === 'TEXTO' && item.arquivoId) {
              setSelecionado({ ...item, tipo: 'TEXTO', arquivoId: item.arquivoId, capituloId: capitulo.id, cenaId: cena.id });
              setAba('editor'); setMostrarArvore(false); setMostrarPropriedades(false);
            } else if (item.tipo !== 'TEXTO' || (!item.arquivoId && !item.url)) {
              setSelecionado({ ...item, tipo: 'CONTEUDO', tipo_conteudo: item.tipo, capituloId: capitulo.id, cenaId: cena.id });
              setAba('editor'); setMostrarArvore(false); setMostrarPropriedades(false);
            } else abrir(item, item.tipo, item.url || null, { capituloId: capitulo.id, cenaId: cena.id });
          }} className={`flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-slate-800 ${selecionadoMesmo ? 'bg-indigo-950 text-indigo-200' : 'text-slate-300'}`}>
            <span>{icones[item.tipo] || '•'}</span><span className="truncate">{item.titulo}</span>{documentoDoTexto && <span className="ml-auto shrink-0 text-[10px] text-emerald-400">MD</span>}
          </button>
          {item.tipo !== 'ESCOLHA' && <>
            <button type="button" aria-label={`Mover ${item.titulo} para cima`} title="Mover para cima" disabled={composicaoOcupada || indiceNaCena <= 0} onClick={() => reordenarConteudo(cena, item, -1)} className="rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30">↑</button>
            <button type="button" aria-label={`Mover ${item.titulo} para baixo`} title="Mover para baixo" disabled={composicaoOcupada || indiceNaCena >= cena.children.filter((filho) => filho.tipo !== 'ESCOLHA').length - 1} onClick={() => reordenarConteudo(cena, item, 1)} className="rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30">↓</button>
            <button type="button" aria-label={`${item.tipo === 'TEXTO' && item.arquivoId ? 'Excluir' : 'Retirar'} ${item.titulo} ${item.tipo === 'TEXTO' && item.arquivoId ? 'do documento' : 'da cena'}`} title={item.tipo === 'TEXTO' && item.arquivoId ? 'Excluir trecho e marcador' : 'Retirar da cena'} disabled={composicaoOcupada} onClick={() => retirarConteudo(cena, item, documentoDoTexto)} className="rounded px-1.5 py-1 text-xs text-rose-300 hover:bg-rose-950 disabled:opacity-40">×</button>
          </>}
        </div>
      </div>
    );
  }

  if (carregando) return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">Carregando a IDE…</main>;
  if (erro) return <main className="min-h-screen bg-slate-950 p-8 text-rose-200"><p>{erro}</p><button onClick={carregar} className="mt-4 rounded border px-3 py-2">Tentar novamente</button></main>;

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-3 py-2 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/estudio" className="text-sm text-slate-400 hover:text-white">← Estúdio</Link>
          <span className="hidden text-slate-700 sm:inline">/</span>
          <strong className="truncate text-sm">{obra?.titulo || 'IDE Editor'}</strong>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setMostrarArvore(true); setMostrarPropriedades(false); }} className="rounded border border-slate-700 px-2.5 py-1.5 text-xs lg:hidden">Árvore</button>
          <button type="button" onClick={() => { setMostrarArvore(false); setMostrarPropriedades(false); }} className="rounded border border-slate-700 px-2.5 py-1.5 text-xs lg:hidden">Editor</button>
          <button type="button" onClick={() => { setMostrarArvore(false); setMostrarPropriedades(true); }} className="rounded border border-slate-700 px-2.5 py-1.5 text-xs xl:hidden">Propriedades</button>
          <Link href={`/estudio/obras/${id}`} className="rounded border border-slate-700 px-2.5 py-1.5 text-xs hover:bg-slate-800">Gestão da obra</Link>
          <button type="button" onClick={carregar} className="rounded border border-slate-700 px-2.5 py-1.5 text-xs hover:bg-slate-800">Atualizar árvore</button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_260px]">
        <aside className={`${mostrarArvore && !mostrarPropriedades ? 'block' : 'hidden'} min-h-0 overflow-y-auto border-r border-slate-800 bg-slate-900 lg:block`}>
          <div className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Navegação da obra</div>
          {erroNavegador && <p role="alert" className="mx-3 mt-3 rounded border border-rose-900 bg-rose-950/40 p-2 text-xs text-rose-200">{erroNavegador}</p>}
          <button type="button" onClick={() => abrir({ id, titulo: obra?.titulo }, 'obra')} className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-800 ${selecionado?.tipo === 'obra' ? 'bg-indigo-950 text-indigo-200' : ''}`}><span>{icones.obra}</span><span className="truncate">{obra?.titulo}</span></button>
          {false && <section className="border-y border-slate-800 bg-slate-950/60 p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">Rascunho local</h2>
          <button type="button" onClick={() => { setModoEscolhas(false); setCenaSelecionadaId(''); setSelecionado({ tipo: 'RASCUNHO', id: 'rascunho', titulo: 'Rascunho' }); setAba('editor'); setMostrarArvore(false); setMostrarPropriedades(false); }} className={`mb-2 w-full rounded px-2 py-2 text-left text-xs ${selecionado?.tipo === 'RASCUNHO' ? 'bg-indigo-950 text-indigo-100' : 'text-slate-300 hover:bg-slate-800'}`}>✎ Editar Rascunho</button>
            <input ref={inputRascunhoRef} type="file" accept=".md,.markdown,text/markdown,text/plain" onChange={carregarRascunho} className="hidden" />
            <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => inputRascunhoRef.current?.click()} disabled={extraindo} className="rounded border border-slate-700 px-2 py-1.5 text-[10px] text-slate-200 disabled:opacity-50">Carregar arquivo</button>
              <button type="button" onClick={baixarRascunho} disabled={!rascunhoCarregado || extraindo} className="rounded border border-slate-700 px-2 py-1.5 text-[10px] text-slate-200 disabled:opacity-50">Baixar Rascunho</button>
              <button type="button" onClick={descartarRascunho} disabled={extraindo} className="col-span-2 rounded border border-rose-900 px-2 py-1.5 text-[10px] text-rose-200 disabled:opacity-50">Descartar Rascunho</button>
            </div>
            {erroRascunho && <p role="alert" className="mt-2 text-[10px] text-amber-200">{erroRascunho}</p>}
            {erroExtracao && <p role="alert" className="mt-2 text-[10px] text-rose-300">{erroExtracao}</p>}
            <button type="button" onClick={iniciarExtracao} disabled={!rascunhoCarregado || extraindo} className="mt-2 w-full rounded bg-indigo-600 px-2 py-2 text-[11px] font-medium text-white disabled:opacity-50">Extrair seleção para uma cena</button>
            {selecaoExtracao && <form onSubmit={extrairSelecao} className="mt-3 space-y-2 rounded border border-indigo-800 bg-indigo-950/40 p-2">
              <label className="block text-[10px] text-slate-300">Nome do documento
                <input autoFocus value={nomeArquivoExtracao} onChange={(event) => setNomeArquivoExtracao(event.target.value)} placeholder="pagina_02.md" className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white" />
              </label>
              <label className="block text-[10px] text-slate-300">Cena de destino
                <select value={cenaExtracaoId} onChange={(event) => setCenaExtracaoId(event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white">
                  <option value="">Selecione uma cena</option>
                  {cenasParaExtracao.map((cena) => <option key={cena.id} value={cena.id}>{cena.capituloTitulo} / {cena.titulo || cena.slug}</option>)}
                </select>
              </label>
              <p className="max-h-20 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-2 text-[10px] text-slate-400">{selecaoExtracao.conteudo}</p>
              <div className="flex gap-2"><button type="submit" disabled={extraindo} className="flex-1 rounded bg-indigo-600 px-2 py-1.5 text-[10px] disabled:opacity-50">{extraindo ? 'Criando…' : 'Criar documento'}</button><button type="button" disabled={extraindo} onClick={() => { setSelecaoExtracao(null); setErroExtracao(''); }} className="rounded border border-slate-700 px-2 py-1.5 text-[10px]">Cancelar</button></div>
            </form>}
            <p className="mt-2 text-[10px] leading-4 text-slate-500">O Rascunho fica neste navegador e não é enviado à plataforma. Documentos extraídos são cópias independentes.</p>
          </section>}
          {false && <section className="border-y border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-2"><h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Documentos independentes</h2><button type="button" onClick={atualizarDocumentos} disabled={operandoDocumento} className="text-[11px] text-indigo-300 disabled:opacity-50">Atualizar</button></div>
            {erroDocumentos && <p role="alert" className="mb-2 rounded border border-rose-900 bg-rose-950/50 p-2 text-xs text-rose-200">{erroDocumentos}</p>}
            {documentosSecundarios.length === 0 && <p className="mb-2 text-xs text-slate-500">Nenhum documento independente.</p>}
            {documentosSecundarios.map((doc) => (
              <details key={doc.arquivo_id} open={doc.arquivo_id === documentoSelecionado?.arquivo_id} className="mb-1 rounded border border-slate-800">
                <summary onClick={(event) => { event.preventDefault(); selecionarDocumento(doc); }} className={`flex cursor-pointer list-none items-center gap-2 px-2 py-2 text-xs ${doc.arquivo_id === documentoSelecionado?.arquivo_id ? 'bg-indigo-950 text-indigo-100' : 'text-slate-300 hover:bg-slate-800'}`}><span>▤</span><span className="min-w-0 flex-1 truncate">{doc.nome_original}</span></summary>
                <div className="border-t border-slate-800 py-1">
                  {(arvore || []).map((capitulo) => <details key={`${doc.arquivo_id}-${capitulo.id}`} className="px-1" open={doc.arquivo_id === documentoSelecionado?.arquivo_id}>
                    <summary onClick={(event) => { event.preventDefault(); selecionarDocumento(doc, '', capitulo.id); }} className="cursor-pointer list-none rounded px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800"><span className="mr-1">{icones.capitulo}</span>{capitulo.titulo || capitulo.slug}</summary>
                    {(capitulo.children || []).map((cena) => <details key={`${doc.arquivo_id}-${cena.id}`} className="ml-3" open={doc.arquivo_id === documentoSelecionado?.arquivo_id}>
                      <summary onClick={(event) => { event.preventDefault(); const primeiroTexto = cena.children?.find((item) => item.tipo === 'TEXTO' && item.arquivoId === doc.arquivo_id); selecionarDocumento(doc, primeiroTexto?.id || '', capitulo.id); }} className="cursor-pointer list-none rounded px-2 py-1.5 text-[11px] text-slate-400 hover:bg-slate-800"><span className="mr-1">{icones.cena}</span>{cena.titulo || cena.slug}</summary>
                      {cena.children?.filter((item) => item.tipo === 'TEXTO' && item.arquivoId === doc.arquivo_id).map((item) => renderConteudo(item, capitulo, cena))}
                    </details>)}
                    <button type="button" onClick={() => { selecionarDocumento(doc); setCriacao({ tipo: 'cena', capituloId: capitulo.id }); setTituloCriacao(''); setErroCriacao(''); }} className="ml-3 rounded px-2 py-1 text-left text-[10px] text-indigo-300 hover:bg-slate-800">+ Cena neste capítulo</button>
                  </details>)}
                  <button type="button" onClick={() => { setCriacao({ tipo: 'capitulo' }); setTituloCriacao(''); setErroCriacao(''); selecionarDocumento(doc); }} className="w-full px-3 py-1.5 text-left text-[10px] text-indigo-300 hover:bg-slate-800">+ Criar capítulo</button>
                  <div className="flex justify-end gap-1 px-2 pb-2"><button type="button" disabled={operandoDocumento} onClick={() => desativarDocumento(doc)} className="rounded border border-rose-900 px-2 py-1 text-[10px] text-rose-200 disabled:opacity-50">Desativar documento</button></div>
                </div>
              </details>
            ))}
            <input ref={inputDocumentoRef} type="file" accept=".md,.markdown,text/markdown,text/plain" className="mt-2 block w-full text-[10px] text-slate-400 file:mr-2 file:rounded file:border-0 file:bg-slate-800 file:px-2 file:py-1.5 file:text-slate-200" />
            <div className="mt-2 grid grid-cols-2 gap-2"><button type="button" disabled={operandoDocumento} onClick={(event) => enviarDocumento(event)} className="rounded border border-slate-700 px-2 py-1.5 text-[10px] text-slate-200 disabled:opacity-50">{operandoDocumento ? 'Enviando…' : 'Enviar documento'}</button><button type="button" disabled={operandoDocumento} onClick={criarDocumentoVazio} className="rounded border border-slate-700 px-2 py-1.5 text-[10px] text-slate-300 disabled:opacity-50">Criar vazio</button></div>
            <p className="mt-2 text-[10px] text-slate-500">O Rascunho não aparece neste gerenciamento e não é armazenado pela plataforma.</p>
          </section>}
          {criacao && <form onSubmit={criarElemento} className="space-y-2 border-b border-slate-800 bg-indigo-950/30 p-3"><label className="block text-[11px] text-slate-300">{criacao.tipo === 'capitulo' ? 'Título do capítulo' : criacao.tipo === 'cena' ? 'Título da cena' : 'Identificação do texto'}<input autoFocus value={tituloCriacao} onChange={(event) => setTituloCriacao(event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white" /></label>{criacao.tipo === 'capitulo' && <p className="text-[10px] text-slate-400">Será criado no documento selecionado: {documentoSelecionado?.nome_original || 'nenhum documento'}</p>}{erroCriacao && <p role="alert" className="text-[11px] text-rose-300">{erroCriacao}</p>}<div className="flex gap-2"><button type="submit" className="rounded bg-indigo-600 px-2 py-1.5 text-[11px]">Criar</button><button type="button" onClick={() => setCriacao(null)} className="rounded border border-slate-700 px-2 py-1.5 text-[11px]">Cancelar</button></div></form>}

<div className="space-y-1 px-2 pb-6">
  <div className="flex items-center justify-between gap-2 px-2 pt-3">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      Estrutura narrativa
    </p>

    <button
      type="button"
      onClick={() => {
        setCriacao({ tipo: 'capitulo' });
        setTituloCriacao('');
        setErroCriacao('');
      }}
      className="rounded border border-indigo-700 px-2 py-1 text-[10px] text-indigo-300 hover:bg-indigo-950"
    >
      + Capítulo
    </button>
  </div>

  {arvore.map((capitulo) => (
    <details key={capitulo.id} open>
      <summary
        className="cursor-pointer list-none rounded px-2 py-2 text-sm hover:bg-slate-800"
        onClick={(event) => {
          event.preventDefault();
          abrir(capitulo, 'capitulo', null);
        }}
      >
        <span className="mr-2">{icones.capitulo}</span>
        {capitulo.titulo || capitulo.slug}
      </summary>

      <div className="ml-3">
        {(capitulo.children || []).map((cena) => (
          <details key={cena.id} open>
            <summary
              className="cursor-pointer list-none rounded px-2 py-2 text-xs text-slate-300 hover:bg-slate-800"
              onClick={(event) => {
                event.preventDefault();
                abrir(cena, 'cena', null, {
                  capituloId: capitulo.id,
                });
              }}
            >
              <span className="mr-2">{icones.cena}</span>
              {cena.titulo || cena.slug}
            </summary>

            {cena.children
              ?.map((item) =>
                renderConteudo(
                  {
                    ...item,
                    capituloId: capitulo.id,
                    cenaId: cena.id,
                  },
                  capitulo,
                  cena
                )
              )}
          </details>
        ))}

        <button
          type="button"
          onClick={() => {
            setCriacao({
              tipo: 'cena',
              capituloId: capitulo.id,
            });
            setTituloCriacao('');
            setErroCriacao('');
          }}
          className="ml-2 mt-1 rounded px-2 py-1 text-left text-[10px] text-indigo-300 hover:bg-slate-800"
        >
          + Cena
        </button>
      </div>
    </details>
  ))}

  {arvore.length === 0 && (
    <p className="px-3 py-4 text-xs text-slate-500">
      Nenhum capítulo cadastrado.
    </p>
  )}
</div>
        </aside>

        <section className={`${!mostrarArvore && !mostrarPropriedades ? 'block' : 'hidden'} min-h-0 min-w-0 bg-slate-950 lg:block`}>
          <div className="flex h-11 items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/70 px-4">
            <div className="flex h-full items-center gap-1">
              <button type="button" onClick={() => setAba('editor')} className={`h-full border-b-2 px-3 text-xs ${aba === 'editor' ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400'}`}>Editor</button>
              <button type="button" onClick={() => setAba('preview')} className={`h-full border-b-2 px-3 text-xs ${aba === 'preview' ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400'}`}>Pré-visualização</button>
              <button type="button" onClick={() => { setAba('arquivos'); carregarArmazenamento(); }} className={`h-full border-b-2 px-3 text-xs ${aba === 'arquivos' ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400'}`}>Arquivos</button>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="max-w-[45vw] truncate text-xs text-slate-500">{aba === 'preview' ? 'Leitura da obra' : aba === 'arquivos' ? 'Armazenamento da obra' : itemSelecionado.titulo}</span>
              {aba === 'editor' && cenaDestino && <button type="button" onClick={abrirNavegacaoEstruturalDaCena} className={`shrink-0 rounded border px-2 py-1.5 text-[10px] hover:bg-slate-800 ${modoNavegacaoEstrutural ? 'border-indigo-500 text-indigo-200' : 'border-slate-700 text-slate-300'}`}>Navegação</button>}
            </div>
          </div>
          <div className="h-[calc(100%-2.75rem)] min-h-[500px]">
            {aba === 'arquivos' ? (
              <div className="h-full overflow-y-auto p-4 sm:p-6">
                <div className="mx-auto max-w-5xl space-y-5">
                  <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold">Armazenamento</h2>
                        <p className="mt-1 text-xs text-slate-400">Consumo baseado nos registros de arquivos gerenciados desta obra. Arquivos legados em media/ não entram na conta.</p>
                      </div>
                      <button type="button" onClick={carregarArmazenamento} disabled={carregandoArmazenamento} className="rounded border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800 disabled:opacity-50">{carregandoArmazenamento ? 'Atualizando…' : 'Atualizar'}</button>
                    </div>
                    {carregandoArmazenamento ? <p className="mt-5 text-sm text-slate-400">Consultando armazenamento no servidor…</p> : erroArmazenamento ? (
                      <div className="mt-5 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200" role="alert">
                        <p>{erroArmazenamento}</p>
                        <button type="button" onClick={carregarArmazenamento} className="mt-2 underline">Tentar novamente</button>
                      </div>
                    ) : armazenamento && (() => {
                      const percentual = Number(armazenamento.percentual_utilizado) || 0;
                      const cor = percentual >= 100 ? 'bg-rose-500' : percentual >= 90 ? 'bg-amber-400' : 'bg-emerald-500';
                      const usado = BigInt(armazenamento.consumo_utilizado_bytes);
                      const disponivel = BigInt(armazenamento.espaco_disponivel_bytes);
                      return <>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-lg bg-slate-950 p-3"><p className="text-xs text-slate-400">Utilizado</p><p className="mt-1 font-semibold">{tamanhoLegivel(armazenamento.consumo_utilizado_bytes)}</p></div>
                          <div className="rounded-lg bg-slate-950 p-3"><p className="text-xs text-slate-400">Cota total</p><p className="mt-1 font-semibold">{tamanhoLegivel(armazenamento.cota_total_bytes)}</p></div>
                          <div className="rounded-lg bg-slate-950 p-3"><p className="text-xs text-slate-400">{disponivel < 0n ? 'Acima da cota' : 'Disponível'}</p><p className="mt-1 font-semibold">{tamanhoLegivel(disponivel < 0n ? (-disponivel).toString() : armazenamento.espaco_disponivel_bytes)}</p></div>
                        </div>
                        <div className="mt-4" aria-label={`${percentual.toFixed(2)} por cento da cota utilizada`}>
                          <div className="mb-1 flex justify-between text-xs text-slate-300"><span>Uso da cota</span><span>{percentual.toFixed(2)}%</span></div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800"><div className={`h-full ${cor} transition-[width]`} style={{ width: `${Math.max(0, Math.min(percentual, 100))}%` }} /></div>
                          {percentual >= 90 && <p className={`mt-2 text-xs ${percentual >= 100 ? 'text-rose-300' : 'text-amber-200'}`}>{percentual >= 100 ? 'A cota foi atingida. Novos uploads serão recusados.' : 'A obra está próxima do limite de armazenamento.'}</p>}
                        </div>
                        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {armazenamento.consumo_por_tipo.map((grupo) => <div key={grupo.tipo_conteudo} className="rounded border border-slate-800 px-3 py-2 text-xs"><div className="flex justify-between gap-2"><span className="text-slate-300">{nomesTipo[grupo.tipo_conteudo] || grupo.tipo_conteudo}</span><span className="text-slate-400">{grupo.quantidade_arquivos} arquivo(s)</span></div><p className="mt-1 text-slate-500">{tamanhoLegivel(grupo.tamanho_total_bytes)}</p></div>)}
                        </div>
                        <p className="mt-3 text-xs text-slate-500">{armazenamento.quantidade_arquivos} arquivo(s) registrados. Arquivos desativados continuam contabilizados enquanto permanecerem registrados no armazenamento.</p>
                      </>;
                    })()}
                  </section>

                  <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><h2 className="text-lg font-semibold">Arquivos da obra</h2><p className="mt-1 text-xs text-slate-400">Limite individual de 50 MiB por arquivo. A API confirma cada alteração antes de atualizar os indicadores.</p></div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">{armazenamento?.quantidade_arquivos ?? '—'} arquivo(s)</span>
                    </div>
                    {erroArquivos && <p role="alert" className="mt-4 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{erroArquivos}</p>}
                    {mensagemArquivos && <p role="status" className="mt-4 rounded border border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-200">{mensagemArquivos}</p>}
                    <form onSubmit={enviarArquivo} className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-800 p-3 sm:flex-row sm:items-end">
                      <label className="grid min-w-0 flex-1 gap-1 text-xs text-slate-300">Enviar arquivo
                        <input type="file" onChange={(event) => { setArquivoParaUpload(event.target.files?.[0] || null); setErroArquivos(''); }} disabled={enviandoArquivo} className="block w-full text-xs file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-slate-100" />
                      </label>
                      <button type="submit" disabled={!arquivoParaUpload || enviandoArquivo || carregandoArmazenamento} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50">{enviandoArquivo ? 'Enviando…' : 'Enviar'}</button>
                    </form>
                    {carregandoArmazenamento ? <p className="mt-5 text-sm text-slate-400">Carregando lista confirmada…</p> : erroArmazenamento ? <p className="mt-5 text-sm text-slate-400">A listagem está indisponível até uma consulta bem-sucedida.</p> : !armazenamento?.arquivos?.length ? <p className="mt-5 rounded border border-dashed border-slate-700 p-5 text-sm text-slate-400">Nenhum arquivo registrado para esta obra.</p> : (
                      <ul className="mt-4 divide-y divide-slate-800">
                        {armazenamento.arquivos.map((arquivo) => (
                          <li key={arquivo.id} className="py-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <p className="break-all font-medium">{arquivo.nome_original}</p>
                                <p className="mt-1 text-xs text-slate-400">{nomesTipo[arquivo.tipo_conteudo] || arquivo.tipo_conteudo} · {arquivo.mime_type} · {tamanhoLegivel(arquivo.tamanho_bytes)} · {arquivo.ativo ? 'Ativo' : 'Inativo, ainda contabilizado'}</p>
                                {arquivo.associacoes?.length ? <ul className="mt-2 space-y-1 text-xs text-slate-300">{arquivo.associacoes.map((associacao) => <li key={`${arquivo.id}-${associacao.conteudo_id}`}>{associacao.capitulo_titulo} / {associacao.cena_titulo} — {associacao.titulo}</li>)}</ul> : <p className="mt-2 text-xs text-slate-500">Sem associação ativa a conteúdo de cena{arquivo.tipo_identificado_por === 'MIME' ? ' (tipo identificado pelo arquivo)' : ''}.</p>}
                              </div>
                              {arquivo.ativo && <div className="flex flex-wrap items-center gap-2">
                                <label className="cursor-pointer rounded border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800">{operacaoArquivoId === arquivo.id ? 'Salvando…' : 'Substituir'}<input type="file" className="sr-only" disabled={Boolean(operacaoArquivoId)} onChange={(event) => substituirArquivo(event, arquivo)} /></label>
                                <button type="button" disabled={Boolean(operacaoArquivoId)} onClick={() => desativarArquivo(arquivo)} className="rounded border border-rose-900 px-3 py-2 text-xs text-rose-200 hover:bg-rose-950 disabled:opacity-50">Desativar</button>
                              </div>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </div>
            ) : aba === 'preview' ? (
              <iframe title="Pré-visualização da obra" src={`/estudio/obras/${id}/visualizar`} className="h-full w-full border-0 bg-white" />
            ) : modoNavegacaoEstrutural ? (
              <EditorNavegacaoEstrutural
                key={`navegacao-estrutural-${cenaDestino?.id || ''}`}
                cena={cenaDestino}
                capitulos={arvore}
              />
            ) : modoEscolhas ? (
              <EditorEscolhasObra
                key={`escolhas-${cenaDestino?.id || ''}`}
                cena={cenaDestino}
                capitulos={arvore}
                iniciarCriacao={pedidoNovaEscolha}
                onAtualizarNavegador={atualizarEscolhasNavegador}
              />
            ) : selecionado?.tipo === 'RASCUNHO' ? (
              rascunhoCarregado ? <EditorMarkdown ref={editorRascunhoRef} rascunho value={rascunho} onChange={atualizarRascunho} disabled={extraindo} /> : <div className="p-6 text-sm text-slate-400">Carregando o Rascunho local…</div>
            ) : selecionado?.tipo === 'DOCUMENTO' && documentoSelecionado ? (
              <EditorMarkdown
                ref={editorDocumentoRef}
                key={documentoSelecionado.arquivo_id}
                livroId={id}
                documento={documentoSelecionado}
                trechoSelecionadoId={trechoSelecionadoId}
                capituloSelecionadoId={capituloSelecionadoId}
                nomesTrechos={nomesTrechos}
                nomesCapitulos={nomesCapitulos}
                onDocumentoSalvo={(arquivoId, metadados) => setDocumentos((atuais) => atuais.map((doc) => doc.arquivo_id === arquivoId ? { ...doc, hash_sha256: metadados.hash_sha256, tamanho_bytes: metadados.tamanho_bytes } : doc))}
              />
            ) : selecionado?.tipo === 'TEXTO' ? (
              <EditorMarkdown key={selecionado.id} textoId={selecionado.id} />
            ) : selecionado?.tipo === 'capitulo' ? (
              <EditorAtributosCapitulo
                key={selecionado.id}
                livroId={id}
                capitulo={capituloSelecionado || selecionado}
                onSalvo={atualizarCapitulo}
              />
            ) : (!selecionado || ['obra', 'cena', 'CONTEUDO'].includes(selecionado.tipo)) ? (
              <EditorConteudosObra
                livroId={id}
                cenaDestino={cenaDestino}
                versaoCatalogo={versaoCatalogo}
                conteudoSelecionado={selecionado?.tipo === 'CONTEUDO' ? selecionado : null}
                onSelecionarConteudo={selecionarConteudoEditor}
                onComposicaoAtualizada={aposIncluirConteudo}
                onAdicionarEscolha={abrirEscolhasDaCena}
                podeAdicionarEscolha={Boolean(cenaDestino)}
              />
            ) : (
              <iframe title={`Editor: ${itemSelecionado.titulo}`} src={rotaEditor()} className="h-full w-full border-0 bg-white" />
            )}
          </div>
        </section>

        <aside className={`${mostrarPropriedades ? 'block' : 'hidden'} min-h-0 overflow-y-auto border-l border-slate-800 bg-slate-900 xl:block`}>
          <div className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Propriedades</div>
          <div className="space-y-4 p-4 text-sm">
            <div><p className="text-xs text-slate-500">Tipo</p><p className="mt-1">{itemSelecionado.tipo === 'RASCUNHO' ? 'Rascunho local' : itemSelecionado.tipo === 'DOCUMENTO' ? 'Documento Markdown independente' : itemSelecionado.tipo === 'TEXTO' ? 'Texto Markdown' : itemSelecionado.tipo === 'ESCOLHA' ? 'Escolha' : itemSelecionado.tipo}</p></div>
            <div><p className="text-xs text-slate-500">Nome</p><p className="mt-1 break-words">{itemSelecionado.titulo}</p></div>
            {itemSelecionado.tipo === 'DOCUMENTO' && documentoSelecionado && <><div><p className="text-xs text-slate-500">Arquivo gerenciado independente</p><p className="mt-1 break-all text-xs text-slate-300">{documentoSelecionado.arquivo_id}</p></div><div><p className="text-xs text-slate-500">Tamanho</p><p className="mt-1">{tamanhoLegivel(documentoSelecionado.tamanho_bytes)}</p></div></>}
            {itemSelecionado.url && <div><p className="text-xs text-slate-500">Referência legada</p><p className="mt-1 break-all text-xs text-slate-300">{itemSelecionado.url}</p></div>}
            {itemSelecionado.slug && <div><p className="text-xs text-slate-500">Slug</p><p className="mt-1 break-all">{itemSelecionado.slug}</p></div>}
            {itemSelecionado.ordem_exibicao != null && <div><p className="text-xs text-slate-500">Ordem</p><p className="mt-1">{itemSelecionado.ordem_exibicao}</p></div>}
            {itemSelecionado.tipo === 'RASCUNHO' && <p className="rounded border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-slate-400">O Rascunho existe somente neste navegador. A extração cria cópias independentes e não mantém vínculo de sincronização.</p>}
            {itemSelecionado.tipo === 'DOCUMENTO' && <p className="rounded border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-slate-400">Este documento independente é armazenado pela plataforma e pode participar da composição por meio dos conteúdos associados às cenas.</p>}
            {itemSelecionado.tipo === 'TEXTO' && !itemSelecionado.arquivoId && <p className="rounded border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-slate-400">Este é um texto legado. Seu editor permanece no fluxo baseado em texto_url.</p>}
            {itemSelecionado.tipo === 'obra' && <section className="rounded-lg border border-slate-700 bg-slate-950 p-3">
              <div className="flex items-center justify-between gap-2"><h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Armazenamento</h2><button type="button" onClick={carregarArmazenamento} disabled={carregandoArmazenamento} className="text-xs text-indigo-300 hover:text-indigo-200 disabled:opacity-50">Atualizar</button></div>
              {carregandoArmazenamento ? <p className="mt-3 text-xs text-slate-400">Consultando servidor…</p> : erroArmazenamento ? <div className="mt-3"><p role="alert" className="text-xs text-rose-300">{erroArmazenamento}</p><button type="button" onClick={carregarArmazenamento} className="mt-2 text-xs text-indigo-300 underline">Tentar novamente</button></div> : armazenamento && <>
                {(() => { const pct = Number(armazenamento.percentual_utilizado) || 0; const cor = pct >= 100 ? 'bg-rose-500' : pct >= 90 ? 'bg-amber-400' : 'bg-emerald-500'; const espaco = BigInt(armazenamento.espaco_disponivel_bytes); return <>
                  <p className="mt-3 text-xs text-slate-400">Utilizado</p><p className="font-semibold">{tamanhoLegivel(armazenamento.consumo_utilizado_bytes)} / {tamanhoLegivel(armazenamento.cota_total_bytes)}</p>
                  <p className="mt-2 text-xs text-slate-400">{espaco < 0n ? 'Acima da cota' : 'Disponível'}</p><p className="font-medium">{tamanhoLegivel(espaco < 0n ? (-espaco).toString() : armazenamento.espaco_disponivel_bytes)}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full ${cor}`} style={{ width: `${Math.max(0, Math.min(pct, 100))}%` }} /></div><p className="mt-1 text-right text-xs text-slate-400">{pct.toFixed(2)}%</p>
                  {pct >= 90 && <p className={`mt-2 text-xs ${pct >= 100 ? 'text-rose-300' : 'text-amber-200'}`}>{pct >= 100 ? 'Cota atingida' : 'Próximo da cota'}</p>}
                </>; })()}
                <p className="mt-3 text-xs text-slate-500">{armazenamento.quantidade_arquivos} arquivo(s) · não inclui arquivos legados de media/.</p>
                <button type="button" onClick={() => { setAba('arquivos'); carregarArmazenamento(); setMostrarArvore(false); setMostrarPropriedades(false); }} className="mt-3 w-full rounded border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800">Abrir Arquivos</button>
              </>}
            </section>}
          </div>
        </aside>
      </div>
    </main>
  );
}
