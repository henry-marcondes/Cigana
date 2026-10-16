'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { obterUsuario } from '../services/autenticacao';
import {
  listarFinaisConquistados,
  registrarFinal,
} from '../services/finaisLeitura';

function formatarData(data) {
  if (!data) return '';
  return new Date(data).toLocaleString('pt-BR');
}

export default function ConfirmarFinal({ livroId, cena }) {
  const [usuario, setUsuario] = useState(null);
  const [registro, setRegistro] = useState(null);
  const [continuando, setContinuando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sessaoExpirada, setSessaoExpirada] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarEstado() {
      try {
        const usuarioAtual = obterUsuario();
        if (!ativo) return;
        setUsuario(usuarioAtual);

        if (usuarioAtual?.id) {
          const resposta = await listarFinaisConquistados(livroId);
          const conquistado = (resposta.data || []).find(
            (final) => final.cena_id === cena.id
          );
          if (ativo) setRegistro(conquistado || null);
        }
      } catch (falha) {
        if (ativo) {
          if (falha.status === 401) {
            setSessaoExpirada(true);
            setUsuario(null);
          }
          setErro(falha.message || 'Não foi possível carregar seu histórico de finais.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarEstado();
    return () => { ativo = false; };
  }, [livroId, cena.id]);

  async function confirmar() {
    setErro('');
    if (!usuario) {
      setErro('Entre na sua conta para registrar este final.');
      return;
    }

    setSalvando(true);
    try {
      const resposta = await registrarFinal(livroId, cena.id);
      setRegistro(resposta.data);
    } catch (falha) {
      if (falha.status === 401) {
        setSessaoExpirada(true);
        setUsuario(null);
      }
      setErro(falha.message || 'Não foi possível registrar este final.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5" aria-labelledby={`final-${cena.id}`}>
      <h2 id={`final-${cena.id}`} className="text-xl font-semibold text-gray-900">
        Você chegou a um final
      </h2>

      {registro ? (
        <p className="mt-2 font-medium text-green-800" role="status">
          Final conquistado{registro.confirmado_em ? ` em ${formatarData(registro.confirmado_em)}` : ''}.
        </p>
      ) : continuando ? (
        <p className="mt-2 text-gray-700">Você pode continuar explorando pelas escolhas disponíveis.</p>
      ) : (
        <>
          <p className="mt-2 text-gray-700">
            Você chegou a um dos possíveis finais desta obra. Você pode registrar este final e continuar explorando outros caminhos ou seguir sua leitura sem registrar este desfecho agora.
          </p>
          {carregando ? (
            <p className="mt-4 text-sm text-gray-600">Consultando seus finais conquistados...</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={confirmar}
                disabled={salvando}
                className="rounded bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
              >
                {salvando ? 'Registrando...' : 'Registrar este final'}
              </button>
              <button
                type="button"
                onClick={() => setContinuando(true)}
                className="rounded border border-gray-400 px-4 py-2 font-semibold text-gray-800 hover:bg-white"
              >
                Continuar explorando
              </button>
            </div>
          )}
        </>
      )}

      {erro && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {erro}{' '}
          {sessaoExpirada && <Link href="/login" className="font-semibold underline">Fazer login novamente</Link>}
          {!usuario && !sessaoExpirada && <Link href="/login" className="font-semibold underline">Fazer login</Link>}
        </p>
      )}
    </section>
  );
}
