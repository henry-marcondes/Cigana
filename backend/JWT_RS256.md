# Configuração futura do JWT RS256

O módulo `src/utils/jwtAsimetrico.js` permanece isolado: não está conectado ao login, aos controllers ou aos middlewares atuais. O mecanismo legado em `src/utils/jwt.js` continua independente.

## Configuração

O emissor precisa da chave privada e os validadores precisam somente da chave pública. Cada ambiente deve receber sua configuração pelo mecanismo de segredos/configuração da infraestrutura, sem guardar chaves no Git.

- `JWT_RS256_PRIVATE_KEY`: chave privada PEM, exclusiva do emissor. Nunca distribuir à API Financeira. Obrigatória somente para assinar.
- `JWT_RS256_PUBLIC_KEY`: chave pública PEM correspondente. Obrigatória para validar.
- `JWT_RS256_KID`: identificador da única chave ativa configurada neste módulo.
- `JWT_ISSUER`: identificador aprovado do emissor. Não há valor padrão.
- `JWT_AUDIENCE`: identificador aprovado do serviço destinatário. Não há valor padrão; configure a audiência própria de cada validador.

Propostas ainda pendentes de formalização e configuração dos ambientes:

- `JWT_ISSUER=plataforma-cigana`
- `JWT_AUDIENCE=cigana-api` no ambiente da API principal.
- `JWT_AUDIENCE=cigana-api-financeira` no ambiente independente da API Financeira.

Valores PEM aceitam quebras de linha reais ou sequências `\\n`, que são normalizadas. Falta de configuração, PEM inválido ou erro criptográfico causa falha fechada. As mensagens emitidas pelo módulo são genéricas e não incluem token ou conteúdo de chave.

## Contrato e validação

A assinatura usa exclusivamente RS256. O emissor exige `sub` como UUID no formato hexadecimal com hífens e mantém `id` igual a `sub`. Inclui `iss`, `aud`, `iat` e `exp`; a vida emitida é exatamente 86.400 segundos.

O validador exige algoritmo RS256, `kid` igual à única chave configurada, assinatura válida, `iss` e `aud` esperados, UUID em `sub`, igualdade `id === sub`, e `iat`/`exp` inteiros seguros. Rejeita `exp <= iat`, duração acima de 86.400 segundos e `iat` ausente, inválido ou excessivamente futuro. Se `nbf` estiver presente, precisa ser inteiro seguro, anterior a `exp` e já válido segundo a tolerância abaixo.

A tolerância de relógio é de cinco segundos. Ela se aplica uniformemente a `iat`, `exp` e `nbf`: um `iat` pode estar no máximo cinco segundos no futuro; `nbf` pode ser considerado válido até cinco segundos antes; um token pode ser aceito por até cinco segundos após `exp`. O limite de `exp - iat` continua sendo exatamente 86.400 segundos.

O `kid` identifica somente a chave configurada no processo; este módulo ainda não implementa conjunto de chaves nem rotação sobreposta. Isso deve ser definido antes de introduzir rotação sem indisponibilidade.

## Validação central da API principal

`src/utils/jwtAutenticacao.js` prepara `verificarTokenApiPrincipal(token)`, mas não está conectado às rotas nem aos middlewares. Ele roteia explicitamente `HS256` ao verificador legado e `RS256` ao verificador assimétrico; outros algoritmos são rejeitados. Não há tentativa de validar o mesmo token com outra chave ou algoritmo. A configuração `JWT_AUDIENCE` deve conter a audiência da API principal no ambiente desse serviço. Os valores propostos acima não foram ativados.

O middleware global atual devolve `err.message` ao cliente. Por isso, o validador central transforma falhas de token e configuração RS256 em mensagens genéricas. Na integração futura, os dois pontos de autenticação devem chamar essa mesma função e responder com erros genéricos; não devem encaminhar tokens ou detalhes criptográficos ao error handler.

O caminho legado fica disponível somente no backend principal, que mantém `JWT_SECRET`. A API Financeira não deve importar este dispatcher nem receber o segredo legado; ela validará somente RS256 com sua chave pública e sua audiência configurada.

## Testes

Execute em `backend/` com `node tests/jwtAsimetrico.test.js` e `node tests/jwtAutenticacao.test.js`. Os testes geram chaves RSA efêmeras somente em memória, não escrevem arquivos e restauram as variáveis de ambiente do processo ao terminar.
