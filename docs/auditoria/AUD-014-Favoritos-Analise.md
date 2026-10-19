# AUD-015 — Análise de Dados de Favoritos

**Projeto:** Plataforma de Livros Cigana (Plataforma Leitura)  
**Área:** Administração — Análise de Dados  
**Tipo:** Auditoria técnica e registro de implementação  
**Status:** Implementado e validado  
**Data:** 19/10/2026

---

## 1. Objetivo

Registrar a implementação dos indicadores e gráficos de análise de dados da funcionalidade Favoritos, integrada à página administrativa existente da Plataforma Cigana.

A análise utiliza os dados já armazenados no banco de dados, sem modificar o modelo de Favoritos ou criar estruturas históricas adicionais.

## 2. Escopo implementado

A página `/admin/analise-dados` passou a apresentar indicadores e gráficos referentes à utilização dos Favoritos.

Foram implementados três cartões de indicadores:

- Quantidade de favoritos ativos associados a obras ativas.
- Quantidade de usuários distintos com favoritos ativos em obras ativas.
- Quantidade de registros de favoritos atualmente inativos.

Também foram implementados três gráficos de barras horizontais:

- Ranking das obras mais favoritadas.
- Distribuição de favoritos por categoria direta das obras.
- Distribuição de usuários por quantidade de obras favoritas.

A implementação reutiliza os componentes e os padrões visuais existentes na área de análise de dados, sem adicionar dependências gráficas.

## 3. Fontes de dados e arquivos envolvidos

### 3.1. Banco de dados

A análise utiliza a tabela `favoritos`, criada pela migration `0021_create_favoritos.sql`.

Os principais campos utilizados são:

- `usuario_id`: identifica o usuário associado ao favorito.
- `livro_id`: identifica a obra favoritada.
- `ativo`: indica se o registro de favorito está ativo.
- `criado_em` e `atualizado_em`: registram a criação e a última atualização do registro.

Os relacionamentos com as tabelas `livros`, `categorias` e `usuarios` permitem calcular os indicadores definidos para a análise.

Não foram criadas migrations nem alteradas as tabelas existentes.

### 3.2. Backend

**Model:** `backend/src/models/AnaliseProgressoLeitura.js`

Responsável pelas agregações de Favoritos utilizadas na análise. Os agrupamentos por obra, categoria e usuário são separados para evitar a multiplicação de registros durante os cálculos.

**Service:** `backend/src/services/analiseDadosService.js`

Integra os indicadores de Favoritos à resposta do serviço de análise de dados existente.

A implementação preserva a estrutura de integração já utilizada pelo projeto.

### 3.3. Frontend

**Página:** `frontend/src/app/admin/analise-dados/page.jsx`

Apresenta os cartões e gráficos de Favoritos, reutilizando os componentes e os padrões visuais existentes na página administrativa.

O tratamento visual contempla listas vazias, valores numéricos, rótulos extensos e rolagem da área dos gráficos.

## 4. Regras de cálculo dos indicadores

### 4.1. Favoritos ativos

Considera registros em que `favoritos.ativo = TRUE`, associados a obras ativas.

Favoritos associados a obras inativas não entram nesse indicador.

### 4.2. Obras mais favoritadas

Agrupa os favoritos ativos por obra e apresenta o ranking das obras ativas.

Cada registro elegível contribui uma vez para a contagem da respectiva obra.

### 4.3. Favoritos por categoria

Agrupa os favoritos elegíveis pela categoria diretamente associada à obra, por meio de `livros.categoria_id`.

Não há propagação da contagem para categorias ancestrais.

Categorias inativas continuam sendo consideradas quando correspondem à categoria diretamente associada à obra.

### 4.4. Usuários distintos que favoritam

Conta os usuários distintos que possuem pelo menos um favorito ativo associado a uma obra ativa.

Usuários desativados são incluídos. Portanto, o indicador não representa exclusivamente a quantidade de usuários com contas atualmente ativas.

### 4.5. Usuários por quantidade de obras favoritas

Agrupa os usuários pela quantidade de obras ativas que favoritam atualmente.

Critérios aplicados:

- Considerar somente favoritos ativos associados a obras ativas.
- Incluir usuários desativados que possuam favoritos elegíveis.
- Excluir da distribuição usuários sem obras favoritas elegíveis.
- Contabilizar cada par usuário–obra uma única vez.

O gráfico representa a distribuição atual das preferências registradas, não o histórico de utilização dos Favoritos.

### 4.6. Favoritos inativos

Conta todos os registros em que `favoritos.ativo = FALSE`, independentemente do estado da obra associada.

Esse indicador representa a quantidade de registros atualmente inativos. Não representa a quantidade histórica de remoções.

## 5. Limitações dos dados

A tabela `favoritos` mantém um registro por par usuário–obra, conforme a restrição de unicidade existente.

A remoção é lógica, e uma nova inclusão pode reativar o registro anterior.

Os campos `criado_em` e `atualizado_em` não permitem reconstruir a sequência completa de inclusões, remoções e reativações.

A implementação não cria histórico de eventos nem permite determinar quantas vezes um usuário adicionou ou removeu a mesma obra dos favoritos.

Os indicadores devem, portanto, ser interpretados como medidas do estado atual dos registros, respeitando os filtros definidos para cada cálculo.

## 6. Autorização

A análise utiliza a permissão existente `analise_dados.visualizar`.

A implementação foi integrada à área administrativa já protegida, sem criar uma permissão específica para Favoritos.

As regras de autorização e os contratos existentes devem ser preservados em futuras alterações.

## 7. Validação técnica e funcional

### 7.1. Verificações técnicas

| Verificação | Resultado |
|---|---|
| `node --check` nos arquivos do backend alterados | Aprovado |
| Execução da consulta agregada em leitura no banco | Aprovado |
| Formato esperado das três coleções de resultados | Aprovado |
| Build com `npm run build -- --webpack` | Aprovado |
| Compilação da rota `/admin/analise-dados` | Aprovado |
| `git diff --check` nos arquivos rastreados | Sem problemas reportados |
| Verificação de whitespace nos arquivos não rastreados | Sem diagnósticos |

### 7.2. Validação visual

A página administrativa foi conferida pela interface.

| Verificação | Resultado |
|---|---|
| Exibição dos três cartões de indicadores | Aprovado |
| Ranking das obras em ordem decrescente | Aprovado |
| Agrupamento pela categoria direta, inclusive inativa | Aprovado |
| Inclusão de usuários desativados na distribuição | Aprovado |
| Exclusão de usuários sem favoritas elegíveis | Aprovado |
| Contagem sem duplicidade de pares usuário–obra | Aprovado |
| Tratamento de rótulos extensos e rolagem | Aprovado |
| Tratamento de listas vazias | Aprovado |

Os resultados confirmam as verificações técnicas e funcionais realizadas no escopo desta implementação. Não constituem evidência de testes de carga, concorrência ou de todos os cenários possíveis do sistema.

## 8. Decisões técnicas preservadas

1. Reutilizar a área existente de análise de dados.
2. Preservar os contratos de API existentes.
3. Não alterar o modelo de dados de Favoritos.
4. Não criar tabelas ou migrations para histórico.
5. Separar os agrupamentos analíticos para evitar multiplicação de registros.
6. Aplicar os filtros aprovados para cada indicador.
7. Incluir usuários desativados quando possuírem favoritos elegíveis.
8. Considerar somente favoritos ativos de obras ativas nos indicadores de preferências atuais.
9. Contabilizar favoritos inativos independentemente do estado da obra.
10. Reutilizar os componentes visuais existentes, sem dependências gráficas adicionais.

## 9. Critério de encerramento

A implementação dos indicadores e gráficos de Favoritos na área administrativa foi validada conforme as verificações técnicas e funcionais registradas neste documento.

A funcionalidade utiliza as estruturas existentes e não modifica o comportamento de criação, desativação ou reativação de favoritos.

Futuras alterações nos cálculos, filtros ou componentes deverão preservar os contratos existentes e ser acompanhadas de validações compatíveis com o escopo modificado.

---

**Documento:** `docs/auditoria/AUD-015-Analise-Dados-Favoritos.md`  
**Referência relacionada:** `docs/auditoria/AUD-014-Favoritos-Biblioteca.md`  
**Projeto:** Plataforma de Livros Cigana — Plataforma Leitura
