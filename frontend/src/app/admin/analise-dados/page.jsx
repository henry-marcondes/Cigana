'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { estaAutenticado, obterUsuario } from '../../../services/autenticacao';
import { usuarioTemPermissao } from '../../../services/permissoesEfetivas';
import {
  obterIndicadoresAvaliacoesComentarios,
  obterIndicadoresProgressoLeitura,
} from '../../../services/analiseDados';

const formatarNumero = (valor) =>
  new Intl.NumberFormat('pt-BR').format(Number.isFinite(Number(valor)) ? Number(valor) : 0);

const obterNumero = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
};

const formatarPercentual = (valor) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor ?? 0))}%`;

function formatarDataInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function obterPeriodoPadrao() {
  const hoje = new Date();
  const dataFinal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dataInicial = new Date(dataFinal);
  dataInicial.setDate(dataInicial.getDate() - 29);

  return {
    dataInicial: formatarDataInput(dataInicial),
    dataFinal: formatarDataInput(dataFinal),
    agrupamento: 'dia',
  };
}

function formatarPeriodo(periodo, agrupamento) {
  if (agrupamento === 'ano') return periodo.slice(0, 4);
  if (agrupamento === 'mes') return `${periodo.slice(5, 7)}/${periodo.slice(0, 4)}`;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${periodo}T00:00:00Z`));
}

const formatarMedia = (valor) => (
  valor === null || valor === undefined
    ? '—'
    : new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(valor))
);

function GraficoBarrasHorizontais({
  titulo,
  descricao,
  itens,
  series,
  maximo,
  classeAltura = 'max-h-72',
}) {
  const maiorValor = maximo === undefined
    ? itens.reduce(
      (maior, item) => series.reduce(
        (maiorSerie, serie) => Math.max(maiorSerie, obterNumero(item[serie.chave])),
        maior,
      ),
      0,
    )
    : obterNumero(maximo);
  const escala = maiorValor > 0 ? maiorValor : 1;

  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm" aria-label={titulo}>
      <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
      <p className="mt-1 text-sm text-gray-600">
        {descricao} Escala: 0 a {formatarNumero(maiorValor)}.
      </p>
      {series.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700" aria-label="Legenda">
          {series.map((serie) => (
            <li key={serie.chave} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-sm ${serie.cor}`} aria-hidden="true" />
              {serie.titulo}
            </li>
          ))}
        </ul>
      )}
      <div
        className={`mt-4 ${classeAltura} space-y-4 overflow-y-auto pr-2`}
        role="region"
        aria-label={`${titulo}, área rolável`}
        tabIndex={0}
      >
        {itens.length > 0 ? itens.map((item) => (
          <div key={item.id}>
            <p className="mb-2 break-words text-sm font-medium text-gray-800">{item.rotulo}</p>
            <div className="space-y-2">
              {series.map((serie) => {
                const valor = Math.max(0, obterNumero(item[serie.chave]));
                const largura = Math.min(100, (valor / escala) * 100);
                const valorNaEscala = Math.min(escala, valor);

                return (
                  <div key={serie.chave} className="grid grid-cols-[7rem_minmax(0,1fr)_4.5rem] items-center gap-2">
                    <span className="truncate text-xs text-gray-600" title={serie.titulo}>
                      {series.length > 1 ? serie.titulo : item.unidade || 'Quantidade'}
                    </span>
                    <div
                      className="h-3 overflow-hidden rounded-full bg-gray-100"
                      role="meter"
                      aria-label={`${item.rotulo}: ${serie.titulo}`}
                      aria-valuemin={0}
                      aria-valuemax={escala}
                      aria-valuenow={valorNaEscala}
                    >
                      <div className={`h-full rounded-full ${serie.cor}`} style={{ width: `${largura}%` }} />
                    </div>
                    <span className="text-right text-xs font-medium text-gray-900">
                      {serie.formatador ? serie.formatador(valor) : formatarNumero(valor)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )) : (
          <p className="py-5 text-center text-sm text-gray-600">Não há dados para exibir.</p>
        )}
      </div>
    </section>
  );
}

function Indicador({ titulo, valor, formatador = formatarNumero }) {
  return (
    <article className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-medium text-gray-600">{titulo}</h2>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {formatador(valor)}
      </p>
    </article>
  );
}

export default function AnaliseDadosPage() {
  const router = useRouter();
  const [indicadores, setIndicadores] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [podeConsultar, setPodeConsultar] = useState(false);
  const [filtros, setFiltros] = useState(obterPeriodoPadrao);
  const [periodoAplicado, setPeriodoAplicado] = useState(filtros);
  const [indicadoresAvaliacoes, setIndicadoresAvaliacoes] = useState(null);
  const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(true);
  const [erroAvaliacoes, setErroAvaliacoes] = useState('');

  useEffect(() => {
    if (!estaAutenticado()) {
      router.replace('/login');
      return;
    }

    let ativo = true;

    async function carregar() {
      try {
        const usuario = obterUsuario();
        const podeVisualizar = await usuarioTemPermissao(
          usuario?.id,
          'analise_dados.visualizar'
        );

        if (!podeVisualizar) {
          if (ativo) setErro('Sua conta não tem permissão para consultar esta área.');
          return;
        }

        if (ativo) setPodeConsultar(true);

        const resposta = await obterIndicadoresProgressoLeitura();
        if (ativo) setIndicadores(resposta.data);
      } catch (falha) {
        if (!ativo) return;

        setErro(
          falha.status === 403
            ? 'Sua conta não tem permissão para consultar esta área.'
            : falha.status === 401
              ? 'Sua sessão expirou. Entre novamente para continuar.'
              : falha.message || 'Não foi possível carregar os indicadores.'
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => { ativo = false; };
  }, [router]);

  useEffect(() => {
    if (!podeConsultar) return undefined;

    let ativo = true;
    setCarregandoAvaliacoes(true);
    setErroAvaliacoes('');

    obterIndicadoresAvaliacoesComentarios(periodoAplicado)
      .then((resposta) => {
        if (ativo) setIndicadoresAvaliacoes(resposta.data);
      })
      .catch((falha) => {
        if (!ativo) return;

        setErroAvaliacoes(
          falha.status === 403
            ? 'Sua conta não tem permissão para consultar esta área.'
            : falha.status === 401
              ? 'Sua sessão expirou. Entre novamente para continuar.'
              : falha.message || 'Não foi possível carregar avaliações e comentários.'
        );
      })
      .finally(() => {
        if (ativo) setCarregandoAvaliacoes(false);
      });

    return () => { ativo = false; };
  }, [podeConsultar, periodoAplicado]);

  const registrosAtivos = obterNumero(indicadores?.registros_progresso_ativos);
  const categorias = indicadores?.categorias ?? [];
  const obras = indicadores?.obras ?? [];
  const favoritos = indicadores?.favoritos ?? {};
  const obrasMaisFavoritadas = favoritos.obras_mais_favoritadas ?? [];
  const favoritosPorCategoria = favoritos.favoritos_por_categoria ?? [];
  const distribuicaoUsuariosFavoritos = favoritos.distribuicao_usuarios ?? [];

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-blue-700 hover:underline">
              Administração
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Análise de Dados
            </h1>
            <p className="mt-2 text-gray-600">
              Progresso de Leitura, Favoritos, Avaliações e Comentários
            </p>
          </div>
        </header>

        {carregando ? (
          <p role="status" className="rounded-lg bg-white p-6 text-gray-600">
            Carregando indicadores...
          </p>
        ) : erro ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-white p-6 text-red-800">
            {erro}
          </div>
        ) : indicadores ? (
          <>
            <section aria-label="Resumo do progresso de leitura" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Indicador
                titulo="Leitores com progresso ativo"
                valor={indicadores.leitores_com_progresso_ativo}
              />
              <Indicador
                titulo="Registros de progresso ativos"
                valor={indicadores.registros_progresso_ativos}
              />
              <Indicador
                titulo="Leituras concluídas"
                valor={indicadores.leituras_concluidas.concluidas}
              />
              <Indicador
                titulo="Leituras não concluídas"
                valor={indicadores.leituras_concluidas.nao_concluidas}
              />
              <Indicador
                titulo="Cenas distintas visitadas"
                valor={indicadores.cenas_distintas_visitadas}
              />
            </section>

            <section className="mt-8" aria-label="Relatório geral de progresso">
              <GraficoBarrasHorizontais
                titulo="Distribuição do percentual de exploração"
                descricao="Quantidade de registros em cada faixa; o denominador é o total de registros ativos."
                itens={(indicadores.distribuicao_percentual ?? []).map((item) => ({
                  id: item.faixa,
                  rotulo: item.faixa,
                  unidade: 'Registros',
                  quantidade: item.quantidade,
                }))}
                series={[{ chave: 'quantidade', titulo: 'Registros', cor: 'bg-indigo-600' }]}
                maximo={registrosAtivos}
              />
              <div className="mt-4">
                <GraficoBarrasHorizontais
                  titulo="Leituras por estado de conclusão"
                  descricao="Contagem de registros ativos por estado; cada estado é exibido como barra independente."
                  itens={[
                    {
                      id: 'concluidas',
                      rotulo: 'Leituras concluídas',
                      unidade: 'Registros',
                      quantidade: indicadores.leituras_concluidas.concluidas,
                    },
                    {
                      id: 'nao-concluidas',
                      rotulo: 'Leituras não concluídas',
                      unidade: 'Registros',
                      quantidade: indicadores.leituras_concluidas.nao_concluidas,
                    },
                  ]}
                  series={[{ chave: 'quantidade', titulo: 'Registros', cor: 'bg-emerald-600' }]}
                  maximo={registrosAtivos}
                />
              </div>
            </section>

            <section className="mt-8 rounded-lg border bg-white p-6 shadow-sm" aria-labelledby="categorias-titulo">
              <h2 id="categorias-titulo" className="text-xl font-semibold text-gray-900">
                Análise por categoria literária
              </h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <GraficoBarrasHorizontais
                  titulo="Obras e leitores por categoria"
                  descricao="Comparação de quantidades em uma escala comum."
                  itens={categorias.map((categoria) => ({
                    id: categoria.categoria_id,
                    rotulo: categoria.categoria,
                    total_obras: categoria.total_obras,
                    leitores: categoria.leitores,
                  }))}
                  series={[
                    { chave: 'total_obras', titulo: 'Obras', cor: 'bg-blue-600' },
                    { chave: 'leitores', titulo: 'Leitores', cor: 'bg-violet-600' },
                  ]}
                />
                <GraficoBarrasHorizontais
                  titulo="Percentual médio de leitura por categoria"
                  descricao="Média dos percentuais de progresso, em escala fixa de 0% a 100%."
                  itens={categorias.map((categoria) => ({
                    id: categoria.categoria_id,
                    rotulo: categoria.categoria,
                    percentual_medio: categoria.percentual_medio,
                  }))}
                  series={[{
                    chave: 'percentual_medio',
                    titulo: 'Média de leitura',
                    cor: 'bg-amber-500',
                    formatador: formatarPercentual,
                  }]}
                  maximo={100}
                />
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-600">
                      <th scope="col" className="px-3 py-3 font-medium">Categoria</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Obras</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Leitores</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Registros de progresso</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Obras em andamento</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Obras concluídas</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Participação</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Média de leitura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(indicadores.categorias ?? []).map((categoria) => (
                      <tr key={categoria.categoria_id} className="border-b last:border-0">
                        <th scope="row" className="px-3 py-3 font-medium text-gray-900">
                          {categoria.categoria}
                        </th>
                        <td className="px-3 py-3 text-right">{formatarNumero(categoria.total_obras)}</td>
                        <td className="px-3 py-3 text-right">{formatarNumero(categoria.leitores)}</td>
                        <td className="px-3 py-3 text-right">{formatarNumero(categoria.registros_progresso)}</td>
                        <td className="px-3 py-3 text-right">{formatarNumero(categoria.obras_em_andamento)}</td>
                        <td className="px-3 py-3 text-right">{formatarNumero(categoria.obras_concluidas)}</td>
                        <td className="px-3 py-3 text-right">{formatarPercentual(categoria.participacao_percentual)}</td>
                        <td className="px-3 py-3 text-right">{formatarPercentual(categoria.percentual_medio)}</td>
                      </tr>
                    ))}
                    {indicadores.categorias?.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-3 py-6 text-center text-gray-600">
                          Não há categorias ativas para exibir.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8 rounded-lg border bg-white p-6 shadow-sm" aria-labelledby="obras-titulo">
              <h2 id="obras-titulo" className="text-xl font-semibold text-gray-900">
                Análise por obra
              </h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <GraficoBarrasHorizontais
                  titulo="Leitores por obra"
                  descricao="Cada barra mostra a quantidade de leitores distintos; a área pode ser rolada para consultar todas as obras."
                  itens={obras.map((obra) => ({
                    id: obra.livro_id,
                    rotulo: obra.titulo,
                    leitores: obra.leitores,
                  }))}
                  series={[{ chave: 'leitores', titulo: 'Leitores', cor: 'bg-blue-600' }]}
                  classeAltura="max-h-80"
                />
                <GraficoBarrasHorizontais
                  titulo="Percentuais por obra"
                  descricao="Média de leitura e percentual de progressos concluídos são métricas separadas, em escala de 0% a 100%."
                  itens={obras.map((obra) => ({
                    id: obra.livro_id,
                    rotulo: obra.titulo,
                    percentual_medio: obra.percentual_medio,
                    percentual_concluidos: obra.percentual_concluidos,
                  }))}
                  series={[
                    {
                      chave: 'percentual_medio',
                      titulo: 'Média de leitura',
                      cor: 'bg-amber-500',
                      formatador: formatarPercentual,
                    },
                    {
                      chave: 'percentual_concluidos',
                      titulo: 'Progressos concluídos',
                      cor: 'bg-emerald-600',
                      formatador: formatarPercentual,
                    },
                  ]}
                  maximo={100}
                  classeAltura="max-h-80"
                />
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-600">
                      <th scope="col" className="px-3 py-3 font-medium">Obra</th>
                      <th scope="col" className="px-3 py-3 font-medium">Identificação</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Leitores</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Registros de progresso</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Média de leitura</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Registros concluídos</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Leitores que concluíram</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Progressos concluídos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(indicadores.obras ?? []).map((obra) => (
                      <tr key={obra.livro_id} className="border-b last:border-0">
                        <th scope="row" className="px-3 py-3 font-medium text-gray-900">
                          {obra.titulo}
                        </th>
                        <td className="px-3 py-3 font-mono text-xs text-gray-600">{obra.livro_id}</td>
                        <td className="px-3 py-3 text-right">{formatarNumero(obra.leitores)}</td>
                        <td className="px-3 py-3 text-right">{formatarNumero(obra.registros_progresso)}</td>
                        <td className="px-3 py-3 text-right">{formatarPercentual(obra.percentual_medio)}</td>
                        <td className="px-3 py-3 text-right">{formatarNumero(obra.registros_concluidos)}</td>
                        <td className="px-3 py-3 text-right">{formatarNumero(obra.leitores_concluidos)}</td>
                        <td className="px-3 py-3 text-right">{formatarPercentual(obra.percentual_concluidos)}</td>
                      </tr>
                    ))}
                    {indicadores.obras?.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-3 py-6 text-center text-gray-600">
                          Não há obras ativas para exibir.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8 rounded-lg border bg-white p-6 shadow-sm" aria-labelledby="favoritos-titulo">
              <h2 id="favoritos-titulo" className="text-xl font-semibold text-gray-900">
                Análise de Favoritos
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Resumo de favoritos">
                <Indicador
                  titulo="Favoritos ativos em obras ativas"
                  valor={favoritos.favoritos_ativos}
                />
                <Indicador
                  titulo="Usuários distintos que favoritam"
                  valor={favoritos.usuarios_distintos}
                />
                <Indicador
                  titulo="Registros de favoritos inativos"
                  valor={favoritos.favoritos_inativos}
                />
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <GraficoBarrasHorizontais
                  titulo="Obras mais favoritadas"
                  descricao="Ranking de obras ativas por registros de favoritos ativos."
                  itens={obrasMaisFavoritadas.map((obra) => ({
                    id: obra.livro_id,
                    rotulo: obra.titulo,
                    quantidade: obra.quantidade_favoritos,
                  }))}
                  series={[{ chave: 'quantidade', titulo: 'Favoritos', cor: 'bg-blue-600' }]}
                  classeAltura="max-h-80"
                />
                <GraficoBarrasHorizontais
                  titulo="Favoritos por categoria"
                  descricao="Contagem agrupada pela categoria diretamente associada a cada obra."
                  itens={favoritosPorCategoria.map((categoria) => ({
                    id: categoria.categoria_id,
                    rotulo: categoria.categoria,
                    quantidade: categoria.quantidade_favoritos,
                  }))}
                  series={[{ chave: 'quantidade', titulo: 'Favoritos', cor: 'bg-violet-600' }]}
                  classeAltura="max-h-80"
                />
                <GraficoBarrasHorizontais
                  titulo="Usuários por quantidade de obras favoritas"
                  descricao="Inclui usuários com pelo menos uma obra favorita elegível; cada obra é contada uma vez por usuário."
                  itens={distribuicaoUsuariosFavoritos.map((item) => ({
                    id: item.quantidade_obras,
                    rotulo: `${formatarNumero(item.quantidade_obras)} ${obterNumero(item.quantidade_obras) === 1 ? 'obra favorita' : 'obras favoritas'}`,
                    quantidade: item.quantidade_usuarios,
                    unidade: 'Usuários',
                  }))}
                  series={[{ chave: 'quantidade', titulo: 'Usuários', cor: 'bg-emerald-600' }]}
                  classeAltura="max-h-80"
                />
              </div>
            </section>

            <section className="mt-8 rounded-lg border bg-white p-6 shadow-sm" aria-labelledby="avaliacoes-comentarios-titulo">
              <header>
                <h2 id="avaliacoes-comentarios-titulo" className="text-xl font-semibold text-gray-900">
                  Análise de Avaliações e Comentários
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Os cartões mostram o estado atual dos registros ativos. A evolução mostra criações no período e não representa alterações ou reativações.
                </p>
              </header>

              <form
                className="mt-5 grid gap-4 rounded-lg border bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPeriodoAplicado({ ...filtros });
                }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Data inicial
                  <input
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    type="date"
                    required
                    value={filtros.dataInicial}
                    onChange={(event) => setFiltros((atual) => ({
                      ...atual,
                      dataInicial: event.target.value,
                    }))}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Data final
                  <input
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    type="date"
                    required
                    value={filtros.dataFinal}
                    onChange={(event) => setFiltros((atual) => ({
                      ...atual,
                      dataFinal: event.target.value,
                    }))}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Agrupamento
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={filtros.agrupamento}
                    onChange={(event) => setFiltros((atual) => ({
                      ...atual,
                      agrupamento: event.target.value,
                    }))}
                  >
                    <option value="dia">Diário</option>
                    <option value="mes">Mensal</option>
                    <option value="ano">Anual</option>
                  </select>
                </label>
                <button
                  className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={carregandoAvaliacoes}
                >
                  Aplicar período
                </button>
              </form>

              {carregandoAvaliacoes ? (
                <p className="mt-5 rounded-lg bg-gray-50 p-5 text-sm text-gray-600" role="status">
                  Carregando avaliações e comentários...
                </p>
              ) : erroAvaliacoes ? (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">
                  {erroAvaliacoes}
                </div>
              ) : indicadoresAvaliacoes ? (
                <>
                  <section className="mt-6" aria-label="Indicadores atuais de avaliações e comentários">
                    <h3 className="text-lg font-semibold text-gray-900">Estado atual</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Considera somente avaliações e comentários independentes ativos.
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Indicador
                        titulo="Avaliações ativas"
                        valor={indicadoresAvaliacoes.atuais.avaliacoes.quantidade}
                      />
                      <Indicador
                        titulo="Nota média"
                        valor={indicadoresAvaliacoes.atuais.avaliacoes.media}
                        formatador={formatarMedia}
                      />
                      <Indicador
                        titulo="Comentários independentes ativos"
                        valor={indicadoresAvaliacoes.atuais.comentarios_independentes.quantidade}
                      />
                      <Indicador
                        titulo="Avaliações com comentário preenchido"
                        valor={indicadoresAvaliacoes.atuais.avaliacoes.com_comentario}
                      />
                      <Indicador
                        titulo="Avaliações sem comentário preenchido"
                        valor={indicadoresAvaliacoes.atuais.avaliacoes.sem_comentario}
                      />
                    </div>

                    {indicadoresAvaliacoes.atuais.avaliacoes.quantidade === 0 && (
                      <p className="mt-4 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
                        Ainda não há avaliações ativas. A média não está disponível.
                      </p>
                    )}

                    <div className="mt-4">
                      <GraficoBarrasHorizontais
                        titulo="Distribuição das notas"
                        descricao="Quantidade de avaliações ativas para cada nota de 1 a 5."
                        itens={Object.entries(
                          indicadoresAvaliacoes.atuais.avaliacoes.distribuicao_notas
                        ).map(([nota, quantidade]) => ({
                          id: nota,
                          rotulo: `Nota ${nota}`,
                          unidade: 'Avaliações',
                          quantidade,
                        }))}
                        series={[{ chave: 'quantidade', titulo: 'Avaliações', cor: 'bg-amber-500' }]}
                      />
                    </div>
                  </section>

                  <section className="mt-8" aria-label="Evolução das criações">
                    <h3 className="text-lg font-semibold text-gray-900">Evolução das criações</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Intervalo inclusivo de {indicadoresAvaliacoes.evolucao.data_inicial} a {indicadoresAvaliacoes.evolucao.data_final}, agrupado por {indicadoresAvaliacoes.evolucao.agrupamento}. Fuso: {indicadoresAvaliacoes.evolucao.fuso_horario}.
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Comentários associados contam avaliações criadas no período cujo comentário está preenchido atualmente.
                    </p>
                    <div className="mt-4">
                      <GraficoBarrasHorizontais
                        titulo="Criações por período"
                        descricao="As séries representam criações independentes por domínio."
                        itens={indicadoresAvaliacoes.evolucao.por_periodo.map((item) => ({
                          id: item.periodo,
                          rotulo: formatarPeriodo(item.periodo, indicadoresAvaliacoes.evolucao.agrupamento),
                          avaliacoes: item.avaliacoes,
                          comentarios_associados: item.comentarios_associados,
                          comentarios_independentes: item.comentarios_independentes,
                        }))}
                        series={[
                          { chave: 'avaliacoes', titulo: 'Avaliações criadas', cor: 'bg-indigo-600' },
                          { chave: 'comentarios_associados', titulo: 'Avaliações criadas com comentário', cor: 'bg-amber-500' },
                          { chave: 'comentarios_independentes', titulo: 'Comentários independentes criados', cor: 'bg-emerald-600' },
                        ]}
                        classeAltura="max-h-96"
                      />
                    </div>
                  </section>

                  <section className="mt-8" aria-labelledby="avaliacoes-por-obra-titulo">
                    <h3 id="avaliacoes-por-obra-titulo" className="text-lg font-semibold text-gray-900">
                      Indicadores atuais por obra
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Inclui todas as obras ativas, mesmo quando não possuem avaliações ou comentários.
                    </p>
                    <div className="mt-4 overflow-x-auto rounded-lg border">
                      <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
                        <thead className="bg-gray-50">
                          <tr className="border-b text-gray-600">
                            <th scope="col" className="px-3 py-3 font-medium">Obra</th>
                            <th scope="col" className="px-3 py-3 text-right font-medium">Avaliações</th>
                            <th scope="col" className="px-3 py-3 text-right font-medium">Média</th>
                            {[1, 2, 3, 4, 5].map((nota) => (
                              <th key={nota} scope="col" className="px-3 py-3 text-right font-medium">Nota {nota}</th>
                            ))}
                            <th scope="col" className="px-3 py-3 text-right font-medium">Com comentário</th>
                            <th scope="col" className="px-3 py-3 text-right font-medium">Sem comentário</th>
                            <th scope="col" className="px-3 py-3 text-right font-medium">Comentários independentes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {indicadoresAvaliacoes.atuais.por_obra.map((obra) => (
                            <tr key={obra.livro_id} className="border-b last:border-0">
                              <th scope="row" className="px-3 py-3 font-medium text-gray-900">{obra.titulo}</th>
                              <td className="px-3 py-3 text-right">{formatarNumero(obra.avaliacoes.quantidade)}</td>
                              <td className="px-3 py-3 text-right">{formatarMedia(obra.avaliacoes.media)}</td>
                              {[1, 2, 3, 4, 5].map((nota) => (
                                <td key={nota} className="px-3 py-3 text-right">
                                  {formatarNumero(obra.avaliacoes.distribuicao_notas[nota])}
                                </td>
                              ))}
                              <td className="px-3 py-3 text-right">{formatarNumero(obra.avaliacoes.com_comentario)}</td>
                              <td className="px-3 py-3 text-right">{formatarNumero(obra.avaliacoes.sem_comentario)}</td>
                              <td className="px-3 py-3 text-right">{formatarNumero(obra.comentarios_independentes.quantidade)}</td>
                            </tr>
                          ))}
                          {indicadoresAvaliacoes.atuais.por_obra.length === 0 && (
                            <tr>
                              <td colSpan="11" className="px-3 py-6 text-center text-gray-600">
                                Não há obras ativas para exibir.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {indicadoresAvaliacoes.atuais.por_obra.length > 0
                      && indicadoresAvaliacoes.atuais.avaliacoes.quantidade === 0
                      && indicadoresAvaliacoes.atuais.comentarios_independentes.quantidade === 0 && (
                        <p className="mt-3 text-sm text-gray-600">
                          Não há avaliações ou comentários independentes ativos no momento.
                        </p>
                      )}
                  </section>
                </>
              ) : (
                <p className="mt-5 rounded-lg bg-gray-50 p-5 text-sm text-gray-600">
                  Não há dados de avaliações e comentários para exibir.
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
