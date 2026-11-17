import { apiFetch } from './api';
import { obterUrlAssinadaArquivo, notificarArquivosMidiaAtualizados } from './arquivoMidia';

export async function listarDocumentosMarkdown(livroId) {
  return apiFetch(`/api/livro-documentos/livro/${livroId}`);
}

export async function obterDocumentoPrincipal(livroId) {
  return apiFetch(`/api/livro-documentos/livro/${livroId}/principal`);
}

export async function enviarDocumentoMarkdown(livroId, arquivo, papel = 'SECUNDARIO') {
  if (!arquivo || !/\.(md|markdown)$/i.test(arquivo.name)) {
    throw new Error('Selecione um arquivo .md ou .markdown.');
  }
  const resposta = await apiFetch(`/api/livro-documentos/livro/${livroId}?papel=${papel}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/markdown', 'X-Nome-Original': arquivo.name },
    body: arquivo,
  });
  notificarArquivosMidiaAtualizados(livroId);
  return resposta;
}

export async function criarDocumentoMarkdown(livroId, papel = 'SECUNDARIO', nome = 'documento.md') {
  const Arquivo = window.File;
  const arquivo = new Arquivo([''], nome.endsWith('.md') ? nome : `${nome}.md`, { type: 'text/markdown' });
  // O parser aceita documentos vazios; nome original é sempre uma extensão Markdown.
  return enviarDocumentoMarkdown(livroId, arquivo, papel);
}

export async function lerDocumentoMarkdown(arquivoId) {
  const url = await obterUrlAssinadaArquivo(arquivoId);
  const resposta = await fetch(url, { cache: 'no-store' });
  if (!resposta.ok) throw new Error('Não foi possível carregar o documento Markdown.');
  const conteudo = await resposta.text();
  const hash = await calcularHash(conteudo);
  return { conteudo, hash };
}

export async function salvarDocumentoMarkdown(livroId, arquivoId, conteudo, hashEsperado) {
  const resposta = await apiFetch(`/api/livro-documentos/livro/${livroId}/${arquivoId}/conteudo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/markdown', 'X-Hash-Esperado': hashEsperado },
    body: conteudo,
  });
  notificarArquivosMidiaAtualizados(livroId);
  return resposta;
}

export async function promoverDocumentoMarkdown(livroId, arquivoId) {
  return apiFetch(`/api/livro-documentos/livro/${livroId}/${arquivoId}/promover`, { method: 'POST' });
}

export async function desativarDocumentoMarkdown(livroId, arquivoId) {
  return apiFetch(`/api/livro-documentos/livro/${livroId}/${arquivoId}`, { method: 'DELETE' });
}

export async function consultarTrechoMarkdown(textoId) {
  return apiFetch(`/api/livro-documentos/trechos/${textoId}`);
}

export async function calcularHash(texto) {
  const bytes = new TextEncoder().encode(texto);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
