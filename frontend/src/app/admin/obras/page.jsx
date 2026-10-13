'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  estaAutenticado,
  obterUsuario,
} from '../../../services/autenticacao';
import {
  decidirEditorial,
  listarLivrosParaDecisaoEditorial,
  publicarLivro,
} from '../../../services/livro';
import { usuarioTemPermissao } from '../../../services/permissoesEfetivas';

export default function ObrasEditorialPage() {
  const router = useRouter();
  const [livros, setLivros] = useState([]);
  const [podeDecidir, setPodeDecidir] = useState(false);
  const [podePublicar, setPodePublicar] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [operacaoId, setOperacaoId] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    setErro('');
    try {
      const resposta = await listarLivrosParaDecisaoEditorial();
      setLivros(resposta.data || []);
    } catch (errorCarregamento) {
      setErro(errorCarregamento.message || 'Não foi possível carregar as obras.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (!estaAutenticado()) {
      router.replace('/login');
      return;
    }

    async function carregarPermissoes() {
      const usuario = obterUsuario();
      if (!usuario?.id) {
        router.replace('/login');
        return;
      }

      try {
        const [podeVisualizar, podeOperar, podePublicarObras] =
          await Promise.all([
            usuarioTemPermissao(usuario.id, 'moderacao.visualizar'),
            usuarioTemPermissao(usuario.id, 'obra.aprovar'),
            usuarioTemPermissao(usuario.id, 'obra.publicar'),
          ]);
        setPodeDecidir(podeVisualizar && podeOperar);
        setPodePublicar(podeVisualizar && podePublicarObras);
      } catch {
        setPodeDecidir(false);
        setPodePublicar(false);
      }

      await carregar();
    }

    carregarPermissoes();
  }, [router]);

  async function registrarDecisao(livro, decisao) {
    let motivo = null;
    if (decisao === 'REJEITADA') {
      motivo = window.prompt(
        `Motivo da rejeição de “${livro.titulo}” (opcional):`
      );
      if (motivo === null) return;
    }

    const confirmacao = decisao === 'APROVADA'
      ? `Aprovar editorialmente “${livro.titulo}”? A obra continuará privada até ser publicada em uma ação separada.`
      : `Rejeitar editorialmente “${livro.titulo}”?`;

    if (!window.confirm(confirmacao)) return;

    setOperacaoId(livro.id);
    setErro('');
    setSucesso('');
    try {
      const resposta = await decidirEditorial(livro.id, decisao, motivo);
      setSucesso(resposta.message || 'Decisão editorial registrada.');
      await carregar();
    } catch (errorDecisao) {
      setErro(errorDecisao.message || 'Não foi possível registrar a decisão.');
    } finally {
      setOperacaoId('');
    }
  }

  async function publicar(livro) {
    if (!window.confirm(
      `Publicar “${livro.titulo}”? A obra ficará disponível publicamente na Biblioteca.`
    )) return;

    setOperacaoId(livro.id);
    setErro('');
    setSucesso('');
    try {
      const resposta = await publicarLivro(livro.id);
      setSucesso(resposta.message || 'Obra publicada com sucesso.');
      await carregar();
    } catch (errorPublicacao) {
      setErro(errorPublicacao.message || 'Não foi possível publicar a obra.');
    } finally {
      setOperacaoId('');
    }
  }

  const pendentes = livros.filter((livro) => !livro.decisao_editorial);
  const aprovadas = livros.filter(
    (livro) => livro.decisao_editorial === 'APROVADA'
  );
  const rejeitadas = livros.filter(
    (livro) => livro.decisao_editorial === 'REJEITADA'
  );

  function renderLivro(livro, grupo) {
    return (
      <article key={livro.id} className="rounded-lg border border-gray-200 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{livro.titulo}</h3>
            {livro.resumo && (
              <p className="mt-2 max-w-2xl text-sm text-gray-600">{livro.resumo}</p>
            )}
            {livro.motivo_rejeicao && (
              <p className="mt-2 text-sm text-red-700">
                Motivo registrado: {livro.motivo_rejeicao}
              </p>
            )}
          </div>
          <Link
            href={`/estudio/obras/${livro.id}/visualizar`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Analisar conteúdo
          </Link>
        </div>

        {grupo === 'pendentes' && podeDecidir && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              disabled={Boolean(operacaoId)}
              onClick={() => registrarDecisao(livro, 'APROVADA')}
              className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
            >
              {operacaoId === livro.id ? 'Registrando...' : 'Aprovar obra'}
            </button>
            <button
              type="button"
              disabled={Boolean(operacaoId)}
              onClick={() => registrarDecisao(livro, 'REJEITADA')}
              className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
            >
              Rejeitar obra
            </button>
          </div>
        )}

        {grupo === 'aprovadas' && podePublicar && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <button
              type="button"
              disabled={Boolean(operacaoId)}
              onClick={() => publicar(livro)}
              className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {operacaoId === livro.id ? 'Publicando...' : 'Publicar obra'}
            </button>
            <p className="mt-2 text-sm text-gray-600">
              A aprovação editorial não tornou a obra pública. Esta ação a disponibiliza na Biblioteca.
            </p>
          </div>
        )}
      </article>
    );
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Carregando obras para análise...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              ← Administração
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              Análise editorial de obras
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              A aprovação editorial e a publicação são ações separadas.
            </p>
          </div>
          <button
            type="button"
            onClick={carregar}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Atualizar lista
          </button>
        </header>

        {erro && (
          <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </p>
        )}
        {sucesso && (
          <p role="status" className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {sucesso}
          </p>
        )}

        <section className="rounded-lg bg-white p-5 shadow sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900">Aguardando decisão</h2>
          <div className="mt-4 space-y-3">
            {pendentes.length === 0 ? (
              <p className="text-sm text-gray-500">Não há obras aguardando decisão editorial.</p>
            ) : pendentes.map((livro) => renderLivro(livro, 'pendentes'))}
          </div>
        </section>

        <section className="mt-5 rounded-lg bg-white p-5 shadow sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900">Aprovadas — aguardando publicação</h2>
          <div className="mt-4 space-y-3">
            {aprovadas.length === 0 ? (
              <p className="text-sm text-gray-500">Não há obras aprovadas aguardando publicação.</p>
            ) : aprovadas.map((livro) => renderLivro(livro, 'aprovadas'))}
          </div>
        </section>

        <section className="mt-5 rounded-lg bg-white p-5 shadow sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900">Rejeitadas</h2>
          <div className="mt-4 space-y-3">
            {rejeitadas.length === 0 ? (
              <p className="text-sm text-gray-500">Não há obras rejeitadas nesta etapa.</p>
            ) : rejeitadas.map((livro) => renderLivro(livro, 'rejeitadas'))}
          </div>
        </section>
      </div>
    </main>
  );
}
