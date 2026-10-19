
# AUD-017 — ADM: Análise de Dados — Progresso de Leitura

**Projeto:** Plataforma Cigana  
**Área:** Administração — Análise de Dados  
**Status:** Relatório geral implementado; relatórios por categoria e por obra implementados e validados pela interface; build de produção pendente por erro do Next.js/Turbopack; validação de Cenas Finais parcialmente concluída.

## 1. Escopo

Esta entrega implementa a análise administrativa de dados agregados de progresso de leitura, incluindo:

- Relatório geral de progresso de leitura.
- Relatório por categoria literária.
- Relatório por obra.

Favoritos, avaliações, comentários, preferências e outros domínios não foram incluídos como indicadores nesta entrega.

A análise utiliza as estruturas existentes do banco de dados, sem introduzir novas tabelas ou migrations para os relatórios por categoria e por obra.

## 2. Autorização

A migration `0051_permissao_analise_dados.sql` cadastra `analise_dados.visualizar` (`Visualizar análise de dados`) e mantém vínculos ativos somente para os papéis `ADMINISTRADOR` e `GERENTE`. O endpoint aplica `autenticar` e `autorizar('analise_dados.visualizar')`; a autorização consulta os vínculos ativos no PostgreSQL.

A migration 0051 foi executada com sucesso na base local. A interface foi acessada com o papel `ADMINISTRADOR`, e o acesso foi negado para um usuário sem a permissão.

Não havia conta de teste com o papel `GERENTE`; esse caso permanece pendente.

Os relatórios geral, por categoria e por obra reutilizam a autorização existente, sem criação de novas permissões.

## 3. Endpoint e indicadores gerais

O endpoint `GET /api/admin/analise-dados/progresso-leitura` retorna indicadores agregados, sem identificadores ou dados pessoais dos leitores.

Os indicadores gerais incluem:

- Leitores distintos com progresso ativo.
- Registros ativos em `progresso_leitura`.
- Distribuição por faixas: `0%`, `>0–25%`, `>25–50%`, `>50–75%`, `>75–<100%` e `100%`.
- Contagens pelo campo persistido `concluido`.
- Pares distintos `(progresso_id, cena_id)` visitados por progressos ativos.

O percentual e `concluido` são contabilizados independentemente. A consulta é somente de leitura e utiliza as tabelas existentes.

O histórico de visitas anterior à migration 0049 pode estar incompleto: a inicialização documentada registra somente a cena atual conhecida de progressos anteriores. O indicador de cenas visitadas representa os pares distintos disponíveis, não uma reconstrução de todo o histórico passado.

## 4. Validação visual e resultados observados — relatório geral

A página `/admin/analise-dados` foi acessada visualmente com um usuário `ADMINISTRADOR`. Os indicadores apresentados foram:

- Leitores distintos com progresso ativo: **2**.
- Registros ativos de progresso: **6**.
- Leituras concluídas (`concluido = true`): **0**.
- Leituras não concluídas (`concluido = false`): **6**.
- Cenas distintas visitadas: **26**.

Distribuição por percentual observada:

| Faixa | Quantidade |
|---|---:|
| 0% | 0 |
| >0–25% | 0 |
| >25–50% | 0 |
| >50–75% | 1 |
| >75–<100% | 1 |
| 100% | 4 |

Os totais foram considerados consistentes: a soma das faixas e a soma dos estados de conclusão correspondem aos seis progressos ativos. O acesso de usuário sem a permissão foi negado.

A validação com o papel `GERENTE` permanece pendente por falta de uma conta de teste disponível.

## 5. Conclusão explícita da leitura e relação com o ADM

Em 18/10/2026, a validação manual do fluxo de conclusão explícita na Biblioteca foi concluída:

1. A API retornou `percentual_concluido: "100.00"` e `concluido: false`.
2. O botão **Concluir leitura** apareceu após o progresso atingir 100%.
3. Após o clique, a interface exibiu **Leitura concluída**.
4. A página do ADM passou a contabilizar a primeira leitura concluída.

Esse resultado confirma que o indicador administrativo utiliza o estado persistido de conclusão, independentemente do percentual de exploração. A conclusão não é registrada automaticamente ao atingir 100%; depende da ação explícita do leitor.

A verificação de persistência da mensagem após recarregar a página ainda está pendente.

## 6. Cenas Finais

Não foi executado teste de integração de Cenas Finais em banco de teste isolado. A validação anterior do fluxo de finais não comprova, por si só, a invariância do percentual e do campo `concluido` após uma confirmação de final.

A inspeção anterior de `FinalLeitura.registrar` indicou que o model não acessa `progresso_leitura` nem `progresso_leitura_cenas_visitadas`, mas isso não substitui um teste controlado de primeira confirmação, repetição, preservação do timestamp e invariância dos campos do progresso.

## 7. Verificações executadas — relatório geral

- `node --check` nos arquivos backend adicionados e em `server.js`: aprovado.
- Consulta agregada executada em modo somente leitura na base local; invariantes verificadas: soma das faixas e soma dos estados de conclusão iguais ao total ativo, e leitores não superiores aos registros ativos.
- Migration `0051_permissao_analise_dados.sql`: executada com sucesso na base local.
- Acesso visual à página `/admin/analise-dados` com `ADMINISTRADOR`: aprovado.
- Acesso com usuário sem a permissão: negado conforme esperado.
- Validação com o papel `GERENTE`: pendente, pois não havia conta de teste disponível.
- `npm run build`: bloqueado por erro interno do Turbopack ao criar processo ou vincular porta durante o processamento de CSS (`Operation not permitted`).
- `next build --webpack`: compilação, verificação de tipos e geração das páginas concluídas com sucesso; a rota `/admin/analise-dados` foi gerada.
- `git diff --check`: aprovado.

## 8. Relatório por categoria literária

O relatório por categoria foi integrado à página existente `/admin/analise-dados` e à resposta do endpoint atual `GET /api/admin/analise-dados/progresso-leitura`. Foram preservados o endpoint, a autorização `analise_dados.visualizar` e os indicadores do relatório geral.

São exibidas todas as categorias ativas, inclusive as que não possuem obras ou progressos. Os indicadores apresentados por categoria são:

- Total de obras ativas associadas diretamente à categoria.
- Leitores distintos com progresso elegível.
- Registros de progresso elegíveis.
- Obras distintas com progresso não concluído.
- Obras distintas com progresso concluído.
- Participação percentual da categoria no total geral de progressos elegíveis.
- Média do percentual de leitura dos progressos elegíveis.

Foram aplicadas as regras aprovadas:

- Categorias, obras e progressos inativos são excluídos.
- Usuários não são filtrados por `ativo`.
- As obras são atribuídas somente à categoria diretamente registrada em `livros.categoria_id`.
- `versao_livro` não separa os resultados.
- A média inclui também os progressos concluídos.
- Progresso não concluído é contado mesmo com percentual zero.
- As contagens de obras em andamento e concluídas usam obras distintas e podem se sobrepor quando leitores diferentes têm estados diferentes para a mesma obra.
- A conclusão narrativa continua independente do percentual de leitura.

A consulta calcula separadamente o total de obras ativas e agrega os progressos por categoria antes de combiná-los com as categorias. Assim, os progressos não multiplicam a contagem de obras nem alteram a média.

Sem progressos elegíveis no total geral, a participação é `0%`; em categorias sem progressos, contagens, participação e média são zero.

### Arquivos alterados — relatório por categoria

- `backend/src/models/AnaliseProgressoLeitura.js`
- `backend/src/services/analiseDadosService.js`
- `frontend/src/app/admin/analise-dados/page.jsx`

### Validação funcional pela interface

A validação funcional pela interface foi concluída com sucesso. Foram confirmados pelo usuário:

1. Abertura da página e apresentação dos relatórios.
2. Exibição de categorias com obras.
3. Exibição de categorias sem obras.
4. Contagem de leitores distintos e registros de progresso.
5. Contagem de obras em andamento e concluídas.
6. Apresentação dos percentuais de participação e média de leitura.
7. Preservação do relatório geral.

### Verificações técnicas — relatório por categoria

- `node --check` nos arquivos principais do backend: aprovado.
- `git diff --check` nos arquivos alterados: aprovado.
- `npm run build`: não concluiu. O Next.js/Turbopack falhou durante o processamento de CSS ao tentar iniciar um processo interno, com o erro `Operation not permitted`. A repetição fora do sandbox apresentou o mesmo erro; esta pendência não foi corrigida.
- Testes Bruno não foram executados.

## 9. Relatório por obra

O relatório por obra foi integrado à página existente `/admin/analise-dados` e à resposta do endpoint atual `GET /api/admin/analise-dados/progresso-leitura`.

A implementação preservou o endpoint, a autorização `analise_dados.visualizar` e os relatórios geral e por categoria.

O relatório apresenta todas as obras ativas, inclusive as que não possuem leitores ou registros de progresso. Os indicadores são:

- Título e identificação da obra.
- Quantidade de leitores distintos com progresso elegível.
- Quantidade de registros de progresso elegíveis.
- Percentual médio de leitura.
- Quantidade de registros com `concluido = true`.
- Quantidade de leitores distintos com `concluido = true`.
- Percentual de registros concluídos em relação ao total de progressos elegíveis da obra.

### Regras de negócio aplicadas

- Somente obras com `livros.ativo = TRUE` são listadas.
- Somente registros com `progresso_leitura.ativo = TRUE`, vinculados a obras ativas, entram nos indicadores.
- Leitores são contados por usuários distintos.
- Registros de progresso são contabilizados separadamente dos leitores.
- A média de leitura inclui os progressos concluídos.
- O campo persistido `concluido` é a fonte de verdade para as contagens de conclusão.
- Percentual de leitura igual a 100% não implica automaticamente conclusão registrada.
- Os resultados não são separados por `versao_livro`.
- Usuários inativos não são excluídos por esta consulta.
- Obras sem progressos apresentam indicadores numéricos zerados.
- Percentuais são tratados como zero quando não existem progressos elegíveis para o cálculo.

As contagens de registros concluídos e de leitores distintos que concluíram são mantidas como indicadores separados, pois representam conceitos diferentes.

### Estratégia de consulta

A consulta parte das obras ativas e combina os resultados com uma agregação prévia dos progressos ativos por obra, utilizando `LEFT JOIN` ou estratégia equivalente.

A agregação separada permite:

- Preservar obras sem progresso no resultado.
- Evitar multiplicação de registros nas contagens.
- Evitar distorções na média de leitura.
- Distinguir leitores distintos de registros de progresso.
- Calcular a proporção de progressos concluídos com tratamento para denominador zero.

A implementação utiliza as estruturas existentes, sem criar migrations ou tabelas novas.

### Arquivos alterados — relatório por obra

- `backend/src/models/AnaliseProgressoLeitura.js`
- `backend/src/services/analiseDadosService.js`
- `frontend/src/app/admin/analise-dados/page.jsx`

O service passou a incluir a propriedade `obras` na resposta existente, preservando os indicadores gerais e a propriedade `categorias`. A página administrativa recebeu uma tabela com título, ID e os indicadores por obra.

### Validação funcional pela interface

A validação funcional pela interface foi concluída com sucesso. O usuário confirmou como aprovados os sete itens abaixo do checklist do relatório por obra:

1. A tabela por obra aparece na página, junto dos relatórios geral e por categoria.
2. Todas as obras ativas aparecem, inclusive as sem leitores ou progresso.
3. As quantidades de leitores distintos e registros de progresso correspondem aos registros elegíveis.
4. O percentual médio corresponde à média dos progressos ativos, incluindo os concluídos.
5. As contagens de progressos concluídos e leitores distintos que concluíram estão corretas.
6. O percentual de conclusões utiliza progressos concluídos divididos pelo total de progressos elegíveis da obra.
7. Os relatórios geral e por categoria continuam funcionando corretamente.

### Verificações técnicas — relatório por obra

- `node --check` nos arquivos pertinentes do backend: aprovado.
- `git diff --check`: sem mensagens de erro.
- Como os arquivos da análise já constavam como não rastreados no workspace, os arquivos foram verificados individualmente com `git diff --no-index --check`; nenhum apontou problemas de whitespace.
- `npm run build`: falhou, inclusive na repetição fora do sandbox. O Next.js/Turbopack voltou a reportar `Operation not permitted` ao iniciar um processo interno durante o processamento de CSS.
- Testes Bruno não foram executados.

A falha do build permanece como pendência técnica independente da validação funcional concluída pela interface.

## 10. Pendências

- Confirmar que a mensagem **Leitura concluída** permanece após recarregar a página.
- Validar o acesso de um usuário com o papel `GERENTE`, quando houver uma conta de teste apropriada.
- Executar teste de integração de Cenas Finais em banco de teste isolado, verificando primeira confirmação, repetição, preservação do timestamp e invariância do progresso.
- Investigar e resolver a falha do build de produção do Next.js/Turbopack (`Operation not permitted`).

## 11. Próximas melhorias fora do escopo desta entrega

A inclusão de gráficos para complementar os relatórios geral, por categoria e por obra foi discutida como melhoria futura de apresentação.

A proposta é posicionar cada gráfico junto ao respectivo relatório, preservando as tabelas para consulta dos valores exatos.

Essa melhoria ainda não foi implementada nem validada e deverá ser tratada em uma etapa separada, após inspeção da estrutura atual do frontend e das bibliotecas disponíveis.
