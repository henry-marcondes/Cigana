import { apiFetch } from '../../../services/api';
import LeituraLivro from '../../../components/LeituraLivro';

export default async function LivroPage({ params }) {
  const { slug } = await params;

  const respostaLivro = await apiFetch(
    `/api/livros/slug/${slug}`
  );

  const livro = respostaLivro.data;

  const respostaCapitulos = await apiFetch(
    `/api/capitulos/livro/${livro.id}`
  );

  const capitulos = respostaCapitulos.data;

  return <LeituraLivro livro={livro} capitulos={capitulos} />;
}
