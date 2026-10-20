import { apiFetch } from './api';

export async function obterIndicadoresProgressoLeitura() {
  return apiFetch('/api/admin/analise-dados/progresso-leitura');
}

export async function obterIndicadoresAvaliacoesComentarios({
  dataInicial,
  dataFinal,
  agrupamento,
}) {
  const parametros = new URLSearchParams({
    data_inicial: dataInicial,
    data_final: dataFinal,
    agrupamento,
  });

  return apiFetch(
    `/api/admin/analise-dados/avaliacoes-comentarios?${parametros.toString()}`
  );
}
