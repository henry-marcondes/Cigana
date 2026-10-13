'use client';

import { useEffect, useRef } from 'react';

import { obterUsuario } from '../services/autenticacao';
import { apiFetch } from '../services/api';

import {
  criarProgresso,
  atualizarCenaAtual,
} from '../services/progressoLeitura';

export default function RegistroProgresso({
  livroId,
  cenaId,
}) {
  const progressos = useRef(new Map());
  const operacoesEmAndamento = useRef(new Map());

  useEffect(() => {
    async function registrarCenaAtual() {
      const usuario = obterUsuario();

      if (!usuario || !livroId || !cenaId) {
        return;
      }

      const chave = `${usuario.id}:${livroId}`;
      const operacaoAnterior =
        operacoesEmAndamento.current.get(chave) || Promise.resolve();
      const operacaoAtual = operacaoAnterior.catch(() => {}).then(async () => {
        let progresso = progressos.current.get(chave);

        if (!progresso) {
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
          return;
        }

        const resposta = await atualizarCenaAtual(progresso.id, cenaId);
        progressos.current.set(
          chave,
          resposta?.data || { ...progresso, cena_atual_id: cenaId }
        );
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
  }, [livroId, cenaId ]);

  return null;
}
