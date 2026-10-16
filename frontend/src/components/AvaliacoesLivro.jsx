
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { obterUsuario } from '../services/autenticacao';
import {
  alterarComentarioAvaliacao,
  alterarNotaAvaliacao,
  buscarMinhaAvaliacao,
  criarAvaliacao,
  listarAvaliacoesPorLivro,
} from '../services/avaliacao';

const NOTA_INICIAL = 5;

export default function AvaliacoesLivro({ livroId }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [minhaAvaliacao, setMinhaAvaliacao] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [nota, setNota] = useState(NOTA_INICIAL);
  const [comentario, setComentario] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sessaoExpirada, setSessaoExpirada] = useState(false);

  const carregarAvaliacoes = useCallback(async (usuarioAtual) => {
    setCarregando(true);
    setErro('');

    try {
      const resposta = await listarAvaliacoesPorLivro(livroId);
      setAvaliacoes(resposta.data || []);

      if (usuarioAtual?.id) {
        try {
          const respostaPessoal = await buscarMinhaAvaliacao(
            usuarioAtual.id,
            livroId
          );

          const avaliacao = respostaPessoal.data || null;

          setMinhaAvaliacao(avaliacao);
          setNota(avaliacao?.nota || NOTA_INICIAL);
          setComentario(avaliacao?.comentario || '');
        } catch (erroBusca) {
          if (erroBusca.status === 404) {
            setMinhaAvaliacao(null);
            setNota(NOTA_INICIAL);
            setComentario('');
          } else if (erroBusca.status === 401) {
            setSessaoExpirada(true);
            setUsuario(null);
          } else {
            throw erroBusca;
          }
        }
      }
    } catch (erroCarga) {
      if (erroCarga.status === 401) {
        setSessaoExpirada(true);
        setUsuario(null);
      }

      setErro(
        erroCarga.message || 'Não foi possível carregar as avaliações.'
      );
    } finally {
      setCarregando(false);
    }
  }, [livroId]);

  useEffect(() => {
    let ativo = true;

    try {
      const usuarioAtual = obterUsuario();
      setUsuario(usuarioAtual);

      carregarAvaliacoes(usuarioAtual).catch((erroCarga) => {
        if (ativo) setErro(erroCarga.message);
      });
    } catch {
      setErro(
        'Não foi possível identificar sua sessão. Faça login novamente.'
      );
      setCarregando(false);
    }

    return () => {
      ativo = false;
    };
  }, [carregarAvaliacoes]);

  async function salvarAvaliacao(event) {
    event.preventDefault();

    if (!usuario || salvando) return;

    setSalvando(true);
    setErro('');
    setMensagem('');

    try {
      let resposta;

      if (!minhaAvaliacao) {
        resposta = await criarAvaliacao(
          livroId,
          Number(nota),
          comentario
        );
      } else {
        const notaAlterada = Number(nota) !== minhaAvaliacao.nota;
        const comentarioAlterado =
          comentario !== (minhaAvaliacao.comentario || '');

        if (!notaAlterada && !comentarioAlterado) {
          setMensagem('Sua avaliação já está atualizada.');
          return;
        }

        if (notaAlterada) {
          resposta = await alterarNotaAvaliacao(
            minhaAvaliacao.id,
            Number(nota)
          );
        }

        if (comentarioAlterado) {
          resposta = await alterarComentarioAvaliacao(
            minhaAvaliacao.id,
            comentario.trim() ? comentario : null
          );
        }
      }

      if (resposta?.data) {
        setMinhaAvaliacao(resposta.data);
      }

      setMensagem('Avaliação salva com sucesso.');
      await carregarAvaliacoes(usuario);
    } catch (erroSalvar) {
      if (erroSalvar.status === 401) {
        setSessaoExpirada(true);
        setUsuario(null);
      }

      setErro(
        erroSalvar.message || 'Não foi possível salvar sua avaliação.'
      );
    } finally {
      setSalvando(false);
    }
  }

  const media = avaliacoes.length
    ? (
        avaliacoes.reduce(
          (soma, item) => soma + Number(item.nota),
          0
        ) / avaliacoes.length
      ).toFixed(1)
    : null;

  return (
    <section
      className="mt-10 rounded-lg bg-white p-6 shadow-md"
      aria-labelledby="avaliacoes-titulo"
    >
      <div className="mb-6">
        <h2
          id="avaliacoes-titulo"
          className="text-2xl font-bold text-gray-900"
        >
          Avaliações
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          {media
            ? `${media} de 5 · ${avaliacoes.length} ${
                avaliacoes.length === 1 ? 'avaliação' : 'avaliações'
              }`
            : 'Esta obra ainda não recebeu avaliações.'}
        </p>
      </div>

      {carregando ? (
        <p className="text-gray-600">Carregando avaliações...</p>
      ) : (
        <>
          {avaliacoes.length > 0 && (
            <ul className="mb-8 space-y-4">
              {avaliacoes.map((avaliacao) => (
                <li
                  key={avaliacao.id}
                  className="border-b border-gray-200 pb-4 last:border-0"
                >
                  <p
                    className="font-semibold text-gray-900"
                    aria-label={`Nota ${avaliacao.nota} de 5`}
                  >
                    <span className="text-amber-500" aria-hidden="true">
                      {'★'.repeat(avaliacao.nota)}
                      {'☆'.repeat(5 - avaliacao.nota)}
                    </span>
                    <span className="ml-2">{avaliacao.nota}/5</span>
                  </p>

                  {avaliacao.comentario && (
                    <p className="mt-2 whitespace-pre-wrap text-gray-700">
                      {avaliacao.comentario}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!usuario ? (
            <p className="rounded bg-gray-50 p-4 text-gray-700">
              {sessaoExpirada
                ? 'Sua sessão expirou. '
                : 'Entre na sua conta para avaliar esta obra. '}

              <Link
                href="/login"
                className="font-semibold text-blue-700 hover:underline"
              >
                Fazer login
              </Link>
            </p>
          ) : (
            <form onSubmit={salvarAvaliacao} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {minhaAvaliacao
                  ? 'Editar minha avaliação'
                  : 'Deixe sua avaliação'}
              </h3>

              <fieldset>
                <legend className="text-sm font-medium text-gray-700">
                  Sua nota
                </legend>

                <div
                  className="mt-2 flex items-center gap-1"
                  role="group"
                  aria-label="Selecione uma nota de 1 a 5 estrelas"
                >
                  {[1, 2, 3, 4, 5].map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setNota(valor)}
                      disabled={salvando}
                      aria-label={`Selecionar ${valor} ${
                        valor === 1 ? 'estrela' : 'estrelas'
                      }`}
                      aria-pressed={nota === valor}
                      className="rounded p-1 text-3xl leading-none transition-colors
                        hover:scale-110
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-amber-500
                        disabled:cursor-not-allowed
                        disabled:opacity-50"
                    >
                      <span
                        className={
                          valor <= nota
                            ? 'text-amber-500'
                            : 'text-gray-300 hover:text-amber-400'
                        }
                        aria-hidden="true"
                      >
                        {valor <= nota ? '★' : '☆'}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-1 text-sm text-gray-600" aria-live="polite">
                  {nota} de 5 estrelas
                </p>
              </fieldset>

              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor={`comentario-avaliacao-${livroId}`}
              >
                Comentário (opcional)

                <textarea
                  id={`comentario-avaliacao-${livroId}`}
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="mt-1 block w-full rounded border border-gray-300 p-2"
                  placeholder="Compartilhe sua opinião sobre a obra"
                />

                <span className="mt-1 block text-right text-xs text-gray-500">
                  {comentario.length}/1.000
                </span>
              </label>

              {erro && (
                <p role="alert" className="text-sm text-red-700">
                  {erro}
                </p>
              )}

              {mensagem && (
                <p role="status" className="text-sm text-green-700">
                  {mensagem}
                </p>
              )}

              <button
                type="submit"
                disabled={salvando}
                className="rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {salvando
                  ? 'Salvando...'
                  : minhaAvaliacao
                    ? 'Salvar alterações'
                    : 'Enviar avaliação'}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
