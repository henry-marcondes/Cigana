'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../services/api';
import { listarArquivosPorLivro } from '../services/arquivoMidia';
import {
  carregarPreviaConteudo,
  listarConteudosDisponiveis,
} from '../services/conteudosObra';

const TIPOS = [
  { id: 'TEXTO', nome: 'Texto', icone: '¶' },
  { id: 'IMAGEM', nome: 'Imagem', icone: '▧' },
  { id: 'AUDIO', nome: 'Áudio', icone: '♫' },
  { id: 'VIDEO', nome: 'Vídeo', icone: '▶' },
];

const PREFIXOS_MIME = { IMAGEM: 'image/', AUDIO: 'audio/', VIDEO: 'video/' };

function formatarErro(error, fallback) {
  return error.data?.message || error.message || fallback;
}

function limparFonte(elemento) {
  if (!elemento) return;
  elemento.pause();
  elemento.removeAttribute('src');
  elemento.load();
}

export default function EditorConteudosObra({
  livroId,
  cenaDestino,
  versaoCatalogo,
  conteudoSelecionado,
  onSelecionarConteudo,
  onComposicaoAtualizada,
  onAdicionarEscolha,
  podeAdicionarEscolha = false,
}) {
  const [disponiveis, setDisponiveis] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [erroLista, setErroLista] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [menuAdicionar, setMenuAdicionar] = useState(false);
  const [incluindo, setIncluindo] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [estadoPrevia, setEstadoPrevia] = useState({ chave: '', carregando: false, erro: '', dados: null });
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const requisicaoPrevia = useRef(0);

  const carregarDisponiveis = useCallback(async () => {
    setCarregandoLista(true);
    setErroLista('');
    try {
      const [respostaConteudos, respostaArquivos] = await Promise.all([
        listarConteudosDisponiveis(livroId),
        listarArquivosPorLivro(livroId),
      ]);
      const conteudos = Array.isArray(respostaConteudos.data) ? respostaConteudos.data : [];
      const arquivos = (Array.isArray(respostaArquivos.data) ? respostaArquivos.data : [])
        .filter((arquivo) => !arquivo.utilizado && arquivo.ativo)
        .map((arquivo) => {
          const tipo = Object.keys(PREFIXOS_MIME).find((chave) => (
            String(arquivo.mime_type || '').toLowerCase().startsWith(PREFIXOS_MIME[chave])
          ));
          return tipo ? {
            id: arquivo.id,
            arquivo_id: arquivo.id,
            tipo_conteudo: tipo,
            titulo: arquivo.nome_original,
            mime_type: arquivo.mime_type,
            origem: 'ARQUIVO_STORAGE',
          } : null;
        }).filter(Boolean);
      setDisponiveis([...conteudos, ...arquivos]);
    } catch (error) {
      setErroLista(formatarErro(error, 'Não foi possível carregar os conteúdos disponíveis.'));
    } finally {
      setCarregandoLista(false);
    }
  }, [livroId]);

  useEffect(() => { carregarDisponiveis(); }, [carregarDisponiveis, versaoCatalogo]);

  const chaveSelecionada = conteudoSelecionado
    ? JSON.stringify([
      conteudoSelecionado.tipo_conteudo,
      conteudoSelecionado.id,
      conteudoSelecionado.arquivo_id || '',
      conteudoSelecionado.origem || '',
      conteudoSelecionado.titulo || '',
    ])
    : '';
  const chaveSelecaoAtual = useRef(chaveSelecionada);

  useLayoutEffect(() => {
    chaveSelecaoAtual.current = chaveSelecionada;
    return () => {
      if (chaveSelecaoAtual.current === chaveSelecionada) {
        chaveSelecaoAtual.current = '';
      }
      limparFonte(audioRef.current);
      limparFonte(videoRef.current);
    };
  }, [chaveSelecionada]);

  useEffect(() => {
    const chave = chaveSelecionada;
    const requisicao = ++requisicaoPrevia.current;
    let ativa = true;

    const tipoSuportado = ['TEXTO', 'IMAGEM', 'AUDIO', 'VIDEO'].includes(conteudoSelecionado?.tipo_conteudo);
    if (!chave || !tipoSuportado) {
      setEstadoPrevia({ chave, carregando: false, erro: '', dados: null });
      return () => { ativa = false; };
    }

    setEstadoPrevia({ chave, carregando: true, erro: '', dados: null });
    carregarPreviaConteudo(conteudoSelecionado)
      .then((dados) => {
        if (
          ativa
          && requisicao === requisicaoPrevia.current
          && chave === chaveSelecaoAtual.current
        ) {
          setEstadoPrevia({ chave, carregando: false, erro: '', dados });
        }
      })
      .catch((error) => {
        if (
          ativa
          && requisicao === requisicaoPrevia.current
          && chave === chaveSelecaoAtual.current
        ) {
          setEstadoPrevia({
            chave,
            carregando: false,
            erro: formatarErro(error, 'Não foi possível carregar a pré-visualização.'),
            dados: null,
          });
        }
      });

    return () => {
      ativa = false;
      if (requisicao === requisicaoPrevia.current) requisicaoPrevia.current += 1;
    };
  // A chave inclui todos os campos de seleção usados na requisição e evita recargas por identidade do objeto.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveSelecionada]);

  const conteudoAindaDisponivel = useMemo(() => (
    conteudoSelecionado && disponiveis.some((item) => (
      item.id === conteudoSelecionado.id
      && item.tipo_conteudo === conteudoSelecionado.tipo_conteudo
      && (!tipoFiltro || item.tipo_conteudo === tipoFiltro)
    ))
  ), [conteudoSelecionado, disponiveis, tipoFiltro]);
  const previaAtual = estadoPrevia.chave === chaveSelecionada
    ? estadoPrevia
    : { carregando: false, erro: '', dados: null };

  function abrirSeletor(tipo) {
    setTipoFiltro(tipo);
    setMenuAdicionar(false);
    setErroAcao('');
    setMensagem('');
  }

  async function incluirNaCena() {
    if (!cenaDestino || !conteudoSelecionado || !conteudoAindaDisponivel || incluindo) return;
    if (!window.confirm(`Incluir “${conteudoSelecionado.titulo}” na cena “${cenaDestino.titulo}”?`)) return;

    const associados = (cenaDestino.children || []).filter((item) => item.tipo !== 'ESCOLHA');
    const ordem = associados.reduce((maximo, item) => Math.max(maximo, Number(item.ordem_exibicao) || 0), 0) + 1;
    setIncluindo(true);
    setErroAcao('');
    setMensagem('');
    try {
      if (conteudoSelecionado.tipo_conteudo === 'TEXTO' && conteudoSelecionado.arquivo_id) {
        await apiFetch('/api/cena-textos/associar-arquivo-markdown', {
          method: 'POST',
          body: JSON.stringify({ cena_id: cenaDestino.id, arquivo_id: conteudoSelecionado.arquivo_id }),
        });
      } else if (conteudoSelecionado.origem === 'ARQUIVO_STORAGE') {
        await apiFetch('/api/cena-conteudos', {
          method: 'POST',
          body: JSON.stringify({
            cena_id: cenaDestino.id,
            tipo_conteudo: conteudoSelecionado.tipo_conteudo,
            arquivo_id: conteudoSelecionado.arquivo_id,
            ordem_exibicao: ordem,
          }),
        });
      } else {
        await apiFetch('/api/cena-conteudos', {
          method: 'POST',
          body: JSON.stringify({
            cena_id: cenaDestino.id,
            tipo_conteudo: conteudoSelecionado.tipo_conteudo,
            conteudo_id: conteudoSelecionado.id,
            ordem_exibicao: ordem,
          }),
        });
      }
      await carregarDisponiveis();
      await onComposicaoAtualizada(conteudoSelecionado);
      setMensagem(`“${conteudoSelecionado.titulo}” foi incluído em “${cenaDestino.titulo}”.`);
    } catch (error) {
      setErroAcao(error.status === 409
        ? `${formatarErro(error, 'A composição foi alterada por outra operação.')} Sua seleção foi mantida.`
        : formatarErro(error, 'Não foi possível incluir o conteúdo. Sua seleção foi mantida.'));
      await carregarDisponiveis();
    } finally {
      setIncluindo(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-950">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/70 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Editor de conteúdos</h2>
          <p className="truncate text-xs text-slate-400">
            {cenaDestino ? `Destino da inclusão: ${cenaDestino.titulo}` : 'Selecione uma cena no Navegador para incluir conteúdo.'}
          </p>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setMenuAdicionar((aberto) => !aberto)} className="rounded bg-indigo-600 px-3 py-2 text-xs font-semibold hover:bg-indigo-500">Adicionar ▾</button>
          {menuAdicionar && <div className="absolute right-0 z-20 mt-1 w-40 rounded border border-slate-700 bg-slate-900 p-1 shadow-xl">
            {TIPOS.map((tipo) => <button key={tipo.id} type="button" onClick={() => abrirSeletor(tipo.id)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs hover:bg-slate-800"><span>{tipo.icone}</span>{tipo.nome}</button>)}
            <button type="button" disabled={!podeAdicionarEscolha} title={podeAdicionarEscolha ? 'Criar escolha para a cena selecionada' : 'Selecione uma cena no Navegador'} onClick={() => { setMenuAdicionar(false); setErroAcao(''); setMensagem(''); onAdicionarEscolha?.(); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"><span>↳</span>Escolha</button>
          </div>}
        </div>
      </header>

      {erroAcao && <p role="alert" className="mx-4 mt-3 rounded border border-rose-900 bg-rose-950/50 p-2 text-xs text-rose-200">{erroAcao}</p>}
      {mensagem && <p role="status" className="mx-4 mt-3 rounded border border-emerald-900 bg-emerald-950/40 p-2 text-xs text-emerald-200">{mensagem}</p>}

      <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.4fr)]">
        <section className="min-h-40 rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Storage · {TIPOS.find((tipo) => tipo.id === tipoFiltro)?.nome || 'todos os tipos'}</h3><button type="button" onClick={carregarDisponiveis} disabled={carregandoLista} className="text-[11px] text-indigo-300 disabled:opacity-50">Atualizar</button></div>
          {erroLista && <p role="alert" className="p-3 text-xs text-rose-300">{erroLista}</p>}
          {carregandoLista ? <p className="p-3 text-xs text-slate-400">Carregando…</p> : !erroLista && !disponiveis.some((item) => !tipoFiltro || item.tipo_conteudo === tipoFiltro) ? <p className="p-3 text-xs text-slate-500">Nenhum arquivo compatível e disponível no Storage.</p> : <ul className="max-h-[50vh] overflow-y-auto p-1">
            {TIPOS.map((tipo) => {
              if (tipoFiltro && tipoFiltro !== tipo.id) return null;
              const itens = disponiveis.filter((item) => item.tipo_conteudo === tipo.id);
              if (!itens.length) return null;
              return <li key={tipo.id} className="mb-1"><p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{tipo.nome}</p>{itens.map((item) => {
                const selecionado = item.id === conteudoSelecionado?.id && item.tipo_conteudo === conteudoSelecionado?.tipo_conteudo;
                return <button key={`${item.tipo_conteudo}:${item.id}`} type="button" onClick={() => { setErroAcao(''); setMensagem(''); onSelecionarConteudo(item); }} className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs ${selecionado ? 'bg-indigo-950 text-indigo-100' : 'text-slate-300 hover:bg-slate-800'}`}><span>{tipo.icone}</span><span className="truncate">{item.titulo}</span></button>;
              })}</li>;
            })}
          </ul>}
        </section>

        <section className="min-h-56 rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-3 py-2"><div className="min-w-0"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Pré-visualização</h3><p className="truncate text-xs text-slate-400">{conteudoSelecionado?.titulo || 'Selecione um conteúdo disponível'}</p></div>{conteudoSelecionado && conteudoAindaDisponivel && <button type="button" onClick={incluirNaCena} disabled={!cenaDestino || incluindo} className="shrink-0 rounded bg-emerald-700 px-3 py-2 text-xs font-semibold hover:bg-emerald-600 disabled:opacity-40">{incluindo ? 'Incluindo…' : 'Incluir na cena'}</button>}</div>
          {conteudoSelecionado && !conteudoAindaDisponivel && <p className="mx-3 mt-3 rounded border border-slate-700 bg-slate-950 p-2 text-xs text-slate-400">Este conteúdo já não está disponível para inclusão. A seleção foi mantida para você consultar a prévia.</p>}
          {!cenaDestino && conteudoSelecionado && conteudoAindaDisponivel && <p className="mx-3 mt-3 text-xs text-amber-200">Selecione uma cena no Navegador para habilitar a inclusão.</p>}
          {conteudoSelecionado && previaAtual.carregando && <p className="p-4 text-xs text-slate-400">Carregando pré-visualização…</p>}
          {conteudoSelecionado && previaAtual.erro && <p role="alert" className="p-4 text-xs text-rose-300">{previaAtual.erro}</p>}
          {conteudoSelecionado && !previaAtual.carregando && !previaAtual.erro && previaAtual.dados && <div className="max-h-[65vh] overflow-auto p-4">
            {conteudoSelecionado.tipo_conteudo === 'TEXTO' && <article className="whitespace-pre-wrap text-sm leading-7 text-slate-100">{previaAtual.dados.texto}</article>}
            {conteudoSelecionado.tipo_conteudo === 'IMAGEM' && <img src={previaAtual.dados.imagem_url} alt={previaAtual.dados.texto_alternativo || previaAtual.dados.titulo} className="mx-auto max-h-[55vh] max-w-full rounded object-contain" />}
            {conteudoSelecionado.tipo_conteudo === 'AUDIO' && <div className="mx-auto w-full max-w-xl"><p className="mb-3 text-sm font-medium">{previaAtual.dados.titulo}</p><audio key={chaveSelecionada} ref={audioRef} controls src={previaAtual.dados.audio_url} className="w-full">Seu navegador não consegue reproduzir este áudio.</audio></div>}
            {conteudoSelecionado.tipo_conteudo === 'VIDEO' && <video key={chaveSelecionada} ref={videoRef} controls src={previaAtual.dados.video_url} className="mx-auto max-h-[55vh] max-w-full rounded bg-black">Seu navegador não consegue reproduzir este vídeo.</video>}
            {previaAtual.dados.legenda && <p className="mt-3 text-center text-xs text-slate-400">{previaAtual.dados.legenda}</p>}
            {previaAtual.dados.descricao && <p className="mt-3 text-xs leading-5 text-slate-400">{previaAtual.dados.descricao}</p>}
          </div>}
        </section>
      </div>
    </div>
  );
}
