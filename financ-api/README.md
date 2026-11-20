# API Financeira Cigana

Serviço REST independente, com configuração, conexão PostgreSQL, autenticação e migrations próprias. A API oferece endpoint de saúde e consulta protegida da identidade financeira autenticada; não há módulos de pedidos, pagamentos, PIX, reembolsos, remuneração, repasses ou relatórios.

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

O runner usa apenas `financ-api/database/migrations/`, registra os arquivos em `public.financ_api_migrations` e executa cada arquivo em transação. A migration `0003_identidades_externas.sql` lê `FINANC_API_JWT_ISSUER` da configuração carregada pelo runner e grava esse emissor confiável na plataforma `CIGANA`. Ela interrompe a execução se encontrar usuários financeiros fora do mapeamento aprovado ou se não localizar o vínculo existente com `ADMIN_RBAC_FINANCEIRO`. A falha provoca rollback da migration e não marca o arquivo como aplicado. O runner não possui migrations reversas; depois do commit, a reversão documentada é restaurar um backup consistente do banco anterior à migration. Não remover manualmente as tabelas novas.

## Autenticação RS256

O módulo `src/utils/jwt.js` valida tokens emitidos por outro serviço; esta API não emite JWT. A validação exige RS256, assinatura válida com a chave pública, `kid`, `iss` e `aud` configurados, `sub` como UUID, `id === sub`, `iat` e `exp` inteiros válidos e duração máxima de 86.400 segundos. Se `nbf` existir, precisa ser inteiro e anterior a `exp`. A tolerância de relógio segue o contrato atual de cinco segundos.

Configure `FINANC_API_JWT_PUBLIC_KEY` com somente a chave pública da API Cigana, e `FINANC_API_JWT_KID`, `FINANC_API_JWT_ISSUER` e `FINANC_API_JWT_AUDIENCE` com os mesmos valores semânticos configurados no emissor Cigana (`JWT_RS256_KID`, `JWT_ISSUER` e `JWT_AUDIENCE`). O emissor mantém a chave privada e habilita seu dispatcher RS256 com `JWT_RS256_ENABLED=true`. PEM pode usar quebras de linha ou `\\n`. Ausência de configuração, chave inválida, token inválido e falha criptográfica rejeitam a autenticação; as respostas HTTP não expõem detalhes internos. Não há fallback HS256 nem leitura de `JWT_SECRET`.

Os valores concretos são definidos na configuração de cada ambiente e não devem ser registrados neste arquivo. A API Financeira não recebe a chave privada. Permissões financeiras não são obtidas de claims `role` do token.

## Primeira rota protegida

`GET /api/financeiro/usuario-autenticado` exige token RS256 e a permissão financeira existente `financeiro.rbac.consultar`. Depois de validar assinatura, `kid`, `iss`, `aud` e claims temporais, o middleware resolve `iss` para uma plataforma ativa e combina essa plataforma com o UUID externo de `sub`/`id`. `req.usuario.id` continua sendo o UUID externo; `req.usuario.usuarioFinanceiroId` é o identificador interno financeiro usado no RBAC. Identidade ou plataforma ausente/inativa retorna `403`; falha de resolução ou autorização no PostgreSQL retorna `503`. A resposta mantém o UUID externo no campo `usuario.id`.

## RBAC financeiro

As migrations `0001` e `0002` criam o schema e o RBAC no banco financeiro. A migration `0003` adiciona `plataformas` (incluindo o `issuer` confiável), `identidades_externas` e o identificador interno `usuarios_financeiros.id`. Ela preserva o UUID financeiro `e4fc…`, estado, papel e vínculos RBAC; registra a identidade aprovada `CIGANA + 6ad… → e4fc…`; e migra a FK de `usuario_papeis_financeiros` para a chave interna. Os campos históricos de auditoria permanecem inalterados. A associação da identidade é imutável; para suspender acesso, desative o registro sem excluí-lo ou reassociá-lo. Outros usuários sem origem aprovada fazem a migration abortar; nenhum dado pessoal da Cigana é copiado.

`middleware/exigirPermissao.js` deve ser usado depois de `middleware/autenticar.js` na cadeia da rota. Ele recebe o código da permissão aprovado para aquela operação e consulta as permissões efetivas no banco; usuário, papel, permissão ou consulta indisponível nunca concede acesso. A listagem efetiva considera somente usuário, associações, papel e permissão ativos. Falhas de banco retornam erro genérico `503`, sem expor detalhes internos.

O catálogo de permissões operacionais e os papéis de negócio permanecem pendentes. Não há associação de permissões ao papel `FINANCEIRO` nem atribuição automática a usuários.

### Provisionamento inicial do administrador RBAC

Na plataforma principal, o papel é identificado pelo código `ADMINISTRADOR`, definido em `database/migrations/0036_insert_papeis.sql` e associado a usuários pela tabela `usuario_papeis` (`database/migrations/0033_create_usuario_papeis.sql`). A `financ-api` não consulta esse banco nem confia em claims de papel do JWT.

Depois de confirmar fora da `financ-api` que uma pessoa específica possui esse papel na plataforma principal, execute localmente:

```sh
node scripts/provisionar-rbac.js \
  --plataforma CIGANA \
  --usuario-id <UUID_VERIFICADO> \
  --confirmar-papel-plataforma ADMINISTRADOR
```

O comando exige o código de plataforma e o UUID externo, resolve uma identidade e um usuário financeiro já existentes e ativos, e então cria idempotentemente o papel `ADMIN_RBAC_FINANCEIRO`, as permissões `financeiro.rbac.consultar`, `financeiro.rbac.atribuir` e `financeiro.rbac.revogar`, associa essas permissões ao papel e associa o usuário interno ao papel. Não cria usuário financeiro nem identidade externa. Nos registros novos, os campos de auditoria continuam guardando o UUID externo informado. `ON CONFLICT DO NOTHING` preserva registros e auditoria existentes. O comando não reativa usuários, identidades, plataformas, papéis, permissões ou associações inativas. Também aborta se completar as permissões de um papel administrativo já atribuído a outras pessoas pudesse ampliar os acessos delas. Não há endpoint público de provisionamento.

O mapeamento usado na migration foi aprovado explicitamente para esta implantação. O provisionador continua sem inferir papéis a partir do JWT e não cria identidades.

A confirmação de `ADMINISTRADOR` na linha de comando é uma declaração operacional explícita, não uma verificação automática do papel externo. Para novas provisões, o responsável deve confirmar fora da Financeira o papel da identidade informada. A API financeira não concede acesso a todos os usuários com `ADMINISTRADOR`.

## Testes

```sh
npm test
```

Os testes unitários usam o runner nativo `node:test` e chaves RSA efêmeras em memória. Os testes de integração RBAC e da rota financeira exigem um `financeiro_db` de teste com as migrations aplicadas e os vínculos de teste correspondentes; não apontam para produção.
