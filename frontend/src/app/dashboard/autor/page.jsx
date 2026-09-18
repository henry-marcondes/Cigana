'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { apiFetch } from '../../../services/api';
import { estaAutenticado, obterUsuario } from '../../../services/autenticacao';
import { criarSolicitacaoAutor } from '../../../services/solicitacaoAutor';

export default function SolicitacaoAutorPage() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [idiomas, setIdiomas] = useState([]);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [formulario, setFormulario] = useState({
    nome_publico: '',
    biografia: '',
    foto_url: '',
    titulo_provisorio: '',
    resumo: '',
    categoria_id: '',
    classificacao_indicativa_id: '',
    idioma_id: '',
  });

  useEffect(() => {
    if (!estaAutenticado()) {
      router.push('/login');
      return;
    }

    carregarDados();
  }, [router]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');

      const usuario = obterUsuario();

      if (!usuario) {
        router.push('/login');
        return;
      }

      const [categoriasResponse, classificacoesResponse, idiomasResponse] =
        await Promise.all([
          apiFetch('/api/categorias/biblioteca/biblioteca-publica'),
          apiFetch('/api/classificacoes-indicativas'),
          apiFetch('/api/idiomas'),
        ]);

      setCategorias(categoriasResponse.data || []);
      setClassificacoes(classificacoesResponse.data || []);
      setIdiomas(idiomasResponse.data || []);
    } catch (error) {
      console.error(
        'Erro ao carregar dados da solicitação de Autor:',
        error
      );

      setErro(
        error.message ||
          'Não foi possível carregar os dados do formulário.'
      );
    } finally {
      setCarregando(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro('');
    setSucesso('');
    setEnviando(true);

    try {
      const resposta = await criarSolicitacaoAutor(formulario);

      console.log('Solicitação de Autor criada:', resposta);

      setSucesso(
        'Sua solicitação foi enviada com sucesso. Ela será analisada pela Plataforma.'
      );

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error(
        'Erro ao enviar solicitação de Autor:',
        error
      );

      setErro(
        error.message ||
          'Não foi possível enviar sua solicitação.'
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <p>Carregando formulário...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm underline"
          >
            ← Voltar para o Dashboard
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-2xl font-bold">
            Quero atuar como Autor
          </h1>

          <p className="mt-2 text-gray-600">
            Conte um pouco sobre você e apresente a obra que
            pretende desenvolver na Plataforma.
          </p>
        </header>

        {erro && (
          <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-700">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-6 rounded border border-green-300 bg-green-50 p-4 text-green-700">
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">
              Sobre você
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nome_publico"
                  className="mb-1 block text-sm font-medium"
                >
                  Nome público
                </label>

                <input
                  id="nome_publico"
                  name="nome_publico"
                  type="text"
                  value={formulario.nome_publico}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  className="w-full rounded border p-3"
                  placeholder="Nome que será apresentado na Plataforma"
                />
              </div>

              <div>
                <label
                  htmlFor="biografia"
                  className="mb-1 block text-sm font-medium"
                >
                  Biografia
                </label>

                <textarea
                  id="biografia"
                  name="biografia"
                  value={formulario.biografia}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded border p-3"
                  placeholder="Conte brevemente sobre você e seu trabalho."
                />
              </div>

              <div>
                <label
                  htmlFor="foto_url"
                  className="mb-1 block text-sm font-medium"
                >
                  Foto
                </label>

                <input
                  id="foto_url"
                  name="foto_url"
                  type="url"
                  value={formulario.foto_url}
                  onChange={handleChange}
                  className="w-full rounded border p-3"
                  placeholder="URL da sua foto (opcional)"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">
              Proposta da Obra
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="titulo_provisorio"
                  className="mb-1 block text-sm font-medium"
                >
                  Título provisório
                </label>

                <input
                  id="titulo_provisorio"
                  name="titulo_provisorio"
                  type="text"
                  value={formulario.titulo_provisorio}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  className="w-full rounded border p-3"
                  placeholder="Título provisório da obra"
                />
              </div>

              <div>
                <label
                  htmlFor="resumo"
                  className="mb-1 block text-sm font-medium"
                >
                  Resumo da obra
                </label>

                <textarea
                  id="resumo"
                  name="resumo"
                  value={formulario.resumo}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded border p-3"
                  placeholder="Apresente brevemente a obra que pretende criar."
                />
              </div>

              <div>
                <label
                  htmlFor="categoria_id"
                  className="mb-1 block text-sm font-medium"
                >
                  Categoria
                </label>

                <select
                  id="categoria_id"
                  name="categoria_id"
                  value={formulario.categoria_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded border p-3"
                >
                  <option value="">
                    Selecione uma categoria
                  </option>

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.id}
                      value={categoria.id}
                    >
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="classificacao_indicativa_id"
                  className="mb-1 block text-sm font-medium"
                >
                  Classificação indicativa
                </label>

                <select
                  id="classificacao_indicativa_id"
                  name="classificacao_indicativa_id"
                  value={formulario.classificacao_indicativa_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded border p-3"
                >
                  <option value="">
                    Selecione a classificação
                  </option>

                  {classificacoes.map((classificacao) => (
                    <option
                      key={classificacao.id}
                      value={classificacao.id}
                    >
                      {classificacao.idade_minima === 0
                        ? 'Livre para todos os públicos'
                        :`Acima de ${classificacao.idade_minima} anos`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="idioma_id"
                  className="mb-1 block text-sm font-medium"
                >
                  Idioma
                </label>

                <select
                  id="idioma_id"
                  name="idioma_id"
                  value={formulario.idioma_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded border p-3"
                >
                  <option value="">
                    Selecione o idioma
                  </option>

                  {idiomas.map((idioma) => (
                    <option
                      key={idioma.id}
                      value={idioma.id}
                    >
                      {idioma.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className="border-t pt-6">
            <p className="mb-4 text-sm text-gray-600">
              Os dados pessoais, fiscais e contratuais serão
              solicitados somente após a aprovação desta
              solicitação.
            </p>

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded bg-black px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando
                ? 'Enviando...'
                : 'Enviar solicitação'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
