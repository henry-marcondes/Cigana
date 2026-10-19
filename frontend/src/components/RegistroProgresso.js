'use client';

import { useEffect, useRef, useState } from 'react';

import { obterUsuario } from '../services/autenticacao';
import { apiFetch } from '../services/api';

import {
  criarProgresso,
  atualizarCenaAtual,
  concluirLeitura,
} from '../services/progressoLeitura';

export default function RegistroProgresso({
  livroId,
  cenaId,
}) {
  const progressos = useRef(new Map());
  const operacoesEmAndamento = useRef(new Map());
  const [progresso, setProgresso] = useState(null);
  const [concluindo, setConcluindo] = useState(false);
  const [erroConclusao, setErroConclusao] = useState('');

  useEffect(() => {
    let ativo = true;

    async function registrarCenaAtual() {
      const usuario = obterUsuario();

      if (!usuario || !livroId || !cenaId) {
        if (ativo) setProgresso(null);
        return;
      }

      if (ativo) setErroConclusao('');
      const chave = `${usuario.id}:${livroId}`;
      const operacaoAnterior =
        operacoesEmAndamento.current.get(chave) || Promise.resolve();
      const operacaoAtual = operacaoAnterior.catch(() => {}).then(async () => {
        let progresso; {
          let resposta;
          try {
            resposta = await apiFetch(
              `/api/progresso-leitura/usuario/${usuario.id}/livro/${livroId}`,
              { silenciarErro: true }
            );
          } catch (erro) {
            if (erro.status !== 404) {
              throw erro;
            }

            resposta = await criarProgresso({
              usuario_id: usuario.id,
              livro_id: livroId,
              versao_livro: 1,
              cena_atual_id: cenaId,
              percentual_concluido: 0,
              concluido: false,
            });

            if (!resposta?.data?.id) {
              throw new Error('A criação do progresso não foi confirmada pela API.');
            }
          }

          progresso = resposta.data;
          progressos.current.set(chave, progresso);
        }

        if (progresso.cena_atual_id === cenaId) {
          if (ativo) setProgresso(progresso);
          return;
        }

        const resposta = await atualizarCenaAtual(progresso.id, cenaId);
        progresso = resposta?.data || { ...progresso, cena_atual_id: cenaId };
        progressos.current.set(chave, progresso);
        if (ativo) setProgresso(progresso);
      });

      operacoesEmAndamento.current.set(chave, operacaoAtual);
      try {
        await operacaoAtual;
      } catch (erro) {
        console.error('Erro ao atualizar progresso de leitura:', erro);
      } finally {
        if (operacoesEmAndamento.current.get(chave) === operacaoAtual) {
          operacoesEmAndamento.current.delete(chave);
        }
      }
    }

    registrarCenaAtual();

    return () => { ativo = false; };
  }, [livroId, cenaId ]);

  async function handleConcluirLeitura() {
    if (
      !progresso?.id ||
      progresso.concluido ||
      Number(progresso.percentual_concluido) < 100 ||
      concluindo
    ) {
      return;
    }

    setConcluindo(true);
    setErroConclusao('');

    try {
      const resposta = await concluirLeitura(progresso.id);
      const progressoAtualizado = resposta?.data || {
        ...progresso,
        concluido: true,
        percentual_concluido: 100,
      };

      setProgresso(progressoAtualizado);
      progressos.current.set(`${progressoAtualizado.usuario_id}:${livroId}`, progressoAtualizado);
    } catch (erro) {
      setErroConclusao(
        erro.message || 'Não foi possível concluir a leitura. Tente novamente.'
      );
    } finally {
      setConcluindo(false);
    }
  }

  if (!progresso) return null;

  if (progresso.concluido) {
    return (
      <section
        className="mx-auto mt-6 max-w-4xl rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-900"
        role="status"
      >
        Leitura concluída
      </section>
    );
  }

  if (Number(progresso.percentual_concluido) < 100) return null;

  return (
    <section className="mx-auto mt-6 max-w-4xl rounded-lg border border-indigo-200 bg-white p-5 text-center shadow-sm">
      <p className="text-gray-700">
        Você explorou todas as cenas elegíveis desta obra.
      </p>
      <button
        type="button"
        onClick={handleConcluirLeitura}
        disabled={concluindo}
        className="mt-4 rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {concluindo ? 'Salvando...' : 'Concluir leitura'}
      </button>
      {erroConclusao && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {erroConclusao}
        </p>
      )}
    </section>
  );
}
