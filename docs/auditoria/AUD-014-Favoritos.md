
# AUD-014 — Favoritos na Biblioteca

**Projeto:** Plataforma de Livros Cigana (Plataforma Leitura)  
**Área:** Biblioteca  
**Tipo:** Auditoria técnica e registro de implementação  
**Status:** Implementado e validado  
**Data:** 13/10/2026

---

## 1. Objetivo

Documentar a implementação da funcionalidade de favoritos na Biblioteca da Plataforma Cigana, incluindo os contratos da API, as regras de negócio, a autenticação, a integração com o frontend e os testes realizados.

Este documento deve orientar futuras manutenções e prevenir regressões na funcionalidade.

## 2. Escopo implementado

A funcionalidade permite que um usuário autenticado:

- Adicione uma obra aos seus favoritos.
- Consulte seus favoritos.
- Verifique se uma obra está favoritada.
- Remova uma obra dos favoritos.
- Acesse a página **Meus favoritos**.
- Consulte seus favoritos após atualizar a página, mantendo a persistência dos dados.

Os favoritos são pessoais. Cada usuário possui sua própria lista, independente das listas dos demais usuários.

## 3. Modelo de dados

A funcionalidade utiliza a tabela `favoritos`, criada pela migration:

`0021_create_favoritos.sql`

### 3.1. Estrutura da tabela

| Campo            | Descrição                              |
|------------------|----------------------------------------|
| `id`             | Identificador UUID do favorito.        |
| `usuario_id`     | Identificador do usuário proprietário. |
| `livro_id`       | Identificador da obra favoritada.      |
| `ativo`          | Indica se o favorito está ativo.       |
| `criado_em`      | Data e hora da criação do registro.    |
| `atualizado_em`  | Data e hora da última atualização.     |

A tabela possui restrição de unicidade para o par `(usuario_id, livro_id)`, além de chaves estrangeiras para usuários e obras.

### 3.2. Exclusão lógica

A remoção de um favorito altera o campo `ativo` para `FALSE`, em vez de excluir fisicamente o registro.

Essa decisão permite que o mesmo usuário favorite novamente a mesma obra, reativando o registro existente.

A restrição de unicidade impede a criação de registros duplicados para o mesmo par de usuário e obra.

## 4. Contrato da API

As rotas são disponibilizadas sob o prefixo `/api/favoritos`.

Todas as operações utilizam a identidade do usuário autenticado. O cliente não deve determinar o proprietário do favorito por meio de `usuario_id` enviado na URL ou no corpo da requisição.

### 4.1. Listar favoritos

**Método:** `GET`

**Endpoint:**

`/api/favoritos`

**Autenticação:** obrigatória.

Retorna os favoritos ativos do usuário autenticado.

### 4.2. Consultar favorito por obra

**Método:** `GET`

**Endpoint:**

`/api/favoritos/livro/:livro_id`

**Autenticação:** obrigatória.

Consulta o favorito ativo correspondente à obra informada para o usuário autenticado.

A rota utiliza a proteção de leitura da obra, conforme a configuração implementada no backend.

### 4.3. Adicionar favorito

**Método:** `POST`

**Endpoint:**

`/api/favoritos`

**Autenticação:** obrigatória.

**Corpo da requisição:**

```json
{
  "livro_id": "UUID_DA_OBRA"
}
```

O `livro_id` deve ser um UUID válido.

A operação considera o registro existente para o usuário e a obra:

- Se o favorito já estiver ativo, retorna o registro existente.
- Se estiver inativo, reativa o registro.
- Se não existir, cria um novo registro.

A operação não deve permitir que o cliente escolha outro usuário como proprietário do favorito.

### 4.4. Remover favorito

**Método:** `DELETE`

**Endpoint:**

`/api/favoritos/livro/:livro_id`

**Autenticação:** obrigatória.

Desativa o favorito correspondente à obra para o usuário autenticado.

A operação é limitada aos favoritos do próprio usuário. A remoção não depende de o usuário continuar tendo acesso de leitura à obra, pois o objetivo é permitir a manutenção de sua lista pessoal.

### 4.5. Validação de parâmetros

A implementação utiliza `express-validator` para validar o UUID da obra nas rotas correspondentes.

A validação do corpo da requisição de criação verifica o campo `livro_id`.

Requisições inválidas devem ser rejeitadas pelo validador, sem executar a operação de persistência.

## 5. Autenticação e autorização

A funcionalidade utiliza o middleware `autenticar` para identificar o usuário autenticado.

O identificador do proprietário é obtido por:

```javascript
req.usuario.id
```

Não se deve confiar em um `usuario_id` enviado pelo frontend para determinar a propriedade de um favorito.

A consulta e a remoção devem sempre considerar o usuário autenticado, impedindo que uma pessoa consulte ou altere os favoritos de outra.

Nas operações de consulta e criação, a proteção de leitura da obra também é aplicada conforme as rotas implementadas.

A funcionalidade de favoritos representa uma preferência pessoal do usuário. Não foi definida uma permissão editorial específica para adicionar ou remover favoritos.

## 6. Backend

### 6.1. Model

Arquivo:

`backend/src/models/Favorito.js`

Responsável pelo acesso à tabela `favoritos`.

As operações implementadas incluem:

- Listagem dos favoritos ativos por usuário.
- Consulta de favorito ativo por usuário e obra.
- Consulta de registro incluindo favoritos inativos.
- Criação de favorito.
- Reativação de favorito inativo.
- Remoção lógica por usuário e obra.

### 6.2. Service

Arquivo:

`backend/src/services/favoritoService.js`

Responsável pelas regras de negócio relacionadas aos favoritos.

Centraliza a listagem, consulta, criação, reativação e remoção lógica, evitando transferir essas regras para o frontend.

### 6.3. Controller

Arquivo:

`backend/src/controllers/FavoritoController.js`

Responsável por receber as requisições, obter os dados do usuário autenticado, chamar o Service e devolver as respostas HTTP.

### 6.4. Validator

Arquivo:

`backend/src/validators/favoritoValidator.js`

Responsável pela validação dos identificadores de obra recebidos nas rotas.

### 6.5. Routes

Arquivo:

`backend/src/routes/favoritoRoutes.js`

Responsável por declarar os endpoints e aplicar os middlewares de autenticação, validação e proteção de leitura correspondentes.

O registro das rotas deve permanecer integrado à configuração existente do servidor.

## 7. Frontend

### 7.1. Serviço de favoritos

Arquivo:

`frontend/src/services/favorito.js`

O serviço centraliza as chamadas da API:

- `listarFavoritos()`
- `buscarFavoritoPorLivro(livro_id)`
- `adicionarFavorito(livro_id)`
- `removerFavorito(livro_id)`

As requisições utilizam `apiFetch`, que centraliza a comunicação com o backend e o envio do token de autenticação disponível.

### 7.2. Componente LivroCard

Arquivo:

`frontend/src/components/LivroCard.jsx`

O componente foi adaptado para oferecer a interação com favoritos.

Características implementadas:

- Exibe o controle de favorito quando o usuário está autenticado.
- Utiliza um coração preenchido para indicar uma obra favoritada.
- Utiliza um coração vazio para indicar uma obra não favoritada.
- Permite adicionar e remover favoritos.
- Desabilita o controle durante o processamento da requisição.
- Apresenta mensagens de erro quando a operação falha.
- Notifica o componente que o utiliza sobre as alterações realizadas.

A navegação para leitura da obra permanece disponível pelo cartão.

### 7.3. Biblioteca inicial

Arquivo:

`frontend/src/app/page.js`

A página inicial carrega a lista de obras e, quando há autenticação, consulta os favoritos do usuário.

Os identificadores das obras favorizadas são utilizados para inicializar os controles apresentados nos cartões.

A lista de favoritos é mantida no estado do frontend para refletir as alterações realizadas durante a interação.

### 7.4. Página Meus favoritos

Arquivo:

`frontend/src/app/favoritos/page.js`

A página apresenta as obras favoritas do usuário autenticado.

Funcionalidades implementadas:

- Verificação de autenticação.
- Redirecionamento para `/login` quando não há autenticação válida.
- Carregamento dos favoritos e dos dados das obras.
- Exibição dos cartões utilizando `LivroCard`.
- Remoção imediata da obra da lista após a operação bem-sucedida.
- Contagem de obras favoritas.
- Mensagem informativa quando a lista está vazia.
- Link para retornar à Biblioteca.
- Tratamento de falhas no carregamento.

A página não deve tratar uma falha da API como se fosse uma lista vazia.

## 8. Testes e validação

Os testes funcionais foram executados no ambiente de desenvolvimento, e os comportamentos abaixo foram confirmados.

| Teste | Resultado |
|---|---|
| Adicionar uma obra aos favoritos | Aprovado |
| Remover uma obra dos favoritos | Aprovado |
| Atualizar a página e verificar a persistência | Aprovado |
| Verificar o isolamento entre usuários | Aprovado |
| Consultar a Biblioteca sem autenticação | Aprovado |
| Abrir a página Meus favoritos | Aprovado |
| Verificar o estado visual dos corações | Aprovado |
| Remover uma obra pela página Meus favoritos | Aprovado |
| Verificar a atualização imediata da lista | Aprovado |
| Exibir a mensagem quando não há favoritos | Aprovado |
| Verificar o redirecionamento para login | Aprovado |

Os resultados registrados representam os testes funcionais executados. Não constituem evidência de testes automatizados de concorrência ou de carga.

## 9. Decisões técnicas preservadas

As seguintes decisões devem ser mantidas em futuras alterações:

1. Os favoritos pertencem ao usuário autenticado.
2. O backend é responsável por determinar o proprietário do registro.
3. A remoção é lógica, por meio do campo `ativo`.
4. Um favorito inativo pode ser reativado.
5. O par `(usuario_id, livro_id)` permanece único no banco.
6. A experiência de favoritos utiliza o componente `LivroCard` existente.
7. A Biblioteca e a página Meus favoritos compartilham o mesmo serviço de frontend.
8. A autenticação continua seguindo o mecanismo já utilizado pelo projeto.
9. Alterações nos contratos da API devem considerar os consumidores existentes.
10. A funcionalidade não deve introduzir permissões editoriais desnecessárias.

## 10. Cuidados para manutenção futura

Antes de alterar a funcionalidade:

- Conferir o contrato atual das rotas e os formatos das respostas.
- Preservar o isolamento dos dados por usuário.
- Verificar a compatibilidade com a restrição de unicidade do banco.
- Testar a reativação de favoritos removidos.
- Garantir que uma falha de rede não altere incorretamente o estado visual.
- Avaliar o comportamento de inclusões simultâneas do mesmo favorito.
- Confirmar que a página Meus favoritos continua compatível com as regras de acesso às obras.
- Evitar duplicar regras de negócio entre Controller, Service e frontend.

A concorrência entre requisições simultâneas de criação deve ser tratada como um ponto de atenção para eventual endurecimento do Service, caso ainda não exista tratamento atômico para esse cenário.

## 11. Critério de encerramento

A etapa de integração de Favoritos na Biblioteca está **funcionalmente validada** pelos testes registrados neste documento.

A documentação preserva o contrato da API, as regras de propriedade dos favoritos, a exclusão lógica e a integração com o frontend.

Qualquer alteração futura que afete esses comportamentos deverá ser acompanhada de validação compatível com o escopo modificado.

---

**Documento:** `docs/auditoria/AUD-014-Favoritos-Biblioteca.md`  
**Projeto:** Plataforma de Livros Cigana — Plataforma Leitura
