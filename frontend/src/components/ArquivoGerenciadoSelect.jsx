'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { listarArquivosPorLivro } from '../services/arquivoMidia';

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

export default function ArquivoGerenciadoSelect({
  livroId,
  value,
  onChange,
  disabled = false,
}) {
  const [arquivos, setArquivos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);
  const [posicaoMenu, setPosicaoMenu] = useState(null);
  const referenciaBotao = useRef(null);
  const referenciaMenu = useRef(null);

  useEffect(() => {
    let ativo = true;

    async function carregarArquivos() {
      setCarregando(true);
      setErro('');

      try {
        const resposta = await listarArquivosPorLivro(livroId);
        if (!Array.isArray(resposta.data) || !resposta.data.every(
          (arquivo) => (
            arquivo &&
            typeof arquivo.id === 'string' &&
            typeof arquivo.nome_original === 'string'
          )
        )) {
          throw new Error('A resposta de arquivos da obra está em formato inválido.');
        }

        if (ativo) setArquivos(resposta.data);
      } catch (errorCarregamento) {
        if (ativo) {
          setErro(
            errorCarregamento.message ||
            'Não foi possível listar os arquivos gerenciados desta obra.'
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    if (livroId) carregarArquivos();
    else {
      setArquivos([]);
      setErro('Não foi possível identificar a obra desta cena.');
      setCarregando(false);
    }

    return () => {
      ativo = false;
    };
  }, [livroId]);

  const arquivoAssociadoDisponivel = arquivos.some(
    (arquivo) => arquivo.id === value
  );
  const arquivoSelecionado = arquivos.find((arquivo) => arquivo.id === value);

  function abrirMenu() {
    if (disabled || carregando || typeof window === 'undefined') return;
    const retangulo = referenciaBotao.current.getBoundingClientRect();
    setPosicaoMenu({
      left: retangulo.left,
      bottom: window.innerHeight - retangulo.top + 4,
      width: retangulo.width,
    });
    setMenuAberto(true);
  }

  function fecharMenu() {
    setMenuAberto(false);
  }

  function selecionar(valor) {
    onChange(valor);
    fecharMenu();
  }

  useEffect(() => {
    if (!menuAberto) return undefined;

    function fecharFora(event) {
      if (!referenciaBotao.current?.contains(event.target)
        && !referenciaMenu.current?.contains(event.target)) fecharMenu();
    }
    function fecharAoMoverTela() {
      fecharMenu();
    }

    document.addEventListener('mousedown', fecharFora);
    window.addEventListener('scroll', fecharAoMoverTela, true);
    window.addEventListener('resize', fecharAoMoverTela);
    return () => {
      document.removeEventListener('mousedown', fecharFora);
      window.removeEventListener('scroll', fecharAoMoverTela, true);
      window.removeEventListener('resize', fecharAoMoverTela);
    };
  }, [menuAberto]);

  function navegarOpcoes(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      fecharMenu();
      referenciaBotao.current?.focus();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const opcoes = [...(referenciaMenu.current?.querySelectorAll('[role="option"]') || [])];
    if (!opcoes.length) return;
    const atual = opcoes.indexOf(document.activeElement);
    const proximo = event.key === 'Home' ? 0
      : event.key === 'End' ? opcoes.length - 1
        : event.key === 'ArrowDown' ? (atual + 1 + opcoes.length) % opcoes.length
          : (atual - 1 + opcoes.length) % opcoes.length;
    opcoes[proximo].focus();
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Arquivo da obra
      </label>
      <button
        ref={referenciaBotao}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={menuAberto}
        disabled={disabled || carregando}
        onClick={() => (menuAberto ? fecharMenu() : abrirMenu())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!menuAberto) abrirMenu();
          }
        }}
        className="mt-1 flex w-full items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm outline-none focus:border-gray-500 disabled:bg-gray-100"
      >
        <span className="min-w-0 truncate">
          {arquivoSelecionado?.nome_original || (value
            ? (erro ? 'Arquivo associado; lista indisponível' : 'Arquivo associado indisponível')
            : 'Usar URL (compatibilidade legada)')}
        </span>
        <span aria-hidden="true" className="shrink-0">{menuAberto ? '▴' : '▾'}</span>
      </button>

      {menuAberto && posicaoMenu && typeof document !== 'undefined' && createPortal(
        <div
          ref={referenciaMenu}
          role="listbox"
          aria-label="Arquivos gerenciados da obra"
          onKeyDown={navegarOpcoes}
          style={{
            position: 'fixed',
            left: posicaoMenu.left,
            bottom: posicaoMenu.bottom,
            width: posicaoMenu.width,
          }}
          className="z-[1000] max-h-64 overflow-y-auto rounded-lg border border-gray-300 bg-white p-1 shadow-xl"
        >
          <button type="button" role="option" aria-selected={!value} onClick={() => selecionar('')} className={`block w-full rounded px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 ${!value ? 'bg-gray-100' : ''}`}>
            Usar URL (compatibilidade legada)
          </button>
          {value && !arquivoAssociadoDisponivel && !carregando && (
            <button type="button" role="option" aria-selected="true" onClick={() => selecionar(value)} className="block w-full rounded px-3 py-2 text-left text-sm text-gray-500">
              {erro ? 'Arquivo associado; não foi possível consultar a lista' : 'Arquivo associado indisponível'}
            </button>
          )}
          {arquivos.map((arquivo) => (
            <button key={arquivo.id} type="button" role="option" aria-selected={arquivo.id === value} onClick={() => selecionar(arquivo.id)} className={`block w-full rounded px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 ${arquivo.id === value ? 'bg-gray-100' : ''}`}>
              <span className="block truncate">{arquivo.nome_original}</span>
              <span className="block truncate text-xs text-gray-500">
                {arquivo.mime_type || 'Tipo não informado'} · {tamanhoLegivel(arquivo.tamanho_bytes)}
              </span>
            </button>
          ))}
        </div>,
        document.body
      )}

      {carregando && (
        <p role="status" className="mt-2 text-sm text-gray-500">
          Carregando arquivos gerenciados da obra…
        </p>
      )}
      {!carregando && erro && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          Não foi possível listar os arquivos gerenciados: {erro}
        </p>
      )}
      {!carregando && !erro && arquivos.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Nenhum arquivo gerenciado ativo nesta obra. Você ainda pode usar uma URL.
        </p>
      )}
      {value && arquivoAssociadoDisponivel && (
        <p className="mt-2 text-sm text-gray-600">
          Selecionado: {arquivos.find((arquivo) => arquivo.id === value)?.nome_original}
        </p>
      )}
    </div>
  );
}
