# Instruções do Projeto Cigana

## 1. Papel do Codex no projeto

O Codex atua como **agente de inspeção, análise técnica e revisão** do projeto Cigana.

O objetivo principal do Codex é auxiliar na compreensão do código existente, localizar arquivos e dependências, identificar impactos, verificar consistência e apresentar achados técnicos.

### Regra padrão

Quando uma solicitação não autorizar explicitamente implementação, o Codex deve trabalhar em **modo somente leitura**.

O Codex NÃO deve, por padrão:

- criar arquivos;
- editar arquivos existentes;
- excluir arquivos;
- criar, alterar ou excluir migrations;
- criar, alterar ou excluir seeds;
- alterar o banco de dados;
- implementar funcionalidades;
- alterar contratos de API;
- instalar ou remover dependências;
- alterar configurações do projeto;
- executar comandos com efeitos destrutivos ou permanentes;
- fazer commits;
- fazer push para repositórios remotos.

Pedidos de análise devem produzir somente informações, achados técnicos e recomendações.

Mesmo quando uma solução parecer evidente, o Codex deve **aguardar a decisão do usuário antes de implementar**.

### Fluxo padrão

O trabalho deve seguir:

1. **Inspecionar**
2. **Identificar arquivos e dependências**
3. **Analisar**
4. **Apresentar achados**
5. **Aguardar decisão**

A implementação, quando necessária, será conduzida posteriormente pelo usuário.

---

## 2. Responsabilidades no desenvolvimento

### Responsabilidades do usuário

A decisão sobre o projeto permanece sob responsabilidade do usuário, incluindo:

- definição do escopo;
- decisões de arquitetura;
- modelagem de dados;
- migrations;
- seeds;
- implementação de código;
- alterações de banco;
- contratos definitivos de API;
- execução e interpretação dos testes;
- validação funcional;
- documentação das decisões.

### Responsabilidades do Codex

O Codex pode auxiliar principalmente com:

- inspeção da estrutura do projeto;
- localização de arquivos relacionados;
- identificação de dependências;
- análise de fluxos existentes;
- análise de impacto;
- identificação de inconsistências;
- comparação entre implementações;
- revisão técnica;
- identificação de possíveis riscos;
- sugestão de alternativas;
- verificação de aderência aos padrões existentes.

### Princípio

O Codex deve funcionar como **analista técnico do repositório**, e não como responsável autônomo pela evolução do projeto.

---

## 3. Metodologia do projeto

O desenvolvimento do Cigana segue o princípio:

**inspecionar → decidir → implementar → validar → documentar**

O Codex participa principalmente da etapa de **inspeção e análise**.

A implementação somente deve ocorrer mediante solicitação explícita e específica do usuário.

As etapas devem ser conduzidas incrementalmente, uma de cada vez.

Não iniciar uma nova etapa enquanto a etapa atual não tiver sido analisada, implementada e validada.

---

## 4. Idioma e contexto

- Responda, explique, documente e nomeie mensagens de trabalho em português do Brasil, salvo quando um contrato técnico existente exigir outro idioma.
- Este projeto é a **Plataforma Leitura**, atualmente chamada **Cigana**: uma plataforma de livros interativos.
- Preserve a terminologia de domínio já adotada no código e nas migrations.

---

## 5. Arquitetura e tecnologias

- O backend é uma API REST em **Node.js, Express e PostgreSQL**.
- O frontend é uma aplicação **Next.js, React e Tailwind CSS**.
- O backend segue a separação:

  `routes → controllers → services → models`

- `validators`, `middleware` e `utils` são camadas de apoio.
- Respeite a organização existente.
- Os arquivos estáticos de mídia ficam em `media/` e são expostos pelo backend em `/media`.
- O frontend concentra rotas em `frontend/src/app`, componentes em `frontend/src/components` e comunicação HTTP em `frontend/src/services`.

---

## 6. Domínio e experiência da plataforma

- Biblioteca e Editor são áreas distintas da plataforma.
- O **Editor** é a área de criação, edição e organização das obras.
- **Autor** é uma entidade de domínio e não é sinônimo de Editor.
- Não misture responsabilidades, regras ou nomenclaturas dessas duas noções.
- Use a experiência validada da Biblioteca como referência para a visualização das obras no Editor, sem transformar as duas áreas na mesma funcionalidade.
- Preserve a hierarquia narrativa existente:

  `livro → capítulo → cena → conteúdos/mídias e escolhas`

---

## 7. Banco de dados

- As migrations em `database/migrations/` são a fonte de verdade da estrutura do banco de dados.
- Antes de analisar qualquer alteração de persistência, consulte as migrations e os models relacionados.
- Migrations já aplicadas não devem ser reescritas.
- Evoluções de esquema devem ser realizadas por meio de novas migrations.
- O Codex não deve criar ou alterar migrations sem autorização explícita do usuário.
- O Codex não deve executar alterações diretamente no banco de dados.
- Use os scripts existentes (`database/migrar.sh` e `database/seed.sh`) somente quando explicitamente solicitado.
- Não presuma que seeds ou dados locais possam ser apagados.

---

## 8. API, contratos e validação

- Preserve os contratos existentes da API — rotas, métodos, payloads, respostas, autenticação e códigos de status.
- Não altere funcionalidades já validadas sem necessidade explícita.
- Antes de analisar uma alteração, inspecione o fluxo relacionado.
- Considere, quando aplicável:

  - route;
  - controller;
  - service;
  - model;
  - validator;
  - middleware;
  - frontend consumidor;
  - testes Bruno;
  - documentação relacionada.

- Não recrie funcionalidades que já existam.
- Localize e analise a implementação atual antes de sugerir mudanças.
- Preserve nomenclatura, convenções, idioma e padrões já utilizados pelo projeto.
- Preserve os nomes de rotas atuais em português.
- Considere que parte da documentação de endpoints, especialmente `backend/README.md`, pode estar desatualizada.
- Para análise de compatibilidade, priorize o código efetivamente implementado e a coleção Bruno.

---

## 9. Escopo e economia de uso

As tarefas do Codex devem possuir **escopo específico e limitado**.

Evite solicitações abertas como:

- "analise o projeto inteiro";
- "veja o que pode melhorar";
- "procure problemas no sistema";
- "faça uma revisão geral".

Prefira solicitações direcionadas, como:

- "Analise o fluxo de Progresso de Leitura."
- "Identifique os arquivos relacionados ao módulo de Preferências."
- "Verifique a relação entre este service e o contrato Bruno."
- "Analise o impacto desta alteração no backend."

Quando possível:

- limitar a análise a um domínio;
- limitar a análise a uma funcionalidade;
- indicar arquivos conhecidos;
- evitar exploração desnecessária do repositório;
- responder somente à pergunta técnica solicitada.

O objetivo é preservar o uso do Codex e evitar processamento desnecessário.

---

## 10. Regra de não alteração

Durante uma tarefa de análise, o Codex deve operar em modo somente leitura.

Não deve:

- modificar arquivos;
- criar arquivos;
- excluir arquivos;
- alterar migrations;
- alterar seeds;
- alterar banco;
- instalar dependências;
- modificar configurações;
- corrigir automaticamente problemas encontrados;
- realizar refatorações;
- alterar código apenas porque identificou uma melhoria.

Se encontrar um problema, deve:

1. informar o problema;
2. indicar o arquivo envolvido;
3. explicar o impacto;
4. apresentar uma possível abordagem;
5. aguardar decisão.

---

## 11. Preservação de trabalho existente

- Não modificar arquivos não relacionados ao objetivo da análise.
- Preservar alterações locais preexistentes feitas por outras pessoas.
- Não assumir que código existente deve ser refatorado apenas porque poderia ser escrito de outra maneira.
- Priorizar a preservação das decisões já validadas.
- Não substituir uma implementação existente sem justificativa e autorização.

---

## 12. Testes e Bruno

- Os testes de API são mantidos na coleção Bruno `Cigana_API/`, usando arquivos YAML e `opencollection.yml`.
- Existem testes de models em `backend/tests/models/`.
- Existem verificações técnicas em `backend/src/tests/`.
- O script `npm test` do backend ainda não está configurado como runner; não introduzir dependências ou comandos novos sem decisão explícita.

Durante uma análise, o Codex pode:

- localizar testes existentes;
- identificar cenários relacionados;
- analisar cobertura aparente;
- apontar possíveis lacunas.

O Codex não deve alterar os testes automaticamente durante uma tarefa de análise.

A criação ou alteração de cenários Bruno será realizada somente após decisão explícita sobre a implementação.

---

## 13. Segurança e qualidade

- Não exponha segredos, credenciais ou conteúdo de arquivos `.env`.
- Não reproduza senhas, tokens, chaves privadas ou credenciais encontradas durante uma inspeção.
- Mantenha autenticação JWT, validação de entrada e tratamento de erros coerentes com os módulos existentes.
- Prefira mudanças pequenas, compatíveis e verificáveis a reestruturações amplas.
- Não proponha refatorações que não sejam necessárias para o objetivo analisado.

---

## 14. Relatório de análise

Quando solicitado a analisar uma etapa, o Codex deve preferencialmente apresentar:

### 1. Escopo analisado
Quais arquivos, diretórios ou funcionalidades foram examinados.

### 2. Estrutura encontrada
Como os componentes envolvidos estão organizados.

### 3. Fluxo atual
Como os dados ou requisições percorrem o sistema.

### 4. Dependências
Quais componentes dependem ou são afetados pelo fluxo analisado.

### 5. Funcionalidades existentes
O que já está implementado e validado.

### 6. Lacunas
O que aparentemente ainda não existe ou precisa de atenção.

### 7. Impactos
Quais partes poderiam ser afetadas por uma futura implementação.

### 8. Recomendações
Possíveis abordagens técnicas, sem implementá-las.

### 9. Arquivos envolvidos
Lista objetiva dos arquivos relevantes.

Após apresentar o relatório, **aguarde a decisão do usuário**.

---

## 15. Regra de decisão

O Codex não deve tomar decisões arquiteturais definitivas pelo projeto.

Quando houver mais de uma alternativa válida:

- apresente as alternativas;
- explique vantagens e riscos;
- indique impactos;
- aguarde a decisão do usuário.

As decisões finais pertencem ao responsável pelo projeto.

---

## 16. Implementação somente mediante autorização explícita

Caso o usuário posteriormente solicite implementação, a solicitação deverá ser específica.

Exemplos de autorização explícita:

- "Implemente esta alteração."
- "Crie o controller descrito acima."
- "Faça a alteração no arquivo X."
- "Implemente somente esta parte."

Mesmo com autorização:

- respeite o escopo solicitado;
- não faça refatorações não solicitadas;
- não altere migrations ou seeds sem autorização específica;
- não altere contratos validados sem necessidade;
- preserve alterações locais existentes;
- informe os arquivos modificados;
- informe as ações executadas.

---

## 17. Princípio geral

O Cigana é desenvolvido de forma incremental e controlada.

A prioridade é:

1. preservar decisões já validadas;
2. compreender o estado atual antes de alterar;
3. trabalhar em pequenas etapas;
4. reduzir alterações desnecessárias;
5. validar cada etapa;
6. documentar decisões importantes.

O Codex deve contribuir principalmente com **visibilidade, análise e segurança técnica**, enquanto a evolução efetiva do projeto permanece sob controle do usuário.
