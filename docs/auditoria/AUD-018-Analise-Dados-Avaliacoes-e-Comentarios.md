# AUD-018 — Análise de Dados — Avaliações e Comentários

**Projeto:** Plataforma Cigana (Plataforma Leitura)  
**Área:** Administração — Análise de Dados  
**Tipo:** Registro de implementação e validação  
**Status:** Implementado e validado  
**Data:** 20/10/2026

---

## 1. Objetivo e escopo

Registrar os indicadores administrativos de Avaliações e Comentários integrados à página existente `/admin/analise-dados`. A análise consolida avaliações e comentários com base nos registros disponíveis, sem alterar o modelo de dados.

O escopo inclui os totais atuais, distribuição das notas, evolução temporal com filtros de data e detalhamento por obra. Avaliações, comentários associados a avaliações e comentários independentes são apresentados como conceitos distintos.

## 2. Indicadores

O relatório apresenta:

- Quantidade de avaliações ativas no período selecionado.
- Média das notas das avaliações contabilizadas.
- Distribuição das avaliações pelas notas de 1 a 5.
- Quantidade de comentários associados a avaliações.
- Quantidade de comentários independentes.
- Evolução temporal dos indicadores.
- Detalhamento por obra, incluindo obras sem avaliações ou comentários.

Uma avaliação é o registro que contém a nota. O comentário é opcional e pode ser alterado ou removido sem remover a avaliação. Comentários associados são contados a partir do texto atualmente presente na avaliação; comentários independentes são registros próprios de comentário, sem associação a uma avaliação.

## 3. Período, filtros e regras de contagem

O relatório permite filtrar por data inicial e final. A evolução pode ser agrupada por dia, mês ou ano, respeitando o período selecionado. Os limites informados são considerados na seleção dos dados, e os intervalos sem registros são mantidos na série com valores zerados para não interromper a leitura temporal.

As métricas de estado atual consideram registros ativos. A quantidade de avaliações e a distribuição das notas contam avaliações ativas; a média é calculada sobre as notas dessas avaliações. Comentários associados são considerados conforme o texto atual da avaliação, e comentários independentes seguem a situação ativa do respectivo registro.

Os resultados por obra incluem todas as obras ativas no detalhamento, inclusive aquelas sem avaliações ou comentários no intervalo. Nesses casos, as contagens e a média são apresentadas como zero, sem excluir a obra da relação.

## 4. Evolução histórica e limitações

A evolução temporal utiliza o campo `criado_em`. Portanto, ela representa a criação dos registros e não reconstitui alterações posteriores de nota ou texto, remoções, desativações ou reativações. Uma alteração feita hoje em uma avaliação criada anteriormente não aparece como uma nova ocorrência na data da alteração.

Comentários associados às avaliações são contabilizados segundo o texto atual. Como não há histórico de versões do texto usado por esta análise, a série não permite recuperar comentários que foram removidos nem determinar quando um texto foi alterado.

Os indicadores históricos devem ser interpretados como agregações dos registros disponíveis e de seus estados/textos atuais, não como trilha completa de eventos.

## 5. Endpoint e comportamento

O relatório utiliza o endpoint administrativo:

`GET /api/admin/analise-dados/avaliacoes-comentarios`

O endpoint recebe filtros de período por data inicial e final e o agrupamento temporal (`dia`, `mes` ou `ano`). A resposta fornece os indicadores agregados, a série temporal e o detalhamento por obra para a interface administrativa. O acesso segue a autorização existente para análise de dados; esta consulta não concede capacidades de edição ou moderação de avaliações.

## 6. Arquivos envolvidos

### Backend

- `backend/src/models/AnaliseProgressoLeitura.js` — consultas e agregações utilizadas pela análise.
- `backend/src/services/analiseDadosService.js` — integração dos indicadores à camada de serviço.
- `backend/src/controllers/analiseDadosController.js` — recebimento dos parâmetros e encaminhamento da consulta.
- `backend/src/routes/analiseDadosRoutes.js` — rota administrativa do relatório.

### Frontend

- `frontend/src/app/admin/analise-dados/page.jsx` — filtros, indicadores, evolução temporal e detalhamento por obra na página administrativa.

## 7. Validações registradas

| Verificação | Resultado |
|---|---|
| Build de produção com `npm run build -- --webpack` | Aprovado |
| Validação visual da página administrativa e dos indicadores | Concluída |

A implementação e a validação visual foram consideradas concluídas. O build registrado é o de Webpack, conforme o procedimento de validação de produção adotado para o frontend.

## 8. Referências e decisões preservadas

- A análise reutiliza a área administrativa existente e a autorização de análise de dados.
- Avaliações não se confundem com comentários: a avaliação contém a nota obrigatória; o comentário é opcional e pode ser removido sem excluir a avaliação.
- Comentários independentes são registros próprios e não devem ser somados aos comentários associados como se fossem o mesmo tipo de relação.
- O detalhamento mantém obras sem registros para permitir identificar ausência de atividade no período.
- A evolução baseada em `criado_em` não representa alterações ou reativações; comentários associados refletem o texto atual.

---

**Documento:** `docs/auditoria/AUD-018-Analise-Dados-Avaliacoes-e-Comentarios.md`  
**Referência relacionada:** `docs/auditoria/AUD-015-Avaliacoes-Biblioteca.md`
