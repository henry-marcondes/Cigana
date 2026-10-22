import { API_SERVER_URL } from './api';

export function montarUrlMedia(url) {
  if (!url) return null;

  try {
    const ehAbsoluta = /^https?:\/\//i.test(url);
    const endereco = new URL(url, API_SERVER_URL);

    if (ehAbsoluta) {
      const origemLocal = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(
        endereco.hostname
      );
      if (!origemLocal) return url;
    }

    const caminhoMedia = endereco.pathname.match(/\/media\/.*$/)?.[0];
    if (!caminhoMedia) return ehAbsoluta ? url : endereco.pathname;

    const caminhoRelativo = `${caminhoMedia}${endereco.search}${endereco.hash}`;
    return typeof window === 'undefined'
      ? new URL(caminhoRelativo, API_SERVER_URL).toString()
      : caminhoRelativo;
  } catch {
    return url;
  }
}

// O validador atual de imagem exige URL absoluta; preserve esse contrato
// ao enviar um caminho local informado no Estúdio.
export function montarUrlImagemParaApi(url) {
  if (url?.startsWith('/media/')) {
    return `http://localhost:3001${url}`;
  }
  return url;
}
