# ARC-008 — Integração RS256 e Isolamento de Ambientes

**Projeto:** Plataforma de Livros Cigana (Plataforma Leitura)  
**Componente integrado:** API Financeira  
**Categoria:** Arquitetura e Segurança  
**Status:** Integração DEV configurada; validação funcional pendente  
**Data:** 19/11/2026

---

## 1. Objetivo

Este documento registra a arquitetura de autenticação entre o backend da Plataforma Cigana e a API Financeira, utilizando JWT assinado pelo algoritmo RS256.

Também estabelece a separação obrigatória entre os ambientes de desenvolvimento (DEV) e produção (PROD), incluindo bancos de dados, chaves criptográficas, identificadores e configurações.

A separação tem como finalidade impedir que testes, alterações experimentais ou falhas ocorridas durante o desenvolvimento afetem os dados financeiros e as operações da plataforma em produção.

## 2. Arquitetura da integração

A Plataforma Cigana e a API Financeira são aplicações independentes.

A Cigana atua como emissora dos tokens de autenticação utilizados na comunicação com a API Financeira.

A API Financeira atua como verificadora dos tokens recebidos, utilizando a chave pública correspondente à chave privada da Cigana.

O fluxo de autenticação é:

1. O backend Cigana autentica o usuário conforme suas regras.
2. A Cigana emite um JWT assinado com RS256.
3. O token contém os identificadores de emissor (`iss`), destinatário (`aud`) e usuário (`sub`), além do identificador da chave (`kid`) no cabeçalho.
4. A API Financeira recebe o token.
5. A API Financeira verifica a assinatura utilizando a chave pública cadastrada.
6. São conferidos KID, issuer, audience e validade temporal.
7. Após a validação criptográfica, a API Financeira resolve a identidade externa por meio do issuer e do UUID do usuário.
8. A identidade externa é relacionada à plataforma e ao usuário financeiro correspondente.
9. A autorização é realizada conforme as permissões existentes no banco de dados financeiro.

A autorização permanece independente da identidade declarada em campos de papel ou perfil presentes no JWT. O banco de dados da API Financeira continua sendo a fonte de verdade para as permissões.

## 3. Autenticação RS256

O algoritmo RS256 utiliza um par de chaves assimétricas:

- **Chave privada:** utilizada exclusivamente pelo emissor para assinar os tokens.
- **Chave pública:** utilizada pelo destinatário para verificar as assinaturas.

Na integração com a Cigana:

- A chave privada pertence ao backend Cigana.
- A chave pública correspondente é fornecida à API Financeira.
- A chave privada nunca deve ser copiada para a API Financeira.
- A chave pública não permite assinar tokens em nome da Cigana.

A configuração atual da Finance API utiliza uma chave pública configurada por ambiente. Por isso, cada ambiente deve possuir sua própria configuração isolada.

### 3.1 Identificadores do JWT

Os identificadores utilizados são:

| Identificador | Finalidade |
|---|---|
| `kid` | Identifica a chave utilizada para assinatura |
| `iss` | Identifica a plataforma emissora |
| `aud` | Identifica o destinatário esperado |
| `sub` | Identifica o usuário na plataforma de origem |
| `exp` | Define o vencimento do token |

O `issuer` também é utilizado na resolução da identidade externa no banco financeiro.

Os identificadores devem ser consistentes entre o emissor, o verificador e o cadastro da plataforma no banco de dados.

## 4. Separação entre DEV e PROD

A arquitetura estabelece dois ambientes independentes.

### 4.1 Ambiente de desenvolvimento — DEV

O ambiente DEV é destinado a:

- Implementação de funcionalidades.
- Testes de autenticação.
- Testes de integração entre as APIs.
- Validação de contratos.
- Testes de regras financeiras.
- Desenvolvimento e correção de funcionalidades.

A Cigana DEV utiliza exclusivamente a API Financeira DEV.

A API Financeira DEV utiliza seu próprio banco de dados e sua própria configuração criptográfica.

Identificadores aprovados:

| Configuração | Valor |
|---|---|
| `JWT_ISSUER` | `urn:plataforma-leitura:cigana:dev` |
| `JWT_AUDIENCE` | `urn:plataforma-financeira:dev` |
| `JWT_RS256_KID` | `cigana-dev-rs256-2026-11` |

O par RSA de desenvolvimento foi gerado localmente e validado.

Localização das chaves:

- Chave privada: `~/.config/cigana/jwt/jwt-rs256-private.pem`
- Chave pública: `~/.config/cigana/jwt/jwt-rs256-public.pem`

As variáveis do backend Cigana são configuradas em `backend/.env`.

As variáveis da API Financeira são configuradas em `financ-api/.env`.

A chave privada permanece exclusivamente na configuração da Cigana DEV.

O banco `financeiro_db` contém o cadastro da plataforma CIGANA com o issuer DEV aprovado.

### 4.2 Ambiente de produção — PROD

O ambiente PROD será utilizado exclusivamente pelas aplicações em operação real.

A Cigana PROD deverá comunicar-se com uma instância independente da API Financeira PROD.

A API Financeira PROD utilizará banco de dados próprio, sem compartilhamento com o ambiente de desenvolvimento.

A produção terá:

- Par de chaves RSA exclusivo.
- Chave privada armazenada somente no ambiente Cigana PROD.
- Chave pública correspondente configurada na API Financeira PROD.
- KID exclusivo.
- Issuer exclusivo.
- Audience exclusiva.
- Arquivos de ambiente próprios.
- Banco de dados financeiro independente.
- Credenciais e segredos próprios.

Nenhuma chave privada ou credencial criptográfica do ambiente DEV poderá ser reutilizada em produção.

Os valores definitivos de issuer, audience e KID da produção deverão ser aprovados antes da implantação.

Não se deve utilizar os identificadores DEV em tokens de produção.

## 5. Matriz de isolamento

| Recurso | DEV | PROD |
|---|---|---|
| Backend Cigana | Cigana DEV | Cigana PROD |
| API Financeira | Finance API DEV | Finance API PROD |
| Banco financeiro | Banco DEV | Banco PROD |
| Chave privada RSA | Exclusiva DEV | Exclusiva PROD |
| Chave pública RSA | Correspondente DEV | Correspondente PROD |
| KID | Exclusivo DEV | Exclusivo PROD |
| Issuer | Exclusivo DEV | Exclusivo PROD |
| Audience | Exclusiva DEV | Exclusiva PROD |
| Arquivo `.env` | Próprio | Próprio |
| Credenciais | Próprias | Próprias |

A separação deve existir também na infraestrutura e nos processos de implantação.

Uma configuração de desenvolvimento não pode apontar acidentalmente para o banco de produção ou para a API Financeira PROD.

## 6. Configuração das aplicações

### 6.1 Backend Cigana

O backend Cigana utiliza as seguintes variáveis:

```env
JWT_RS256_PRIVATE_KEY=
JWT_RS256_PUBLIC_KEY=
JWT_RS256_KID=
JWT_ISSUER=
JWT_AUDIENCE=
JWT_RS256_ENABLED=true
```

As chaves são carregadas como conteúdo PEM, com quebras de linha reais ou representadas por `\n`, conforme o mecanismo de configuração implementado.

A autenticação HS256 legada continua preservada. A ativação do RS256 não deve provocar a remoção ou substituição automática do mecanismo anterior.

### 6.2 API Financeira

A API Financeira utiliza:

```env
FINANC_API_JWT_PUBLIC_KEY=
FINANC_API_JWT_KID=
FINANC_API_JWT_ISSUER=
FINANC_API_JWT_AUDIENCE=
```

A API Financeira recebe somente a chave pública da plataforma emissora.

A configuração atual utiliza uma única chave pública por instância da API. A separação das instâncias DEV e PROD permite manter configurações criptográficas independentes.

### 6.3 Proteção dos arquivos de ambiente

Os arquivos `.env` não devem ser versionados no Git.

As permissões devem restringir o acesso aos segredos, especialmente à chave privada.

Na configuração DEV validada:

- `backend/.env`: permissão `0600`.
- `financ-api/.env`: permissão `0600`.

Em ambientes de produção, recomenda-se utilizar mecanismos de gerenciamento de segredos compatíveis com a infraestrutura implantada.

## 7. Banco de dados e identidade externa

A API Financeira mantém sua própria estrutura de identidade.

A identificação de um usuário externo utiliza a combinação:

- Plataforma emissora (`issuer`).
- UUID do usuário na plataforma de origem (`sub`).

A associação é realizada por meio da tabela `financeiro.identidades_externas`, relacionada ao cadastro de plataformas.

O cadastro da plataforma CIGANA no ambiente DEV possui:

- Código: `CIGANA`.
- Issuer: `urn:plataforma-leitura:cigana:dev`.
- Situação: ativa.

A atualização do issuer foi realizada em transação no banco `financeiro_db`, condicionada ao valor anterior esperado.

A operação não exigiu nova migration e preservou as identidades externas, permissões e demais registros.

A produção deverá possuir seu próprio cadastro de plataforma, com issuer correspondente ao ambiente de produção e associações próprias de identidade externa.

Não se deve compartilhar ou transportar automaticamente registros financeiros de DEV para PROD.

## 8. Procedimentos de implantação

A configuração de um novo ambiente deverá respeitar a seguinte sequência:

1. Preparar a instância correspondente da API Financeira.
2. Criar ou preparar seu banco de dados independente.
3. Gerar um novo par de chaves RSA para a plataforma e o ambiente.
4. Configurar a chave privada exclusivamente no backend emissor.
5. Configurar a chave pública correspondente na API Financeira.
6. Definir KID, issuer e audience próprios do ambiente.
7. Cadastrar a plataforma com o issuer correspondente no banco financeiro.
8. Configurar os arquivos de ambiente.
9. Validar a assinatura e os claims do JWT.
10. Validar a resolução da identidade externa.
11. Executar os testes funcionais de integração.

A implantação em produção deverá ser precedida de validação completa em ambiente de desenvolvimento e homologação, quando disponível.

## 9. Situação atual

Na data deste documento, as seguintes atividades foram concluídas no ambiente DEV:

- Geração do par RSA de 3072 bits.
- Validação da chave privada.
- Verificação da correspondência entre as chaves.
- Definição dos identificadores DEV.
- Atualização transacional do issuer da plataforma CIGANA no banco financeiro.
- Backup do banco financeiro anterior à atualização.
- Configuração dos parâmetros RS256 nos dois arquivos `.env`.
- Validação de correspondência das chaves configuradas.
- Verificação das permissões dos arquivos.
- Preservação da configuração HS256 legada.
- Confirmação de que a chave privada não foi copiada para a API Financeira.

**Atenção:** a configuração criptográfica está concluída, mas a comunicação funcional entre as duas APIs ainda precisa ser validada por testes de integração.

Não se considera a integração funcional concluída apenas pela configuração das chaves e dos identificadores.

A implantação PROD ainda não foi configurada.

## 10. Considerações finais

A separação entre DEV e PROD é uma medida fundamental de segurança, integridade e confiabilidade da Plataforma Cigana e da API Financeira.

A independência dos ambientes impede que testes comprometam dados financeiros reais, reduz o risco de exposição de credenciais e permite evoluir as aplicações sem interferir nas operações comerciais.

A autenticação RS256 estabelece uma relação criptográfica entre a plataforma emissora e a API Financeira, enquanto a resolução de identidade externa e o RBAC mantêm a responsabilidade de autorização no banco de dados financeiro.

Esta arquitetura permite que outras plataformas sejam integradas futuramente, mantendo identidades, bancos de dados, chaves e configurações independentes.

---

**Referência arquitetural:** ARC-008  
**Documento relacionado:** `backend/JWT_RS256.md`  
**Componentes envolvidos:** Backend Cigana e API Financeira  
**Princípio obrigatório:** isolamento criptográfico, cadastral e operacional entre DEV e PROD.
