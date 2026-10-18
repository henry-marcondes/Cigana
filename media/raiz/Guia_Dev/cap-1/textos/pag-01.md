
# DOM-001 — Modelagem do Domínio

Decisões Validadas

---
```text
D-001 Biblioteca
D-002 Usuário / Perfil do Autor
D-003 Categoria
D-004 Capítulo
D-005 Cena
D-006 Interação
D-007 Propriedade da Cena
D-008 Conteúdo
D-009 Recurso
D-010 — Tag é uma entidade do domínio
D-011 — Idioma é uma entidade global do domínio
D-012 — Classificação Indicativa é uma entidade global
D-013 — Licença é uma entidade global do domínio.
```
# Itens em Análise

---
```text
IA-001 Comportamento
IA-002 — Versão
```
---

## Decisão de Domínio D-001: 

A plataforma suporta múltiplas bibliotecas. Cada biblioteca possui identidade própria, 
regras de acesso, tipo (Pública, Privada ou Organização), podendo conter categorias e 
livros específicos. Essa decisão fundamentará os relacionamentos e as regras de negócio 
nas etapas seguintes.

Estrutura conceitual inicial

Neste momento nosso domínio começa a ganhar uma forma bem definida:
```text 
Plataforma
    │
    ├── Biblioteca Pública
    │
    ├── Biblioteca Privada
    │
    └── Biblioteca de Organização
             │
             ├── Escola
             ├── Igreja
             ├── Empresa
             ├── Clube
             └── Associaçãobra
```

1. Catálogo

Responsável por organizar o conteúdo disponível.

Entidades:

Biblioteca
Categoria
Livro
Coleção (opcional, para agrupamentos futuros)


## Decisão Validada nº 002

Autor é um Perfil de Usuário

Status: ✅ Aprovado

Decisão
Usuário representa a identidade da pessoa na plataforma.
Papel (Role) define suas permissões e capacidades.
Perfil do Autor é uma extensão opcional do usuário, contendo informações relacionadas à atividade de autor.

Essa modelagem permite que um mesmo usuário seja, por exemplo:

Leitor
Autor
Administrador
Moderador

simultaneamente, dependendo dos papéis atribuídos.

## Decisão Validada nº 003
Categoria pertence à Biblioteca

Status: ✅ Aprovado

Decisão

Uma Categoria sempre pertence a uma Biblioteca.
```text
Biblioteca
    └── Categoria
            └── Livro
```
exemplo:
```text
Biblioteca Pública
    ├── Romance
    ├── História
    ├── Ficção Científica
    └── Fantasia

Biblioteca Privada
    ├── Contos Picantes
    ├── Romance Adulto
    ├── BDSM
    └── Fantasias

Biblioteca Escola
    ├── Matemática
    ├── Português
    ├── História
    └── Ciências

Biblioteca Igreja
    ├── Estudos Bíblicos
    ├── Devocionais
    ├── Teologia
    └── Música
```
## Livro 

O Livro deve possuir...

Sem entrar ainda em atributos técnicos, podemos dizer que ele possui:

identidade;
autor(es);
pertence a uma categoria;
pertence a uma biblioteca;
capítulos;
recursos multimídia;
configurações de acesso;
configurações de publicação.

Tudo isso faz parte do domínio.
```text
Plataforma
    │
    └── Biblioteca
            │
            └── Categoria
                    │
                    └── Livro
                            │
                            ├── Capítulos
                            ├── Recursos
                            ├── Configurações
                            └── Publicação
```
## Decisão Validada nº 004
Capítulo é a unidade narrativa fundamental

Status: ✅ Aprovado

Decisão

O Capítulo é a unidade narrativa fundamental da Plataforma de Livros Interativos.

O Livro organiza e contextualiza a obra, mas é dentro dos capítulos que acontece 
toda a experiência de leitura e interação. 

Um capítulo pode conter muito mais do que texto.

Por exemplo:

Capítulo

Texto

Imagens

Áudios

Vídeos (futuro)

Cenas 

Personagens (futuro)

Eventos (futuro)

Anotações do autor

Isso mostra que o Capítulo é a verdadeira unidade narrativa da plataforma, ele é uma entidade completa.

O Livro apenas organiza esses capítulos. 

