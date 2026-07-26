Etapa 2.3 — Modelo Lógico do Banco de Dados (MLD)

## Bloco A — Catálogo
1.  Biblioteca
2.  Categoria
3.  Livro
4. Autor (Perfil do Autor)
5. Livro_Autor
6. Coleção
7. Coleção_Livro

## Bloco B — Conteúdo
8. Capítulo
9. Escolha
10. Mídia
11. Anexo (caso exista)

## Bloco C — Usuários
12. Usuário
13. Papel (Role)
14. Usuário_Papel
15. Perfil do Autor (caso permaneça separado)

## Bloco D — Leitura
16. Progresso
17. Favoritos
18. Histórico

## Bloco E — Comercial
19. Plano
20. Assinatura
21. Pedido
22. Licença
23. Pagamento

## Bloco F — Organização
24. Organização
25. Biblioteca_Organização


## MLD-001 — Aprovado
### Tabela tipos_bibliotecao

| Campo         | Observação                       |
| ------------- | -------------------------------- |
| id (PK)       | Identificador único              |
| nome          | Nome do tipo                     |
| descricao     | Descrição opcional               |
| ativa         | Indica se o tipo está disponível |
| criada_em     | Data de criação                  |
| atualizada_em | Data da última alteração         |

Responsabilidade

Classificar bibliotecas da plataforma.

Exemplos de registros:

Pública
Privada
Organização
Premium
Universidade
Infantil
Corporativa (caso surja futuramente)

### Tabela bibliotecas

| Campo                   | Observação                         |
| ----------------------- | ---------------------------------- |
| id (PK)                 | Identificador único                |
| tipo_biblioteca_id (FK) | Referência para `tipos_biblioteca` |
| nome                    | Nome da biblioteca                 |
| descricao               | Descrição opcional                 |
| slug                    | Identificador único para URLs      |
| publico                 | Biblioteca visível ou restrita     |
| ativa                   | Biblioteca ativa/inativa           |
| criada_em               | Data de criação                    |
| atualizada_em           | Data da última alteração           |

### Relacionamento

tipos_biblioteca
        │
        │ 1
        │
        └────────────── N bibliotecas

Regras aprovadas

✅ Uma biblioteca pertence obrigatoriamente a um tipo.

✅ Um tipo pode ser utilizado por várias bibliotecas.

✅ O slug é único globalmente.

✅ O nome não precisa ser único, permitindo bibliotecas com o mesmo nome em contextos diferentes.

✅ A desativação é feita através do campo ativa; a estratégia de exclusão será definida posteriormente.

### Observação de modelagem

Há uma decisão que considero importante registrar desde já, pois influenciará as próximas tabelas.

Nas etapas anteriores definimos a hierarquia conceitual:

Biblioteca
    └── Categoria
            └── Livro

No modelo lógico, isso significa que cada nível referencia apenas seu pai imediato:

bibliotecas
      │
      └── categorias
              │
              └── livros

Ou seja:

categorias terá biblioteca_id como FK.
livros terá categoria_id como FK.
livros não terá biblioteca_id, pois a biblioteca já é determinada pela categoria.

Essa abordagem evita redundância, mantém o modelo normalizado e reduz o risco de inconsistências 
(por exemplo, um livro apontando para uma categoria de uma biblioteca e, ao mesmo tempo, para 
outra biblioteca diferente).

---

## MLD-002 — Tabela categorias
### Tabela Categoria

| Campo                 | Obrigatório | Observação                             |
| --------------------- | ----------- | -------------------------------------- |
| id (PK)               | Sim         | Identificador único                    |
| biblioteca_id (FK)    | Sim         | Biblioteca à qual a categoria pertence |
| categoria_pai_id (FK) | Não         | Categoria superior (subcategoria)      |
| nome                  | Sim         | Nome da categoria                      |
| descricao             | Não         | Descrição da categoria                 |
| slug                  | Sim         | Identificador para URLs                |
| ordem                 | Não         | Ordem de exibição                      |
| ativa                 | Sim         | Categoria ativa/inativa                |
| criada_em             | Sim         | Data de criação                        |
| atualizada_em         | Sim         | Data da última alteração               |

### Relacionamentos
tipos_biblioteca
        │
        └── bibliotecas
                 │
                 └── categorias
                         │
                         └── categorias (auto-relacionamento)

Ou, detalhando o auto-relacionamento:

categorias

1
│
├────────────── N categorias

Uma categoria pode possuir várias subcategorias.

Uma subcategoria pertence a apenas uma categoria pai.

### Exemplo
Biblioteca Pública

Literatura
│
├── Romance
├── Fantasia
├── Terror
└── Ficção Científica

Outro exemplo:

Empresa ABC

Manuais
│
├── RH
├── Financeiro
├── Comercial
└── TI

---

## MLD-003 — Tabela livros (Aprovado)

| Campo                            | Obrigatório | Observação                       |
| -------------------------------- | ----------- | -------------------------------- |
| id (PK)                          | Sim         | Identificador único              |
| categoria_id (FK)                | Sim         | Categoria principal do livro     |
| idioma_id (FK)                   | Sim         | Idioma principal da obra         |
| classificacao_indicativa_id (FK) | Sim         | Classificação etária             |
| status_livro_id (FK)             | Sim         | Status editorial                 |
| visibilidade_livro_id (FK)       | Sim         | Visibilidade do livro            |
| capa_id (FK)                     | Não         | Mídia utilizada como capa        |
| criado_por (FK)                  | Sim         | Usuário responsável pela criação |
| titulo                           | Sim         | Título da obra                   |
| subtitulo                        | Não         | Subtítulo                        |
| slug                             | Sim         | Identificador amigável para URL  |
| sinopse                          | Não         | Resumo da obra                   |
| ordem                            | Não         | Ordem de exibição na categoria   |
| ativo                            | Sim         | Disponibilidade do livro         |
| criado_em                        | Sim         | Data de criação                  |
| atualizado_em                    | Sim         | Data da última alteração         |

Relacionamentos
categorias
      │
      │ 1
      │
      └────────────── N livros

Relacionamentos futuros:

livros
│
├── 1 → N capítulos
├── 1 → N livro_autores
├── 1 → N progresso_leitura
├── 1 → N favoritos
├── 1 → N avaliações
├── 1 → N mídias
└── 1 → N coleções

## Tabelas auxiliares aprovadas

### status_livro

Responsável pelo fluxo editorial.

Exemplos:

Nome
Rascunho
Em Revisão
Publicado
Arquivado

No futuro, poderemos adicionar novos estados sem alterar a estrutura do banco.

visibilidades_livro

Responsável por definir quem pode visualizar o livro.

Exemplos:

Nome
Público
Assinantes
Compradores
Organização
Privado

Essa separação é importante porque visibilidade não é a mesma coisa que permissão de acesso.
Um livro pode ser visível no catálogo, mas exigir assinatura, compra ou vínculo com uma 
organização para ser lido.

classificacoes_indicativas

Responsável pela classificação etária.

Exemplos iniciais:

Nome
Livre
10+
12+
14+
16+
18+

Essa tabela será usada pelas regras de acesso, especialmente para bibliotecas privadas e 
conteúdo adulto.

Decisão importante registrada

Cada livro pertence a uma única categoria principal.

Biblioteca
     │
Categoria
     │
Livro

Caso, no futuro, a plataforma precise classificar um mesmo livro em várias categorias, criaremos 
uma entidade associativa livro_categorias, preservando a compatibilidade com o modelo atual.

---
## MLD-004 — Tabela autores

| Campo           | Obrigatório | Observação                                   |
| --------------- | ----------- | -------------------------------------------- |
| id (PK)         | Sim         | Identificador do perfil de autor             |
| usuario_id (FK) | Sim         | Referência ao usuário proprietário do perfil |
| foto_id (FK)    | Não         | Foto pública do autor                        |
| nome_publico    | Sim         | Nome ou pseudônimo exibido nas obras         |
| biografia       | Não         | Apresentação pública do autor                |
| ativo           | Sim         | Perfil ativo/inativo                         |
| criado_em       | Sim         | Data de criação                              |
| atualizado_em   | Sim         | Data da última alteração                     |

Relacionamento
usuarios
     │
     │ 1
     │
     └────────── 0..1 autores

E futuramente:

autores
     │
     │ 1
     │
     ├────────── N livro_autores
     │
     └────────── N autor_links
Nova entidade planejada

Já deixaremos registrada para os próximos MLDs:

autor_links

Essa entidade ficará responsável por todos os canais públicos do autor.

Exemplo:

Campo
id
autor_id
tipo_link_id
url
ordem
ativo
criado_em
atualizado_em

E uma tabela de apoio:

tipos_link

Exemplos:

Site Oficial
Blog
Instagram
Facebook
X
LinkedIn
GitHub
YouTube
TikTok
Twitch
Discord
Patreon
Apoia.se
Catarse

Essa abordagem evita criar dezenas de colunas na tabela autores e facilita a inclusão 
de novos serviços no futuro.

## MLD-005 — Tabela livro_autores


| Campo                | Obrigatório | Observação                    |
| -------------------- | ----------- | ----------------------------- |
| id (PK)              | Sim         | Identificador da participação |
| livro_id (FK)        | Sim         | Livro relacionado             |
| autor_id (FK)        | Sim         | Autor participante            |
| funcao_autor_id (FK) | Sim         | Papel desempenhado na obra    |
| ordem                | Sim         | Ordem de exibição dos autores |
| ativo                | Sim         | Participação ativa            |
| criado_em            | Sim         | Data de criação               |
| atualizado_em        | Sim         | Data da última alteração      |

Objetivo

A tabela livro_autores representa a relação entre livros e autores.

Ela resolve o relacionamento N:N entre as entidades livros e autores, permitindo que:

um livro possua vários autores;
um autor participe de diversos livros;
cada autor tenha uma função específica na obra;
seja definida a ordem de exibição dos autores.

Esta tabela representa uma participação editorial, e não apenas uma associação simples.

Relacionamentos
livros

1
│
│
└────────────── N livro_autores

autores

1
│
│
└────────────── N livro_autores

Relacionamento com funções
funcoes_autor

1
│
│
└────────────── N livro_autores

Cada participação possui exatamente uma função.

Exemplo

Livro:

Arquitetura Moderna

Participações:

Ordem	Autor	Função
1	João Silva	Autor Principal
2	Maria Costa	Coautora
3	Pedro Lima	Revisor Técnico
4	Ana Souza	Ilustradora

A página do livro poderá exibir exatamente essa ordem.

Regras de Integridade
Obrigatórias
Toda participação pertence a um livro.
Toda participação pertence a um autor.
Toda participação possui uma função.
Ordem

A coluna ordem define a sequência de apresentação.

Exemplo:

Livro

1 João Silva

2 Maria Costa

3 Pedro Lima

Essa ordem será utilizada em:

capa;
página do livro;
catálogo;
exportações;
geração de citações bibliográficas (quando implementadas).
Participação única

Uma mesma combinação de:

livro
+
autor
+
função

deve existir apenas uma vez.

Isso evita registros duplicados.

Exemplo inválido:

Livro A

João Silva
Autor Principal

João Silva
Autor Principal

Entretanto, se houver um caso excepcional em que o mesmo autor desempenhe duas funções 
diferentes na mesma obra, isso continua sendo possível:

Livro	Autor	Função
Livro A	João Silva	Autor Principal
Livro A	João Silva	Tradutor

## MLD-006 — Tabela funcoes_autor


| Campo          | Obrigatório | Observação                            |
| -------------- | ----------- | ------------------------------------- |
| id (PK)        | Sim         | Identificador único                   |
| nome           | Sim         | Nome da função                        |
| descricao      | Não         | Descrição da função                   |
| ordem_exibicao | Não         | Ordem padrão de apresentação          |
| ativa          | Sim         | Indica se a função pode ser utilizada |
| criada_em      | Sim         | Data de criação                       |
| atualizada_em  | Sim         | Data da última alteração              |

Relacionamento

funcoes_autor
        │
        │ 1
        │
        └────────────── N livro_autores


Uma função pode ser utilizada em milhares de participações editoriais.

Cada participação editorial possui exatamente uma função.

Exemplos de registros
Ordem	Nome
1	Autor Principal
2	Coautor
3	Organizador
4	Tradutor
5	Ilustrador
6	Narrador
7	Revisor Técnico
8	Editor Científico
9	Adaptador
10	Colaborador

Observe que esta tabela é aberta. A plataforma pode receber novas funções futuramente sem necessidade de alterar sua estrutura.

Regras de Integridade
Nome

O nome da função deve ser único na plataforma.

Não faz sentido existir:

Autor Principal

Autor Principal
Desativação

Uma função utilizada por livros publicados não deve ser removida fisicamente.

Caso deixe de ser utilizada, basta marcá-la como inativa.

Ordem de exibição

ordem_exibicao define apenas a sequência sugerida para listas administrativas (combos, telas de cadastro etc.).

Ela não interfere na ordem dos autores dentro de um livro. Essa responsabilidade continua sendo da tabela livro_autores.


## MLD-007 — capitulos


| Campo                   | Tipo            |
| ----------------------- | --------------- |
| id (PK)                 | PK              |
| livro_id (FK)           | livros          |
| capitulo_pai_id (FK)    | capitulos       |
| tipo_capitulo_id (FK)   | tipos_capitulo  |
| status_capitulo_id (FK) | status_capitulo |
| criado_por (FK)         | usuarios        |
| titulo                  |                 |
| slug                    |                 |
| resumo                  |                 |
| conteudo                |                 |
| ordem_exibicao          |                 |
| ativo                   |                 |
| criado_em               |                 |
| atualizado_em           |                 |

--- 

## MLD-008 — transicoes_capitulo (antigo escolhas)


| Campo                    | Tipo                          |
| ------------------------ | ----------------------------- |
| id (PK)                  | PK                            |
| capitulo_origem_id (FK)  | capitulos                     |
| capitulo_destino_id (FK) | capitulos                     |
| condicao_id (FK)         | condicoes *(opcional/futuro)* |
| texto                    |                               |
| descricao                |                               |
| ordem_exibicao           |                               |
| ativo                    |                               |
| criado_em                |                               |
| atualizado_em            |                               |

---

## MLD-009 — midias


| Campo              | Tipo        |
| ------------------ | ----------- |
| id (PK)            | PK          |
| tipo_midia_id (FK) | tipos_midia |
| usuario_id (FK)    | usuarios    |
| idioma_id (FK)     | idiomas     |
| nome               |             |
| nome_original      |             |
| descricao          |             |
| caminho            |             |
| mime_type          |             |
| tamanho            |             |
| largura            |             |
| altura             |             |
| duracao            |             |
| alt_text           |             |
| legenda            |             |
| hash_arquivo       |             |
| ativo              |             |
| criado_em          |             |
| atualizado_em      |             |

---

## MLD-010 — capitulo_midias


| Campo                  | Tipo            |
| ---------------------- | --------------- |
| id (PK)                | PK              |
| capitulo_id (FK)       | capitulos       |
| midia_id (FK)          | midias          |
| tipo_uso_midia_id (FK) | tipos_uso_midia |
| legenda                |                 |
| ordem_exibicao         |                 |
| ativo                  |                 |
| criado_em              |                 |
| atualizado_em          |                 |


