'use client';

import { useEffect, useState } from 'react';
import { listarArquivosPorLivro } from '../services/arquivoMidia';

function tamanhoLegivel(tamanho) {
  const valor = typeof tamanho === 'string' && tamanho.trim() !== ''
    ? Number(tamanho)
    : tamanho;

  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0) {
    return 'Tamanho não informado';
  }
  if (valor < 1024) return `${valor} B`;
  if (valor < 1024 ** 2) return `${(valor / 1024).toFixed(1)} KB`;
  if (valor < 1024 ** 3) return `${(valor / 1024 ** 2).toFixed(1)} MB`;
  return `${(valor / 1024 ** 3).toFixed(1)} GB`;
}

export default function ArquivoGerenciadoSelect({
  livroId,
  value,
  onChange,
  disabled = false,
}) {
  const [arquivos, setArquivos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarArquivos() {
      setCarregando(true);
      setErro('');

      try {
        const resposta = await listarArquivosPorLivro(livroId);
        if (!Array.isArray(resposta.data) || !resposta.data.every(
          (arquivo) => (
            arquivo &&
            typeof arquivo.id === 'string' &&
            typeof arquivo.nome_original === 'string'
          )
        )) {
          throw new Error('A resposta de arquivos da obra está em formato inválido.');
        }

        if (ativo) setArquivos(resposta.data);
      } catch (errorCarregamento) {
        if (ativo) {
          setErro(
            errorCarregamento.message ||
            'Não foi possível listar os arquivos gerenciados desta obra.'
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    if (livroId) carregarArquivos();
    else {
      setArquivos([]);
      setErro('Não foi possível identificar a obra desta cena.');
      setCarregando(false);
    }

    return () => {
      ativo = false;
    };
  }, [livroId]);

  const arquivoAssociadoDisponivel = arquivos.some(
    (arquivo) => arquivo.id === value
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Arquivo da obra
      </label>
      <select
        value={value || ''}
        disabled={disabled || carregando}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 disabled:bg-gray-100"
      >
        <option value="">Usar URL (compatibilidade legada)</option>
        {value && !arquivoAssociadoDisponivel && !carregando && (
          <option value={value} disabled>
            {erro
              ? 'Arquivo associado; não foi possível consultar a lista'
              : 'Arquivo associado indisponível'}
          </option>
        )}
        {arquivos.map((arquivo) => (
          <option key={arquivo.id} value={arquivo.id}>
            {arquivo.nome_original}
            {' · '}
            {arquivo.mime_type || 'Tipo não informado'}
            {' · '}
            {tamanhoLegivel(arquivo.tamanho_bytes)}
          </option>
        ))}
      </select>

      {carregando && (
        <p role="status" className="mt-2 text-sm text-gray-500">
          Carregando arquivos gerenciados da obra…
        </p>
      )}
      {!carregando && erro && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          Não foi possível listar os arquivos gerenciados: {erro}
        </p>
      )}
      {!carregando && !erro && arquivos.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Nenhum arquivo gerenciado ativo nesta obra. Você ainda pode usar uma URL.
        </p>
      )}
      {value && arquivoAssociadoDisponivel && (
        <p className="mt-2 text-sm text-gray-600">
          Selecionado: {arquivos.find((arquivo) => arquivo.id === value)?.nome_original}
        </p>
      )}
    </div>
  );
}
