'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  alterarDestinoEscolha,
  alterarTextoEscolha,
  criarEscolha as criarEscolhaApi,
  excluirEscolha as excluirEscolhaApi,
  listarEscolhasPorCena,
  reordenarEscolhas as reordenarEscolhasApi,
} from '../services/escolha';

function mensagemErro(error, fallback) {
  return error.data?.message || error.message || fallback;
}

export default function EditorEscolhasObra({
  cena,
  capitulos,
  iniciarCriacao = 0,
  onAtualizarNavegador,
}) {
  const [escolhas, setEscolhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState('');
  const [texto, setTexto] = useState('');
  const [capituloDestinoId, setCapituloDestinoId] = useState('');
  const [cenaDestinoId, setCenaDestinoId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [processandoId, setProcessandoId] = useState('');
  const [reordenando, setReordenando] = useState(false);
  const requisicaoRef = useRef(0);
  const tokenInicialRef = useRef(0);

  const todasAsCenas = useMemo(() => capitulos.flatMap((capitulo) => (
    (capitulo.children || []).map((item) => ({ ...item, capituloTitulo: capitulo.titulo || capitulo.slug }))
  )), [capitulos]);
  const cenasPorCapitulo = useMemo(() => (
    Object.fromEntries(capitulos.map((capitulo) => [capitulo.id, capitulo.children || []]))
  ), [capitulos]);
  const cenaDestino = todasAsCenas.find((item) => item.id === cenaDestinoId) || null;
  const listaCenasDestino = cenasPorCapitulo[capituloDestinoId] || [];

  const carregarEscolhas = useCallback(async (cenaId, limpar = true) => {
    const requisicao = ++requisicaoRef.current;
    if (limpar) {
      setCarregando(true);
      setEscolhas([]);
      setErro('');
    }
    try {
      const resposta = await listarEscolhasPorCena(cenaId);
      if (!resposta.success) throw new Error(resposta.message || 'Não foi possível carregar as escolhas.');
      if (requisicao === requisicaoRef.current) setEscolhas(resposta.data || []);
    } catch (error) {
      if (requisicao === requisicaoRef.current) setErro(mensagemErro(error, 'Não foi possível carregar as escolhas.'));
    } finally {
      if (requisicao === requisicaoRef.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!cena?.id) return undefined;
    carregarEscolhas(cena.id);
    return () => { requisicaoRef.current += 1; };
  }, [cena?.id, carregarEscolhas]);

  function abrirNovaEscolha() {
    const padrao = todasAsCenas.find((item) => item.cena_padrao === true);
    if (!padrao) {
      setErro('A Cena Padrão desta obra não foi encontrada. Atualize a árvore ou verifique a estrutura da obra.');
      return;
    }
    setEditandoId('');
    setTexto('');
    setCapituloDestinoId(padrao.capitulo_id);
    setCenaDestinoId(padrao.id);
    setErro('');
    setFormAberto(true);
  }

  useEffect(() => {
    if (iniciarCriacao > tokenInicialRef.current) {
      tokenInicialRef.current = iniciarCriacao;
      abrirNovaEscolha();
    }
  // O token abre o formulário somente quando a ação Adicionar → Escolha é solicitada.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iniciarCriacao, todasAsCenas]);

  function abrirEdicao(escolha) {
    const destino = todasAsCenas.find((item) => item.id === escolha.cena_destino_id);
    if (!destino) {
      setErro('A cena de destino desta escolha não foi encontrada na estrutura da obra.');
      return;
    }
    setEditandoId(escolha.id);
    setTexto(escolha.texto || '');
    setCapituloDestinoId(destino.capitulo_id);
    setCenaDestinoId(destino.id);
    setErro('');
    setFormAberto(true);
  }

  function cancelarFormulario() {
    if (salvando) return;
    setFormAberto(false);
    setEditandoId('');
    setTexto('');
    setCapituloDestinoId('');
    setCenaDestinoId('');
    setErro('');
  }

  async function salvarEscolha(event) {
    event.preventDefault();
    if (!texto.trim()) { setErro('Informe o texto da escolha.'); return; }
    if (!capituloDestinoId || !cenaDestinoId) { setErro('Selecione um destino.'); return; }

    const cenaOrigemId = cena.id;
    setSalvando(true);
    setErro('');
    try {
      if (editandoId) {
        const atual = escolhas.find((item) => item.id === editandoId);
        if (!atual) throw new Error('A escolha que está sendo editada não foi encontrada.');
        if (atual.texto !== texto.trim()) {
          const respostaTexto = await alterarTextoEscolha(editandoId, texto.trim());
          if (!respostaTexto.success) throw new Error(respostaTexto.message || 'Não foi possível alterar o texto da escolha.');
        }
        if (atual.cena_destino_id !== cenaDestinoId) {
          const respostaDestino = await alterarDestinoEscolha(editandoId, cenaDestinoId);
          if (!respostaDestino.success) throw new Error(respostaDestino.message || 'Não foi possível alterar o destino da escolha.');
        }
      } else {
        const ordem = escolhas.reduce((maior, item) => Math.max(maior, Number(item.ordem_exibicao) || 0), 0) + 1;
        const resposta = await criarEscolhaApi({ cena_origem_id: cenaOrigemId, cena_destino_id: cenaDestinoId, texto: texto.trim(), ordem_exibicao: ordem });
        if (!resposta.success) throw new Error(resposta.message || 'Não foi possível criar a escolha.');
      }
      cancelarFormulario();
      if (cena.id === cenaOrigemId) await carregarEscolhas(cenaOrigemId);
      await onAtualizarNavegador?.(cenaOrigemId);
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível salvar a escolha.'));
    } finally {
      setSalvando(false);
    }
  }

  async function excluirEscolha(escolha) {
    if (!window.confirm(`Deseja realmente excluir a escolha “${escolha.texto}”?`)) return;
    const cenaOrigemId = cena.id;
    setProcessandoId(escolha.id);
    setErro('');
    try {
      const resposta = await excluirEscolhaApi(escolha.id);
      if (!resposta.success) throw new Error(resposta.message || 'Não foi possível excluir a escolha.');
      if (editandoId === escolha.id) cancelarFormulario();
      if (cena.id === cenaOrigemId) await carregarEscolhas(cenaOrigemId);
      await onAtualizarNavegador?.(cenaOrigemId);
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível excluir a escolha.'));
    } finally {
      setProcessandoId('');
    }
  }

  async function moverEscolha(indice, direcao) {
    const destinoIndice = indice + direcao;
    if (destinoIndice < 0 || destinoIndice >= escolhas.length || reordenando) return;
    const novaOrdem = [...escolhas];
    [novaOrdem[indice], novaOrdem[destinoIndice]] = [novaOrdem[destinoIndice], novaOrdem[indice]];
    const cenaOrigemId = cena.id;
    setReordenando(true);
    setErro('');
    try {
      const resposta = await reordenarEscolhasApi(cenaOrigemId, novaOrdem.map((item) => ({ id: item.id })));
      if (!resposta.success) throw new Error(resposta.message || 'Não foi possível reordenar as escolhas.');
      if (cena.id === cenaOrigemId) setEscolhas(resposta.data || []);
      await onAtualizarNavegador?.(cenaOrigemId);
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível reordenar as escolhas.'));
    } finally {
      setReordenando(false);
    }
  }

  if (!cena) return <div className="p-6 text-sm text-amber-200">Selecione uma cena no Navegador para administrar escolhas.</div>;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-950">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/70 px-4 py-3">
        <div className="min-w-0"><h2 className="text-sm font-semibold">Escolhas da cena</h2><p className="truncate text-xs text-slate-400">{cena.titulo || cena.slug}</p></div>
        {!formAberto && <button type="button" onClick={abrirNovaEscolha} className="rounded bg-indigo-600 px-3 py-2 text-xs font-semibold hover:bg-indigo-500">Nova escolha</button>}
      </header>
      {erro && <p role="alert" className="mx-4 mt-3 rounded border border-rose-900 bg-rose-950/50 p-2 text-xs text-rose-200">{erro}</p>}
      <div className="space-y-4 p-4">
        {formAberto && <form onSubmit={salvarEscolha} className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{editandoId ? 'Editar escolha' : 'Nova escolha'}</h3><button type="button" onClick={cancelarFormulario} disabled={salvando} className="text-xs text-slate-400 hover:text-white">Cancelar</button></div>
          <label className="block text-xs text-slate-300">Texto da escolha<input autoFocus value={texto} onChange={(event) => setTexto(event.target.value)} disabled={salvando} placeholder="Ex.: Seguir pela esquerda" className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-slate-300">Capítulo de destino<select value={capituloDestinoId} onChange={(event) => { setCapituloDestinoId(event.target.value); setCenaDestinoId(''); }} disabled={salvando} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"><option value="">Selecione o capítulo</option>{capitulos.map((capitulo, indice) => <option key={capitulo.id} value={capitulo.id}>Capítulo {indice + 1} · {capitulo.titulo || capitulo.slug}</option>)}</select></label>
            <label className="block text-xs text-slate-300">Cena de destino<select value={cenaDestinoId} onChange={(event) => setCenaDestinoId(event.target.value)} disabled={salvando || !capituloDestinoId} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"><option value="">Selecione a cena</option>{listaCenasDestino.map((item) => <option key={item.id} value={item.id}>{item.cena_padrao ? 'Cena Padrão · ' : `Cena ${item.ordem_exibicao} · `}{item.titulo || item.slug}</option>)}</select></label>
          </div>
          {cenaDestino && <p className={`rounded border p-2 text-xs ${cenaDestino.cena_padrao ? 'border-amber-800 bg-amber-950/40 text-amber-200' : 'border-emerald-800 bg-emerald-950/30 text-emerald-200'}`} role="status">{cenaDestino.cena_padrao ? 'Destino pendente' : 'Destino definido'} · {cenaDestino.capituloTitulo} / {cenaDestino.titulo || cenaDestino.slug}</p>}
          <button type="submit" disabled={salvando} className="rounded bg-indigo-600 px-3 py-2 text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50">{salvando ? 'Salvando…' : editandoId ? 'Salvar alterações' : 'Criar escolha'}</button>
        </form>}

        {carregando ? <p className="text-xs text-slate-400">Carregando escolhas…</p> : escolhas.length === 0 ? <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center"><p className="text-sm text-slate-300">Esta cena ainda não possui escolhas.</p><p className="mt-1 text-xs text-slate-500">Adicione uma escolha e defina o destino agora ou deixe-o pendente.</p></div> : <ol className="space-y-2">{escolhas.map((escolha, indice) => {
          const destino = todasAsCenas.find((item) => item.id === escolha.cena_destino_id);
          return <li key={escolha.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <span className="w-6 shrink-0 text-xs text-slate-500">{indice + 1}.</span><div className="min-w-0 flex-1"><p className="break-words text-sm text-slate-100">{escolha.texto}</p><p className="mt-1 truncate text-xs text-slate-400">→ {destino ? `${destino.capituloTitulo} / ${destino.titulo || destino.slug}` : 'Destino não encontrado'}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] ${destino?.cena_padrao ? 'bg-amber-950 text-amber-200' : destino ? 'bg-emerald-950 text-emerald-200' : 'bg-rose-950 text-rose-200'}`}>{destino?.cena_padrao ? 'Destino pendente' : destino ? 'Destino definido' : 'Destino indisponível'}</span></div>
            <div className="flex items-center gap-1"><button type="button" title="Mover para cima" aria-label="Mover escolha para cima" disabled={indice === 0 || reordenando} onClick={() => moverEscolha(indice, -1)} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:opacity-30">↑</button><button type="button" title="Mover para baixo" aria-label="Mover escolha para baixo" disabled={indice === escolhas.length - 1 || reordenando} onClick={() => moverEscolha(indice, 1)} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:opacity-30">↓</button><button type="button" onClick={() => abrirEdicao(escolha)} disabled={reordenando || processandoId === escolha.id} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:opacity-50">Editar</button><button type="button" onClick={() => excluirEscolha(escolha)} disabled={reordenando || processandoId === escolha.id} className="rounded border border-rose-900 px-2 py-1 text-xs text-rose-300 hover:bg-rose-950 disabled:opacity-50">{processandoId === escolha.id ? 'Excluindo…' : 'Excluir'}</button></div>
          </li>;
        })}</ol>}
      </div>
    </div>
  );
}
