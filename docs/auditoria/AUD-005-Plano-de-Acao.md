## PA - Plano de Ação

PA-003 — Eliminar duplicação de acesso ao banco no módulo de capítulos, concentrando 
toda a lógica de consultas SQL na camada models e preservando o padrão arquitetural 
adotado no restante do backend.

### Etapa 1

| Prioridade | Item                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 🟠         | Padronizar os prefixos das rotas (`/api/...` ou sem `/api`, mantendo um único padrão).                          |
| 🟠         | Remover a consulta SQL direta do `chapterController`, centralizando-a no `Chapter` Model.                       |
| 🟡         | Introduzir uma camada `services` quando surgirem regras de negócio mais complexas.                              |
| 🟡         | Adicionar validação de entrada (`express-validator`, `Joi` ou equivalente) antes dos controllers.               |
| 🟡         | Padronizar a ordenação dos capítulos utilizando `order_position`, caso esse seja o critério oficial de leitura. |
| 🟢         | Evoluir o módulo `UserProgress` para aproveitar o campo `JSONB` com recursos avançados de leitura.              |
| 🟢         | Preparar a API para autenticação, removendo futuramente o `userId` das URLs.                                    |


### Etapa 2 — Consolidação da Arquitetura do Frontend

  1.  Remover a dependência de storyData.json.
  2.  Adaptar BookContext para consumir a API do backend.
  3.  Integrar o módulo UserProgress.
  4.  Padronizar todas as páginas (index.jsx, book.jsx e progress.jsx) para utilizar a mesma fonte de dados.
  5. Eliminar código de transição e mocks que não forem mais necessários.

Essa etapa será o ponto de transição entre o MVP e uma plataforma realmente integrada, aproveitando toda a 
infraestrutura de backend já desenvolvida.

# Prioridade Alta

## PA-001 — Consolidar integração Backend × Frontend

Objetivo

Eliminar a utilização de storyData.json, fazendo com que toda a aplicação utilize exclusivamente a API.

Benefícios

única fonte de dados;
menor risco de inconsistências;
simplificação da manutenção.

## PA-002 — Padronizar modelo de dados

| Etapa   | Objetivo                              | Resultado                      |
| ------- | ------------------------------------- | ------------------------------ |
| **2.1** | Levantamento das entidades do domínio | Lista oficial das entidades    |
| **2.2** | Responsabilidades de cada entidade    | O que cada uma representa      |
| **2.3** | Relacionamentos                       | Como elas se conectam          |
| **2.4** | Regras de negócio                     | Regras independentes do banco  |
| **2.5** | Agregados e limites do domínio        | Organização do modelo          |
| **2.6** | Modelo conceitual                     | Diagrama conceitual            |
| **2.7** | MER                                   | Modelo Entidade-Relacionamento |
| **2.8** | Revisão do PostgreSQL                 | Comparação com o banco atual   |
| **2.9** | Plano de migração                     | Alterações no schema           |

## PA-003 — Revisar dependências do projeto

Verificar e documentar:

framer-motion;
prop-types;
versões do Next.js;
configuração de imagens;
demais dependências utilizadas.
Prioridade Média
PM-001 — Centralizar comunicação com API

Evitar chamadas diretas nas páginas.

Fluxo desejado:

Pages

↓

Hooks

↓

Context

↓

Services

↓

API

## PM-002 — Melhorar tratamento de erros

Implementar:

loading;
tratamento de falhas da API;
mensagens amigáveis;
componentes de erro.

## PM-003 — Configuração por ambiente

Substituir URLs fixas por variáveis de ambiente.

Exemplo:

NEXT_PUBLIC_API_URL
Prioridade Baixa
PB-001 — Melhorias de Interface
menu responsivo;
indicação da página ativa;
estados "loading";
estados "disabled".

## PB-002 — Evolução do MediaDisplay

Adicionar suporte para:

vídeo local;
fallback de imagem;
melhorias de acessibilidade.

## PB-003 — Evolução dos Hooks

Conforme o crescimento da plataforma:

useLibrary();
useReader();
useProgress();
useAuthentication().
