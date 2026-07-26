## Relacionamento 001 — Biblioteca → Livro
Relacionamento

Biblioteca (1) ─────────── (N) Livro

Regra de negócio
Uma Biblioteca contém vários Livros.
Todo Livro pertence a uma Biblioteca.
A Biblioteca é responsável apenas pela organização do catálogo, não pela classificação temática dos livros.

Justificativa

A Categoria passa a classificar diretamente o Livro, evitando acoplamento entre Biblioteca e Categoria 
e permitindo que a taxonomia seja reutilizada em diferentes bibliotecas no futuro.

Status: ✅ Aprovado

## Relacionamento 002 — Categoria → Livro
Relacionamento

Categoria (1) ─────────── (N) Livro

Regra de Negócio
Uma Categoria pode classificar vários Livros.
Todo Livro deve possuir uma Categoria principal.
A Categoria representa a classificação estrutural do catálogo.
Um Livro pertence a uma única Categoria no MER inicial.

Responsabilidades

    Categoria
Organizar os livros por assunto.
Facilitar a navegação na Biblioteca.
Servir como classificação principal do Livro.

    Livro
Deve estar vinculado a uma Categoria.
Herda sua classificação principal da Categoria associada.

Justificativa

A adoção de uma única Categoria por Livro simplifica o modelo conceitual, reduz a 
complexidade do MER e atende às necessidades atuais da plataforma.

Classificações complementares, palavras-chave e múltiplos temas serão representados 
pela entidade Tag, evitando a necessidade de um relacionamento N:N entre Categoria e 
Livro neste momento.

Caso futuramente surja uma necessidade real de múltiplas categorias por livro, o modelo 
poderá ser evoluído por meio de uma entidade associativa (LivroCategoria) sem impactar a 
estrutura principal.

Cardinalidade

Categoria (1) ─────────── (N) Livro

Dependência

A existência de uma Categoria independe dos Livros.
Todo Livro depende de uma Categoria para sua classificação principal.
Status

✅ Aprovado

## Relacionamento 003 — Livro → Capítulo

Relacionamento

Livro (1) ─────────── (1..N) Capítulo

Regra de Negócio
Um Livro é composto por um ou mais Capítulos.
Todo Capítulo pertence obrigatoriamente a um único Livro.
Um Capítulo não pode ser compartilhado entre Livros.

Responsabilidades

    Livro
Representar a obra completa.
Organizar sua estrutura narrativa por meio de Capítulos.
Definir a ordem geral da narrativa.

    Capítulo
Representar uma divisão lógica da narrativa.
Agrupar uma ou mais Cenas.
Facilitar a navegação, o sumário e a organização do conteúdo.

    Justificativa

A entidade Capítulo é mantida no modelo conceitual porque proporciona uma organização 
clara da narrativa, tanto para obras curtas quanto para obras extensas.

Embora alguns livros possuam apenas um único capítulo, essa estrutura continua válida e 
mantém consistência em toda a plataforma. Livros maiores podem ser divididos em diversos 
capítulos sem necessidade de alterar o modelo.

    Cardinalidade

Livro (1) ─────────── (1..N) Capítulo

    Dependência

A existência de um Capítulo depende da existência de um Livro.
Um Livro pode existir durante o processo de criação sem capítulos, porém, para fins de publicação, 
deverá possuir pelo menos um capítulo. Essa é uma regra de negócio da aplicação, não uma restrição 
do MER conceitual.

Status

✅ Aprovado

## Relacionamento 004 — Capítulo → Cena
Relacionamento
Capítulo (1) ─────────── (1..N) Cena
Regra de Negócio
Um Capítulo é composto por uma ou mais Cenas.
Toda Cena pertence obrigatoriamente a um único Capítulo.
Uma Cena não pode existir sem um Capítulo.
Responsabilidades
Capítulo
Organizar a narrativa em unidades maiores.
Agrupar as Cenas que compõem sua história.
Definir a ordem estrutural das Cenas dentro do capítulo.
Cena
Representar uma unidade narrativa independente.
Servir como ponto de exibição para o leitor.
Agrupar Conteúdos, Recursos e Interações.
Navegação

A Cena não conhece sua próxima Cena.

A progressão da narrativa será definida exclusivamente pelas entidades Interação, permitindo:

histórias lineares;
histórias ramificadas;
múltiplos finais;
caminhos condicionais;
futuras mecânicas interativas.
Justificativa

A separação entre estrutura e navegação reduz o acoplamento entre entidades e torna o modelo mais flexível para diferentes tipos de narrativas. As Cenas permanecem focadas na apresentação do conteúdo, enquanto as Interações controlam o fluxo da história.

Cardinalidade
Capítulo (1) ─────────── (1..N) Cena
Dependência
A existência de uma Cena depende da existência de um Capítulo.
Um Capítulo pode existir temporariamente sem Cenas durante a edição da obra, mas, para publicação, deverá conter ao menos uma Cena. Essa validação pertence às regras de negócio da aplicação.
Status

✅ Aprovado

## Relacionamento 005 — Cena → Conteúdo
Relacionamento
Cena (1) ─────────── (1..N) Conteúdo
Regra de Negócio
Uma Cena é composta por um ou mais Conteúdos.
Todo Conteúdo pertence obrigatoriamente a uma única Cena.
Um Conteúdo não pode existir sem uma Cena.
Responsabilidades
Cena
Organizar a unidade narrativa.
Definir a sequência dos blocos apresentados ao leitor.
Conteúdo
Representar um bloco de informação exibido na Cena.
Possuir um tipo (texto, título, imagem, vídeo, áudio, citação, lista etc.).
Opcionalmente referenciar um Recurso quando o bloco depender de um arquivo de mídia.
Justificativa

A entidade Conteúdo representa a estrutura lógica da informação apresentada ao leitor, enquanto a entidade Recurso representa o arquivo físico associado (imagem, áudio, vídeo, PDF, animação, entre outros).

Essa separação evita o acoplamento entre apresentação e armazenamento de arquivos, facilita a reutilização de recursos e torna o modelo mais extensível.

Cardinalidade
Cena (1) ─────────── (1..N) Conteúdo
Dependência
A existência de um Conteúdo depende da existência de uma Cena.
Uma Cena pode existir temporariamente sem Conteúdos durante a edição, mas, para publicação, deverá possuir ao menos um Conteúdo. Essa validação faz parte das regras de negócio da aplicação.
Status

✅ Aprovado

## Relacionamento 006 — Conteúdo → Recurso
Relacionamento

Conteúdo (1) ─────────── (0..N) Recurso

Regra de Negócio
Um Conteúdo pode não possuir nenhum Recurso.
Um Conteúdo pode referenciar um ou vários Recursos.
Todo Recurso pertence obrigatoriamente a um único Conteúdo.

Responsabilidades

    Conteúdo
Representar um componente exibido na Cena.
Definir o tipo do componente (texto, imagem, galeria, vídeo, áudio, carrossel, mapa etc.).
Organizar os Recursos utilizados pelo componente.

    Recurso
Representar um arquivo físico ou mídia utilizada pelo Conteúdo.
Armazenar informações sobre o arquivo (imagem, áudio, vídeo, documento, animação, entre outros).
Ser utilizado exclusivamente pelo Conteúdo ao qual pertence.

    Justificativa

O modelo separa claramente:

Estrutura narrativa → Cena.
Componente visual → Conteúdo.
Arquivo físico → Recurso.

Essa separação evita acoplamento e permite criar novos tipos de componentes sem necessidade de alterar o MER.

    Cardinalidade
Conteúdo (1) ─────────── (0..N) Recurso

    Dependência
Um Recurso depende da existência de um Conteúdo.
Um Conteúdo pode existir sem Recursos (por exemplo, um bloco de texto ou um título).
Regras específicas por tipo

As quantidades mínimas e máximas de Recursos para cada tipo de Conteúdo não fazem parte do MER. Elas 
serão implementadas como regras de negócio no editor e na camada de validação da aplicação.

Por exemplo:

| Tipo de Conteúdo | Recursos permitidos | Regra de negócio                    |
| ---------------- | ------------------: | ----------------------------------- |
| Texto            |                   0 | Não utiliza arquivos.               |
| Título           |                   0 | Apenas texto.                       |
| Citação          |                   0 | Apenas texto.                       |
| Imagem           |                   1 | Exatamente uma imagem.              |
| Áudio            |                   1 | Exatamente um arquivo de áudio.     |
| Vídeo            |                   1 | Exatamente um vídeo.                |
| PDF              |                   1 | Exatamente um documento.            |
| Galeria          |                2..N | Várias imagens.                     |
| Carrossel        |                1..N | Vários recursos ordenados.          |
| Comparação       |                   2 | Dois recursos para comparação.      |
| Mapa Interativo  |                1..N | Um mapa base e recursos associados. |

Status

✅ Aprovado

## Relacionamento 007 — Cena → Interação
Relacionamento
Cena (1) ─────────── (0..N) Interação
Regra de Negócio
Uma Cena pode possuir nenhuma, uma ou várias Interações.
Toda Interação pertence obrigatoriamente a uma única Cena.
Uma Interação não pode existir fora do contexto de uma Cena.
Uma Cena pode ser totalmente linear, sem nenhuma Interação.
Responsabilidades
Cena
Representar uma unidade narrativa.
Organizar os conteúdos apresentados ao leitor.
Disponibilizar possibilidades de interação quando necessário.
Interação
Representar uma possibilidade de ação do leitor.
Definir a intenção da ação dentro da Cena.
Servir como ponto de extensão para comportamentos futuros.
Informações conceituais da Interação

Neste momento do domínio, uma Interação possui:

Identificação

Permite diferenciar uma interação dentro da plataforma.

Exemplo:

Interação 01
Interação 02
Interação 03
Rótulo / Descrição

Texto apresentado ao leitor.

Exemplo:

"Entrar na floresta"
"Investigar a casa abandonada"
Tipo

Representa a natureza da interação.

Exemplos futuros:

escolha;
botão;
pergunta;
resposta;
ação automática;
comando.

A lista definitiva será definida posteriormente.

Ordem dentro da Cena

Define a organização visual das interações.

Exemplo:

Cena

1 - Conversar
2 - Fugir
3 - Investigar
Limites definidos neste momento

A Interação não possuirá ainda:

❌ Cena destino
❌ Condições
❌ Variáveis
❌ Regras de execução
❌ Ações compostas
❌ Eventos

Esses conceitos serão tratados na futura:

Etapa 2.3 — Modelagem da Engine de Interação

Justificativa

A separação mantém responsabilidades claras:

Cena
 |
 ├── Conteúdo
 |       └── Recurso
 |
 └── Interação

Onde:

Conteúdo define o que o leitor vê.
Recurso define os arquivos utilizados.
Interação define o que o leitor pode fazer.

O comportamento resultante será responsabilidade da Engine.

Status

✅ Aprovado

## Relacionamento 008 — Livro → Idioma
Relacionamento

Livro (N) ─────────── (1) Idioma

    Regra de Negócio
Um Livro possui um idioma principal.
Um Idioma pode estar associado a vários Livros.
O idioma representa a língua de publicação do livro no catálogo.

    Responsabilidades

    Livro
Informar ao catálogo em qual idioma a obra está disponível.
Permitir filtros e pesquisas por idioma.

    Idioma
Representar idiomas disponíveis na plataforma.
Padronizar informações linguísticas.

Exemplos:

Português (Brasil)

English

Español

Français

    Dependência
Um Livro depende de um Idioma para sua classificação no catálogo.
Um Idioma pode existir sem livros publicados.

    Futuro

Caso a internacionalização se torne necessária, a evolução natural será:

Livro
   │
   ├── Versão PT
   │
   ├── Versão EN
   │
   └── Versão ES

Mas essa evolução será feita com base em uma necessidade real.

Status

✅ Aprovado para o MER inicial

## Relacionamento 009 — Classificação Indicativa
Conceito aprovado

A Classificação Indicativa pode ser aplicada em diferentes níveis da estrutura narrativa:

Livro
 │
 └── Capítulo
        │
        └── Cena

A classificação segue uma regra de herança.

Hierarquia de Classificação
Cena
 ↓
Capítulo
 ↓
Livro
 ↓
Plataforma
Regra de resolução

Quando o leitor acessa um conteúdo:

Verifica se a Cena possui classificação.
Caso não possua, verifica o Capítulo.
Caso não possua, verifica o Livro.
Caso não exista nenhuma classificação, aplica a classificação padrão definida pela plataforma.
Exemplos
Exemplo 1 — Livro completo adulto
Livro:
Contos Sensuais

Classificação:
18 anos

Resultado:

Capítulo 1 → 18 anos
Cena 1 → 18 anos
Cena 2 → 18 anos
Exemplo 2 — Livro com capítulos diferentes
Livro:
Mistérios da Noite

Classificação:
14 anos


Capítulo 5:
18 anos

Resultado:

Capítulo 1 → 14 anos

Capítulo 5 → 18 anos
Exemplo 3 — Cena específica
Livro:
Aventura Sombria

Classificação:
14 anos


Capítulo 8:
16 anos


Cena 3:
18 anos

Resultado:

Cena 1 → 16 anos
Cena 2 → 16 anos
Cena 3 → 18 anos
Modelo conceitual aprovado

A entidade:

Classificação Indicativa

pode se relacionar com:

Livro
Capítulo
Cena

como uma associação opcional.

Representação:

Classificação Indicativa

        ▲
        │
 ┌──────┼────────┐
 │      │        │
Livro Capítulo Cena
Relacionamentos registrados
Relacionamento 009-A
Livro (0..1) ─────────── (1) Classificação Indicativa

Regra:

Um Livro pode possuir uma classificação.
Uma classificação pode ser usada por vários Livros.
Relacionamento 009-B
Capítulo (0..1) ─────────── (1) Classificação Indicativa

Regra:

Um Capítulo pode sobrescrever a classificação do Livro.
Uma classificação pode ser usada por vários Capítulos.
Relacionamento 009-C
Cena (0..1) ─────────── (1) Classificação Indicativa

Regra:

Uma Cena pode sobrescrever a classificação herdada.
Uma classificação pode ser usada por várias Cenas.
Observação importante de domínio

A Classificação Indicativa não controla acesso diretamente.

Ela apenas informa o nível de adequação do conteúdo.

A futura regra:

Usuário
    ↓
Idade / Permissão
    ↓
Pode acessar?

pertencerá ao contexto de Identidade e Controle de Acesso, não ao MER editorial.

Status

✅ Relacionamento 009 aprovado

## Relacionamento 010 — Livro → Licença
Relacionamento aprovado
Livro (0..1) ─────────── (1) Licença

Ou representado pela perspectiva da Licença:

Licença (1) ─────────── (0..N) Livro
Regra de Negócio
Um Livro pode existir sem uma Licença enquanto estiver em estado de criação, revisão ou preparação.
Um Livro publicado publicamente deve possuir uma Licença definida.
Uma Licença pode estar associada a vários Livros.
A Licença representa a regra principal de utilização da obra.
Responsabilidades
Livro

Responsável por:

informar a licença aplicada à obra;
permitir que leitores e plataforma conheçam as regras de utilização.

Exemplo:

Livro:
Cultura Cigana

Licença:
Todos os direitos reservados
Licença

Responsável por:

padronizar modelos de direitos de uso;
evitar duplicação de regras;
permitir evolução futura dos modelos de publicação.

Exemplo:

Licenças:

Todos os direitos reservados

Creative Commons BY

Creative Commons BY-NC

Domínio Público

Licença personalizada
Estados possíveis do Livro

Essa decisão permite uma evolução natural:

Livro
 |
 ├── Rascunho
 │       |
 │       └── Sem licença
 │
 ├── Revisão
 │       |
 │       └── Licença opcional
 │
 └── Publicado
         |
         └── Licença obrigatória

A obrigatoriedade fica na regra de publicação, não no relacionamento conceitual.

Justificativa

Manter a Licença opcional evita:

bloquear criação de conteúdo;
obrigar decisões antecipadas;
dificultar fluxo editorial.

Ao mesmo tempo, preserva a responsabilidade jurídica no momento correto: a publicação.

Status

✅ Relacionamento 010 aprovado

## Relacionamento 011 — Usuário → Papel
Relacionamento
Usuário (N) ─────────── (N) Papel

Entidade associativa:

Usuário
     │
     │
Usuário_Papel
     │
     │
   Papel
Regra de Negócio
Todo usuário criado na plataforma possui automaticamente as permissões básicas de leitura.
O papel Leitor não é persistido como entidade.
Os papéis representam apenas permissões adicionais concedidas ao usuário.
Um usuário pode possuir nenhum, um ou vários papéis adicionais.
Um papel pode ser atribuído a vários usuários.
Papéis previstos

Nesta fase do domínio, podemos considerar:

Autor

Moderador

Administrador

Curador

Organização

Revisor

Essa lista poderá crescer no futuro sem alterar a estrutura do MER.

Justificativa

Essa abordagem reduz a complexidade do modelo e elimina registros redundantes.

Ao invés de armazenar milhões de relacionamentos "Usuário → Leitor", o sistema assume que a leitura é uma capacidade inerente a qualquer usuário autenticado. Os papéis passam a representar apenas permissões especiais.

Status

✅ Relacionamento 011 aprovado

## Relacionamento 012 — Usuário → Perfil do Autor
Primeiro conceito

Precisamos responder:

Um Autor é um tipo de Usuário ou um Perfil de Usuário?

Essa pergunta já foi respondida na modelagem do domínio.

Nossa decisão foi:

O Autor não é uma identidade diferente.

O Autor é um perfil público opcional de um Usuário.

Essa decisão evita problemas como:

contas duplicadas;
login diferente para autor e leitor;
sincronização de dados;
dificuldade para um leitor tornar-se autor.
Modelo aprovado
Usuário
     │
     │ 1 : 0..1
     ▼
Perfil do Autor

Ou seja:

Um Usuário pode não possuir um Perfil do Autor.
Um Usuário pode possuir apenas um Perfil do Autor.
Todo Perfil do Autor pertence obrigatoriamente a um único Usuário.
Por que não é 1:N?

Imagine:

Henry

Você poderia escrever:

livros técnicos;
romances;
livros infantis.

Mesmo utilizando pseudônimos no futuro, todos pertencem à mesma identidade da plataforma.

O que muda é a forma de apresentação, não a identidade.

Se algum dia a plataforma precisar suportar múltiplos pseudônimos por usuário, isso pode ser uma evolução do Perfil do Autor, sem alterar a identidade do usuário.

Responsabilidades
Usuário

Representa:

identidade;
autenticação;
segurança;
dados da conta;
assinatura;
histórico de leitura;
permissões.
Perfil do Autor

Representa apenas a presença pública do escritor.

Exemplos:

nome de exibição;
biografia;
fotografia;
redes sociais;
site pessoal;
formação;
apresentação pública;
livros publicados.

Observe que ele não contém dados de autenticação nem de permissões.

Regra de Negócio
Todo Perfil do Autor pertence obrigatoriamente a um Usuário.
Um Usuário pode existir sem Perfil do Autor.
Um Perfil do Autor não pode existir sem um Usuário.
A criação do Perfil do Autor é opcional e normalmente ocorre quando o usuário decide publicar obras.
Representação no MER
Usuário (1)
      │
      │ 0..1
      ▼
Perfil do Autor
Exemplo
Usuário

Henry

↓

Perfil do Autor

Henry Fernando

Outro exemplo:

Usuário

Maria

↓

(não possui Perfil do Autor)

Maria continua podendo:

ler livros;
comentar;
favoritar;
assinar planos.

Apenas não publica obras.

Status
Relacionamento 012 — Usuário → Perfil do Autor

Cardinalidade:

Usuário (1) ─────────── (0..1) Perfil do Autor

Status: ✅ Aprovado
