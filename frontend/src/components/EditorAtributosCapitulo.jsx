'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { listarArquivosPorLivro, obterUrlAssinadaArquivo } from '../services/arquivoMidia';

export default function EditorAtributosCapitulo({ livroId, capitulo, onSalvo }) {
  const [dados, setDados] = useState({ titulo: '', slug: '', resumo: '', texto_introdutorio: '', arquivo_capa_id: null, capa_url: null });
  const [arquivos, setArquivos] = useState([]);
  const [urlCapa, setUrlCapa] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregandoArquivos, setCarregandoArquivos] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setDados({
      titulo: capitulo?.titulo || '', slug: capitulo?.slug || '', resumo: capitulo?.resumo || '',
      texto_introdutorio: capitulo?.texto_introdutorio || '', arquivo_capa_id: capitulo?.arquivo_capa_id || null,
      capa_url: capitulo?.capa_url || null,
    });
    setErro('');
  }, [capitulo]);

  useEffect(() => {
    if (!mensagem) return undefined;
    const temporizador = window.setTimeout(() => setMensagem(''), 4000);
    return () => window.clearTimeout(temporizador);
  }, [mensagem]);

  useEffect(() => {
    let ativo = true;
    setCarregandoArquivos(true);
    listarArquivosPorLivro(livroId).then((resposta) => {
      if (ativo) setArquivos((resposta.data || []).filter((arquivo) => arquivo.ativo && String(arquivo.mime_type || '').toLowerCase().startsWith('image/')));
    }).catch((error) => {
      if (ativo) setErro(error.data?.message || error.message || 'Não foi possível listar as imagens da obra.');
    }).finally(() => { if (ativo) setCarregandoArquivos(false); });
    return () => { ativo = false; };
  }, [livroId]);

  useEffect(() => {
    let ativo = true;
    if (!dados.arquivo_capa_id) { setUrlCapa(dados.capa_url || ''); return () => { ativo = false; }; }
    obterUrlAssinadaArquivo(dados.arquivo_capa_id).then((url) => { if (ativo) setUrlCapa(url); }).catch(() => { if (ativo) setUrlCapa(''); });
    return () => { ativo = false; };
  }, [dados.arquivo_capa_id, dados.capa_url]);

  function alterar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setMensagem('');
  }

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true); setErro(''); setMensagem('');
    try {
      const resposta = await apiFetch(`/api/capitulos/${capitulo.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          titulo: dados.titulo, slug: dados.slug, resumo: dados.resumo || null,
          texto_introdutorio: dados.texto_introdutorio || null,
          arquivo_capa_id: dados.arquivo_capa_id,
        }),
      });
      setDados((atual) => ({ ...atual, ...resposta.data }));
      onSalvo?.(resposta.data);
      setMensagem('Salvo com sucesso!');
    } catch (errorSalvamento) {
      setErro(errorSalvamento.data?.message || errorSalvamento.message || 'Não foi possível salvar o capítulo.');
    } finally { setSalvando(false); }
  }

  if (!capitulo) return <div className="p-6 text-sm text-slate-400">Selecione um capítulo na árvore estrutural.</div>;

  return <form onSubmit={salvar} className="h-full overflow-y-auto p-4 sm:p-6">
    <div className="mx-auto max-w-3xl space-y-5">
      <div><h2 className="text-xl font-semibold">Atributos do capítulo</h2><p className="mt-1 text-sm text-slate-400">Edite os dados de “{capitulo.titulo || capitulo.slug}”.</p></div>
      {erro && <p role="alert" className="rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{erro}</p>}
      {mensagem && <p role="status" className="rounded border border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-200">{mensagem}</p>}
      <label className="block text-sm text-slate-300">Título<input required value={dados.titulo} onChange={(event) => alterar('titulo', event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white" /></label>
      <label className="block text-sm text-slate-300">Slug<input required value={dados.slug} onChange={(event) => alterar('slug', event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white" /></label>
      <label className="block text-sm text-slate-300">Resumo<textarea rows={3} value={dados.resumo} onChange={(event) => alterar('resumo', event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white" /></label>
      <label className="block text-sm text-slate-300">Texto introdutório<textarea rows={6} value={dados.texto_introdutorio} onChange={(event) => alterar('texto_introdutorio', event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white" /></label>
      <div>
        <label className="block text-sm text-slate-300">Imagem de capa da obra<select value={dados.arquivo_capa_id || ''} disabled={carregandoArquivos || salvando} onChange={(event) => alterar('arquivo_capa_id', event.target.value || null)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"><option value="">Sem capa</option>{dados.arquivo_capa_id && !arquivos.some((arquivo) => arquivo.id === dados.arquivo_capa_id) && <option value={dados.arquivo_capa_id}>Capa atual indisponível na lista</option>}{arquivos.map((arquivo) => <option key={arquivo.id} value={arquivo.id}>{arquivo.nome_original} · {arquivo.mime_type}</option>)}</select></label>
        {carregandoArquivos && <p className="mt-2 text-xs text-slate-400">Carregando imagens do Storage da obra…</p>}
        {!carregandoArquivos && arquivos.length === 0 && <p className="mt-2 text-xs text-slate-400">Não há imagens ativas no Storage desta obra.</p>}
        {urlCapa && <img src={urlCapa} alt={`Prévia da capa de ${dados.titulo}`} className="mt-3 h-40 max-w-full rounded border border-slate-700 object-cover" />}
        {!dados.arquivo_capa_id && dados.capa_url && <p className="mt-2 text-xs text-amber-200">Este capítulo ainda usa uma capa legada. Selecione uma imagem do Storage para substituí-la.</p>}
      </div>
      <div className="flex justify-end"><button type="submit" disabled={salvando || carregandoArquivos} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">{salvando ? 'Salvando…' : 'Salvar alterações'}</button></div>
    </div>
  </form>;
}
