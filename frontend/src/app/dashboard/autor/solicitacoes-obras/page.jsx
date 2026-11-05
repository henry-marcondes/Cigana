'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../../services/api';
import { estaAutenticado } from '../../../../services/autenticacao';
import {
  criarSolicitacaoInclusaoObra, editarSolicitacaoInclusaoObra,
  listarMinhasSolicitacoesInclusaoObras, reenviarSolicitacaoInclusaoObra,
} from '../../../../services/solicitacaoInclusaoObra';

const vazio = { titulo: '', slug: '', resumo: '', categoria_id: '', classificacao_indicativa_id: '', idioma_id: '' };

export default function SolicitacoesObrasAutor() {
  const router = useRouter();
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [idiomas, setIdiomas] = useState([]);
  const [formulario, setFormulario] = useState(vazio);
  const [editando, setEditando] = useState('');
  const [erro, setErro] = useState('');
  const [erroSlug, setErroSlug] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const [lista, cats, classifs, langs] = await Promise.all([
      listarMinhasSolicitacoesInclusaoObras(), apiFetch('/api/categorias'),
      apiFetch('/api/classificacoes-indicativas'), apiFetch('/api/idiomas'),
    ]);
    const items = lista.data || [];
    setSolicitacoes(items); setCategorias(cats.data || []);
    setClassificacoes(classifs.data || []); setIdiomas(langs.data || []);
    return items;
  }

  useEffect(() => {
    if (!estaAutenticado()) { router.push('/login'); return; }
    carregar().then((items) => {
      const corrigirId = new URLSearchParams(window.location.search).get('corrigir_slug');
      const item = items.find((s) => s.id === corrigirId && s.status === 'APROVADA' && !s.livro_id);
      if (item) editar(item);
    }).catch((e) => setErro(e.message || 'Não foi possível carregar as solicitações.'));
  }, [router]);

  function alterar(event) {
    const { name, value } = event.target;
    if (name === 'slug' || name === 'titulo') setErroSlug('');
    setFormulario((atual) => ({ ...atual, [name]: value, ...(name === 'titulo' ? { slug: value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') } : {}) }));
  }

  async function salvar(event) {
    event.preventDefault(); setErro(''); setSucesso(''); setSalvando(true);
    try {
      if (editando) {
        const resposta = await editarSolicitacaoInclusaoObra(editando, formulario);
        if (resposta.data?.status === 'PENDENTE') {
          setSucesso('A solicitação corrigida voltou para análise administrativa.');
        } else {
          await reenviarSolicitacaoInclusaoObra(editando);
          setSucesso('A mesma solicitação foi reenviada para análise.');
        }
      } else {
        await criarSolicitacaoInclusaoObra(formulario);
        setSucesso('Solicitação enviada para análise administrativa.');
      }
      setFormulario(vazio); setEditando(''); await carregar();
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar a solicitação.');
      setErroSlug(e.data?.errors?.find((item) => item.field === 'slug')?.message || '');
    }
    finally { setSalvando(false); }
  }

  function editar(s) {
    setEditando(s.id); setErroSlug('');
    setFormulario({ titulo: s.titulo, slug: s.slug, resumo: s.resumo || '', categoria_id: s.categoria_id, classificacao_indicativa_id: s.classificacao_indicativa_id, idioma_id: s.idioma_id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <main className="min-h-screen bg-gray-100 p-5"><div className="mx-auto max-w-4xl">
    <Link href="/dashboard" className="text-sm underline">← Voltar ao dashboard</Link>
    <h1 className="mt-5 text-2xl font-bold">Solicitações de inclusão de obras</h1>
    <p className="mt-2 text-gray-600">Cada aprovação permite criar uma obra em rascunho uma única vez. A publicação continua sujeita à revisão editorial.</p>
    {erro && <p role="alert" className="my-4 rounded bg-red-50 p-3 text-red-800">{erro}</p>}
    {sucesso && <p role="status" className="my-4 rounded bg-green-50 p-3 text-green-800">{sucesso}</p>}
    <section className="my-6 rounded bg-white p-5 shadow"><h2 className="mb-4 text-lg font-semibold">{editando ? 'Editar e reenviar solicitação' : 'Solicitar nova obra'}</h2>
      <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1">Título<input name="titulo" value={formulario.titulo} onChange={alterar} required className="rounded border p-2" /></label>
        <label className="grid gap-1">Slug<input name="slug" value={formulario.slug} onChange={alterar} required aria-invalid={!!erroSlug} aria-describedby={erroSlug ? 'erro-slug' : undefined} className={`rounded border p-2 ${erroSlug ? 'border-red-600' : ''}`} />{erroSlug && <span id="erro-slug" className="text-sm text-red-700">{erroSlug}</span>}</label>
        <label className="grid gap-1 md:col-span-2">Resumo<textarea name="resumo" value={formulario.resumo} onChange={alterar} rows={4} className="rounded border p-2" /></label>
        <label className="grid gap-1">Categoria<select name="categoria_id" value={formulario.categoria_id} onChange={alterar} required className="rounded border p-2"><option value="">Selecione</option>{categorias.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select></label>
        <label className="grid gap-1">Classificação indicativa<select name="classificacao_indicativa_id" value={formulario.classificacao_indicativa_id} onChange={alterar} required className="rounded border p-2"><option value="">Selecione</option>{classificacoes.map((x) => <option key={x.id} value={x.id}>{x.nome || `Acima de ${x.idade_minima} anos`}</option>)}</select></label>
        <label className="grid gap-1">Idioma<select name="idioma_id" value={formulario.idioma_id} onChange={alterar} required className="rounded border p-2"><option value="">Selecione</option>{idiomas.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select></label>
        <div className="flex items-end gap-2"><button disabled={salvando} className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50">{salvando ? 'Salvando…' : editando ? 'Salvar e reenviar' : 'Enviar solicitação'}</button>{editando && <button type="button" onClick={() => { setEditando(''); setFormulario(vazio); }} className="rounded border px-4 py-2">Cancelar edição</button>}</div>
      </form>
    </section>
    <section className="space-y-3"><h2 className="text-lg font-semibold">Minhas solicitações</h2>
      {solicitacoes.length === 0 && <p className="rounded bg-white p-4 text-gray-600">Você ainda não solicitou a inclusão de uma nova obra.</p>}
      {solicitacoes.map((s) => <article key={s.id} className="rounded bg-white p-4 shadow"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{s.titulo}</h3><p className="text-sm text-gray-500">Enviada em {new Date(s.criado_em).toLocaleString('pt-BR')}</p></div><span className="rounded bg-gray-100 px-3 py-1 text-sm">{s.status}</span></div>
        {s.motivo_rejeicao && <p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-800"><strong>Motivo da rejeição:</strong> {s.motivo_rejeicao}</p>}
        {(s.historico || []).filter((h) => h.evento === 'RECUSADA').map((h) => <p key={h.id} className="mt-2 rounded bg-amber-50 p-3 text-sm text-amber-900"><strong>Rejeição anterior ({new Date(h.criado_em).toLocaleString('pt-BR')}):</strong> {h.motivo || 'Sem motivo informado.'}</p>)}
        {s.status === 'RECUSADA' && <button onClick={() => editar(s)} className="mt-3 rounded border px-3 py-2 text-sm">Editar e reenviar</button>}
        {s.status === 'APROVADA' && <Link href={`/estudio/nova-obra?solicitacao_id=${s.id}`} className="mt-3 inline-block rounded bg-gray-900 px-3 py-2 text-sm text-white">Criar obra aprovada</Link>}
        {s.status === 'UTILIZADA' && <p className="mt-3 text-sm">Obra criada. <Link href={`/estudio/obras/${s.livro_id}`} className="underline">Abrir no Estúdio</Link></p>}
      </article>)}
    </section>
  </div></main>;
}
