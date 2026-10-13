import { apiFetch } from '../../../../../services/api';
import LeituraCapitulo from '../../../../../components/LeituraCapitulo';

export default async function CapituloPage({ params }) {
  const { slug, capituloSlug } = await params;

  const respostaLivro = await apiFetch(
    `/api/livros/slug/${slug}`
  );

  const livro = respostaLivro.data;

  const respostaCapitulo = await apiFetch(
    `/api/capitulos/livro/${livro.id}/slug/${capituloSlug}`
  );

  const capitulo = respostaCapitulo.data;
  
  const respostaCenaInicial = await apiFetch(
    `/api/cenas/capitulo/${capitulo.id}/inicial`
  );

  const cenaInicial = respostaCenaInicial.data;

  return (
    <LeituraCapitulo
      livro={livro}
      capitulo={capitulo}
      cenaInicial={cenaInicial}
      linkVoltar={`/livros/${slug}`}
    />
  );
}
