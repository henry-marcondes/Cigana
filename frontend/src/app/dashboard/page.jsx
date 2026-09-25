
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
obterUsuario,
estaAutenticado,
logout,
} from '../../services/autenticacao';
import { buscarAutorPorUsuario } from '../../services/autor';
import { listarPapeisDoUsuario } from '../../services/usuarioPapel';

import { listarMinhasSolicitacoesAutor } from '../../services/solicitacaoAutor';

export default function Dashboard() {
const router = useRouter();

const [usuario, setUsuario] = useState(null);
const [autor, setAutor] = useState(null);
const [solicitacaoAutor, setSolicitacaoAutor] = useState(null);
const [podeAdministrar, setPodeAdministrar] = useState(false);


useEffect(() => {
    if (!estaAutenticado()) {
        router.push('/login');
        return;
    }

    async function carregarDados() {
        try {
            const usuarioAtual = obterUsuario();

            if (!usuarioAtual) {
                router.push('/login');
                return;
            }

            setUsuario(usuarioAtual);

            // Carrega os papéis do usuário
            const respostaPapeis = await listarPapeisDoUsuario(usuarioAtual.id);

            const papeis = respostaPapeis.data || [];

            const possuiPapelAdministrativo = papeis.some(
                (papel) =>
                    papel.papel_codigo === 'ADMINISTRADOR' ||
                    papel.papel_codigo === 'GERENTE'
            );

            setPodeAdministrar(possuiPapelAdministrativo);

            // Carrega Autor
            try {
                const respostaAutor = await buscarAutorPorUsuario(usuarioAtual.id);
                setAutor(respostaAutor.data);
            } catch (error) {
                // Usuário pode não possuir uma entidade Autor.
                setAutor(null);
            }

            // Carrega solicitações de Autor
            try {
                const respostaSolicitacoes =
                    await listarMinhasSolicitacoesAutor();

                const solicitacoes = respostaSolicitacoes.data || [];

                if (solicitacoes.length > 0) {
                    setSolicitacaoAutor(solicitacoes[0]);
                } else {
                    setSolicitacaoAutor(null);
                }
            } catch (error) {
                console.error(
                    'Erro ao carregar solicitações de Autor:',
                    error
                );

                setSolicitacaoAutor(null);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do Dashboard:', error);
        }
    }

    carregarDados();
}, [router]);

function handleLogout() {
logout();
router.push('/login');
}

if (!usuario) {
return ( <main className="flex min-h-screen items-center justify-center bg-gray-100"> <p className="text-gray-600">
Carregando... </p> </main>
);
}

return ( <main className="min-h-screen bg-gray-100 p-6"> <div className="mx-auto max-w-4xl">

    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Área do usuário
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
      >
        Sair
      </button>
      {podeAdministrar && (
      <Link
          href="/admin"
          className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
      >
        ADMIN
      </Link>
    )}
    </header>

    {/* Minha conta */}
    <section className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Minha conta
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">
            E-mail
          </p>

          <p className="text-gray-900">
            {usuario.email}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Status do e-mail
          </p>

          <p className="text-green-600">
            {usuario.email_verificado_em
              ? 'E-mail verificado'
              : 'E-mail não verificado'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Conta
          </p>

          <p className="text-gray-900">
            {usuario.ativo ? 'Ativa' : 'Inativa'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/perfil"
          className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          Meu perfil
        </Link>

        <button
          onClick={() => router.push('/alteracao-senha')}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Alterar senha
        </button>
      </div>
    </section>

    {/* Biblioteca */}
    <section className="mt-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Biblioteca
      </h2>

      <p className="mb-4 text-gray-600">
        Acesse as obras disponíveis para leitura.
      </p>

      <Link
        href="/"
        className="inline-block rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        Acessar Biblioteca
      </Link>
    </section>

    {/* Minha atuação como Autor */}
    {autor && (
      <section className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Minha atuação como Autor
        </h2>

        <p className="mb-4 text-gray-600">
          Gerencie sua atuação como autor na plataforma.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/estudio"
            className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Estúdio
          </Link>

        </div>
      </section>
    )}

    {/* Oportunidades */}
    <section className="mt-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Oportunidades
      </h2>

      <p className="mb-6 text-gray-600">
        Conheça as possibilidades de atuação na plataforma.
      </p>

      <div className="space-y-4">

    {!autor && !solicitacaoAutor && (
      <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900">
        Quero atuar como Autor
      </h3>

      <p className="mt-1 text-sm text-gray-600">
        Apresente-se como Autor e proponha uma obra para a plataforma.
      </p>

      <Link
        href="/dashboard/autor"
        className="mt-3 inline-block rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
      >
        Quero ser Autor
      </Link>
    </div>
  )}

  {!autor && solicitacaoAutor?.status === 'PENDENTE' && (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <h3 className="font-semibold text-gray-900">
        Solicitação para atuar como Autor
      </h3>

      <p className="mt-1 text-sm text-gray-700">
        Sua solicitação foi enviada e está aguardando análise da Plataforma.
      </p>

      <p className="mt-3 text-sm font-medium text-yellow-700">
        Status: Em análise
      </p>

      <p className="mt-2 text-sm text-gray-600">
        Obra proposta: {solicitacaoAutor.titulo_provisorio}
      </p>
    </div>
  )}

  {!autor && solicitacaoAutor?.status === 'APROVADA' && (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <h3 className="font-semibold text-gray-900">
        Solicitação para atuar como Autor
      </h3>

      <p className="mt-1 text-sm text-gray-700">
        Sua solicitação foi aprovada pela Plataforma.
      </p>

      <p className="mt-3 text-sm font-medium text-green-700">
        Status: Aprovada
      </p>

      <p className="mt-2 text-sm text-gray-600">
        Obra proposta: {solicitacaoAutor.titulo_provisorio}
      </p>
    </div>
  )}

  {!autor && solicitacaoAutor?.status === 'RECUSADA' && (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h3 className="font-semibold text-gray-900">
        Solicitação para atuar como Autor
      </h3>

      <p className="mt-1 text-sm text-gray-700">
        Sua solicitação foi recusada pela Plataforma.
      </p>

      <p className="mt-3 text-sm font-medium text-red-700">
        Status: Recusada
      </p>

      {solicitacaoAutor.motivo_recusa && (
        <p className="mt-2 text-sm text-gray-600">
          Motivo: {solicitacaoAutor.motivo_recusa}
        </p>
      )}

      <Link
        href="/dashboard/autor"
        className="mt-3 inline-block rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
      >
        Fazer nova solicitação
      </Link>
    </div>
  )}

        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">
            Atuar como Editor
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Conheça os requisitos e o processo para atuar como Editor.
          </p>

          <button
            type="button"
            className="mt-3 rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            Conhecer oportunidade
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">
            Outras oportunidades
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Em breve estarão disponíveis outras possibilidades de atuação.
          </p>
        </div>

      </div>
    </section>

  </div>
</main>

);
}
