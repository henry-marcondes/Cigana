'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  alterarNavegacaoEstrutural,
  criarNavegacaoEstrutural,
  excluirNavegacaoEstrutural,
  listarNavegacoesEstruturaisPorCena,
  reordenarNavegacoesEstruturais,
} from '../services/navegacaoEstrutural';

function mensagemErro(error, fallback) {
  return error.data?.message || error.message || fallback;
}

export default function EditorNavegacaoEstrutural({ cena, capitulos }) {
  const [botoes, setBotoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState('');
  const [rotulo, setRotulo] = useState('');
  const [capituloDestinoId, setCapituloDestinoId] = useState('');
  const [cenaDestinoId, setCenaDestinoId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [processandoId, setProcessandoId] = useState('');
  const [reordenando, setReordenando] = useState(false);

  const capitulosDisponiveis = useMemo(() => capitulos.filter((capitulo) => (
    (capitulo.children || []).some((item) => item.cena_padrao !== true)
  )), [capitulos]);
  const cenasPorCapitulo = useMemo(() => Object.fromEntries(
    capitulosDisponiveis.map((capitulo) => [
      capitulo.id,
      (capitulo.children || []).filter((item) => item.cena_padrao !== true),
    ])
  ), [capitulosDisponiveis]);
  const todasAsCenas = useMemo(() => capitulosDisponiveis.flatMap((capitulo) => (
    (cenasPorCapitulo[capitulo.id] || []).map((item) => ({
      ...item,
      capituloTitulo: capitulo.titulo || capitulo.slug,
    }))
  )), [capitulosDisponiveis, cenasPorCapitulo]);
  const listaCenasDestino = cenasPorCapitulo[capituloDestinoId] || [];

  const carregar = useCallback(async () => {
    if (!cena?.id) return;
    setCarregando(true);
    setErro('');
    try {
      const resposta = await listarNavegacoesEstruturaisPorCena(cena.id);
      setBotoes(resposta.data || []);
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível carregar a navegação estrutural.'));
    } finally {
      setCarregando(false);
    }
  }, [cena?.id]);

  useEffect(() => {
    setBotoes([]);
    setFormAberto(false);
    setEditandoId('');
    carregar();
  }, [carregar]);

  function abrirNovo() {
    setEditandoId('');
    setRotulo('');
    setCapituloDestinoId('');
    setCenaDestinoId('');
    setErro('');
    setFormAberto(true);
  }

  function abrirEdicao(botao) {
    setEditandoId(botao.id);
    setRotulo(botao.rotulo || '');
    setCapituloDestinoId(botao.capitulo_destino_id || '');
    setCenaDestinoId(botao.cena_destino_id || '');
    setErro('');
    setFormAberto(true);
  }

  function cancelarFormulario() {
    setFormAberto(false);
    setEditandoId('');
    setRotulo('');
    setCapituloDestinoId('');
    setCenaDestinoId('');
  }

  async function salvar(event) {
    event.preventDefault();
    if (!rotulo.trim()) { setErro('Informe o rótulo do botão.'); return; }
    if (!capituloDestinoId || !cenaDestinoId) { setErro('Selecione o capítulo e a cena de destino.'); return; }

    setSalvando(true);
    setErro('');
    try {
      if (editandoId) {
        await alterarNavegacaoEstrutural(editandoId, {
          cena_destino_id: cenaDestinoId,
          rotulo: rotulo.trim(),
        });
      } else {
        const ordem = botoes.reduce((maior, item) => Math.max(maior, Number(item.ordem_exibicao) || 0), 0) + 1;
        await criarNavegacaoEstrutural({
          cena_origem_id: cena.id,
          cena_destino_id: cenaDestinoId,
          rotulo: rotulo.trim(),
          ordem_exibicao: ordem,
        });
      }
      cancelarFormulario();
      await carregar();
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível salvar o botão estrutural.'));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(botao) {
    if (!window.confirm(`Deseja realmente remover o botão “${botao.rotulo}”?`)) return;
    setProcessandoId(botao.id);
    setErro('');
    try {
      await excluirNavegacaoEstrutural(botao.id);
      if (editandoId === botao.id) cancelarFormulario();
      await carregar();
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível remover o botão estrutural.'));
    } finally {
      setProcessandoId('');
    }
  }

  async function mover(indice, direcao) {
    const destinoIndice = indice + direcao;
    if (destinoIndice < 0 || destinoIndice >= botoes.length || reordenando) return;
    const novaOrdem = [...botoes];
    [novaOrdem[indice], novaOrdem[destinoIndice]] = [novaOrdem[destinoIndice], novaOrdem[indice]];
    setReordenando(true);
    setErro('');
    try {
      const resposta = await reordenarNavegacoesEstruturais(cena.id, novaOrdem.map((item) => ({ id: item.id })));
      setBotoes(resposta.data || []);
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível reordenar os botões.'));
    } finally {
      setReordenando(false);
    }
  }

  if (!cena) return <div className="p-6 text-sm text-amber-200">Selecione uma cena no Navegador para configurar a navegação estrutural.</div>;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-950">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/70 px-4 py-3">
        <div className="min-w-0"><h2 className="text-sm font-semibold">Navegação estrutural</h2><p className="truncate text-xs text-slate-400">{cena.titulo || cena.slug}</p></div>
        {!formAberto && <button type="button" onClick={abrirNovo} className="rounded bg-indigo-600 px-3 py-2 text-xs font-semibold hover:bg-indigo-500">Adicionar botão</button>}
      </header>
      {erro && <p role="alert" className="mx-4 mt-3 rounded border border-rose-900 bg-rose-950/50 p-2 text-xs text-rose-200">{erro}</p>}
      <div className="space-y-4 p-4">
        {formAberto && <form onSubmit={salvar} className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{editandoId ? 'Editar botão' : 'Novo botão'}</h3><button type="button" onClick={cancelarFormulario} disabled={salvando} className="text-xs text-slate-400 hover:text-white">Cancelar</button></div>
          <label className="block text-xs text-slate-300">Rótulo<input autoFocus value={rotulo} onChange={(event) => setRotulo(event.target.value)} disabled={salvando} placeholder="Ex.: Próxima página" className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-slate-300">Capítulo de destino<select value={capituloDestinoId} onChange={(event) => { setCapituloDestinoId(event.target.value); setCenaDestinoId(''); }} disabled={salvando} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"><option value="">Selecione o capítulo</option>{capitulosDisponiveis.map((capitulo, indice) => <option key={capitulo.id} value={capitulo.id}>Capítulo {indice + 1} · {capitulo.titulo || capitulo.slug}</option>)}</select></label>
            <label className="block text-xs text-slate-300">Cena de destino<select value={cenaDestinoId} onChange={(event) => setCenaDestinoId(event.target.value)} disabled={salvando || !capituloDestinoId} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"><option value="">Selecione a cena</option>{cenaDestinoId && !listaCenasDestino.some((item) => item.id === cenaDestinoId) && <option value={cenaDestinoId} disabled>Destino indisponível — escolha outro</option>}{listaCenasDestino.map((item) => <option key={item.id} value={item.id}>Cena {item.ordem_exibicao} · {item.titulo || item.slug}</option>)}</select></label>
          </div>
          {cenaDestinoId && <p className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-slate-300" role="status">Destino selecionado: {todasAsCenas.find((item) => item.id === cenaDestinoId) ? `${todasAsCenas.find((item) => item.id === cenaDestinoId).capituloTitulo} / ${todasAsCenas.find((item) => item.id === cenaDestinoId).titulo || todasAsCenas.find((item) => item.id === cenaDestinoId).slug}` : 'indisponível; selecione um novo destino'}</p>}
          <button type="submit" disabled={salvando} className="rounded bg-indigo-600 px-3 py-2 text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50">{salvando ? 'Salvando…' : editandoId ? 'Salvar alterações' : 'Adicionar botão'}</button>
        </form>}

        {carregando ? <p className="text-xs text-slate-400">Carregando navegação estrutural…</p> : botoes.length === 0 ? <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center"><p className="text-sm text-slate-300">Esta cena ainda não possui botões estruturais.</p><p className="mt-1 text-xs text-slate-500">Os destinos serão definidos individualmente e não dependem da ordem editorial das cenas.</p></div> : <ol className="space-y-2">{botoes.map((botao, indice) => {
          const destino = todasAsCenas.find((item) => item.id === botao.cena_destino_id);
          const disponivel = botao.destino_disponivel !== false && Boolean(destino);
          return <li key={botao.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <span className="w-6 shrink-0 text-xs text-slate-500">{indice + 1}.</span><div className="min-w-0 flex-1"><p className="break-words text-sm text-slate-100">{botao.rotulo}</p><p className="mt-1 truncate text-xs text-slate-400">→ {destino ? `${destino.capituloTitulo} / ${destino.titulo || destino.slug}` : botao.capitulo_destino_titulo ? `${botao.capitulo_destino_titulo} / ${botao.cena_destino_titulo || botao.cena_destino_slug}` : 'Destino indisponível'}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] ${disponivel ? 'bg-emerald-950 text-emerald-200' : 'bg-rose-950 text-rose-200'}`}>{disponivel ? 'Destino definido' : 'Destino indisponível'}</span></div>
            <div className="flex items-center gap-1"><button type="button" title="Mover para cima" aria-label="Mover botão para cima" disabled={indice === 0 || reordenando || Boolean(processandoId)} onClick={() => mover(indice, -1)} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:opacity-30">↑</button><button type="button" title="Mover para baixo" aria-label="Mover botão para baixo" disabled={indice === botoes.length - 1 || reordenando || Boolean(processandoId)} onClick={() => mover(indice, 1)} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:opacity-30">↓</button><button type="button" onClick={() => abrirEdicao(botao)} disabled={reordenando || processandoId === botao.id} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:opacity-50">Editar</button><button type="button" onClick={() => excluir(botao)} disabled={reordenando || processandoId === botao.id} className="rounded border border-rose-900 px-2 py-1 text-xs text-rose-300 hover:bg-rose-950 disabled:opacity-50">{processandoId === botao.id ? 'Removendo…' : 'Remover'}</button></div>
          </li>;
        })}</ol>}
      </div>
    </div>
  );
}
