'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import LeituraLivro from '../../../../../components/LeituraLivro';
import LeituraCapitulo from '../../../../../components/LeituraCapitulo';
import LeituraCena from '../../../../../components/LeituraCena';
import { apiFetch } from '../../../../../services/api';
import { estaAutenticado } from '../../../../../services/autenticacao';
import { listarCapitulosPorLivro } from '../../../../../services/capitulo';
import { carregarDadosLeituraCena } from '../../../../../services/leitura';

export default function PrevisualizarObraPage() {
  const { id: livroId } = useParams();
  const router = useRouter();

  const [livro, setLivro] = useState(null);
  const [capitulos, setCapitulos] = useState([]);
  const [capitulo, setCapitulo] = useState(null);
  const [cenaInicial, setCenaInicial] = useState(null);
  const [cena, setCena] = useState(null);
  const [conteudos, setConteudos] = useState([]);
  const [escolhas, setEscolhas] = useState([]);
  const [etapa, setEtapa] = useState('livro');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!estaAutenticado()) {
      router.replace('/login');
      return;
    }

    async function carregarObra() {
      try {
        setCarregando(true);
        setErro('');

        const [respostaLivro, respostaCapitulos] = await Promise.all([
          apiFetch(`/api/livros/${livroId}`),
          listarCapitulosPorLivro(livroId),
        ]);

        setLivro(respostaLivro.data);
        setCapitulos(respostaCapitulos.data || []);
      } catch (erroCarregamento) {
        setErro(
          erroCarregamento.message ||
          'Não foi possível abrir a pré-visualização desta obra.'
        );
      } finally {
        setCarregando(false);
      }
    }

    if (livroId) carregarObra();
  }, [livroId, router]);

  async function selecionarCapitulo(capituloResumo) {
    try {
      setCarregando(true);
      setErro('');

      const [respostaCapitulo, respostaCenaInicial] = await Promise.all([
        apiFetch(
          `/api/capitulos/livro/${livroId}/slug/${capituloResumo.slug}`
        ),
        apiFetch(
          `/api/cenas/capitulo/${capituloResumo.id}/inicial`
        ),
      ]);

      setCapitulo(respostaCapitulo.data);
      setCenaInicial(respostaCenaInicial.data);
      setEtapa('capitulo');
    } catch (erroCarregamento) {
      setErro(
        erroCarregamento.message || 'Não foi possível abrir o capítulo.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function abrirCena(cenaId) {
    try {
      setCarregando(true);
      setErro('');

      const respostaCena = await apiFetch(`/api/cenas/${cenaId}`);
      const cenaAtual = respostaCena.data;
      const [respostaCapitulo, dadosLeitura] = await Promise.all([
        apiFetch(`/api/capitulos/${cenaAtual.capitulo_id}`),
        carregarDadosLeituraCena(cenaAtual),
      ]);

      setCapitulo(respostaCapitulo.data);
      setCena(cenaAtual);
      setConteudos(dadosLeitura.conteudos);
      setEscolhas(dadosLeitura.escolhas);
      setEtapa('cena');
    } catch (erroCarregamento) {
      setErro(
        erroCarregamento.message || 'Não foi possível carregar a cena.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarEscolha(escolha) {
    try {
      setCarregando(true);
      setErro('');

      const dadosLeitura = await carregarDadosLeituraCena(
        escolha.cenaDestino
      );

      setCapitulo(escolha.capituloDestino);
      setCena(escolha.cenaDestino);
      setConteudos(dadosLeitura.conteudos);
      setEscolhas(dadosLeitura.escolhas);
    } catch (erroCarregamento) {
      setErro(
        erroCarregamento.message || 'Não foi possível abrir o destino.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-amber-200 bg-amber-50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-amber-950">Pré-visualização</p>
            <p className="text-sm text-amber-900">
              Esta obra está em Rascunho e ainda não foi publicada.
            </p>
          </div>
          <Link
            href="/estudio"
            className="rounded border border-amber-300 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-100"
          >
            ← Voltar ao Estúdio
          </Link>
        </div>
      </header>

      {erro && (
        <div className="mx-auto mt-6 max-w-4xl rounded border border-red-300 bg-red-50 p-4 text-red-800">
          {erro}
        </div>
      )}

      {carregando && (
        <main className="flex min-h-64 items-center justify-center p-6">
          <p className="text-gray-600">Carregando pré-visualização...</p>
        </main>
      )}

      {!carregando && livro && etapa === 'livro' && (
        <LeituraLivro
          livro={livro}
          capitulos={capitulos}
          onSelecionarCapitulo={selecionarCapitulo}
          linkVoltar="/estudio"
          textoVoltar="← Voltar ao Estúdio"
        />
      )}

      {!carregando && etapa === 'capitulo' && livro && capitulo && (
        <LeituraCapitulo
          livro={livro}
          capitulo={capitulo}
          cenaInicial={cenaInicial}
          onStart={(cenaSelecionada) => abrirCena(cenaSelecionada.id)}
          linkVoltar={() => setEtapa('livro')}
          textoVoltar="← Voltar aos capítulos"
        />
      )}

      {!carregando && etapa === 'cena' && livro && capitulo && cena && (
        <LeituraCena
          livro={livro}
          capitulo={capitulo}
          cena={cena}
          conteudos={conteudos}
          escolhas={escolhas}
          onSelecionarEscolha={selecionarEscolha}
          onVoltar={() => setEtapa('capitulo')}
        />
      )}
    </div>
  );
}
