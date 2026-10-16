'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { obterUsuario } from '../services/autenticacao';
import { listarFinaisConquistados } from '../services/finaisLeitura';

export default function HistoricoFinais({ livroId }) {
  const [finais, setFinais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const usuarioAtual = obterUsuario();
        if (!ativo) return;
        setUsuario(usuarioAtual);
        if (usuarioAtual?.id) {
          const resposta = await listarFinaisConquistados(livroId);
          if (ativo) setFinais(resposta.data || []);
        }
      } catch (falha) {
        if (ativo) setErro(falha.message || 'Não foi possível carregar os finais conquistados.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; };
  }, [livroId]);

  return (
    <section className="mt-10 rounded-lg bg-white p-6 shadow-md" aria-labelledby="historico-finais-titulo">
      <h2 id="historico-finais-titulo" className="text-2xl font-bold text-gray-900">
        Finais conquistados
      </h2>

      {carregando ? (
        <p className="mt-3 text-gray-600">Carregando seu histórico...</p>
      ) : !usuario ? (
        <p className="mt-3 text-gray-600">
          <Link href="/login" className="font-semibold text-blue-700 hover:underline">Entre na sua conta</Link> para consultar seus finais registrados.
        </p>
      ) : erro ? (
        <p role="alert" className="mt-3 text-red-700">{erro}</p>
      ) : finais.length === 0 ? (
        <p className="mt-3 text-gray-600">Você ainda não registrou finais nesta obra.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {finais.map((final) => (
            <li key={final.id} className="rounded border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">{final.cena_titulo}</p>
              {final.capitulo_titulo && <p className="text-sm text-gray-600">{final.capitulo_titulo}</p>}
              <p className="mt-1 text-sm text-green-800">Final conquistado · {new Date(final.confirmado_em).toLocaleString('pt-BR')}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
