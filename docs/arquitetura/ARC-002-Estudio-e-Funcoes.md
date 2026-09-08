# ARC-002 — Estúdio e Funções

## Objetivo

Registrar as decisões conceituais referentes ao **Estúdio da Plataforma de Livros Interativos**, à distinção entre as funções exercidas pelos usuários e à relação entre Autor, Editor e Obra.

Este documento complementa o princípio definido em `PA-001-Interacao-Autor.md`, segundo o qual a experiência do autor deve vir primeiro.

---

## 1. Estúdio

A plataforma terá uma área denominada **Estúdio**.

O Estúdio é a ferramenta destinada à criação, organização e desenvolvimento das obras.

A escolha do nome **Estúdio** evita confundir a ferramenta com a função de **Editor**.

### Conceitos

- **Biblioteca**: experiência de leitura e consumo das obras.
- **Estúdio**: ambiente de criação, organização e desenvolvimento das obras.
- **Autor**: função de domínio relacionada à responsabilidade e autoria da obra.
- **Editor**: função de domínio relacionada à colaboração na edição de uma obra.

O termo **Editor** não deve ser usado como sinônimo da área de criação da plataforma.

---

## 2. Autor e Editor

**Autor e Editor são funções distintas.**

Um usuário pode exercer diferentes funções na plataforma, conforme as regras de habilitação e autorização definidas para cada uma delas.

Neste momento, não serão implementadas todas as funções possíveis. Entre as funções consideradas para evolução futura estão:

- Autor
- Editor
- Curador
- Moderador
- Revisor

A existência dessas funções como conceito não implica que todas estejam implementadas.

---

## 3. Responsabilidade do Autor sobre a Obra

O Autor é responsável pela criação da obra.

O Autor possui a capacidade de criar uma obra quando tiver a permissão correspondente:

```text
obra.criar
```

O Autor também é responsável por decidir quais Editores poderão trabalhar em sua obra.

A regra conceitual estabelecida é:

> **É o Autor quem concede ao Editor acesso à Obra.**

---

## 4. Acesso do Editor à Obra

Possuir a função **Editor** e a permissão:

```text
obra.editar
```

não significa ter acesso irrestrito a todas as obras da plataforma.

Existe uma distinção entre:

### Capacidade

```text
usuário → papel → permissão

EDITOR → obra.editar
```

A permissão representa a capacidade de realizar uma operação de edição.

### Escopo

```text
EDITOR
   +
autorização do Autor
   ↓
Obra específica
```

O Editor poderá trabalhar somente nas obras para as quais tenha recebido autorização.

O mecanismo técnico dessa autorização ainda deverá ser definido e implementado em etapa própria.

---

## 5. Estúdio e Obras

A área do Estúdio será responsável pela experiência de construção da obra.

A navegação deverá acompanhar progressivamente a estrutura editorial:

```text
Estúdio
  ↓
Obra
  ↓
Capítulo
  ↓
Cena
  ↓
Conteúdos
```

As escolhas pertencem ao contexto da Cena:

```text
Cena
├── Conteúdos
│   ├── Texto
│   ├── Imagem
│   ├── Áudio
│   └── Vídeo
│
└── Escolhas
```

A estrutura deve permitir que o usuário trabalhe na obra sem precisar conhecer a complexidade interna do motor da plataforma.

Essa decisão está alinhada ao princípio registrado em `PA-001-Interacao-Autor.md`:

> O autor deve pensar em histórias, não em tecnologia.

---

## 6. Navegação Mobile-First

A experiência do Estúdio será projetada com abordagem **mobile-first**.

A interface não deverá ser uma experiência desktop simplesmente reduzida para telas menores.

A navegação deverá utilizar **progressão de contexto**, evitando apresentar toda a estrutura da obra em uma única tela.

Cada nível deverá possuir uma responsabilidade clara e uma forma simples de retornar ao nível anterior.

Exemplo conceitual:

```text
Estúdio
   ↓
Obra
   ↓
Capítulo
   ↓
Cena
   ↓
Conteúdo
```

A implementação das rotas e componentes será realizada de forma incremental.

---

## 7. Rotas do Estúdio

A área anteriormente denominada `/editor` passa a utilizar `/estudio`.

Estrutura inicial:

```text
/estudio
/estudio/nova-obra
/estudio/obras/[id]
```

A página `/estudio` representa a entrada do Estúdio.

A página `/estudio/nova-obra` representa o início da criação de uma nova obra.

A página `/estudio/obras/[id]` representa a entrada para o desenvolvimento de uma obra específica.

Novas rotas serão acrescentadas conforme cada nível da estrutura editorial for implementado.

---

## 8. Tutorial e Habilitação de Funções — Direcionamento Futuro

Existe a intenção de oferecer tutoriais específicos para as diferentes funções da plataforma.

O conceito considerado é:

```text
Usuário
   ↓
solicitação de função
   ↓
processo de habilitação/aprovação
   ↓
tutorial da função
   ↓
função habilitada
```

Essa regra ainda não está completamente definida e não deve ser tratada como requisito implementado.

Entre as possibilidades futuras está a cobrança pelos tutoriais.

As regras financeiras relacionadas a tutoriais serão definidas posteriormente, junto às demais regras financeiras da plataforma.

---

## 9. Funções Futuras

Além de Autor e Editor, a plataforma poderá trabalhar futuramente com funções como:

```text
Autor
Editor
Curador
Moderador
Revisor
```

O mesmo princípio poderá ser aplicado a essas funções:

- cada função possui capacidades específicas;
- o acesso às funcionalidades depende das permissões correspondentes;
- quando necessário, o acesso deverá possuir escopo definido;
- a experiência de uso deverá ser orientada por tutoriais apropriados.

Essas funções não fazem parte da implementação atual do Estúdio.

---

## 10. Decisões Estabelecidas

### Decidido

1. A ferramenta de criação e desenvolvimento será denominada **Estúdio**.
2. A rota principal da ferramenta será `/estudio`.
3. **Editor** não será utilizado como sinônimo da ferramenta.
4. Autor e Editor são funções distintas.
5. O Autor é responsável pela obra e concede acesso a Editores.
6. `obra.editar` representa capacidade, não acesso irrestrito a todas as obras.
7. O Editor trabalha somente nas obras para as quais recebeu autorização.
8. O Estúdio utilizará navegação progressiva.
9. A experiência será projetada com abordagem mobile-first.
10. A estrutura narrativa seguirá o fluxo Obra → Capítulo → Cena → Conteúdos.
11. Escolhas pertencem ao contexto da Cena.
12. A implementação será incremental, sem antecipar estruturas ainda não definidas.

### Direcionamento futuro

Ainda deverão ser definidas:

- mecanismo técnico de convite/autorização do Editor;
- regras completas para aquisição/habilitação das funções;
- aprovação de usuários para funções específicas;
- tutoriais das funções;
- regras financeiras dos tutoriais;
- regras detalhadas das funções de Curador, Moderador e Revisor.

---

## 11. Relação com outros documentos

Este documento deve ser interpretado em conjunto com:

```text
PA-001-Interacao-Autor.md
NA-001-Estrutura-de-cenas.md
ARC-001-Estrutura-Backend.md
```

O `PA-001` estabelece o princípio de experiência do autor.

O `NA-001` registra a estrutura de cenas.

O `ARC-001` registra aspectos estruturais do backend.

Este documento registra especificamente as decisões sobre o **Estúdio, as funções e a relação Autor × Editor × Obra**.


---

## 12. Ajuda no Estúdio

O Estúdio deverá possuir uma funcionalidade denominada **Ajuda**.

O termo "Ajuda" será utilizado na interface por ser mais adequado ao contexto da Plataforma Leitura do que o termo "Help".

A Ajuda deverá acompanhar o usuário durante a navegação pelo Estúdio e oferecer suporte adequado ao contexto em que ele estiver trabalhando.

### Estrutura conceitual

```text
Ajuda
├── Dúvidas rápidas
├── Ajuda contextual
└── Tutorial do Estúdio
```

### Dúvidas rápidas

Destinadas a perguntas simples e frequentes que possam ser respondidas de forma objetiva, sem interromper o fluxo de trabalho.

### Ajuda contextual

O conteúdo apresentado deverá considerar o nível atual da navegação.

Exemplos:

```text
Obra
└── Ajuda sobre informações e organização da obra

Capítulo
└── Ajuda sobre criação e organização de capítulos

Cena
└── Ajuda sobre criação, organização e funcionamento das cenas

Conteúdo
└── Ajuda sobre texto, imagem, áudio, vídeo e ordenação dos conteúdos
```

A Ajuda contextual deverá evitar apresentar ao usuário informações que não sejam relevantes para a tarefa atual.

### Tutorial do Estúdio

O tutorial terá caráter mais abrangente e deverá ensinar o funcionamento da ferramenta de criação e organização de obras.

O tutorial é conceitualmente diferente da Ajuda contextual:

```text
Ajuda contextual
→ resolve uma dúvida durante o trabalho.

Tutorial
→ ensina o usuário a utilizar o Estúdio.
```

Os tutoriais específicos relacionados às funções/títulos de usuário e suas possíveis regras de habilitação ou cobrança permanecem como direcionamento futuro e serão definidos em etapa própria.

### Princípio de UX

A Ajuda deverá reduzir a complexidade percebida pelo Autor, e não acrescentar complexidade à interface.

A funcionalidade deve estar disponível de forma acessível nas diferentes etapas do Estúdio, mantendo a abordagem **mobile-first** e a navegação progressiva definida neste documento.

### Organização dos capítulos

A criação de um capítulo não exige que o Autor defina manualmente sua posição na obra.

O sistema atribuirá uma `ordem_exibicao` inicial automaticamente.

A reorganização da sequência dos capítulos será tratada como uma função própria do Estúdio, distinta da criação ou edição das informações do capítulo.

A interface deverá tornar essa possibilidade perceptível ao Autor através de uma ação de organização, sem expor o campo técnico `ordem_exibicao` como parte da experiência editorial normal.

A forma de interação para reorganização dos capítulos será definida posteriormente.
