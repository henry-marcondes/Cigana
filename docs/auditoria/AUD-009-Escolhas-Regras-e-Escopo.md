
# AUD-009 — Escolhas: Regras e Escopo

## 1. Objetivo

Este documento registra as decisões conceituais e regras de negócio definidas para a entidade **Escolhas** da Plataforma Leitura.

A finalidade é servir como referência para futuras implementações, alterações no backend, desenvolvimento do Editor e evolução da experiência de leitura da Biblioteca.

Este documento deve ser considerado complementar à documentação de composição e reordenação de conteúdos registrada em:

```text
docs/auditoria/AUD-008-Editor-Composicao-Reordenacao-Conteudos
```

A implementação técnica das decisões aqui registradas será realizada posteriormente, em etapa própria.

---

# 2. Conceito de Escolha

Uma **Escolha** representa uma opção narrativa apresentada ao leitor em uma determinada cena.

Ao selecionar uma escolha, o leitor é direcionado para uma cena de destino.

A relação fundamental é:

```text
Cena de origem
      │
      └── Escolha
             │
             └──→ Cena de destino
```

A Escolha, portanto, funciona como uma conexão entre duas cenas dentro do universo narrativo de uma obra.

---

# 3. Estrutura editorial

A estrutura editorial da Plataforma é:

```text
Obra
  └── Capítulos
       └── Cenas
            ├── Conteúdos
            └── Escolhas
```

Os conteúdos representam a composição apresentada na cena.

As escolhas representam as possibilidades de continuidade narrativa.

A ordem dos conteúdos e a ordem das escolhas são conceitos independentes.

---

# 4. Estrutura atual da entidade

A tabela `escolhas` possui atualmente:

```text
id
cena_origem_id
cena_destino_id
texto
ordem_exibicao
ativo
criado_em
atualizado_em
```

Relacionamentos:

```text
cena_origem_id → cenas.id
cena_destino_id → cenas.id
```

A Escolha possui uma cena de origem e uma cena de destino.

---

# 5. Cena de origem

`cena_origem_id` identifica a cena na qual a escolha será apresentada ao leitor.

Exemplo:

```text
Cena A
 ├── Escolha 1
 ├── Escolha 2
 └── Escolha 3
```

Todas essas escolhas possuem `cena_origem_id` correspondente à Cena A.

A cena de origem também é o recurso utilizado para determinar a obra à qual a operação pertence quando a requisição fornece `cena_origem_id`.

---

# 6. Cena de destino

`cena_destino_id` identifica a cena para a qual o leitor será encaminhado quando selecionar a escolha.

Exemplo:

```text
Cena A
 ├── "Entrar na floresta"    → Cena B
 ├── "Seguir pela estrada"   → Cena C
 └── "Voltar"                → Cena D
```

A cena destino é independente da ordem de exibição da escolha.

## 6.1 Destino obrigatório

Foi definida a regra de negócio:

> Toda Escolha deve possuir uma cena de destino.

Portanto:

```text
cena_destino_id = obrigatório
```

A possibilidade atualmente existente na estrutura do banco de permitir `NULL` deverá ser ajustada em etapa técnica posterior.

---

# 7. Pertencimento à mesma obra

A cena destino deve obrigatoriamente pertencer à mesma obra da cena de origem.

Regra:

```text
obra(cena_origem) == obra(cena_destino)
```

Exemplo válido:

```text
Obra A
│
├── Capítulo 1
│    └── Cena A
│         └── Escolha → Cena B
│
└── Capítulo 2
     └── Cena B
```

Exemplo inválido:

```text
Obra A
└── Cena A
     └── Escolha → Cena X

Obra B
└── Cena X
```

Uma Escolha não pode conectar cenas pertencentes a obras diferentes.

Essa validação é uma regra de negócio da entidade Escolha e deve ser tratada no `EscolhaService`.

---

# 8. Navegação entre capítulos

Não existe restrição de que a cena destino pertença ao mesmo capítulo da cena origem.

Uma Escolha pode direcionar o leitor para:

* outra cena do mesmo capítulo;
* outra cena de outro capítulo;
* uma cena anterior;
* uma cena posterior;
* uma cena de convergência;
* qualquer outra cena válida da mesma obra.

Exemplo:

```text
Obra: Cultura Cigana

Capítulo 1
│
├── Cena A
│    ├── Escolha 1 → Cena B
│    └── Escolha 2 → Cena C
│
└── Cena B
     └── Escolha → Cena D

Capítulo 2
│
└── Cena C
     └── Escolha → Cena D
```

Esse fluxo é válido.

Não deve existir regra de negócio exigindo:

```text
mesmo capítulo
```

nem:

```text
próximo capítulo
```

nem:

```text
ordem posterior
```

A obra é o limite do universo narrativo.

---

# 9. A obra como limite narrativo

A estrutura de Escolhas permite representar a obra como um grafo de cenas.

Exemplo:

```text
                 Cena B
                ↗
Cena A ─────────
        \
         └────→ Cena C
                 │
                 └────→ Cena D
```

As conexões podem representar:

* caminhos divergentes;
* caminhos convergentes;
* retorno a cenas anteriores;
* saltos entre capítulos;
* múltiplos caminhos para a mesma cena;
* diferentes finais;
* estruturas narrativas não lineares.

Não deve ser imposta uma navegação linear entre capítulos ou cenas.

---

# 10. `ordem_exibicao`

`ordem_exibicao` representa exclusivamente a posição da escolha dentro da cena de origem.

**Não representa o destino da escolha.**

Exemplo:

```text
Cena A

Escolha 1
texto: "Entrar na floresta"
ordem_exibicao: 1
destino: Cena B

Escolha 2
texto: "Seguir pela estrada"
ordem_exibicao: 2
destino: Cena C
```

A ordem e o destino são propriedades independentes.

---

# 11. Ordem relativa à cena

A ordem não é global na obra nem na plataforma.

Ela é relativa à `cena_origem_id`.

Portanto, é perfeitamente válido:

```text
Cena A
└── Escolha X → ordem 1

Cena B
└── Escolha Y → ordem 1

Cena C
└── Escolha Z → ordem 1
```

Não existe conflito entre essas escolhas.

---

# 12. Unicidade da ordem

Dentro de uma mesma cena de origem, duas escolhas ativas não devem possuir a mesma ordem.

Exemplo inválido:

```text
Cena A

Escolha X → ordem 1
Escolha Y → ordem 1
```

Exemplo válido:

```text
Cena A

Escolha X → ordem 1
Escolha Y → ordem 2
Escolha Z → ordem 3
```

A regra estrutural desejada é:

```sql
UNIQUE (cena_origem_id, ordem_exibicao)
WHERE ativo = TRUE
```

Essa restrição deverá ser adicionada em migration na etapa de implementação.

A mesma ordem pode existir em diferentes cenas.

---

# 13. Reordenação das escolhas

As escolhas de uma cena devem poder ser reordenadas como uma composição.

Está prevista a operação:

```http
PATCH /api/escolhas/reordenar
```

Request:

```json
{
  "cena_origem_id": "UUID",
  "ordem": [
    {
      "id": "UUID"
    },
    {
      "id": "UUID"
    },
    {
      "id": "UUID"
    }
  ]
}
```

A posição de cada elemento no array determina a nova `ordem_exibicao`.

Exemplo:

```json
{
  "ordem": [
    { "id": "ESCOLHA-C" },
    { "id": "ESCOLHA-A" },
    { "id": "ESCOLHA-B" }
  ]
}
```

resulta em:

```text
Escolha C → ordem 1
Escolha A → ordem 2
Escolha B → ordem 3
```

Os destinos das escolhas não são modificados pela reordenação.

---

# 14. Reordenação como composição

A reordenação representa a composição das opções disponíveis em uma cena.

A operação deve receber a composição completa das escolhas ativas da cena.

Não deve ser possível reordenar somente parte das escolhas ativas.

Caso a cena possua:

```text
Escolha A
Escolha B
Escolha C
```

a requisição deve conter:

```text
A
B
C
```

em alguma ordem.

---

# 15. Regras da reordenação

A operação deverá validar:

### Cena existente

A cena de origem deve existir.

Caso contrário:

```text
404
Cena não encontrada.
```

### Quantidade completa

A quantidade de escolhas recebidas deve ser igual à quantidade de escolhas ativas da cena.

Caso contrário:

```text
400
A ordem deve conter todas as escolhas ativas da cena.
```

### IDs únicos

Uma mesma escolha não pode aparecer mais de uma vez no array.

Caso contrário:

```text
400
A ordem não pode conter escolhas repetidas.
```

### Pertencimento

Todos os IDs recebidos devem corresponder a escolhas ativas pertencentes à cena de origem informada.

Caso contrário:

```text
400
Uma ou mais escolhas informadas não pertencem à cena.
```

---

# 16. Estratégia transacional da reordenação

A reordenação deverá ser realizada dentro de uma transação.

Fluxo conceitual:

```text
BEGIN
  ↓
validar cena
  ↓
buscar escolhas ativas
  ↓
validar quantidade
  ↓
validar IDs únicos
  ↓
validar pertencimento
  ↓
atribuir ordens temporárias
  ↓
atribuir ordens definitivas
  ↓
COMMIT
```

Em caso de erro:

```text
ROLLBACK
```

A estratégia deverá seguir o padrão já validado para `CenaConteudo`.

As ordens temporárias devem permanecer positivas para respeitar:

```sql
CHECK (ordem_exibicao > 0)
```

A implementação deverá evitar colisões temporárias com a restrição de unicidade.

---

# 17. Diferença entre alteração individual e reordenação

A alteração individual:

```http
PATCH /api/escolhas/:id/ordem
```

modifica a ordem de uma escolha específica.

A reordenação:

```http
PATCH /api/escolhas/reordenar
```

recebe a composição completa das escolhas da cena e define a sequência final.

As duas operações possuem finalidades diferentes e não devem ser confundidas.

---

# 18. Escopo da obra

A autorização das operações de edição deve continuar utilizando a arquitetura:

```text
usuário
   ↓
papel
   ↓
permissão
   ↓
obra
```

A permissão de negócio utilizada permanece:

```text
obra.editar
```

Não deve ser criada uma permissão específica como:

```text
escolha.editar
```

quando `obra.editar` já representa corretamente a capacidade de editar a obra.

---

# 19. EscopoObraService

O `EscopoObraService` é responsável por resolver o `livro_id` da obra à qual o recurso pertence.

Ele não deve implementar regras narrativas da Escolha.

Para operações identificadas por `cena_origem_id`, o escopo poderá ser resolvido através da cena:

```text
cena_origem_id
      ↓
Cena
      ↓
Capítulo
      ↓
livro_id
```

Para operações identificadas diretamente pelo ID da Escolha:

```text
escolha.id
      ↓
Escolha
      ↓
cena_origem_id
      ↓
Cena
      ↓
Capítulo
      ↓
livro_id
```

O resultado é utilizado pelo middleware:

```text
autorizarObra(...)
```

que consulta:

```text
AutorizacaoService.podeEditarObra(
    usuario_id,
    livro_id
)
```

---

# 20. Separação entre autorização e regra de negócio

A autorização e a validação narrativa possuem responsabilidades diferentes.

### Autorização

Responde:

> O usuário possui autorização para editar esta obra?

Fluxo:

```text
request
  ↓
EscopoObraService
  ↓
livro_id
  ↓
AutorizacaoService
  ↓
obra.editar
```

### Regra de negócio

Responde:

> A Escolha é válida dentro da obra?

Exemplos:

```text
cena destino existe?
cena destino pertence à mesma obra?
ordem é válida?
escolha pertence à cena?
```

Essas regras pertencem ao `EscolhaService`.

O `EscopoObraService` não deve assumir responsabilidades do `EscolhaService`.

---

# 21. Responsabilidades por camada

## Route

Responsável por:

* definir endpoints;
* autenticação;
* autorização da obra;
* validação;
* encaminhamento ao Controller.

Não deve conter regras de negócio.

---

## Validator

Responsável somente pela validação estrutural.

Exemplos:

* UUID válido;
* campo obrigatório;
* texto não vazio;
* ordem inteira maior que zero;
* array de reordenação;
* IDs válidos.

Não deve consultar banco para validar regras de negócio.

---

## Controller

Responsável por:

* receber a requisição;
* extrair os dados;
* chamar o Service;
* produzir a resposta HTTP.

Não deve conter regras de negócio.

---

## EscolhaService

Responsável pelas regras de negócio da entidade.

Incluindo:

* verificar existência das cenas;
* verificar validade da cena origem;
* verificar validade da cena destino;
* garantir que origem e destino pertencem à mesma obra;
* validar composição das escolhas;
* controlar a reordenação;
* coordenar transações quando necessário.

---

## Escolha Model

Responsável pela persistência dos registros de `escolhas`.

Operações de reordenação que participem de uma transação devem receber o `client` da transação, seguindo o padrão já adotado em `CenaConteudo`.

---

## EscopoObraService

Responsável exclusivamente por resolver o `livro_id` a partir do recurso informado.

Não deve validar regras narrativas específicas.

---

# 22. API atualmente existente

A implementação existente possui:

```http
GET /api/escolhas/cena/:cena_origem_id
GET /api/escolhas/:id

POST /api/escolhas/

PATCH /api/escolhas/:id/texto
PATCH /api/escolhas/:id/destino
PATCH /api/escolhas/:id/ordem

DELETE /api/escolhas/:id
```

As operações de escrita atualmente utilizam:

```text
obra.editar
```

para criação e alterações.

A desativação utiliza:

```text
obra.excluir
```

Esse comportamento deve ser preservado, salvo decisão posterior expressamente documentada.

---

# 23. Operações previstas para o Editor

O Editor deverá permitir ao usuário autorizado:

```text
Adicionar escolha
Editar texto
Definir/alterar destino
Reordenar escolhas
Desativar escolha
```

A escolha será tratada como parte da composição narrativa da cena.

A nomenclatura preferida permanece:

```text
Editar obra
```

e não "Editar livro", pois o Editor trabalha sobre a obra como um todo.

---

# 24. Experiência da Biblioteca

A Biblioteca não precisa conhecer a mecânica de edição ou reordenação.

Ela deverá consumir as escolhas ativas da cena na ordem definida pela API:

```text
Cena
  ↓
Escolhas
  ↓
ordem_exibicao
  ↓
opções apresentadas ao leitor
```

Ao selecionar uma escolha:

```text
Escolha
  ↓
cena_destino_id
  ↓
Cena destino
```

A navegação pode atravessar capítulos dentro da mesma obra.

---

# 25. Regras que NÃO devem ser implementadas

Não implementar as seguintes restrições:

### Não exigir mesmo capítulo

```text
cena origem e destino devem estar no mesmo capítulo
```

Não é uma regra válida.

### Não exigir capítulo seguinte

```text
destino deve estar no próximo capítulo
```

Não é uma regra válida.

### Não exigir ordem narrativa linear

```text
cena destino deve possuir ordem posterior
```

Não é uma regra válida.

### Não criar ordem global

```text
ordem 1 só pode existir uma vez na obra
```

Não é uma regra válida.

A ordem é relativa à cena de origem.

### Não usar `role` do JWT como fonte de autorização

A autorização continua sendo baseada no banco:

```text
usuário → papel → permissão → obra
```

### Não criar permissão específica desnecessária

Não criar:

```text
escolha.editar
```

quando:

```text
obra.editar
```

representa corretamente a capacidade de negócio.

### Não colocar regra de negócio no Validator

O Validator não deve determinar:

```text
destino pertence à obra?
```

ou:

```text
escolha pertence à cena?
```

Essas são regras do Service.

---

# 26. Ajustes de banco previstos

A estrutura atual deverá ser ajustada para refletir as regras consolidadas.

### Destino obrigatório

Atualmente:

```sql
cena_destino_id UUID
```

Deverá representar a regra:

```text
cena_destino_id NOT NULL
```

### Ordem única por cena

Deverá ser adicionada a proteção:

```sql
UNIQUE (cena_origem_id, ordem_exibicao)
WHERE ativo = TRUE
```

Essas alterações devem ser realizadas por migration própria e validadas antes de avançar.

---

# 27. Decisões consolidadas

As seguintes decisões estão oficialmente definidas:

* `cena_origem_id` identifica a cena onde a escolha aparece.
* `cena_destino_id` identifica a cena para onde o leitor será encaminhado.
* `cena_destino_id` é obrigatório.
* A cena destino deve pertencer à mesma obra da cena origem.
* O destino pode estar em qualquer capítulo da mesma obra.
* O destino pode ser qualquer cena válida da mesma obra.
* `ordem_exibicao` representa a posição da escolha dentro da cena de origem.
* A ordem não representa o destino.
* A mesma ordem pode existir em cenas diferentes.
* Não podem existir duas escolhas ativas com a mesma ordem na mesma cena.
* A reordenação será feita em lote.
* A reordenação receberá a composição completa das escolhas ativas da cena.
* A reordenação será transacional.
* A estratégia de reordenação seguirá o padrão validado em `CenaConteudo`.
* A autorização continuará utilizando `obra.editar`.
* O `EscopoObraService` continuará sendo responsável pela resolução do `livro_id`.
* As regras narrativas serão responsabilidade do `EscolhaService`.
* A Biblioteca apenas consome a sequência e realiza a navegação para a cena destino.
* Escolhas podem criar caminhos não lineares dentro da obra.

---

# 28. Referência arquitetural

O desenho conceitual consolidado é:

```text
                           OBRA
                            │
                ┌───────────┴───────────┐
                │                       │
           Capítulo 1              Capítulo 2
                │                       │
             Cena A                  Cena C
                │                       │
        ┌───────┴───────┐               │
        │               │               │
    Escolha 1        Escolha 2      Escolha 1
        │               │               │
        ▼               ▼               ▼
      Cena B          Cena C          Cena D
        │
        └──────────────→ Cena D
```

A obra funciona como o limite do grafo narrativo.

Cada Escolha representa uma conexão:

```text
Cena origem
     │
     ▼
  Escolha
     │
     ▼
Cena destino
```

A posição da escolha na cena é independente da cena destino:

```text
cena_origem_id
       │
       ├── texto
       ├── ordem_exibicao
       │
       └── cena_destino_id
```

---

# 29. Próxima etapa

Este documento encerra a etapa conceitual de Escolhas.

A próxima etapa será exclusivamente prática, seguindo a metodologia da Plataforma:

```text
inspecionar
    ↓
decidir
    ↓
implementar
    ↓
testar
    ↓
validar
    ↓
documentar
```

A implementação deverá começar pelo escopo e autorização da obra, preservando o padrão existente:

```text
Escolha
   ↓
EscopoObraService
   ↓
livro_id
   ↓
autorizarObra
   ↓
AutorizacaoService
   ↓
obra.editar
```

Depois serão implementadas e validadas, incrementalmente:

```text
integridade da Escolha
        ↓
ajustes de banco
        ↓
reordenação
        ↓
Bruno
        ↓
validação final
        ↓
documentação
```

Nenhuma alteração transversal ou refatoração não relacionada deve ser realizada durante essa etapa.
