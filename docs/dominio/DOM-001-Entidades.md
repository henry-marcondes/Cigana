# DOM-001 — Modelagem do Domínio

Decisões Validadas
──────────────────

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

# Itens em Análise
────────────────

IA-001 Comportamento
IA-002 — Versão

---

## Decisão de Domínio D-001: 

A plataforma suporta múltiplas bibliotecas. Cada biblioteca possui identidade própria, 
regras de acesso, tipo (Pública, Privada ou Organização), podendo conter categorias e 
livros específicos. Essa decisão fundamentará os relacionamentos e as regras de negócio 
nas etapas seguintes.

Estrutura conceitual inicial

Neste momento nosso domínio começa a ganhar uma forma bem definida:

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
             └── Associação

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

Biblioteca
    └── Categoria
            └── Livro

exemplo:

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

## Decisão Validada nº 005
Cena é a unidade funcional da narrativa

Status: ✅ Aprovado

Definição

A Cena é a menor unidade funcional da narrativa e o coração da Plataforma de Livros Interativos.

É dentro dela que acontece toda a experiência do leitor.

Uma Cena é composta por quatro pilares fundamentais:

Cena
│
├── Conteúdo
├── Recursos
├── Interações
└── Comportamentos

O Capítulo passa a ser um agrupador lógico de cenas.

O Livro passa a ser um agrupador lógico de capítulos.

Hierarquia do domínio :

Plataforma
    │
    └── Biblioteca
            │
            └── Categoria
                    │
                    └── Livro
                            │
                            └── Capítulo
                                    │
                                    └── Cena

1. Conteúdo

Representa a narrativa apresentada ao leitor.

Exemplos:

Texto
Diálogos
Descrições
Narração

2. Recursos

São os elementos multimídia utilizados pela cena.

Exemplos:

Imagem
Áudio
Vídeo
Animações (futuro)
Modelos 3D (futuro)

3. Interações

São as ações realizadas pelo leitor.

Exemplos:

Escolha
Quiz
Puzzle
Hotspot
Formulário
Mini Game
Entrada de Texto
Arrastar e Soltar
IA Conversacional (futuro)

4. Comportamentos

São ações executadas automaticamente pelo sistema durante o ciclo de vida da cena.

Exemplos:

Executar áudio ao entrar
Alterar variáveis da história
Desbloquear conteúdo
Registrar decisões
Atualizar progresso
Iniciar cronômetros
Disparar eventos
Executar animações
Alterar estado de personagens

### Princípio Arquitetural

A Cena é a unidade funcional responsável por concentrar toda a experiência narrativa e 
interativa da plataforma.

Todo elemento apresentado ao leitor ou executado pelo sistema pertence ao contexto da Cena.

Essa definição estabelece a Cena como o núcleo do domínio, permitindo que a plataforma 
evolua com novos recursos, mídias e tipos de interação sem alterar sua estrutura fundamental.


## Decisão Validada nº 006
Interação é uma entidade independente do domínio

Status: ✅ Aprovado

Definição

A Interação é uma entidade de domínio independente.

Ela representa qualquer mecanismo de participação do leitor dentro de uma Cena.

A Cena passa a conter uma ou mais interações, e cada interação possui comportamento, 
regras e configurações próprias.

E somente dentro de Interações teremos:

Interação
    │
    ├── Escolha
    ├── Quiz
    ├── Puzzle
    ├── Hotspot
    ├── Formulário
    ├── Mini Game
    ├── Entrada de Texto
    ├── Arrastar/Soltar
    ├── Reconhecimento de Voz (futuro)
    ├── IA Conversacional (futuro)
    └── ...

A plataforma não precisa conhecer antecipadamente todos os tipos de interação.

Ela precisa conhecer apenas a entidade Interação.

Novos tipos poderão surgir no futuro sem alterar o núcleo do domínio.

## Decisão Validada nº 007

A Cena pertence exclusivamente a um Capítulo

Status: ✅ Aprovado

Definição

Uma Cena pertence exclusivamente a um único Capítulo.

Ela não pode ser compartilhada simultaneamente entre diferentes capítulos ou livros.

Essa regra garante que cada narrativa seja independente, previsível e fácil de manter.

Reutilização de Cenas

A reutilização de uma cena não ocorre por compartilhamento da mesma instância.

Ela ocorre por duplicação.

Livro A
└── Capítulo 3
    └── Cena 12

          │
          │ Duplicar
          ▼

Livro B
└── Capítulo 5
    └── Cena 47

Após a duplicação:

As duas cenas tornam-se independentes.
Alterações em uma não afetam a outra.
O autor pode adaptar livremente a nova cena ao contexto da narrativa.

Justificativa

Essa decisão foi tomada priorizando a experiência do autor.
Embora o compartilhamento de cenas seja tecnicamente possível, ele introduz dependências 
difíceis de compreender e manter:

necessidade de conhecer cenas existentes;
risco de alterações impactarem outras histórias;
aumento da complexidade do editor;
documentação mais extensa;
maior curva de aprendizado.

A duplicação elimina esses problemas e mantém o processo de criação intuitivo.

Princípio Arquitetural Derivado

Dessa decisão nasce um princípio que eu acho que vale a pena manter como referência durante 
todo o projeto:

A modelagem do domínio deve refletir a forma como um autor cria uma narrativa, e não a forma 
como um desenvolvedor implementa um sistema.

Esse princípio será nosso guia sempre que surgir uma escolha entre uma solução tecnicamente 
sofisticada e uma solução mais simples e natural para o autor.

## Decisão Validada nº 008
Conteúdo é uma entidade do domínio

Status: ✅ Aprovado

Definição

Conteúdo é uma entidade independente do domínio.

Sua responsabilidade é armazenar e representar as informações narrativas apresentadas ao leitor dentro de uma Cena.

Todo conteúdo possui identidade própria, ciclo de vida e pertence a uma única Cena.

Justificativa

O Conteúdo não deve ser tratado como um simples campo de texto da entidade Cena, pois:

uma Cena pode possuir múltiplos conteúdos;
os conteúdos podem possuir tipos diferentes;
podem existir regras de ordenação;
poderão evoluir sem alterar a estrutura da Cena.
Relacionamento conceitual
Cena
    └── Conteúdo

## Decisão Validada nº 009
Recurso é uma entidade do domínio

Status: ✅ Aprovado

Definição

Recurso é uma entidade independente do domínio.

Sua responsabilidade é representar qualquer elemento multimídia utilizado por uma Cena.

Todo recurso possui identidade própria e pertence a uma única Cena.

Justificativa

Um recurso possui características próprias que justificam sua existência como entidade:

tipo do recurso;
arquivo associado;
metadados;
ordem de apresentação;
possibilidade de evolução para novos formatos.

Além disso, uma Cena pode conter diversos recursos simultaneamente.

Relacionamento conceitual
Cena
    └── Recurso
    
## D-010 — Tag é uma entidade do domínio

Status: ✅ Proposta

Definição

Tag é uma entidade independente utilizada para classificar, agrupar e facilitar a 
pesquisa de obras.

Uma Tag pode estar associada a vários Livros.

Um Livro pode possuir várias Tags.

Trata-se, portanto, de um relacionamento muitos-para-muitos.

Hierarquia

Importante observar que a Tag não pertence à árvore principal do conteúdo.

Ela funciona como uma classificação transversal.

Biblioteca
    │
Categoria
    │
Livro

Enquanto isso:

Tag
    │
    ├── Livro A
    ├── Livro B
    ├── Livro C

Ou seja, a Tag complementa a classificação feita pela Categoria.

Categoria x Tag


| Categoria                           | Tag                                   |
| ----------------------------------- | ------------------------------------- |
| Estrutural                          | Descritiva                            |
| Obrigatória                         | Opcional                              |
| Pertence à Biblioteca               | Global (ou por Biblioteca, a definir) |
| Organiza o catálogo                 | Facilita pesquisa e descoberta        |
| Cada Livro pertence a uma Categoria | Um Livro pode possuir várias Tags     |

Exemplo:

Biblioteca Pública

Categoria:
Romance

Livro:
A Estrada do Norte

Tags:

Aventura

Drama

Viagem

Brasil

Século XIX

Perceba que a Categoria organiza o catálogo, enquanto as Tags enriquecem a busca e a 
descoberta de conteúdo.

Escopo

As Tags são globais na plataforma.

Elas não pertencem a uma Biblioteca específica.

Isso garante:

    padronização da classificação;
    eliminação de duplicidade;
    melhor experiência de pesquisa;
    possibilidade de estatísticas globais;
    facilidade na criação de recomendações.

## D-011 — Idioma é uma entidade global do domínio

Status: ✅ Proposta

Definição

Idioma é uma entidade global da plataforma.

Ela representa um idioma reconhecido pelo sistema e pode ser utilizada por diferentes 
contextos do domínio.

Inicialmente será utilizada por:

Livros;
Usuários (idioma da interface);
Plataforma (internacionalização).

No futuro poderá ser utilizada por:

Traduções;
Bibliotecas;
Conteúdos;
Áudios;
Recursos multilíngues.

## D-012 — Classificação Indicativa é uma entidade global

Status: ✅ Proposta

Definição

A Classificação Indicativa é uma entidade global responsável por representar as faixas etárias e restrições de acesso aplicáveis aos conteúdos da plataforma.

Ela não pertence exclusivamente ao Livro, pois poderá ser utilizada por diferentes módulos, como:

Catálogo;
Controle de acesso;
Bibliotecas;
Organizações;
Recomendações;
Controles parentais.
Relacionamento conceitual

Classificação Indicativa
            │
            ▼
         Livro

Uma observação para o futuro

Essa decisão conversa diretamente com uma preocupação que você levantou logo no início do projeto: 
proteger conteúdos adultos.

No futuro, o sistema poderá combinar várias regras:

    Biblioteca = Privada
    Classificação = 18+
    Usuário = maior de idade
    Organização = permite esse tipo de conteúdo?

Assim, o acesso será determinado pela combinação dessas informações, e não apenas por um campo 
isolado no Livro.

## D-013 — Licença é uma entidade global do domínio.
Exemplos:

Copyright
Creative Commons
Domínio Público
Licença Comercial
Licença Educacional

Aqui vejo claramente uma entidade.

Porque:

vários livros utilizarão a mesma licença;
possui descrição;
possui regras jurídicas;
pode evoluir.


## Item em Análise IA-001
Comportamento

Status: 🟡 Em Análise

Situação Atual

Durante a modelagem do domínio identificamos o conceito de Comportamento como um possível componente da Cena.

Entretanto, ainda não há elementos suficientes para decidir se ele representa:

uma entidade persistente do domínio;
regras do motor narrativo;
eventos do sistema;
ou uma combinação desses conceitos.
Motivo para manter em análise

A decisão depende da definição de outros conceitos que ainda serão modelados, entre eles:

Variáveis narrativas;
Eventos;
Regras de progressão;
Estados da narrativa;
Motor de execução.

Somente após a modelagem desses conceitos será possível determinar a melhor forma de representar 
os comportamentos.

Decisão

O conceito permanece registrado no domínio, porém não será incorporado ao Modelo Entidade-Relacionamento 
(MER) até que sua responsabilidade esteja claramente definida.

## IA-002 — Versão

Status: 🟡 Em Análise

Motivo:

A definição depende da modelagem do contexto editorial (autoria, revisão, publicação e versionamento).



