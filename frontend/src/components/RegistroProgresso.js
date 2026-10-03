'use client';

import { useEffect } from 'react';

import { obterUsuario } from '../services/autenticacao';

import {
  buscarPorUsuarioELivro,
  criarProgresso,
} from '../services/progressoLeitura';

export default function RegistroProgresso({
  livroId,
  cenaId,
}) {
  useEffect(() => {
    async function registrarInicio() {
      const usuario = obterUsuario();

      if (!usuario) {
        return;
      }

      try {
        await buscarPorUsuarioELivro(
          usuario.id,
          livroId
        );

        // O progresso já existe.
        // Nesta etapa não alteramos a cena atual.
      } catch (erro) {
        if (erro.status !== 404) {
          console.error(
            'Erro ao consultar progresso de leitura:',
            erro
          );

          return;
        }

        try {
          await criarProgresso({
            usuario_id: usuario.id,
            livro_id: livroId,
            cena_atual_id: cenaId,
            percentual_concluido: 0,
            concluido: false,
          });
        } catch (erroCriacao) {
          console.error(
            'Erro ao criar progresso de leitura:',
            erroCriacao
          );
        }
      }
    }

    registrarInicio();
  }, [livroId, cenaId ]);

  return null;
}
