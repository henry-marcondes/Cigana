# ARC-006 — Preferências do Usuário

## 1. Identificação

**Código:** ARC-006  
**Título:** Preferências do Usuário  
**Projeto:** Plataforma de Livros Cigana / Plataforma Leitura  
**Área:** Administração e dados do usuário  
**Status:** Implementado e validado

---

## 2. Objetivo

Documentar a estrutura implementada para armazenamento e gerenciamento das preferências de leitura dos usuários da plataforma.

A estrutura permite que a plataforma mantenha informações relacionadas às preferências declaradas pelo usuário, possibilitando posteriormente sua utilização em recursos de personalização, pesquisa, análise de comportamento e administração dos dados.

As preferências foram separadas em duas estruturas principais:

- preferências gerais de leitura;
- categorias literárias preferidas.

---

## 3. Estrutura das Preferências

As preferências gerais são armazenadas na tabela `preferencias`.

A estrutura utiliza grupos para organizar os tipos de preferência.

### Grupos implementados

#### FINALIDADE_LEITURA

|    Código    |      Nome    | Ordem |
|--------------|--------------|------:|
| DIVERSAO     | Diversão     |     1 |
| ESTUDO       | Estudo       |     2 |
| CONHECIMENTO | Conhecimento |     3 |
| TRABALHO     | Trabalho     |     4 |

#### FORMATO_LEITURA

| Código   | Nome     | Ordem |
|----------|----------|------:|
| DIGITAL  | Digital  |     1 |
| IMPRESSO | Impresso |     2 |

#### MEIO_LEITURA

| Código     | Nome       | Ordem |
|------------|------------|------:|
| CELULAR    | Celular    |     1 |
| TABLET     | Tablet     |     2 |
| COMPUTADOR | Computador |     3 |
| KINDLE     | Kindle     |     4 |
| OUTRO      | Outro      |     5 |

---

## 4. Categorias Literárias

As categorias literárias existentes na plataforma são utilizadas como categorias preferidas do usuário.

Foi definido que gênero literário e categoria representam, neste contexto, a mesma informação.

Dessa forma, não foi criada uma estrutura independente para "gênero literário".

A relação do usuário com categorias existentes é armazenada separadamente das demais preferências.

---

## 5. Relacionamentos

A estrutura possui três entidades principais:

```text
preferencias
      │
      │
      ▼
usuario_preferencias
      ▲
      │
    usuarios
```

usuario_preferencias
Relaciona um usuário com uma preferência cadastrada no catálogo de preferências.

usuario_categorias_preferidas
Relaciona um usuário com uma categoria literária cadastrada na tabela categorias.

### 6. Camada Model
Foram implementados os Models:
Preferencia.js
UsuarioPreferencia.js
UsuarioCategoriaPreferida.js

Preferencia.js
Responsável pelo acesso ao catálogo de preferências.
Operações:
```java 
listar()
listarPorGrupo(grupo)
buscarPorId(id)
buscarPorCodigo(grupo, codigo)
criar(preferencia)
```

UsuarioPreferencia.js
Responsável pelo relacionamento entre usuário e preferência.
Operações principais:
```java
listarPorUsuario(usuarioId)
buscarPorId(id, usuarioId)
adicionar(usuarioId, preferenciaId)
remover(id, usuarioId)
```

UsuarioCategoriaPreferida.js
Responsável pelo relacionamento entre usuário e categoria.
Operações principais:
```java
listarPorUsuario(usuarioId)
buscarPorId(id, usuarioId)
adicionar(usuarioId, categoriaId)
remover(id, usuarioId)
```

### 7. Camada Service
Foram implementados:
PreferenciaService.js
UsuarioPreferenciaService.js
UsuarioCategoriaPreferidaService.js

Os Services concentram as regras de negócio e realizam as validações necessárias antes das operações nos Models.
Entre as regras implementadas estão:
- validação da existência do usuário;
- validação da existência da preferência;
- validação da existência da categoria;
- prevenção de associação duplicada;
- validação de pertencimento da relação ao usuário autenticado.

### 8. Autenticação e segurança
As operações de preferências do usuário utilizam o middleware:
autenticar

O middleware valida o token Bearer e disponibiliza o payload em:
req.usuario

O identificador do usuário autenticado é obtido através de:
req.usuario.id

Regra definida
O usuario_id não é recebido pelo cliente nas operações normais de preferências.
Por exemplo, para adicionar uma preferência:
POST /api/usuario-preferencias
```json
o corpo contém somente:
{
  "preferencia_id": "UUID"
}
```

O usuário é determinado pelo token de autenticação.
A mesma regra é aplicada às categorias preferidas.

### 9. Proteção das relações
As operações de consulta e remoção das relações utilizam o identificador da relação juntamente com o identificador do usuário autenticado.
Exemplo:
```sql 
WHERE id = $1
  AND usuario_id = $2
  ```

Dessa forma, conhecer o UUID de uma relação pertencente a outro usuário não permite que ela seja consultada ou removida através da API normal do usuário.

### 10. Validators
Foram implementados validators para:
Preferências
- criação;
- busca por código.
Preferências do usuário
- busca por ID;
- adição;
- remoção.
Categorias preferidas
- busca por ID;
- adição;
- remoção.
Os identificadores utilizados nas relações são validados como UUID.

### 11. Controllers
Foram implementados:
PreferenciaController.js
UsuarioPreferenciaController.js
UsuarioCategoriaPreferidaController.js

Os Controllers são responsáveis por:
- receber parâmetros da requisição;
- obter o usuário autenticado;
- encaminhar a operação ao Service;
- retornar a resposta através de apiResponse.

### 12. Rotas
Catálogo de preferências
GET  /api/preferencias
GET  /api/preferencias/grupo/:grupo
GET  /api/preferencias/:grupo/:codigo
POST /api/preferencias

Preferências do usuário
GET    /api/usuario-preferencias
GET    /api/usuario-preferencias/:id
POST   /api/usuario-preferencias
DELETE /api/usuario-preferencias/:id

Categorias preferidas
GET    /api/usuario-categorias-preferidas
GET    /api/usuario-categorias-preferidas/:id
POST   /api/usuario-categorias-preferidas
DELETE /api/usuario-categorias-preferidas/:id

As rotas relacionadas ao usuário exigem autenticação.

### 13. Seed
Foi criado o seed:
database/seeds/0008_seed_preferencias.sql

O seed cadastra as preferências iniciais dos grupos:
FINALIDADE_LEITURA
FORMATO_LEITURA
MEIO_LEITURA

Os códigos utilizados são mantidos separados dos nomes apresentados ao usuário.
Exemplo:
codigo: DIGITAL
nome: Digital

Essa separação permite que o código seja utilizado internamente pela aplicação sem depender diretamente do texto apresentado na interface.

### 14. Testes Bruno
O conjunto de endpoints foi testado através do Bruno.
Foram validadas as operações de:
Preferências
Listar preferências                         ✅
Listar preferências por grupo              ✅
Buscar preferência por código              ✅

Preferências do usuário
Listar preferências do usuário             ✅
Adicionar preferência                      ✅
Buscar preferência do usuário por ID       ✅
Remover preferência                        ✅

Categorias preferidas
Listar categorias preferidas               ✅
Adicionar categoria preferida              ✅
Buscar categoria preferida por ID          ✅
Remover categoria preferida                ✅

Todos os testes Bruno foram executados sem erros.

### 15. Decisões importantes

### 15.1 Usuário autenticado
O usuário das operações normais é determinado pelo token de autenticação.
Não é permitido informar livremente outro usuario_id pelo cliente.

### 15.2 Gênero literário e categoria
Foi definido que gênero literário e categoria representam a mesma informação neste contexto.
As categorias já existentes na plataforma são utilizadas como categorias preferidas.

### 15.3 Preferências e categorias
Preferências gerais e categorias literárias são estruturas distintas:
Preferência
    finalidade de leitura
    formato de leitura
    meio de leitura

Categoria preferida
    categoria literária

### 15.4 Administração
A API normal do usuário trabalha com as próprias preferências.
Consultas ou alterações administrativas sobre outros usuários deverão ser tratadas posteriormente através da área administrativa e das regras de autorização correspondentes.

### 16. Estado da implementação
O pacote de preferências do usuário encontra-se:
IMPLEMENTADO E VALIDADO
Migration        ✅
Seed             ✅
Model            ✅
Service          ✅
Validator        ✅
Controller       ✅
Routes           ✅
Autenticação     ✅
Proteção de acesso ✅
Testes Bruno     ✅

### 17. Próxima etapa
A estrutura de preferências passa a fazer parte da base de dados disponível para a futura área de administração e análise dos usuários.
Próximas etapas relacionadas ao objetivo maior:
- organizar a coleta dos dados de utilização;
- integrar Progresso de Leitura;
- integrar Favoritos;
- integrar Avaliações;
- integrar Comentários;
- definir filtros e consultas administrativas;
- definir indicadores e análises;
- disponibilizar os dados na área administrativa.
A implementação dessas funcionalidades deverá preservar as estruturas e contratos já validados neste documento.
