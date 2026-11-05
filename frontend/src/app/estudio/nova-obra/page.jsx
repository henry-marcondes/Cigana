'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { estaAutenticado } from '../../../services/autenticacao';
import {
  buscarSolicitacaoInclusaoObra, criarObraDaSolicitacao,
  listarMinhasSolicitacoesInclusaoObras,
} from '../../../services/solicitacaoInclusaoObra';

function NovaObraConteudo() {
  const router = useRouter();
  const params = useSearchParams();
  const solicitacaoId = params.get('solicitacao_id');
  const [solicitacao, setSolicitacao] = useState(null);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [conflitoSlug, setConflitoSlug] = useState(false);

  useEffect(() => {
    if (!estaAutenticado()) { router.push('/login'); return; }
    async function carregar() {
      try {
        if (solicitacaoId) {
          const resultado = await buscarSolicitacaoInclusaoObra(solicitacaoId);
          setSolicitacao(resultado.data);
        } else {
          const resultado = await listarMinhasSolicitacoesInclusaoObras();
          setSolicitacoes(resultado.data || []);
        }
      } catch (e) { setErro(e.message || 'Não foi possível carregar a solicitação.'); }
      finally { setCarregando(false); }
    }
    carregar();
  }, [router, solicitacaoId]);

  async function criar() {
    if (!solicitacao) return;
    setErro(''); setConflitoSlug(false); setSalvando(true);
    try {
      const resultado = await criarObraDaSolicitacao(solicitacao.id);
      const livro = resultado.data?.livro;
      if (!livro?.id) throw new Error('A obra não foi retornada pela API.');
      router.push(`/estudio/obras/${livro.id}`);
    } catch (e) {
      setErro(e.message || 'Não foi possível criar a obra.');
      setConflitoSlug(e.data?.errors?.some((item) => item.field === 'slug' && item.code === 'SLUG_JA_UTILIZADO') || false);
    }
    finally { setSalvando(false); }
  }

  if (carregando) return <main className="p-6">Carregando solicitação…</main>;
  if (erro && !solicitacaoId) return <main className="mx-auto max-w-3xl p-6"><p role="alert" className="rounded bg-red-50 p-4 text-red-800">{erro}</p></main>;

  return <main className="min-h-screen bg-gray-100 p-5"><div className="mx-auto max-w-3xl">
    <Link href="/estudio" className="text-sm underline">← Voltar ao Estúdio</Link>
    <h1 className="mt-5 text-2xl font-bold">Criar nova obra</h1>
    {erro && <div role="alert" className="my-4 rounded bg-red-50 p-3 text-red-800"><p>{erro}</p>{conflitoSlug && solicitacao && <p className="mt-2">A aprovação continua disponível. Corrija a proposta original para que ela volte à análise: <Link className="font-semibold underline" href={`/dashboard/autor/solicitacoes-obras?corrigir_slug=${solicitacao.id}`}>corrigir o slug da solicitação</Link>.</p>}</div>}
    {!solicitacaoId && <section className="mt-5 space-y-3">
      <p className="rounded bg-white p-4">Para iniciar outra obra, envie uma solicitação de inclusão e aguarde a aprovação administrativa.</p>
      <Link href="/dashboard/autor/solicitacoes-obras" className="inline-block rounded bg-gray-900 px-4 py-2 text-white">Solicitações de inclusão</Link>
      {solicitacoes.map((s) => <article key={s.id} className="rounded bg-white p-4"><div className="flex justify-between gap-3"><strong>{s.titulo}</strong><span>{s.status}</span></div>
        {s.motivo_rejeicao && <p className="mt-2 text-sm text-red-800">Motivo: {s.motivo_rejeicao}</p>}
        {s.status === 'APROVADA' && <Link href={`/estudio/nova-obra?solicitacao_id=${s.id}`} className="mt-3 inline-block underline">Continuar criação aprovada</Link>}
        {s.status === 'UTILIZADA' && <p className="mt-2 text-sm">Esta aprovação já foi utilizada.</p>}
      </article>)}
    </section>}
    {solicitacaoId && solicitacao && <section className="mt-5 rounded bg-white p-5 shadow">
      {solicitacao.status !== 'APROVADA' && <div className="rounded bg-amber-50 p-4 text-amber-900">Esta solicitação está como <strong>{solicitacao.status}</strong> e não autoriza criar uma obra.{solicitacao.motivo_rejeicao && <p className="mt-2">Motivo: {solicitacao.motivo_rejeicao}</p>}{solicitacao.status === 'UTILIZADA' && solicitacao.livro_id && <Link className="mt-2 inline-block underline" href={`/estudio/obras/${solicitacao.livro_id}`}>Abrir obra criada</Link>}</div>}
      <p className="mb-4 text-gray-600">A proposta aprovada preenche os dados da obra. Estes dados correspondem ao que foi aprovado. A obra será criada em rascunho; a publicação depende da revisão editorial.</p>
      <form onSubmit={(event) => { event.preventDefault(); criar(); }} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1">Título<input readOnly value={solicitacao.titulo} className="rounded border bg-gray-50 p-2" /></label>
        <label className="grid gap-1">Slug<input readOnly value={solicitacao.slug} className="rounded border bg-gray-50 p-2" /></label>
        <label className="grid gap-1 md:col-span-2">Resumo<textarea readOnly value={solicitacao.resumo || ''} rows={4} className="rounded border bg-gray-50 p-2" /></label>
        <label className="grid gap-1">Categoria<input readOnly value={solicitacao.categoria_nome || solicitacao.categoria_id} className="rounded border bg-gray-50 p-2" /></label>
        <label className="grid gap-1">Classificação indicativa<input readOnly value={solicitacao.classificacao_indicativa_nome || solicitacao.classificacao_indicativa_id} className="rounded border bg-gray-50 p-2" /></label>
        <label className="grid gap-1">Idioma<input readOnly value={solicitacao.idioma_nome || solicitacao.idioma_id} className="rounded border bg-gray-50 p-2" /></label>
        {solicitacao.status === 'APROVADA' && <button type="submit" disabled={salvando} className="mt-2 rounded bg-gray-900 px-5 py-2 text-white disabled:opacity-50">{salvando ? 'Criando obra…' : 'Criar obra em rascunho'}</button>}
      </form>
    </section>}
  </div></main>;
}

export default function NovaObra() {
  return <Suspense fallback={<main className="p-6">Carregando…</main>}><NovaObraConteudo /></Suspense>;
}
