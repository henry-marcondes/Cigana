'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { estaAutenticado, obterUsuario } from '../../../../services/autenticacao';
import { usuarioTemPermissao } from '../../../../services/permissoesEfetivas';
import {
  aprovarSolicitacaoInclusaoObra, buscarSolicitacaoInclusaoObraGestao,
  listarSolicitacoesInclusaoObrasGestao, rejeitarSolicitacaoInclusaoObra,
} from '../../../../services/solicitacaoInclusaoObra';

export default function GestaoSolicitacoesInclusao() {
  const router = useRouter();
  const [permitido, setPermitido] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [filtro, setFiltro] = useState('PENDENTE');
  const [erro, setErro] = useState('');
  const [erroSlug, setErroSlug] = useState('');
  const [carregando, setCarregando] = useState(true);

  async function carregarLista(status = filtro) {
    setErro('');
    try {
      const resposta = await listarSolicitacoesInclusaoObrasGestao(status);
      setSolicitacoes(resposta.data || []);
      setSelecionada(null);
    } catch (e) { setErro(e.message || 'Não foi possível carregar as solicitações.'); }
    finally { setCarregando(false); }
  }

  useEffect(() => {
    if (!estaAutenticado()) { router.push('/login'); return; }
    const usuario = obterUsuario();
    usuarioTemPermissao(usuario?.id, 'obra.aprovar').then((ok) => {
      setPermitido(ok);
      if (ok) carregarLista('PENDENTE');
      else setCarregando(false);
    }).catch(() => { setPermitido(false); setCarregando(false); });
  }, [router]);

  async function abrir(id) {
    setErro('');
    try { const resposta = await buscarSolicitacaoInclusaoObraGestao(id); setSelecionada(resposta.data); }
    catch (e) { setErro(e.message || 'Não foi possível abrir a solicitação.'); }
  }

  async function decidir(aprovada) {
    if (!selecionada) return;
    setErro(''); setErroSlug('');
    let motivo = null;
    if (!aprovada) {
      motivo = window.prompt('Informe o motivo da rejeição:');
      if (!motivo?.trim()) { if (motivo !== null) setErro('O motivo da rejeição é obrigatório.'); return; }
    }
    try {
      if (aprovada) await aprovarSolicitacaoInclusaoObra(selecionada.id);
      else await rejeitarSolicitacaoInclusaoObra(selecionada.id, motivo.trim());
      await carregarLista(filtro);
    } catch (e) {
      setErro(e.message || 'Não foi possível registrar a decisão.');
      setErroSlug(e.data?.errors?.find((item) => item.field === 'slug')?.message || '');
    }
  }

  if (carregando) return <main className="p-6">Carregando…</main>;
  if (!permitido) return <main className="p-6"><p role="alert">Você não possui a permissão obra.aprovar para acessar esta fila.</p></main>;

  return <main className="min-h-screen bg-gray-100 p-5"><div className="mx-auto max-w-6xl">
    <Link href="/admin" className="text-sm underline">← Administração</Link>
    <h1 className="mt-5 text-2xl font-bold">Solicitações de inclusão de obras</h1>
    <p className="mt-1 text-gray-600">Fila administrativa independente das solicitações para atuar como Autor e da revisão editorial.</p>
    {erro && <p role="alert" className="my-4 rounded bg-red-50 p-3 text-red-800">{erro}</p>}
    <label className="my-4 inline-flex items-center gap-2">Exibir<select value={filtro} onChange={(e) => { setFiltro(e.target.value); carregarLista(e.target.value); }} className="rounded border p-2"><option value="PENDENTE">Pendentes</option><option value="">Todas</option><option value="APROVADA">Aprovadas</option><option value="RECUSADA">Recusadas</option><option value="UTILIZADA">Utilizadas</option></select></label>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <section className="space-y-3">{solicitacoes.map((s) => <button key={s.id} onClick={() => abrir(s.id)} className="block w-full rounded bg-white p-4 text-left shadow hover:bg-gray-50"><strong>{s.titulo}</strong><span className="ml-2 text-sm">{s.status}</span><p className="mt-1 text-sm text-gray-600">Autor: {s.nome_publico}</p><p className="text-xs text-gray-500">{new Date(s.criado_em).toLocaleString('pt-BR')}</p></button>)}{!solicitacoes.length && <p className="rounded bg-white p-4">Nenhuma solicitação encontrada.</p>}</section>
      {selecionada && <article className="rounded bg-white p-5 shadow"><div className="flex justify-between"><h2 className="text-xl font-semibold">{selecionada.titulo}</h2><span>{selecionada.status}</span></div><dl className="mt-4 grid gap-3">{[['Autor', selecionada.nome_publico], ['ID do Autor', selecionada.autor_id], ['Título', selecionada.titulo], ['Slug', selecionada.slug], ['Resumo', selecionada.resumo || '—'], ['Categoria', selecionada.categoria_nome || selecionada.categoria_id], ['Classificação indicativa', selecionada.classificacao_indicativa_nome || selecionada.classificacao_indicativa_id], ['Idioma', selecionada.idioma_nome || selecionada.idioma_id], ['Motivo da rejeição', selecionada.motivo_rejeicao || '—']].map(([k, v]) => <div key={k}><dt className="text-sm text-gray-500">{k}</dt><dd className="break-words">{v}</dd>{k === 'Slug' && erroSlug && <dd className="mt-1 text-sm text-red-700">{erroSlug} A solicitação continua pendente; rejeite com um motivo para permitir a correção pelo Autor.</dd>}</div>)}</dl>
        {selecionada.status === 'PENDENTE' && <div className="mt-5 flex gap-2"><button onClick={() => decidir(true)} className="rounded bg-green-700 px-4 py-2 text-white">Aprovar inclusão</button><button onClick={() => decidir(false)} className="rounded bg-red-700 px-4 py-2 text-white">Rejeitar</button></div>}
        <h3 className="mt-7 font-semibold">Histórico</h3><ol className="mt-2 space-y-2">{(selecionada.historico || []).map((h) => <li key={h.id} className="rounded border p-3"><strong>{h.evento}</strong><span className="ml-2 text-sm text-gray-500">{new Date(h.criado_em).toLocaleString('pt-BR')}</span>{h.motivo && <p className="mt-1">{h.motivo}</p>}<p className="mt-1 text-xs text-gray-500">Responsável: {h.realizado_por}</p><details className="mt-2"><summary className="cursor-pointer text-sm underline">Ver proposta registrada neste evento</summary><pre className="mt-2 overflow-auto rounded bg-gray-50 p-2 text-xs">{JSON.stringify(h.dados_proposta, null, 2)}</pre></details></li>)}</ol>
      </article>}
    </div>
  </div></main>;
}
