# AUD-015 --- Avaliações na Biblioteca

-   **Área:** Biblioteca / Interação com leitores
-   **Status:** Implementação integrada; validação manual da interface
    realizada
-   **Arquivo de referência:**
    `docs/auditoria/AUD-015-Avaliacoes-Biblioteca.md`
-   **Escopo:** registro, consulta e edição de avaliações de obras, com
    comentário opcional
-   **Ponto de atenção:** administração/moderação e fluxo de
    desativação/reativação ainda precisam de evolução e validação
    específica

## 1. Objetivo

Registrar a implementação de Avaliações na Biblioteca, as regras de
negócio acordadas, os arquivos envolvidos, os testes manuais executados
e as pendências que devem orientar alterações futuras.

Este documento também serve como referência para evitar que futuras
mudanças no backend, na Biblioteca ou na área administrativa removam
regras já validadas.

## 2. Regras de negócio acordadas

1.  Cada usuário pode ter uma avaliação por obra.
2.  A nota é obrigatória, inteira e deve estar entre **1 e 5**.
3.  O comentário é opcional e independente da nota.
4.  A nota e o comentário podem ser alterados separadamente.
5.  O comentário pode ter no máximo **1.000 caracteres**.
6.  O comentário pode ser removido sem apagar a avaliação nem a nota.
    Valor `null` ou texto vazio deve ser tratado como ausência de
    comentário.
7.  O usuário só pode consultar e administrar sua própria avaliação nas
    operações pessoais de criação, edição e desativação.
8.  A identidade do usuário deve vir da sessão autenticada
    (`req.usuario.id`), nunca de um `usuario_id` confiado no corpo da
    requisição.
9.  Se o usuário tentar criar outra avaliação para a mesma obra enquanto
    já houver uma avaliação ativa, a API deve responder com conflito
    (`409`).
10. Se existir uma avaliação inativa do mesmo usuário para a mesma obra,
    o backend pode reativar esse registro, preservando a nota e o
    comentário anteriores. Essa regra foi implementada no backend, mas o
    fluxo de reavaliação após desativação **não foi validado
    manualmente** e não é prioridade imediata.
11. A listagem pública da Biblioteca exibe avaliações ativas. Operações
    pessoais exigem autenticação e verificação de propriedade.

## 3. Implementação registrada

### 3.1 Backend

Arquivos alterados na implementação:

-   `backend/src/routes/avaliacaoRoutes.js`
    -   Define as rotas de avaliações.
    -   As operações pessoais e de escrita devem permanecer protegidas
        por autenticação.
    -   A listagem pública de avaliações ativas por obra foi mantida.
-   `backend/src/controllers/AvaliacaoController.js`
    -   Recebe as requisições e encaminha a identidade autenticada ao
        serviço.
    -   Não deve aceitar o `usuario_id` enviado pelo cliente como fonte
        de identidade.
-   `backend/src/services/avaliacaoService.js`
    -   Centraliza as regras de negócio.
    -   As operações por identificador devem respeitar a propriedade da
        avaliação.
    -   A reativação de registro inativo preserva a nota e o comentário
        existentes.
    -   Erros inesperados devem ser encaminhados ao tratamento global,
        sem serem mascarados indiscriminadamente como erro de entrada
        (`400`).
-   `backend/src/models/Avaliacao.js`
    -   Executa as operações de persistência.
    -   A criação deve tratar a restrição única por usuário e obra,
        inclusive em situações de concorrência.
    -   A reativação deve ocorrer de forma atômica e sem sobrescrever os
        dados anteriores.
-   `backend/src/validators/avaliacaoValidator.js`
    -   Valida a nota obrigatória entre 1 e 5.
    -   Valida o comentário opcional e o limite de 1.000 caracteres.
    -   Permite ausência do comentário por `null` ou texto vazio,
        conforme a regra acordada.

A verificação sintática (`node --check`) foi executada nos cinco
arquivos alterados e passou. Na ocasião do registro, não foram
executados testes automatizados, testes pelo Bruno, nem uma validação
específica de migração ou banco de dados para essa alteração.

### 3.2 Frontend --- Biblioteca

Arquivos envolvidos:

-   `frontend/src/services/avaliacao.js`
    -   Centraliza as chamadas à API utilizando `apiFetch`.
    -   Deve continuar seguindo os contratos de API existentes e a forma
        de autenticação utilizada pelo frontend.
-   `frontend/src/components/AvaliacoesLivro.jsx`
    -   Lista avaliações e apresenta a interface para registrar e editar
        nota e comentário.
    -   A seleção da nota foi alterada para **cinco estrelas
        clicáveis**.
    -   Permite editar nota e comentário separadamente e remover o
        comentário sem apagar a nota.
    -   Apresenta estados de carregamento, gravação, ausência/expiração
        de sessão e erros da API.
    -   Não envia `usuario_id` no corpo da criação.
    -   A alteração visual para estrelas foi feita diretamente, sem
        Codex, preservando a lógica existente. A interface foi conferida
        manualmente e o usuário confirmou que ficou correta.
-   `frontend/src/components/LeituraLivro.jsx`
    -   Integra a seção de avaliações à experiência de leitura quando
        aplicável.
-   `frontend/src/app/livros/[slug]/page.jsx`
    -   Habilita a seção na página pública da Biblioteca.
    -   A prévia da obra no Estúdio/Editor não deve exibir essa seção
        como se fosse uma avaliação pública da Biblioteca.

## 4. Banco de dados

Migração relacionada:

-   `database/migrations/0022_create_avaliacoes.sql`

Estrutura registrada para `avaliacoes`:

-   `id`: UUID, chave primária;
-   `usuario_id`: UUID, referência ao usuário;
-   `livro_id`: UUID, referência à obra;
-   `nota`: `SMALLINT`, obrigatória, com restrição entre 1 e 5;
-   `comentario`: texto opcional;
-   `ativo`: booleano, padrão `TRUE`;
-   campos de criação e atualização;
-   restrição única para `(usuario_id, livro_id)`;
-   chaves estrangeiras e índices previstos na migração.

A migração `0021` pertence a Favoritos; não renomear nem reutilizar esse
número para Avaliações. A migração de Avaliações é a `0022`.

## 5. Validação manual realizada

Foram realizados testes pela interface gráfica da Biblioteca, sem usar
Bruno nesta etapa.

  -----------------------------------------------------------------------
  Cenário                             Resultado registrado
  ----------------------------------- -----------------------------------
  Biblioteca sem sessão: avaliações   Aprovado
  visíveis e convite para entrar      

  Criar avaliação com nota e sem      Aprovado
  comentário                          

  Adicionar comentário                Aprovado

  Alterar nota e comentário           Aprovado
  separadamente                       

  Remover comentário preservando a    Aprovado
  nota                                

  Tentar comentário com mais de 1.000 Aprovado
  caracteres                          

  Sessão expirada e erros da API      Aprovado

  Prévia do Editor sem a seção de     Aprovado
  avaliações da Biblioteca            

  Reavaliar depois de desativar uma   **Não testado; não prioritário
  avaliação                           nesta etapa**
  -----------------------------------------------------------------------

O fluxo de reavaliação após desativação não deve ser descrito como
validado. O backend foi preparado para reativar o registro inativo,
preservando nota e comentário, mas a experiência completa ainda precisa
ser exercitada quando esse fluxo voltar a ser prioridade.

## 6. Pendências e evolução futura

### 6.1 Ativação, desativação e reavaliação

A lógica de reativação existe no backend, mas o fluxo não foi validado
de ponta a ponta pela interface. Antes de implementar ou alterar esse
comportamento, inspecionar os arquivos atuais e manter os contratos
existentes.

Arquivos a revisar para concluir esse fluxo:

1.  `backend/src/routes/avaliacaoRoutes.js`
    -   Confirmar a rota de desativação e os middlewares aplicados.
    -   Confirmar que a rota não permite desativar avaliação de outro
        usuário.
2.  `backend/src/controllers/AvaliacaoController.js`
    -   Confirmar que o controlador obtém o usuário autenticado e
        encaminha corretamente o identificador da avaliação.
3.  `backend/src/services/avaliacaoService.js`
    -   Revisar as regras de desativação, duplicidade e reativação.
    -   Preservar nota e comentário antigos ao reativar, conforme a
        decisão atual.
    -   Não transformar a reativação em criação de uma segunda linha
        para o mesmo usuário e obra.
4.  `backend/src/models/Avaliacao.js`
    -   Conferir a persistência de `ativo`, a restrição única e o
        tratamento de concorrência.
    -   Garantir que a reativação não sobrescreva os dados históricos.
5.  `backend/src/validators/avaliacaoValidator.js`
    -   Revisar validações da operação caso a rota ou o contrato de
        desativação seja alterado.
6.  `frontend/src/services/avaliacao.js`
    -   Verificar se a operação de desativação/reativação está exposta
        pelo serviço, de acordo com as rotas existentes.
7.  `frontend/src/components/AvaliacoesLivro.jsx`
    -   Decidir e implementar, quando priorizado, a ação visual
        correspondente.
    -   Definir mensagens de sucesso e erro, estado de carregamento e
        comportamento após reativação.
    -   Não exibir controles que o backend não suporte.
8.  `frontend/src/components/LeituraLivro.jsx` e
    `frontend/src/app/livros/[slug]/page.jsx`
    -   Revisar apenas se a conclusão do fluxo exigir alteração na
        integração da seção da Biblioteca.

**Validação futura mínima:** desativar a própria avaliação, confirmar
que ela deixa de aparecer na listagem pública, enviar nova avaliação
para a mesma obra, confirmar a reativação do registro existente e
verificar que nota e comentário anteriores foram preservados. Também
confirmar que outro usuário não consegue desativar, alterar ou reativar
essa avaliação.

A desativação não deve ser confundida com apagar fisicamente o registro.
O campo `ativo` e a restrição única são parte da regra atual.

### 6.2 Acesso administrativo e moderação

**O acesso administrativo às avaliações, incluindo consulta global,
edição ou desativação por administrador/moderador, foi adiado e não deve
ser considerado implementado.**

A autorização futura precisa ser definida antes de alterar as rotas. Não
basta verificar um nome de papel no JWT, nem liberar acesso apenas
porque o usuário acessa a área `/admin`. A autorização da plataforma
deve continuar seguindo a regra:

`usuário → papel → permissão`

O banco de dados é a fonte de verdade para as permissões. O middleware
de autorização e as permissões já existentes devem ser inspecionados
antes de decidir qual permissão representa a capacidade de moderar
avaliações. Não presumir que `moderacao.visualizar`,
`plataforma.visualizar` ou outra permissão já existente autorize
automaticamente editar ou desativar avaliações; é necessário conferir
seu significado e uso atuais.

Arquivos e pontos a inspecionar quando essa funcionalidade for
priorizada:

-   `backend/src/routes/avaliacaoRoutes.js`
    -   Separar claramente as rotas pessoais das futuras rotas de
        moderação.
    -   Proteger todas as operações administrativas com autenticação e
        autorização RBAC.
    -   Não tornar operações de moderação públicas.
-   `backend/src/controllers/AvaliacaoController.js`
    -   Adicionar ações administrativas somente depois de definida a
        regra de negócio e o contrato da API.
-   `backend/src/services/avaliacaoService.js`
    -   Implementar regras específicas para moderação sem enfraquecer a
        regra de propriedade nas operações pessoais.
    -   Definir se o moderador pode editar a nota/comentário ou apenas
        ocultar/desativar a avaliação.
-   `backend/src/models/Avaliacao.js`
    -   Criar apenas as consultas necessárias para a operação
        administrativa definida.
    -   Evitar alterações no modelo ou na tabela sem necessidade
        demonstrada.
-   Middleware de autorização existente, incluindo
    `backend/src/middlewares/autorizacao.js` (confirmar o caminho/nome
    no código atual antes de editar).
    -   Reutilizar o mecanismo RBAC existente.
    -   Não usar o campo `role` do JWT como fonte de verdade.
-   Arquivos de definição/semente/migração de permissões e vínculos
    papel-permissão.
    -   Localizar as definições existentes antes de criar qualquer
        permissão nova.
    -   Reutilizar uma permissão existente somente se ela representar
        corretamente a capacidade de negócio.
    -   Se não existir permissão adequada, discutir e documentar a
        decisão antes de criar outra.
-   `frontend/src/services/avaliacao.js`
    -   Acrescentar chamadas administrativas apenas quando as rotas
        estiverem definidas e protegidas.
-   Componentes e páginas de administração existentes em
    `frontend/src/app/admin/` (inspecionar a estrutura atual antes de
    escolher o arquivo exato).
    -   Definir onde a consulta e a moderação de avaliações se encaixam
        na área administrativa.
    -   Respeitar a separação entre Biblioteca, Estúdio/Editor e
        administração.

**Decisões ainda necessárias para o acesso administrativo:**

1.  Administrador e moderador terão as mesmas capacidades?
2.  Poderão apenas consultar e desativar avaliações ou também editar
    nota/comentário?
3.  A desativação administrativa será reversível? Quem poderá reativar?
4.  A interface deve informar ao leitor que uma avaliação foi moderada?
5.  Será necessário registrar motivo, responsável e data da moderação?
    Se sim, avaliar antes a necessidade de histórico/auditoria e
    eventual mudança de banco.

Essas decisões não devem ser resolvidas por suposição durante a
implementação.

### 6.3 Uso das avaliações na análise de dados

Avaliações poderão alimentar indicadores administrativos futuros, por
exemplo:

-   quantidade de avaliações ativas por obra;
-   distribuição das notas de 1 a 5;
-   nota média por obra;
-   evolução das avaliações ao longo do tempo, se os dados históricos
    disponíveis forem suficientes;
-   quantidade de avaliações com comentário.

Os indicadores devem considerar a regra de avaliação única por usuário e
obra e, em geral, filtrar registros inativos quando a métrica
representar avaliações atualmente válidas. A definição de cada indicador
precisa explicitar se considera apenas avaliações ativas ou também
histórico de registros desativados.

A consulta administrativa para análise de dados deve ser protegida por
RBAC. O desenvolvimento de indicadores não depende de conceder, desde
já, permissão administrativa para editar avaliações. Consulta analítica
e moderação são capacidades distintas e devem continuar separadas.

## 7. Cuidados para alterações futuras

-   Preservar a restrição de uma avaliação por usuário e obra.
-   Não confiar em `usuario_id` fornecido pelo cliente.
-   Não permitir que um usuário altere ou desative avaliação de outra
    pessoa.
-   Manter nota obrigatória entre 1 e 5.
-   Manter comentário opcional, independente da nota, com limite de
    1.000 caracteres.
-   Permitir remover o comentário sem apagar a nota.
-   Preservar nota e comentário ao reativar registro inativo, conforme
    regra acordada.
-   Manter a listagem pública limitada às avaliações ativas.
-   Proteger rotas pessoais de escrita e futuras rotas administrativas.
-   Não misturar autorização administrativa com o simples fato de estar
    na página `/admin`.
-   Não alterar a experiência de prévia do Estúdio/Editor sem
    necessidade.
-   Antes de modificar arquivos, inspecionar o código atual e os
    contratos existentes.

## 8. Estado ao encerrar esta etapa

-   Backend de avaliações implementado e verificado sintaticamente.
-   Integração da Biblioteca concluída.
-   Seletor de nota com cinco estrelas implementado e conferido
    visualmente.
-   Cenários manuais principais aprovados pelo usuário.
-   Reavaliação após desativação permanece sem teste manual e foi
    explicitamente adiada.
-   Acesso administrativo/moderação permanece pendente de definição e
    implementação.
-   Próxima frente acordada: retomar a análise de dados, começando pelos
    indicadores de progresso de leitura e, posteriormente, incorporando
    avaliações e favoritos com autorização adequada.

------------------------------------------------------------------------

**Documento de auditoria técnica.** Alterações futuras devem ser
incrementais, respeitar as decisões registradas e validar apenas os
cenários afetados pela mudança.
