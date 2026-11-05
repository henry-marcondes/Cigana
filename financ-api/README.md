# API Financeira Cigana

Serviço REST independente, com configuração, conexão PostgreSQL, autenticação e migrations próprias. Nesta etapa há somente o endpoint de saúde e a infraestrutura inicial; não há módulos de pedidos, pagamentos, PIX, reembolsos, remuneração, repasses ou relatórios.

## Requisitos locais

- Node.js 20 ou superior.
- PostgreSQL local com um banco chamado `financeiro_db` e um usuário próprio.

## Instalação e execução

```sh
cd financ-api
npm install
cp .env.example .env
```

Edite `financ-api/.env` com as configurações locais. O arquivo é ignorado pelo Git. Inicie com `npm start` ou, durante desenvolvimento, `npm run dev`. A API inicia na porta `FINANC_API_PORT` (padrão `3001`).

`GET http://localhost:3001/api/health` retorna o estado de vida do processo. Esse endpoint não testa a disponibilidade do PostgreSQL.

## Banco de dados

Use somente as variáveis `FINANC_API_DB_HOST`, `FINANC_API_DB_PORT`, `FINANC_API_DB_NAME`, `FINANC_API_DB_USER` e `FINANC_API_DB_PASSWORD`. A configuração exige que `FINANC_API_DB_NAME` seja exatamente `financeiro_db`; a conexão não lê `DB_NAME`, `DB_USER` ou outras variáveis do backend principal.

O serviço não executa migrations ao iniciar. Depois de configurar o banco local, aplique-as explicitamente com:

```sh
npm run migrate
```

O runner usa apenas `financ-api/database/migrations/`, registra os arquivos em `public.financ_api_migrations` e executa cada arquivo em transação. As migrations criam o schema `financeiro` e as tabelas mínimas do RBAC financeiro. Nenhuma migration foi executada durante a implementação.

## Autenticação RS256

O módulo `src/utils/jwt.js` valida tokens emitidos por outro serviço; esta API não emite JWT. A validação exige RS256, assinatura válida com a chave pública, `kid`, `iss` e `aud` configurados, `sub` como UUID, `id === sub`, `iat` e `exp` inteiros válidos e duração máxima de 86.400 segundos. Se `nbf` existir, precisa ser inteiro e anterior a `exp`. A tolerância de relógio segue o contrato atual de cinco segundos.

Configure `FINANC_API_JWT_PUBLIC_KEY`, `FINANC_API_JWT_KID`, `FINANC_API_JWT_ISSUER` e `FINANC_API_JWT_AUDIENCE` quando os valores contratuais forem formalizados. PEM pode usar quebras de linha ou `\\n`. Ausência de configuração, chave inválida, token inválido e falha criptográfica rejeitam a autenticação; as respostas HTTP não expõem detalhes internos. Não há fallback HS256 nem leitura de `JWT_SECRET`.

Os identificadores de emissor e audiência continuam pendentes de aprovação/configuração. A API Financeira deverá usar uma audiência exclusiva para si. Permissões financeiras não são obtidas de claims `role` do token.

## RBAC financeiro

A migration `0002_create_rbac_financeiro.sql` cria `usuarios_financeiros`, `papeis_financeiros`, `permissoes_financeiras`, `usuario_papeis_financeiros` e `papel_permissoes_financeiras` no schema `financeiro`. O UUID externo do usuário é armazenado como identidade local, sem chave estrangeira para a plataforma principal. As chaves estrangeiras existem somente entre tabelas do `financeiro_db`. Os registros têm timestamps e identificadores externos de auditoria; estes identificadores também não criam dependências com o banco principal. Não são copiados dados pessoais ou credenciais, e a migration não insere usuários, papéis ou permissões.

`middleware/exigirPermissao.js` deve ser usado depois de `middleware/autenticar.js` na cadeia da rota. Ele recebe o código da permissão aprovado para aquela operação e consulta as permissões efetivas no banco; usuário, papel, permissão ou consulta indisponível nunca concede acesso. A listagem efetiva considera somente usuário, associações, papel e permissão ativos. Falhas de banco retornam erro genérico `503`, sem expor detalhes internos.

O catálogo de permissões operacionais e os papéis de negócio permanecem pendentes. Não há associação de permissões ao papel `FINANCEIRO` nem atribuição automática a usuários.

### Provisionamento inicial do administrador RBAC

Na plataforma principal, o papel é identificado pelo código `ADMINISTRADOR`, definido em `database/migrations/0036_insert_papeis.sql` e associado a usuários pela tabela `usuario_papeis` (`database/migrations/0033_create_usuario_papeis.sql`). A `financ-api` não consulta esse banco nem confia em claims de papel do JWT.

Depois de confirmar fora da `financ-api` que uma pessoa específica possui esse papel na plataforma principal, execute localmente:

```sh
node scripts/provisionar-rbac.js \
  --usuario-id <UUID_VERIFICADO> \
  --confirmar-papel-plataforma ADMINISTRADOR
```

O comando exige um único UUID explícito e a confirmação do código externo. Ele cria idempotentemente o papel `ADMIN_RBAC_FINANCEIRO`, as permissões `financeiro.rbac.consultar`, `financeiro.rbac.atribuir` e `financeiro.rbac.revogar`, associa essas permissões somente ao papel administrativo dedicado e associa apenas o UUID informado a esse papel. Nos registros novos, preenche os campos de auditoria com esse UUID como ator do bootstrap; `ON CONFLICT DO NOTHING` preserva registros e auditoria existentes. O comando não reativa usuários, papéis, permissões ou associações inativas. Também aborta se completar as permissões de um papel administrativo já atribuído a outras pessoas pudesse ampliar os acessos delas. Não há endpoint público de provisionamento.

O banco `financeiro_db` foi consultado somente para leitura nesta etapa: as tabelas de RBAC existem e não havia códigos de papéis ou permissões cadastrados. Portanto, o provisionador não foi executado e nenhum UUID foi escolhido. A plataforma principal contém as permissões gerais `financeiro.visualizar` e `financeiro.operar`, mas elas não são copiadas nem substituem os códigos específicos de administração do RBAC.

A confirmação de `ADMINISTRADOR` na linha de comando é uma declaração operacional explícita, não uma verificação automática do papel externo. Continua pendente definir quem aprova e fornece o UUID inicial e qual procedimento documentado comprova essa associação na plataforma principal. A API financeira não concede o acesso a todos os usuários com `ADMINISTRADOR`.

## Testes

```sh
npm test
```

Os testes usam o runner nativo `node:test` e chaves RSA efêmeras em memória. Não exigem PostgreSQL, chaves reais ou acesso ao banco.
