'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { apiFetch } from '../services/api';
import { montarUrlMedia } from '../services/media';
import { obterUrlAssinadaArquivo } from '../services/arquivoMidia';
import { lerDocumentoMarkdown, salvarDocumentoMarkdown } from '../services/livroDocumento';

async function calcularHash(texto) {
  const bytes = new TextEncoder().encode(texto);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function escaparHtml(texto) {
  return texto.replace(/[&<>"']/g, (caractere) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[caractere]);
}

function destacarInline(texto) {
  const padrao = /(`[^`]*`|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;
  let resultado = '';
  let inicio = 0;
  for (const trecho of texto.matchAll(padrao)) {
    resultado += escaparHtml(texto.slice(inicio, trecho.index));
    const token = escaparHtml(trecho[0]);
    const classe = trecho[0].startsWith('`') ? 'text-amber-300' :
      trecho[0].startsWith('[') ? 'text-sky-300 underline' : 'text-violet-300';
    resultado += `<span class="${classe}">${token}</span>`;
    inicio = trecho.index + trecho[0].length;
  }
  return resultado + escaparHtml(texto.slice(inicio));
}

function destacarMarkdown(texto) {
  let dentroCodigo = false;
  return texto.split('\n').map((linha) => {
    if (/^\s*```/.test(linha)) {
      dentroCodigo = !dentroCodigo;
      return `<span class="text-amber-300">${escaparHtml(linha)}</span>`;
    }
    if (dentroCodigo) return `<span class="text-emerald-300">${escaparHtml(linha)}</span>`;
    if (/^\s{0,3}#{1,6}\s/.test(linha)) return `<span class="text-sky-300 font-bold">${destacarInline(linha)}</span>`;
    if (/^\s*&gt;/.test(escaparHtml(linha))) return `<span class="text-slate-400 italic">${destacarInline(linha)}</span>`;
    if (/^\s*([-*+] |\d+\. )/.test(linha)) return `<span class="text-orange-300">${destacarInline(linha)}</span>`;
    return destacarInline(linha);
  }).join('\n');
}

const coresMarcadores = {
  cinza: { texto: 'text-slate-300', fundo: 'border-slate-600 bg-slate-800/95', id: 'text-slate-500' },
  azul: { texto: 'text-sky-200', fundo: 'border-sky-700 bg-sky-950/95', id: 'text-sky-500/80' },
  verde: { texto: 'text-emerald-200', fundo: 'border-emerald-700 bg-emerald-950/95', id: 'text-emerald-500/80' },
  lilas: { texto: 'text-violet-200', fundo: 'border-violet-700 bg-violet-950/95', id: 'text-violet-500/80' },
};

function destacarDocumentoMarkdown(texto, nomesTrechos, nomesCapitulos, cor) {
  const estilo = coresMarcadores[cor] || coresMarcadores.cinza;
  const idsTrechos = [];
  const idsCapitulos = [];
  let indiceTrecho = 0;
  const linhas = texto.split('\n').map((linha) => {
    const abertura = /^\s*<!--[\t ]*cigana:trecho[\t ]+id="([^"]+)"[\t ]*-->\s*$/i.exec(linha);
    if (abertura) {
      const id = abertura[1];
      idsTrechos.push(id);
      indiceTrecho += 1;
      const nome = nomesTrechos[id] || `Texto ${indiceTrecho}`;
      const original = escaparHtml(linha);
      return `<span class="relative inline-block align-top"><span class="invisible">${original || ' '}</span><span class="absolute left-0 top-0 inline-flex h-6 max-w-[calc(100vw-3rem)] items-center gap-2 overflow-hidden whitespace-nowrap rounded border px-2 text-xs font-medium ${estilo.texto} ${estilo.fundo}"><strong class="font-bold">${escaparHtml(nome)}</strong><span>— Início.</span><span class="truncate text-[10px] font-normal ${estilo.id}" title="${escaparHtml(id)}">${escaparHtml(id)}</span></span></span>`;
    }
    if (/^\s*<!--[\t ]*\/cigana:trecho[\t ]*-->\s*$/i.test(linha)) {
      const id = idsTrechos.pop();
      const nome = id ? (nomesTrechos[id] || `Texto ${indiceTrecho}`) : 'trecho';
      const original = escaparHtml(linha);
      return `<span class="relative inline-block align-top"><span class="invisible">${original || ' '}</span><span class="absolute left-0 top-0 inline-flex h-6 items-center gap-2 rounded border px-2 text-xs font-medium ${estilo.texto} ${estilo.fundo}"><strong class="font-bold">${escaparHtml(nome)}</strong><span>Fim</span></span></span>`;
    }
    const aberturaCapitulo = /^\s*<!--[\t ]*cigana:capitulo[\t ]+id="([^"]+)"[\t ]*-->\s*$/i.exec(linha);
    if (aberturaCapitulo) {
      const id = aberturaCapitulo[1];
      idsCapitulos.push(id);
      const nome = nomesCapitulos[id] || 'Capítulo';
      const original = escaparHtml(linha);
      return `<span class="relative inline-block align-top"><span class="invisible">${original || ' '}</span><span class="absolute left-0 top-0 inline-flex h-6 max-w-[calc(100vw-3rem)] items-center gap-2 overflow-hidden whitespace-nowrap rounded border px-2 text-xs font-medium ${estilo.texto} ${estilo.fundo}"><strong class="font-bold">${escaparHtml(nome)}</strong><span>— Início.</span><span class="truncate text-[10px] font-normal ${estilo.id}" title="${escaparHtml(id)}">${escaparHtml(id)}</span></span></span>`;
    }
    if (/^\s*<!--[\t ]*\/cigana:capitulo[\t ]*-->\s*$/i.test(linha)) {
      const id = idsCapitulos.pop();
      const nome = id ? (nomesCapitulos[id] || 'Capítulo') : 'Capítulo';
      const original = escaparHtml(linha);
      return `<span class="relative inline-block align-top"><span class="invisible">${original || ' '}</span><span class="absolute left-0 top-0 inline-flex h-6 items-center gap-2 rounded border px-2 text-xs font-medium ${estilo.texto} ${estilo.fundo}"><strong class="font-bold">${escaparHtml(nome)}</strong><span>Fim</span></span></span>`;
    }
    return escaparHtml(linha);
  });
  return linhas.join('\n');
}

export function EditorTextoLegado({ textoId, onFechar }) {
  const [draft, setDraft] = useState('');
  const [url, setUrl] = useState('');
  const [urlFonte, setUrlFonte] = useState('');
  const [status, setStatus] = useState('carregando');
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState('');
  const [conflito, setConflito] = useState(false);
  const [versaoRemota, setVersaoRemota] = useState(null);
  const [carregandoRemota, setCarregandoRemota] = useState(false);
  const draftRef = useRef('');
  const salvoRef = useRef('');
  const hashRef = useRef('');
  const timerRef = useRef(null);
  const salvandoRef = useRef(false);
  const scrollRef = useRef(null);
  const realceRef = useRef(null);
  const salvarRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setStatus('carregando');
      setErro('');
      try {
        const resposta = await apiFetch(`/api/cena-textos/${textoId}`);
        const textoUrl = resposta.data.texto_url;
        const urlArquivo = resposta.data.arquivo_id
          ? await obterUrlAssinadaArquivo(resposta.data.arquivo_id)
          : montarUrlMedia(textoUrl);
        const respostaArquivo = await fetch(urlArquivo, { cache: 'no-store' });
        if (!respostaArquivo.ok) throw new Error('Não foi possível carregar o arquivo Markdown.');
        const conteudo = await respostaArquivo.text();
        const hash = await calcularHash(conteudo);
        if (!ativo) return;
        setUrl(textoUrl || resposta.data.nome_arquivo || 'Arquivo Markdown do Storage');
        setUrlFonte(urlArquivo);
        hashRef.current = hash;
        setDraft(conteudo);
        draftRef.current = conteudo;
        salvoRef.current = conteudo;
        hashRef.current = hash;
        setStatus('salvo');
      } catch (errorCarregamento) {
        if (ativo) {
          setErro(errorCarregamento.message);
          setStatus('erro');
        }
      }
    }
    carregar();
    return () => {
      ativo = false;
      clearTimeout(timerRef.current);
    };
  }, [textoId]);

  async function salvar() {
    if (salvandoRef.current || status === 'carregando' || !hashRef.current || draftRef.current === salvoRef.current) return;
    const conteudoEnviado = draftRef.current;
    salvandoRef.current = true;
    setStatus('salvando');
    setErro('');
    let confirmado = false;
    try {
      const metadadosTexto = await apiFetch(`/api/cena-textos/${textoId}`);
      const resposta = metadadosTexto.data.arquivo_id
        ? await apiFetch(`/api/arquivos-midia/${metadadosTexto.data.arquivo_id}/conteudo`, {
          method: 'PUT',
          headers: { 'Content-Type': 'text/markdown', 'X-Hash-Esperado': hashRef.current },
          body: conteudoEnviado,
        })
        : await apiFetch(`/api/cena-textos/${textoId}/conteudo`, {
        method: 'PUT',
        body: JSON.stringify({ conteudo: conteudoEnviado, hash_esperado: hashRef.current }),
      });
      hashRef.current = resposta.data.hash_sha256;
      salvoRef.current = conteudoEnviado;
      confirmado = true;
      setSalvo(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      if (draftRef.current === conteudoEnviado) {
        setStatus('salvo');
      } else {
        setStatus('pendente');
      }
    } catch (errorSalvamento) {
      setErro(errorSalvamento.message);
      setStatus('erro');
      setConflito(errorSalvamento.status === 409 && errorSalvamento.message.includes('alterado desde a última leitura'));
      setVersaoRemota(null);
    } finally {
      salvandoRef.current = false;
      if (confirmado && draftRef.current !== conteudoEnviado) {
        timerRef.current = setTimeout(() => salvar(), 100);
      }
    }
  }

  salvarRef.current = salvar;

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    if (draftRef.current !== salvoRef.current) {
      salvarRef.current?.();
    }
  }, [textoId]);

  async function carregarVersaoRemota() {
    if (!urlFonte) return;
    setCarregandoRemota(true);
    try {
      const resposta = await fetch(urlFonte, { cache: 'no-store' });
      if (!resposta.ok) throw new Error('Não foi possível carregar a versão atual do arquivo.');
      const conteudo = await resposta.text();
      setVersaoRemota({ conteudo, hash: await calcularHash(conteudo) });
    } catch (errorVersao) {
      setErro(errorVersao.message);
    } finally {
      setCarregandoRemota(false);
    }
  }

  function substituirVersaoRemota() {
    if (!versaoRemota || salvandoRef.current) return;
    hashRef.current = versaoRemota.hash;
    setConflito(false);
    setVersaoRemota(null);
    setErro('');
    setStatus('pendente');
    salvar();
  }

  useEffect(() => {
    if (status === 'carregando') return undefined;
    if (!hashRef.current) return undefined;
    if (salvandoRef.current) return undefined;
    if (conflito) return undefined;
    if (draft === salvoRef.current) return undefined;
    setStatus((atual) => atual === 'erro' ? atual : 'pendente');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => salvar(), 900);
    return () => clearTimeout(timerRef.current);
    // salvar usa a referência mais recente do draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, conflito]);

  function alterar(event) {
    const valor = event.target.value;
    draftRef.current = valor;
    setDraft(valor);
    setErro('');
  }

  function sincronizarScroll() {
    if (!scrollRef.current || !realceRef.current) return;
    realceRef.current.scrollTop = scrollRef.current.scrollTop;
    realceRef.current.scrollLeft = scrollRef.current.scrollLeft;
  }

  const rotuloStatus = {
    carregando: 'Carregando…', pendente: 'Alterações pendentes',
    salvando: 'Salvando…', salvo: salvo ? `Salvo às ${salvo}` : 'Salvo', erro: 'Erro ao salvar',
  }[status];

  return (
    <section className="flex h-full min-h-[620px] flex-col bg-slate-950 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Editor Markdown</p>
          <p className="truncate text-xs text-slate-400">{url || 'Carregando referência…'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${status === 'erro' ? 'text-rose-300' : status === 'salvo' ? 'text-emerald-300' : 'text-amber-300'}`} aria-live="polite">{rotuloStatus}</span>
          <button type="button" onClick={salvar} disabled={!hashRef.current || status === 'carregando' || status === 'salvando' || status === 'salvo' || conflito} className="rounded bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">Salvar</button>
          {onFechar && <button type="button" onClick={onFechar} className="rounded border border-slate-700 px-3 py-2 text-sm">Fechar</button>}
        </div>
      </header>
      {erro && <p className="border-b border-rose-900 bg-rose-950/60 px-4 py-2 text-sm text-rose-200" role="alert">{erro}</p>}
      {conflito && <div className="space-y-3 border-b border-amber-800 bg-amber-950/50 p-4" role="alert">
        <p className="text-sm text-amber-100">Outra edição foi salva neste arquivo. Seu rascunho continua aberto e não foi enviado por cima da versão mais recente.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={carregarVersaoRemota} disabled={carregandoRemota} className="rounded border border-amber-700 px-3 py-2 text-xs text-amber-100 disabled:opacity-50">{carregandoRemota ? 'Carregando versão…' : 'Comparar com a versão atual'}</button>
          {versaoRemota && <button type="button" onClick={substituirVersaoRemota} className="rounded bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500">Substituir a versão atual pelo meu rascunho</button>}
        </div>
        {versaoRemota && <details className="rounded border border-amber-900 p-3">
          <summary className="cursor-pointer text-xs text-amber-200">Conteúdo atualmente salvo no servidor</summary>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-amber-100">{versaoRemota.conteudo}</pre>
        </details>}
      </div>}
      <div className="relative min-h-0 flex-1 font-mono text-sm leading-6">
        <pre ref={realceRef} aria-hidden="true" className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words p-5 font-mono text-sm leading-6 text-slate-100"><code dangerouslySetInnerHTML={{ __html: destacarMarkdown(draft) + '\n' }} /></pre>
        <textarea ref={scrollRef} aria-label="Conteúdo Markdown" spellCheck="false" value={draft} onChange={alterar} onScroll={sincronizarScroll} disabled={status === 'carregando'} className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-5 font-mono text-sm leading-6 text-transparent caret-white outline-none selection:bg-indigo-500/40 disabled:cursor-wait" />
      </div>
    </section>
  );
}

function extrairMarcadores(conteudo) {
  return (conteudo.match(/<!--[\t ]*\/?cigana:(?:capitulo|trecho)\b[^>]*-->/gi) || []);
}

function faixaTrecho(conteudo, textoId) {
  const id = String(textoId || '').toLowerCase();
  if (!id) return null;
  const abertura = new RegExp(`<!--[\\t ]*cigana:trecho[\\t ]+id="${id}"[\\t ]*-->`, 'i').exec(conteudo);
  if (!abertura) return null;
  const inicio = abertura.index + abertura[0].length;
  const fimRelativo = /<!--[\t ]*\/cigana:trecho[\t ]*-->/i.exec(conteudo.slice(inicio));
  return fimRelativo ? { inicio, fim: inicio + fimRelativo.index } : null;
}

function faixaCapitulo(conteudo, capituloId) {
  const id = String(capituloId || '').toLowerCase();
  if (!id) return null;
  const abertura = new RegExp(`<!--[\\t ]*cigana:capitulo[\\t ]+id="${id}"[\\t ]*-->`, 'i').exec(conteudo);
  if (!abertura) return null;
  const inicio = abertura.index + abertura[0].length;
  const fimRelativo = /<!--[\t ]*\/cigana:capitulo[\t ]*-->/i.exec(conteudo.slice(inicio));
  return fimRelativo ? { inicio, fim: inicio + fimRelativo.index } : null;
}

const EditorDocumentoMarkdown = forwardRef(function EditorDocumentoMarkdown({
  livroId, documento, trechoSelecionadoId, capituloSelecionadoId, nomesTrechos = {}, nomesCapitulos = {}, rascunhoInicial, onRascunhoChange, onDocumentoSalvo,
}, ref) {
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('carregando');
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState('');
  const [conflito, setConflito] = useState(false);
  const [versaoRemota, setVersaoRemota] = useState(null);
  const [carregandoRemota, setCarregandoRemota] = useState(false);
  const [corMarcadores, setCorMarcadores] = useState('cinza');
  const [documentoCarregado, setDocumentoCarregado] = useState(false);
  const draftRef = useRef('');
  const hashRef = useRef('');
  const timerRef = useRef(null);
  const salvandoRef = useRef(false);
  const salvamentoAtualRef = useRef(null);
  const concluirSalvamentoRef = useRef(null);
  const operacaoEstruturalRef = useRef(false);
  const pendenteRef = useRef(false);
  const sequenciaRef = useRef(0);
  const carregadoRef = useRef(false);
  const baseEstruturalRef = useRef([]);
  const editorRef = useRef(null);
  const realceRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    carregadoRef.current = false;
    setDocumentoCarregado(false);
    setStatus('carregando'); setErro(''); setConflito(false); setVersaoRemota(null);
    async function carregar() {
      try {
        const remoto = await lerDocumentoMarkdown(documento.arquivo_id);
        if (!ativo) return;
        const veioRascunho = rascunhoInicial?.rascunho != null;
        const conteudo = veioRascunho ? rascunhoInicial.rascunho : remoto.conteudo;
        draftRef.current = conteudo;
        hashRef.current = veioRascunho ? rascunhoInicial.hash : remoto.hash;
        baseEstruturalRef.current = extrairMarcadores(remoto.conteudo);
        setDraft(conteudo);
        carregadoRef.current = true;
        setDocumentoCarregado(true);
        pendenteRef.current = veioRascunho && conteudo !== remoto.conteudo;
        setStatus(pendenteRef.current ? 'pendente' : 'salvo');
        if (pendenteRef.current) agendar(150);
      } catch (errorCarregamento) {
        if (ativo) { setErro(errorCarregamento.message || 'Não foi possível carregar o documento.'); setStatus('erro'); }
      }
    }
    carregar();
    return () => { ativo = false; clearTimeout(timerRef.current); };
    // A carga ocorre ao trocar o arquivo, a atualização do rascunho é feita pelo callback abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documento.arquivo_id]);

  function notificarRascunho(conteudo, hash, atualStatus) {
    onRascunhoChange?.(documento.arquivo_id, { rascunho: conteudo, hash, status: atualStatus });
  }

  function agendar(atraso = 9000) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => salvar(), atraso);
  }

  async function salvar() {
    if (salvandoRef.current) return salvamentoAtualRef.current;
    if (!carregadoRef.current || conflito || !hashRef.current) return;
    const conteudoEnviado = draftRef.current;
    if (!pendenteRef.current) return;
    const marcadores = extrairMarcadores(conteudoEnviado);
    if (marcadores.length !== baseEstruturalRef.current.length || marcadores.some((m, i) => m !== baseEstruturalRef.current[i])) {
      setErro('Os marcadores estruturais são protegidos pela IDE. A alteração não foi salva.');
      setStatus('erro');
      return;
    }
    const sequencia = ++sequenciaRef.current;
    salvandoRef.current = true;
    salvamentoAtualRef.current = new Promise((resolve) => { concluirSalvamentoRef.current = resolve; });
    setStatus('salvando'); setErro('');
    try {
      const resposta = await salvarDocumentoMarkdown(livroId, documento.arquivo_id, conteudoEnviado, hashRef.current);
      if (sequencia !== sequenciaRef.current) return;
      hashRef.current = resposta.data.hash_sha256;
      baseEstruturalRef.current = marcadores;
      if (draftRef.current === conteudoEnviado) {
        pendenteRef.current = false;
        setStatus('salvo');
        setSalvo(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        notificarRascunho(conteudoEnviado, hashRef.current, 'salvo');
        onDocumentoSalvo?.(documento.arquivo_id, resposta.data);
      } else {
        // O hash confirmado avança, mas a edição mais recente permanece local e será enviada depois.
        setStatus('pendente');
        notificarRascunho(draftRef.current, hashRef.current, 'pendente');
        agendar(100);
      }
    } catch (errorSalvamento) {
      if (errorSalvamento.status === 409) setConflito(true);
      setErro(errorSalvamento.message || 'Não foi possível salvar o documento. Seu rascunho foi preservado.');
      setStatus('erro');
      notificarRascunho(draftRef.current, hashRef.current, 'erro');
    } finally {
      salvandoRef.current = false;
      concluirSalvamentoRef.current?.();
      concluirSalvamentoRef.current = null;
      salvamentoAtualRef.current = null;
    }
  }

  async function salvarAntesDaOperacao() {
    clearTimeout(timerRef.current);
    if (status === 'erro' || conflito) throw new Error(erro || 'Resolva o conflito do documento antes de continuar.');
    if (pendenteRef.current) await salvar();
    if (salvandoRef.current) await salvamentoAtualRef.current;
    if (pendenteRef.current || status === 'erro' || conflito) throw new Error(erro || 'Não foi possível concluir o autosave antes da operação.');
  }

  async function executarOperacaoEstrutural(mutacao) {
    if (operacaoEstruturalRef.current) throw new Error('Já existe uma operação estrutural em andamento neste documento.');
    operacaoEstruturalRef.current = true;
    try {
      await salvarAntesDaOperacao();
      mutacao();
      await salvar();
      if (pendenteRef.current || status === 'erro') throw new Error(erro || 'Não foi possível persistir a alteração estrutural.');
    } finally {
      operacaoEstruturalRef.current = false;
    }
  }

  useImperativeHandle(ref, () => ({
    focarTrecho(textoId) {
      const faixa = faixaTrecho(draftRef.current, textoId);
      if (!faixa || !editorRef.current) return false;
      editorRef.current.focus();
      editorRef.current.setSelectionRange(faixa.inicio, faixa.fim);
      return true;
    },
    focarCapitulo(capituloId) {
      const faixa = faixaCapitulo(draftRef.current, capituloId);
      if (!faixa || !editorRef.current) return false;
      editorRef.current.focus();
      editorRef.current.setSelectionRange(faixa.inicio, faixa.fim);
      return true;
    },
    inserirCapitulo(capitulo) {
      const id = String(capitulo.id).toLowerCase();
      if (new RegExp(`cigana:capitulo[\\t ]+id="${id}"`, 'i').test(draftRef.current)) return;
      const bloco = `<!-- cigana:capitulo id="${id}" -->\n\n# ${capitulo.titulo}\n\n<!-- /cigana:capitulo -->\n`;
      const novo = `${draftRef.current}${draftRef.current.endsWith('\n') || !draftRef.current ? '' : '\n'}${bloco}`;
      baseEstruturalRef.current = extrairMarcadores(novo);
      alterarConteudo(novo);
    },
    async inserirTrecho(capituloId, textoId) {
      const atual = draftRef.current;
      if (faixaTrecho(atual, textoId)) return;
      const id = String(capituloId).toLowerCase();
      const padrao = new RegExp(`<!--[\\t ]*cigana:capitulo[\\t ]+id="${id}"[\\t ]*-->[\\s\\S]*?<!--[\\t ]*\\/cigana:capitulo[\\t ]*-->`, 'i');
      const bloco = `<!-- cigana:trecho id="${String(textoId).toLowerCase()}" -->\n\n<!-- /cigana:trecho -->\n`;
      const correspondencia = padrao.exec(atual);
      if (!correspondencia) throw new Error('O capítulo não possui marcador no documento selecionado.');
      const fechamento = /<!--[\t ]*\/cigana:capitulo[\t ]*-->/i.exec(correspondencia[0]);
      if (!fechamento) throw new Error('Marcador de fechamento do capítulo ausente.');
      const final = correspondencia.index + fechamento.index;
      const novo = `${atual.slice(0, final)}${bloco}${atual.slice(final)}`;
      await executarOperacaoEstrutural(() => {
        baseEstruturalRef.current = extrairMarcadores(novo);
        alterarConteudo(novo);
      });
    },
    async removerTrecho(textoId) {
      const atual = draftRef.current;
      const id = String(textoId || '').toLowerCase();
      const abertura = new RegExp(`<!--[\\t ]*cigana:trecho[\\t ]+id="${id}"[\\t ]*-->`, 'i').exec(atual);
      if (!abertura) throw new Error('O marcador do trecho não foi encontrado no documento.');
      const inicio = abertura.index;
      const fechamento = /<!--[\t ]*\/cigana:trecho[\t ]*-->/i.exec(atual.slice(inicio + abertura[0].length));
      if (!fechamento) throw new Error('Marcador de fechamento do trecho ausente.');
      const fim = inicio + abertura[0].length + fechamento.index + fechamento[0].length;
      const novo = `${atual.slice(0, inicio)}${atual.slice(fim)}`;
      await executarOperacaoEstrutural(() => {
        baseEstruturalRef.current = extrairMarcadores(novo);
        alterarConteudo(novo);
      });
    },
    async salvarAntesDaOperacao() { await salvarAntesDaOperacao(); },
    obterStatus() { return status; },
  }), [status]);

  function alterarConteudo(valor) {
    draftRef.current = valor;
    pendenteRef.current = true;
    setDraft(valor); setErro(''); setStatus('pendente');
    notificarRascunho(valor, hashRef.current, 'pendente');
  }

  function alterar(event) {
    const valor = event.target.value;
    const marcadores = extrairMarcadores(valor);
    if (marcadores.length !== baseEstruturalRef.current.length || marcadores.some((m, i) => m !== baseEstruturalRef.current[i])) {
      setErro('Marcadores estruturais bloqueados. Edite somente o conteúdo entre os marcadores.');
      return;
    }
    alterarConteudo(valor);
    agendar();
  }

  useEffect(() => {
    if ((trechoSelecionadoId || capituloSelecionadoId) && carregadoRef.current) {
      const faixa = trechoSelecionadoId ? faixaTrecho(draftRef.current, trechoSelecionadoId) : faixaCapitulo(draftRef.current, capituloSelecionadoId);
      if (faixa && editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(faixa.inicio, faixa.fim);
        editorRef.current.scrollTop = Math.max(0, editorRef.current.value.slice(0, faixa.inicio).split('\n').length * 24 - editorRef.current.clientHeight / 2);
        realceRef.current?.scrollTo({ top: editorRef.current.scrollTop, left: editorRef.current.scrollLeft });
      }
    }
  }, [trechoSelecionadoId, capituloSelecionadoId, documentoCarregado]);

  useEffect(() => {
    if (!carregadoRef.current || !pendenteRef.current || conflito) return undefined;
    agendar();
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, conflito]);

  async function carregarVersaoRemota() {
    setCarregandoRemota(true);
    try { setVersaoRemota(await lerDocumentoMarkdown(documento.arquivo_id)); }
    catch (error) { setErro(error.message); }
    finally { setCarregandoRemota(false); }
  }

  function resolverConflitoComRascunho() {
    if (!versaoRemota || salvandoRef.current) return;
    hashRef.current = versaoRemota.hash;
    baseEstruturalRef.current = extrairMarcadores(versaoRemota.conteudo);
    setConflito(false); setVersaoRemota(null); setErro('');
    pendenteRef.current = true; setStatus('pendente');
    notificarRascunho(draftRef.current, hashRef.current, 'pendente');
    agendar(0);
  }

  const marcadoresRemotosCompativeis = Boolean(versaoRemota) && (() => {
    const locais = extrairMarcadores(draft);
    const remotos = extrairMarcadores(versaoRemota.conteudo);
    return locais.length === remotos.length && locais.every((marcador, indice) => marcador === remotos[indice]);
  })();

  const rotulos = { carregando: 'Carregando…', pendente: 'Alterações pendentes', salvando: 'Salvando…', salvo: salvo ? `Salvo às ${salvo}` : 'Salvo', erro: 'Erro ao salvar' };
  return (
    <section className="flex h-full min-h-[620px] flex-col bg-slate-950 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="min-w-0"><p className="truncate text-sm font-semibold">Editor Markdown · documento completo</p><p className="truncate text-xs text-slate-400">{documento.nome_original}</p></div>
        <div className="flex flex-wrap items-center gap-3"><fieldset className="flex items-center gap-1" aria-label="Cor dos marcadores"><legend className="sr-only">Cor dos marcadores</legend>{[['cinza', 'Cinza'], ['azul', 'Azul'], ['verde', 'Verde'], ['lilas', 'Lilás']].map(([valor, rotulo]) => <button key={valor} type="button" aria-label={`Marcadores ${rotulo.toLowerCase()}`} aria-pressed={corMarcadores === valor} onClick={() => setCorMarcadores(valor)} className={`h-5 w-5 rounded-full border-2 ${corMarcadores === valor ? 'border-white ring-1 ring-white/50' : 'border-slate-600'} ${valor === 'cinza' ? 'bg-slate-400' : valor === 'azul' ? 'bg-sky-500' : valor === 'verde' ? 'bg-emerald-500' : 'bg-violet-500'}`} />)}</fieldset><span className={`text-xs ${status === 'erro' ? 'text-rose-300' : status === 'salvo' ? 'text-emerald-300' : 'text-amber-300'}`} aria-live="polite">{rotulos[status]}</span><button type="button" onClick={() => { clearTimeout(timerRef.current); salvar(); }} disabled={!pendenteRef.current || status === 'salvando' || status === 'carregando' || conflito} className="rounded bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50">Salvar</button></div>
      </header>
      {erro && <p className="border-b border-rose-900 bg-rose-950/60 px-4 py-2 text-sm text-rose-200" role="alert">{erro}</p>}
      {conflito && <div className="space-y-3 border-b border-amber-800 bg-amber-950/50 p-4" role="alert"><p className="text-sm text-amber-100">Este documento foi alterado por outra gravação. Seu rascunho local foi preservado e não será enviado por cima automaticamente.</p><div className="flex flex-wrap gap-2"><button type="button" onClick={carregarVersaoRemota} disabled={carregandoRemota} className="rounded border border-amber-700 px-3 py-2 text-xs">{carregandoRemota ? 'Carregando…' : 'Consultar versão atual'}</button>{versaoRemota && marcadoresRemotosCompativeis && <button type="button" onClick={resolverConflitoComRascunho} className="rounded bg-amber-600 px-3 py-2 text-xs font-semibold">Reaplicar meu rascunho sobre a versão atual</button>}</div>{versaoRemota && !marcadoresRemotosCompativeis && <p className="text-xs text-amber-200">A estrutura dos marcadores também mudou. Compare as versões e integre as alterações manualmente; a IDE não reaplicará automaticamente um rascunho com estrutura diferente.</p>}{versaoRemota && <details className="rounded border border-amber-900 p-3"><summary className="cursor-pointer text-xs">Versão atual no servidor</summary><pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs">{versaoRemota.conteudo}</pre></details>}</div>}
      <div className="relative min-h-0 flex-1 font-mono text-sm leading-6"><pre ref={realceRef} aria-hidden="true" className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words p-5 font-mono text-sm leading-6"><code dangerouslySetInnerHTML={{ __html: destacarDocumentoMarkdown(draft, nomesTrechos, nomesCapitulos, corMarcadores) + '\n' }} /></pre><textarea ref={editorRef} aria-label="Documento Markdown completo" spellCheck="false" value={draft} onChange={alterar} onScroll={() => { if (realceRef.current && editorRef.current) { realceRef.current.scrollTop = editorRef.current.scrollTop; realceRef.current.scrollLeft = editorRef.current.scrollLeft; } }} disabled={status === 'carregando'} className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-5 font-mono text-sm leading-6 text-transparent caret-white outline-none selection:bg-indigo-500/40 disabled:cursor-wait" /></div>
      <footer className="border-t border-slate-800 px-4 py-2 text-xs text-slate-500">Os marcadores de capítulo e trecho são protegidos; o conteúdo Markdown entre eles é editável.</footer>
    </section>
  );
});

const EditorRascunhoMarkdown = forwardRef(function EditorRascunhoMarkdown({ value = '', onChange, disabled = false }, ref) {
  const editorRef = useRef(null);
  const realceRef = useRef(null);

  function sincronizarScroll() {
    if (!editorRef.current || !realceRef.current) return;
    realceRef.current.scrollTop = editorRef.current.scrollTop;
    realceRef.current.scrollLeft = editorRef.current.scrollLeft;
  }

  useImperativeHandle(ref, () => ({
    obterSelecao() {
      const editor = editorRef.current;
      if (!editor) throw new Error('O editor do Rascunho ainda não está pronto.');
      const { selectionStart, selectionEnd } = editor;
      if (selectionStart === selectionEnd) throw new Error('Selecione o texto que deseja extrair.');
      const conteudo = value.slice(selectionStart, selectionEnd);
      if (!conteudo.trim()) throw new Error('A seleção não contém texto.');
      if (/<!--[\t ]*\/?cigana:(?:capitulo|trecho)\b[^>]*-->/i.test(conteudo)) {
        throw new Error('A seleção inclui marcadores estruturais. Selecione somente o conteúdo do Rascunho.');
      }
      return { conteudo, inicio: selectionStart, fim: selectionEnd };
    },
    anotar(anotacao) {
      const separador = !value ? '' : value.endsWith('\n') ? '\n' : '\n\n';
      onChange(`${value}${separador}> ${anotacao}\n`);
    },
  }), [onChange, value]);

  return (
    <section className="flex h-full min-h-[620px] flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <p className="text-sm font-semibold">Rascunho local</p>
        <p className="mt-1 text-xs text-slate-400">Este arquivo fica neste navegador. Baixe suas alterações para guardá-las fora da plataforma.</p>
      </header>
      <div className="relative min-h-0 flex-1 font-mono text-sm leading-6">
        <pre ref={realceRef} aria-hidden="true" className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words p-5 font-mono text-sm leading-6 text-slate-100"><code dangerouslySetInnerHTML={{ __html: destacarMarkdown(value) + '\n' }} /></pre>
        <textarea
          ref={editorRef}
          aria-label="Conteúdo do Rascunho local"
          spellCheck="false"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={sincronizarScroll}
          disabled={disabled}
          className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-5 font-mono text-sm leading-6 text-transparent caret-white outline-none selection:bg-indigo-500/40"
        />
      </div>
      <footer className="border-t border-slate-800 px-4 py-2 text-xs text-slate-500">Selecione qualquer trecho para criar uma cópia independente associada a uma cena.</footer>
    </section>
  );
});

const EditorMarkdown = forwardRef(function EditorMarkdown(props, ref) {
  if (props.rascunho) return <EditorRascunhoMarkdown {...props} ref={ref} />;
  if (props.documento) return <EditorDocumentoMarkdown {...props} ref={ref} />;
  return <EditorTextoLegado {...props} />;
});

export default EditorMarkdown;
