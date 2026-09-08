# ARC-003 — Autorização Editorial

## 1. Objetivo

Registrar as decisões já definidas e validadas para autorização das operações editoriais da Plataforma Leitura/Cigana.

Este documento existe para preservar as decisões do desenvolvimento e evitar que regras já implementadas e testadas precisem ser reconstruídas posteriormente a partir de conversas.

## 2. Modelo de autorização

A autorização utiliza:

```text
USUÁRIO
   ↓
USUARIO_PAPEIS
   ↓
PAPEL
   ↓
PAPEL_PERMISSOES
   ↓
PERMISSÃO
```

A autorização é realizada pelo backend. O campo `role` do JWT não é fonte de verdade para autorização. O banco de dados é a fonte de verdade para usuários, papéis e permissões.

## 3. Papéis

Papéis persistidos:

- AUTOR
- CURADOR
- REVISOR
- EDITOR
- MODERADOR
- GERENTE
- ADMINISTRADOR

`LEITOR` permanece como capacidade básica, não como papel persistido obrigatório.

Um usuário pode possuir múltiplos papéis por `usuario_papeis`.

## 4. Permissões de obras

```text
obra.criar
obra.visualizar
obra.editar
obra.publicar
obra.excluir
```

São capacidades de negócio de alto nível. Não criar permissões específicas para cada tipo de conteúdo sem decisão que justifique essa granularidade.

## 5. Matriz validada

```text
AUTOR
 ├── autor.visualizar
 ├── obra.criar
 └── obra.visualizar

CURADOR
 ├── autor.visualizar
 ├── obra.publicar
 └── obra.visualizar

REVISOR
 ├── autor.visualizar
 ├── moderacao.visualizar
 └── obra.visualizar

EDITOR
 ├── autor.editar
 ├── autor.visualizar
 ├── obra.criar
 ├── obra.editar
 ├── obra.excluir
 ├── obra.publicar
 └── obra.visualizar

MODERADOR
 ├── autor.visualizar
 ├── moderacao.operar
 ├── moderacao.visualizar
 ├── obra.visualizar
 ├── usuario.bloquear
 └── usuario.visualizar

GERENTE
 ├── autor.editar
 ├── autor.visualizar
 ├── financeiro.operar
 ├── financeiro.visualizar
 ├── moderacao.operar
 ├── moderacao.visualizar
 ├── obra.visualizar
 ├── plataforma.visualizar
 ├── usuario.bloquear
 ├── usuario.editar
 └── usuario.visualizar

ADMINISTRADOR
 ├── autor.editar
 ├── autor.visualizar
 ├── obra.visualizar
 ├── plataforma.configurar
 ├── plataforma.visualizar
 ├── usuario.editar
 └── usuario.visualizar
```

Total validado: **40 vínculos ativos**.

## 6. Papel × participação na obra

Papel da plataforma e participação em uma obra são conceitos diferentes.

Participação:

```text
AUTOR
   ↓
livro_autores
   ↓
OBRA
```

Funções como Autor Principal, Coautor, Tradutor, Ilustrador, Narrador, Revisor Técnico, Editor Científico, Adaptador e Colaborador são funções da participação na obra, não papéis de acesso à plataforma.

## 7. Separação conceitual

```text
PESSOA
   ↓
quem a pessoa é no mundo real

USUÁRIO
   ↓
conta que permite acesso à plataforma

ATUAÇÃO
   ↓
o que essa pessoa faz dentro da plataforma

PAPEL / PERMISSÃO
   ↓
o que ela pode acessar ou executar
```

Autor não é sinônimo de Editor. Administrador e Moderador pertencem à operação/administração da plataforma, não à atuação autoral.

## 8. Aplicação editorial validada

### Livro

```text
criar        → obra.criar
editar       → obra.editar
status       → obra.editar
visibilidade → obra.editar
capa         → obra.editar
excluir      → obra.excluir
```

### Capítulo

```text
criar     → obra.editar
editar    → obra.editar
capa      → obra.editar
desativar → obra.excluir
```

### Cena

```text
criar           → obra.editar
editar          → obra.editar
definir inicial → obra.editar
excluir         → obra.excluir
```

### Conteúdos da Cena

Regra definida para o próximo bloco:

```text
criar/editar conteúdo → obra.editar
remover/desativar     → obra.excluir
consultar             → permanece conforme as rotas existentes
```

Não criar permissões como `texto.editar`, `imagem.editar`, `audio.editar` ou `video.editar` sem nova decisão.

## 9. Validação do RBAC

O middleware de autorização foi validado nos cenários:

```text
JWT válido + possui permissão
→ 200

JWT válido + não possui permissão
→ 403

sem autenticação
→ 401
```

Também foi validado um caso real:

```text
REVISOR
   ↓
obra.visualizar ✓
obra.criar      ✗
   ↓
POST /api/livros
   ↓
403
```

Mensagem validada:

```json
{
  "success": false,
  "message": "Usuário não possui permissão para executar esta operação."
}
```

## 10. Escopo

A arquitetura prevê permissões com escopo. Exemplo:

```text
AUTOR
   ↓
obra.editar
   ↓
somente suas obras
```

Portanto, possuir `obra.editar` não significa automaticamente editar qualquer obra da plataforma.

A relação de autoria é:

```text
autor
   ↓
livro_autores
   ↓
obra
```

Para Editor, foi estabelecido conceitualmente que a atuação deve ocorrer somente nas obras para as quais recebeu autorização do Autor.

O mecanismo técnico definitivo de escopo Autor/Editor deve ser preservado quando identificado na implementação existente. Não criar uma nova solução de escopo enquanto houver código ou decisão histórica a recuperar.

## 11. Estado da implementação

O RBAC básico foi implementado e validado.

O ciclo da entidade `Permissao` foi concluído:

```text
Model → Service → Controller → Routes → server.js
```

As migrations do RBAC foram:

```text
0032 → papeis
0033 → usuario_papeis
0034 → permissões
0035 → papel_permissoes
0036 → inserção dos papéis
0037 → vínculos papel/permissão
```

As migrations já validadas não devem ser alteradas sem necessidade e decisão explícita.

## 12. Regras para continuidade

1. Preservar as permissões já definidas.
2. Não substituir `obra.editar` por novas permissões específicas sem decisão.
3. Não confundir papel de plataforma com participação em obra.
4. Não usar o `role` do JWT como fonte de autorização.
5. Consultar o banco para determinar permissões.
6. Considerar o escopo quando a operação envolver uma obra específica.
7. Não alterar código fora da tarefa atual.
8. Seguir: `inspecionar → decidir → implementar → validar → avançar`.
9. Não reconstruir etapas já validadas.
10. Diante de dúvida sobre uma regra existente, consultar primeiro implementação e histórico antes de criar nova regra.

## 13. Próximo ponto

O próximo bloco do Estúdio é:

```text
Conteúdos da Cena
   ├── CenaTexto
   ├── CenaImagem
   ├── CenaAudio
   ├── CenaVideo
   └── CenaConteudo
```

Aplicar:

```text
criação/alteração → obra.editar
remoção/desativação → obra.excluir
```

As alterações devem ser feitas nas respectivas Routes, preservando as demais camadas já validadas, salvo necessidade concreta identificada durante a implementação.
