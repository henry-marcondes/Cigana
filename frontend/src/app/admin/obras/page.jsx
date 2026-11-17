'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  estaAutenticado,
  obterUsuario,
} from '../../../services/autenticacao';
import {
  alterarCotaArmazenamento,
  decidirEditorial,
  listarCotasArmazenamento,
  listarLivrosParaDecisaoEditorial,
  publicarLivro,
} from '../../../services/livro';
import { usuarioTemPermissao } from '../../../services/permissoesEfetivas';

const BYTES_POR_MIB = 1024n * 1024n;
const MAX_BIGINT = 9223372036854775807n;

function bytesParaMiB(bytes) {
  const valor = BigInt(bytes);
  let inteiro = valor / BYTES_POR_MIB;
  let fracao = ((valor % BYTES_POR_MIB) * 1000000n + BYTES_POR_MIB / 2n) / BYTES_POR_MIB;
  if (fracao === 1000000n) {
    inteiro += 1n;
    fracao = 0n;
  }
  if (fracao === 0n) return inteiro.toString();
  return `${inteiro}.${fracao.toString().padStart(6, '0').replace(/0+$/, '')}`;
}

function converterMiBParaBytes(valor) {
  const texto = String(valor ?? '');
  if (!/^\d+(\.\d{1,6})?$/.test(texto)) return null;
  const [parteInteira, parteFracionaria = ''] = texto.split('.');
  const escala = 10n ** BigInt(parteFracionaria.length);
  const totalMiB = BigInt(parteInteira) * escala + BigInt(parteFracionaria || '0');
  const bytes = (totalMiB * BYTES_POR_MIB) / escala;
  return bytes <= MAX_BIGINT ? bytes.toString() : null;
}

export default function ObrasEditorialPage() {
  const router = useRouter();
  const [livros, setLivros] = useState([]);
  const [podeDecidir, setPodeDecidir] = useState(false);
  const [podePublicar, setPodePublicar] = useState(false);
  const [podeVerEditorial, setPodeVerEditorial] = useState(false);
  const [podeConfigurarCotas, setPodeConfigurarCotas] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [cotas, setCotas] = useState([]);
  const [valoresCota, setValoresCota] = useState({});
  const [carregandoCotas, setCarregandoCotas] = useState(true);
  const [salvandoCotaId, setSalvandoCotaId] = useState('');
  const [erroCotas, setErroCotas] = useState('');
  const [sucessoCotas, setSucessoCotas] = useState('');
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

  async function carregarCotas() {
    setErroCotas('');
    try {
      const resposta = await listarCotasArmazenamento();
      const obras = resposta.data || [];
      setCotas(obras);
      setValoresCota(Object.fromEntries(obras.map((livro) => [
        livro.id,
        bytesParaMiB(livro.cota_armazenamento_bytes),
      ])));
    } catch (errorCarregamento) {
      setErroCotas(errorCarregamento.message || 'Não foi possível carregar as cotas das obras.');
    } finally {
      setCarregandoCotas(false);
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

      let podeVisualizar = false;
      let podeConfigurar = false;
      try {
        const [podeVerModeracao, podeOperar, podePublicarObras, podeConfigurarPlataforma] =
          await Promise.all([
            usuarioTemPermissao(usuario.id, 'moderacao.visualizar'),
            usuarioTemPermissao(usuario.id, 'obra.aprovar'),
            usuarioTemPermissao(usuario.id, 'obra.publicar'),
            usuarioTemPermissao(usuario.id, 'plataforma.configurar'),
          ]);
        podeVisualizar = podeVerModeracao;
        podeConfigurar = podeConfigurarPlataforma;
        setPodeVerEditorial(podeVisualizar);
        setPodeDecidir(podeVisualizar && podeOperar);
        setPodePublicar(podeVisualizar && podePublicarObras);
        setPodeConfigurarCotas(podeConfigurar);
      } catch {
        setPodeDecidir(false);
        setPodePublicar(false);
        setPodeVerEditorial(false);
        setPodeConfigurarCotas(false);
        setCarregando(false);
        setCarregandoCotas(false);
        return;
      }

      const tarefas = [];
      if (podeVisualizar) tarefas.push(carregar());
      else {
        setCarregando(false);
      }
      if (podeConfigurar) tarefas.push(carregarCotas());
      else setCarregandoCotas(false);
      await Promise.all(tarefas);
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

  async function salvarCota(event, livro) {
    event.preventDefault();
    const bytes = converterMiBParaBytes(valoresCota[livro.id]);
    if (bytes === null) {
      setErroCotas('Informe uma cota válida, igual ou maior que zero.');
      return;
    }

    setSalvandoCotaId(livro.id);
    setErroCotas('');
    setSucessoCotas('');
    try {
      const resposta = await alterarCotaArmazenamento(livro.id, bytes);
      setCotas((atuais) => atuais.map((item) => (
        item.id === livro.id ? resposta.data : item
      )));
      setValoresCota((atuais) => ({
        ...atuais,
        [livro.id]: bytesParaMiB(resposta.data.cota_armazenamento_bytes),
      }));
      setSucessoCotas(`Cota de “${livro.titulo}” atualizada.`);
    } catch (errorSalvamento) {
      setErroCotas(errorSalvamento.message || 'Não foi possível atualizar a cota.');
    } finally {
      setSalvandoCotaId('');
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

  if (carregando || (podeConfigurarCotas && carregandoCotas)) {
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
              Gestão de obras
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Administração editorial e configuração das cotas por obra.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (podeVerEditorial) await carregar();
              if (podeConfigurarCotas) await carregarCotas();
            }}
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

        {podeConfigurarCotas && <section className="mb-5 rounded-lg bg-white p-5 shadow sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900">Cota de armazenamento por obra</h2>
          <p className="mt-1 text-sm text-gray-600">A cota inicial de cada obra é 521 MiB. Os valores abaixo são persistidos em bytes.</p>
          {erroCotas && <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erroCotas}</p>}
          {sucessoCotas && <p role="status" className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{sucessoCotas}</p>}
          <div className="mt-4 space-y-3">
            {cotas.length === 0 ? <p className="text-sm text-gray-500">Nenhuma obra ativa encontrada.</p> : cotas.map((livro) => (
              <form key={livro.id} onSubmit={(event) => salvarCota(event, livro)} className="flex flex-col gap-3 rounded border border-gray-200 p-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{livro.titulo}</p>
                  <p className="mt-1 text-xs text-gray-500">Cota atual: {Number(livro.cota_armazenamento_bytes).toLocaleString('pt-BR')} bytes</p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <label className="grid gap-1 text-xs text-gray-600">
                    Nova cota (MiB)
                    <input type="number" min="0" step="0.000001" required value={valoresCota[livro.id] ?? ''} onChange={(event) => setValoresCota((atuais) => ({ ...atuais, [livro.id]: event.target.value }))} className="w-40 rounded border border-gray-300 px-3 py-2 text-sm text-gray-900" />
                  </label>
                  <button type="submit" disabled={Boolean(salvandoCotaId)} className="rounded bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50">
                    {salvandoCotaId === livro.id ? 'Salvando…' : 'Salvar cota'}
                  </button>
                </div>
              </form>
            ))}
          </div>
        </section>}

        {podeVerEditorial && <>
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
        </>}
      </div>
    </main>
  );
}
