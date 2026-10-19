import { apiFetch } from '../../../../../../../services/api';
import LeituraCena from '../../../../../../../components/LeituraCena';
import RegistroProgresso from '../../../../../../../components/RegistroProgresso';
import { carregarDadosLeituraCena } from '../../../../../../../services/leitura';

export default async function CenaPage({ params }) {
  const { slug, capituloSlug, cenaSlug } = await params;

  /*
   * ============================================================
   * 1. LIVRO
   * ============================================================
   */

  const respostaLivro = await apiFetch(
    `/api/livros/slug/${slug}`
  );

  const livro = respostaLivro.data;

  /*
   * ============================================================
   * 2. CAPÍTULO
   * ============================================================
   */

  const respostaCapitulo = await apiFetch(
    `/api/capitulos/livro/${livro.id}/slug/${capituloSlug}`
  );

  const capitulo = respostaCapitulo.data;

  /*
   * ============================================================
   * 3. CENA
   * ============================================================
   */

  const respostaCena = await apiFetch(
    `/api/cenas/capitulo/${capitulo.id}/slug/${cenaSlug}`
  );

  const cena = respostaCena.data;

  const { conteudos, escolhas } = await carregarDadosLeituraCena(cena);

  /*
   * ============================================================
   * 8. RENDERIZAÇÃO
   * ============================================================
   */

  return (
    <>
      <LeituraCena
        livro={livro}
        capitulo={capitulo}
        cena={cena}
        conteudos={conteudos}
        escolhas={escolhas}
        linkVoltar={`/livros/${slug}/capitulos/${capituloSlug}`}
        mostrarAcaoFinal
      />
      <RegistroProgresso livroId={livro.id} cenaId={cena.id} />
    </>
  );
}
