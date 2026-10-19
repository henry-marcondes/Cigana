import { apiFetch } from './api';

export async function obterIndicadoresProgressoLeitura() {
  return apiFetch('/api/admin/analise-dados/progresso-leitura');
}
