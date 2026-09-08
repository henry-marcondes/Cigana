# ARC-004 — Estrutura de Relações entre Usuário, Autor, Obra e Editor

**Projeto:** Plataforma Leitura  
**Status:** Decisão arquitetural consolidada

## 1. Objetivo

Registrar as relações estruturais já definidas entre usuário, autor, obra, Editor, RBAC, contratos e autorização específica por obra, evitando nova garimpagem histórica quando o desenvolvimento avançar.

## 2. Relações fundamentais

```text
USUÁRIO
   │
   ├── PAPEL / PERMISSÃO (RBAC)
   │
   └── AUTOR
          │
          ▼
     livro_autores
          │
          ▼
         OBRA
```

Autor e Editor são conceitos distintos.

**Autor** é uma entidade de domínio relacionada à autoria da obra.

**Editor** é um usuário da plataforma que possui o papel EDITOR e pode receber autorização específica para trabalhar em determinadas obras.

## 3. Usuário

A tabela `usuarios` representa a conta de acesso à plataforma.

O usuário é a identidade utilizada pela autenticação e pelo RBAC.

## 4. Autor

A tabela `autores` representa a entidade de domínio de autoria.

Estrutura atual:

```text
autores
├── id
├── usuario_id
├── nome_publico
├── biografia
├── foto_url
├── ativo
├── criado_em
└── atualizado_em
```

`usuario_id` é `UNIQUE`, estabelecendo a relação atual entre usuário e Autor.

Existe a operação:

```text
Autor.buscarPorUsuarioId(usuario_id)
```

## 5. Obra

A tabela `livros` representa a obra na estrutura atual.

Ela contém, entre outros:

```text
livros
├── id
├── categoria_id
├── classificacao_indicativa_id
├── idioma_id
├── status_livro_id
├── visibilidade_livro_id
├── titulo
├── slug
├── resumo
├── capa_url
├── isbn
├── ano_publicacao
├── data_publicacao
├── ordem_exibicao
├── ativo
├── criado_em
└── atualizado_em
```

`livros` atualmente não registra diretamente quem cadastrou a obra.

Não adicionar `criado_por_usuario_id` apenas para resolver autorização editorial sem considerar o modelo de contratos definido neste ARC.

## 6. Relação Obra ↔ Autor

A tabela `livro_autores` representa a relação entre obra e Autor:

```text
livro_autores
├── id
├── livro_id
├── autor_id
├── ordem_exibicao
├── ativo
├── criado_em
└── atualizado_em
```

Uma obra pode possuir vários autores.

Existe:

```text
UNIQUE (livro_id, autor_id)
```

`livro_autores` representa autoria/participação e **não deve ser usada como tabela de autorização de Editores**.

## 7. Caminho Autor → Obras

A estrutura existente permite:

```text
USUÁRIO
   ↓
AUTOR
   ↓
livro_autores
   ↓
OBRA
```

O `LivroAutor` possui `listarPorAutor(autor_id)`.

## 8. RBAC

A autorização por capacidade utiliza:

```text
usuário → papel → permissão
```

A fonte de verdade é o banco de dados.

O `role` do JWT não deve ser usado como fonte de verdade para autorização.

O papel `EDITOR` possui a capacidade editorial existente:

```text
obra.editar
```

Ser EDITOR não concede acesso automático a todas as obras.

## 9. Capacidade e escopo

São duas camadas independentes.

```text
CAPACIDADE
EDITOR
  ↓
obra.editar
```

e:

```text
ESCOPO
EDITOR
  ↓
autorizado nesta obra?
```

Para editar:

```text
possui obra.editar
        +
autorização específica da obra
        ↓
     pode editar
```

O middleware atual `autorizacao.js` implementa a camada de RBAC/permissão. Ele não determina o escopo da obra.

## 10. Responsável pela autorização

A regra de negócio consolidada é:

> O Autor(a)/Titular que assume a responsabilidade pela publicação da obra é quem decide quais usuários poderão trabalhar como Editores naquela obra.

Ele poderá:

- conceder autorização;
- revogar autorização.

Não é qualquer Autor da obra que automaticamente possui essa função.

## 11. Termo de Autorização

O documento jurídico atual é:

**Termo de Autorização para Publicação e Disponibilização de Obra na Plataforma Leitura — Versão 2.0.**

O Termo estabelece que o AUTOR(A)/TITULAR declara possuir os direitos necessários para autorizar a publicação e se responsabiliza pelas informações e conteúdos fornecidos.

O aceite eletrônico registra, entre outros:

- usuário;
- obra;
- versão do Termo;
- data e hora;
- informações técnicas relacionadas ao aceite.

Portanto, a responsabilidade relevante para a autorização de Editores deverá derivar do instrumento formal aceito para a obra, e não simplesmente de quem criou tecnicamente o registro em `livros`.

## 12. Entidade CONTRATOS

Foi decidido que o banco terá uma entidade transversal:

```text
contratos
```

O documento continuará sendo chamado de Termo de Autorização na interface e no texto jurídico.

No banco, o instrumento será identificado por tipo e versão, por exemplo:

```text
tipo = AUTORIZACAO_PUBLICACAO_OBRA
versao = 2.0
```

A entidade deverá ser extensível para futuros instrumentos contratuais.

Possíveis tipos futuros, sem implementação agora:

```text
CONTRATO_EDITOR
CONTRATO_MODERADOR
CONTRATO_CURADOR
CONTRATO_GERENTE
CONTRATO_ADMINISTRADOR
```

Também poderão existir futuramente contratos de prestação de serviços ou outras relações profissionais.

## 13. Autorização específica de Editor

A autorização é individual por obra:

```text
EDITOR
   ├── autorizado → Obra A
   ├── autorizado → Obra B
   └── não autorizado → Obra C
```

Ser EDITOR na plataforma não concede acesso automático às obras.

A futura relação de autorização deverá permitir concessão e revogação, preservar histórico e não desfazer alterações anteriores.

## 14. Escopo editorial

O Editor autorizado recebe inicialmente a capacidade editorial da obra como um todo.

Não serão criadas permissões excessivamente específicas como:

```text
obra.editar_capitulos
obra.editar_cenas
obra.editar_conteudos
obra.editar_escolhas
```

As permissões de negócio existentes serão reaproveitadas.

## 15. Publicação

Não será criada uma nova permissão específica de publicação para Editor.

Continua sendo utilizada:

```text
obra.publicar
```

A publicação deverá respeitar:

```text
RBAC
+
escopo/autorização da obra
```

## 16. Revogação

O responsável pela obra poderá revogar a autorização de um Editor.

A revogação:

- impede novas operações editoriais autorizadas;
- não apaga alterações anteriores;
- não desfaz o trabalho realizado;
- preserva o histórico da relação.

## 17. Relação conceitual consolidada

```text
                         PLATAFORMA
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 USUÁRIO             CONTRATOS
                    │                   │
          ┌─────────┴───────┐           │
          │                 │           │
        PAPEL             AUTOR         │
          │                 │           │
       EDITOR               │           │
          │                 │           │
   obra.editar              └────┐      │
          │                      │      │
          │                 livro_autores
          │                      │
          │                      ▼
          └── autorização ────► OBRA
             específica          │
                                  │
                            contrato/termo
                            de publicação
```

O diagrama é conceitual. Não cria automaticamente tabelas que ainda não existem.

## 18. O que já existe

```text
usuarios
autores
livros
livro_autores
papeis
usuario_papeis
permissoes
papel_permissoes
```

O RBAC já foi implementado e validado.

## 19. O que ainda será implementado

```text
contratos
```

O primeiro instrumento será o Termo de Autorização para Publicação e Disponibilização de Obra.

Posteriormente será implementada a relação de:

```text
Editor ↔ Obra
```

com autorização específica.

## 20. O que não fazer

Não:

- tratar Autor como sinônimo de Editor;
- usar `livro_autores` como autorização de Editor;
- usar `ordem_exibicao` para determinar o responsável;
- usar `role` do JWT como fonte de verdade;
- criar permissões específicas para cada etapa editorial sem necessidade;
- criar `criado_por_usuario_id` em `livros` apenas para resolver o escopo;
- criar estruturas paralelas se a estrutura de contratos puder representar corretamente a relação;
- refazer auditorias históricas gerais quando a informação já estiver documentada.

## 21. Prioridade atual

O objetivo imediato é:

```text
TERMINAR O ESTÚDIO
       ↓
TESTAR A PLATAFORMA
       ↓
USAR O ESTÚDIO NA PRÁTICA
       ↓
PRODUZIR OS TUTORIAIS
```

Contratos profissionais, relações trabalhistas, carteira de trabalho, INSS e outros assuntos administrativos ficam fora do fluxo imediato.

## 22. Regra de continuidade

Este ARC é referência arquitetural consolidada.

Quando uma etapa futura depender das relações entre usuário, Autor, obra, `livro_autores`, Editor, RBAC, contratos ou autorização por obra, consultar este documento antes de realizar nova investigação.

Não repetir garimpagem histórica geral se a informação necessária já estiver registrada.

Se surgir uma dúvida não respondida neste ARC, realizar somente a inspeção pontual necessária.

## 23. Resumo

```text
USUÁRIO
   │
   ├── PAPEL EDITOR
   │       ↓
   │   obra.editar
   │
   └── AUTOR(A)/TITULAR
           ↓
       CONTRATO/TERMO
           ↓
          OBRA
           ↓
   responsabilidade
           ↓
   concede / revoga
           ↓
   EDITOR AUTORIZADO
           ↓
   escopo específico da obra
```

**Decisão consolidada:** a capacidade editorial vem do RBAC; o acesso editorial à obra vem de autorização específica; a responsabilidade pela concessão deverá derivar do contrato/termo de publicação aceito pelo Autor(a)/Titular responsável pela obra.
