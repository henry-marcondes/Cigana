
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { estaAutenticado } from '../../../../services/autenticacao';

import {
  buscarUsuarioPorId,
  desativarUsuario,
} from '../../../../services/usuario';

import {
  buscarPerfilPorUsuario,
} from '../../../../services/perfilUsuario';

import {
  listarPapeis,
} from '../../../../services/papel';

import {
  listarPapeisDoUsuario,
  vincularPapel,
  removerPapel,
} from '../../../../services/usuarioPapel';

export default function UsuarioPage() {
  const router = useRouter();
  const params = useParams();

  const { id } = params;

  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [papeis, setPapeis] = useState([]);
  const [todosPapeis, setTodosPapeis] = useState([]);

  const [papelSelecionado, setPapelSelecionado] =
    useState('');

  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!estaAutenticado()) {
      router.push('/login');
      return;
    }

    carregarDados();
  }, [id, router]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');

      const [
        usuarioResponse,
        perfilResponse,
        papeisResponse,
        todosPapeisResponse,
      ] = await Promise.all([
        buscarUsuarioPorId(id),
        buscarPerfilPorUsuario(id).catch(() => null),
        listarPapeisDoUsuario(id),
        listarPapeis(),
      ]);

      setUsuario(usuarioResponse.data);
      setPerfil(perfilResponse?.data || null);
      setPapeis(papeisResponse.data || []);
      setTodosPapeis(todosPapeisResponse.data || []);
    } catch (error) {
      console.error(
        'Erro ao carregar usuário:',
        error
      );

      setErro(
        error.message ||
          'Não foi possível carregar os dados do usuário.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleAdicionarPapel() {
    if (!papelSelecionado) {
      return;
    }

    try {
      setProcessando(true);
      setErro('');
      setMensagem('');

      await vincularPapel(
        id,
        papelSelecionado
      );

      setPapelSelecionado('');

      setMensagem(
        'Papel vinculado ao usuário com sucesso.'
      );

      const resposta =
        await listarPapeisDoUsuario(id);

      setPapeis(resposta.data || []);
    } catch (error) {
      console.error(
        'Erro ao vincular papel:',
        error
      );

      setErro(
        error.message ||
          'Não foi possível vincular o papel.'
      );
    } finally {
      setProcessando(false);
    }
  }

  async function handleRemoverPapel(vinculoId) {
    const confirmar = window.confirm(
      'Deseja realmente remover este papel do usuário?'
    );

    if (!confirmar) {
      return;
    }

    try {
      setProcessando(true);
      setErro('');
      setMensagem('');

      await removerPapel(vinculoId);

      setMensagem(
        'Papel removido do usuário com sucesso.'
      );

      const resposta =
        await listarPapeisDoUsuario(id);

      setPapeis(resposta.data || []);
    } catch (error) {
      console.error(
        'Erro ao remover papel:',
        error
      );

      setErro(
        error.message ||
          'Não foi possível remover o papel.'
      );
    } finally {
      setProcessando(false);
    }
  }

  async function handleDesativarUsuario() {
    const confirmar = window.confirm(
      'Deseja realmente desativar este usuário?'
    );

    if (!confirmar) {
      return;
    }

    try {
      setProcessando(true);
      setErro('');
      setMensagem('');

      await desativarUsuario(id);

      router.push('/admin/usuarios');
    } catch (error) {
      console.error(
        'Erro ao desativar usuário:',
        error
      );

      setErro(
        error.message ||
          'Não foi possível desativar o usuário.'
      );

      setProcessando(false);
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <p>Carregando usuário...</p>
        </div>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <p>Usuário não encontrado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6">
          <Link
            href="/admin/usuarios"
            className="text-sm underline"
          >
            ← Voltar para usuários
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Administração do Usuário
          </h1>

          <p className="mt-2 text-gray-600">
            {usuario.email}
          </p>
        </header>

        {erro && (
          <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-700">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="mb-6 rounded border border-green-300 bg-green-50 p-4 text-green-700">
            {mensagem}
          </div>
        )}

        {/* Conta */}
        <section className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Conta
            </h2>

            <Link
              href={`/admin/usuarios/${id}/editar`}
              className="rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              Editar
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                E-mail
              </p>

              <p className="font-medium">
                {usuario.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p>
                {usuario.ativo
                  ? 'Ativo'
                  : 'Desativado'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                E-mail verificado
              </p>

              <p>
                {usuario.email_verificado_em
                  ? 'Verificado'
                  : 'Não verificado'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Último login
              </p>

              <p>
                {usuario.ultimo_login_em
                  ? new Date(
                      usuario.ultimo_login_em
                    ).toLocaleString('pt-BR')
                  : 'Nenhum login registrado'}
              </p>
            </div>
          </div>
        </section>

        {/* Perfil */}
        <section className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold">
            Perfil
          </h2>

          {!perfil ? (
            <p className="text-gray-600">
              Este usuário ainda não possui um perfil cadastrado.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Nome
                </p>

                <p>
                  {[perfil.nome, perfil.sobrenome]
                    .filter(Boolean)
                    .join(' ') || 'Não informado'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Nome de usuário
                </p>

                <p>
                  {perfil.nome_usuario ||
                    'Não informado'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Biografia
                </p>

                <p>
                  {perfil.biografia ||
                    'Não informada'}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Papéis */}
        <section className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold">
            Papéis
          </h2>

          {papeis.length === 0 ? (
            <p className="mb-5 text-gray-600">
              Este usuário não possui papéis ativos.
            </p>
          ) : (
            <div className="mb-6 space-y-3">
              {papeis.map((papel) => (
                <div
                  key={papel.id}
                  className="flex items-center justify-between rounded border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-medium">
                      {papel.papel_nome}
                    </p>

                    <p className="text-sm text-gray-500">
                      {papel.papel_codigo}
                    </p>

                    {papel.papel_descricao && (
                      <p className="mt-1 text-sm text-gray-600">
                        {papel.papel_descricao}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={processando}
                    onClick={() =>
                      handleRemoverPapel(papel.id)
                    }
                    className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-5">
            <h3 className="mb-3 font-medium">
              Adicionar papel
            </h3>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={papelSelecionado}
                onChange={(event) =>
                  setPapelSelecionado(
                    event.target.value
                  )
                }
                className="flex-1 rounded border p-3"
              >
                <option value="">
                  Selecione um papel
                </option>

                {todosPapeis
                  .filter(
                    (papel) =>
                      !papeis.some(
                        (atual) =>
                          atual.papel_id ===
                          papel.id
                      )
                  )
                  .map((papel) => (
                    <option
                      key={papel.id}
                      value={papel.id}
                    >
                      {papel.nome}
                    </option>
                  ))}
              </select>

              <button
                type="button"
                disabled={
                  processando ||
                  !papelSelecionado
                }
                onClick={handleAdicionarPapel}
                className="rounded bg-black px-5 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </section>

        {/* Zona administrativa */}
        <section className="rounded-lg border border-red-200 bg-white p-6 shadow">
          <h2 className="mb-2 text-lg font-semibold text-red-700">
            Administração da conta
          </h2>

          <p className="mb-4 text-sm text-gray-600">
            A desativação impede o uso normal desta conta.
          </p>

          <button
            type="button"
            disabled={processando}
            onClick={handleDesativarUsuario}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Desativar usuário
          </button>
        </section>

      </div>
    </main>
  );
}
