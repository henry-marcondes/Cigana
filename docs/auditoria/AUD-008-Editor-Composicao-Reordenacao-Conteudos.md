# AUD-008 --- Editor: Composição e Reordenação de Conteúdos

## 1. Objetivo

Documentar a implementação frontend da tela de Composição de uma Cena no
Editor da Plataforma Leitura, especialmente a edição local e
persistência da ordem dos conteúdos através do endpoint de reordenação
já validado no backend.

Esta documentação complementa:

`docs/auditoria/AUD-007-Reordenacao-Conteudos-Cena.md`

A operação representa a composição narrativa da cena.

Estrutura editorial:

**Obra → Capítulos → Cenas → Conteúdos**

Tipos de conteúdo:

-   TEXTO
-   IMAGEM
-   AUDIO
-   VIDEO

------------------------------------------------------------------------

## 2. Localização no frontend

A tela está localizada em:

`src/app/estudio/obras/[id]/capitulos/[capituloId]/cenas/[cenaId]/composicao/page.jsx`

A nomenclatura adotada é **Composição da cena**.

O projeto utiliza `/estudio` como área atual do Editor/Estúdio. Não
alterar essa nomenclatura sem decisão explícita.

------------------------------------------------------------------------

## 3. Responsabilidade da tela

A tela de Composição possui responsabilidade exclusiva sobre a
**ordenação dos conteúdos que já pertencem à composição da cena**.

Ela permite:

-   visualizar os conteúdos atualmente pertencentes à composição;
-   mover conteúdos para cima;
-   mover conteúdos para baixo;
-   manter as alterações de ordem somente no estado local durante a
    edição;
-   salvar a composição completa em uma única chamada à API.

A tela NÃO deve ser responsável por:

-   criar conteúdo de texto;
-   criar imagem;
-   criar áudio;
-   criar vídeo;
-   inserir conteúdo na composição;
-   remover conteúdo da composição.

Para inserir ou remover conteúdo, o usuário deve retornar à tela
anterior da cena.

------------------------------------------------------------------------

## 4. Decisão de UX

Foi deliberadamente adotado o seguinte fluxo:

``` text
Tela da cena
    ↓
Composição
    ↓
movimentações locais ↑ ↓
    ↓
Salvar alterações
    ↓
PATCH /api/cena-conteudos/reordenar
```

Adicionar ou remover conteúdos ocorre fora da tela de Composição:

``` text
Composição
    ↓
Voltar para cena
    ↓
Adicionar/remover conteúdo
    ↓
retornar à Composição
```

### Motivo

O endpoint de reordenação recebe a composição completa. Não é necessário
fazer uma chamada ao backend a cada movimento.

Isso reduz:

-   requisições HTTP;
-   transações no banco;
-   processamento desnecessário;
-   estados intermediários;
-   latência durante a edição.

Também deixa clara a diferença entre:

**editar a composição** e **alterar os elementos que pertencem à
composição**.

------------------------------------------------------------------------

## 5. Endpoint utilizado

A persistência da ordem utiliza exclusivamente:

``` http
PATCH /api/cena-conteudos/reordenar
```

Request:

``` json
{
  "cena_id": "UUID",
  "ordem": [
    { "id": "UUID" },
    { "id": "UUID" }
  ]
}
```

O frontend NÃO envia `ordem_exibicao`.

A posição do item no array `ordem` determina a nova ordem.

O backend é responsável por validar a composição e persistir a sequência
em transação.

------------------------------------------------------------------------

## 6. Comportamento de movimentação

Os botões `↑` e `↓` não fazem chamadas à API.

Eles somente reorganizam o array local `conteudos`.

Exemplo:

``` text
Antes:

1 TEXTO
2 IMAGEM
3 AUDIO
4 VIDEO
```

Ao mover IMAGEM para cima:

``` text
1 IMAGEM
2 TEXTO
3 AUDIO
4 VIDEO
```

Nenhum PATCH é executado nesse momento.

O frontend passa a considerar que existem alterações não salvas.

------------------------------------------------------------------------

## 7. Persistência

Quando o usuário seleciona:

**Salvar alterações**

o frontend envia uma única requisição:

``` http
PATCH /api/cena-conteudos/reordenar
```

com todos os IDs na nova sequência.

Exemplo:

``` json
{
  "cena_id": "501768dc-7161-478a-b8dc-2e0d1cfbc6bd",
  "ordem": [
    { "id": "a3fbeea1-7feb-4d00-8e91-39f737eec84c" },
    { "id": "7ad28109-a4f9-41ca-aa5d-d22053605ac6" },
    { "id": "16e9f938-f9b1-477d-b51b-80ea15bede1b" },
    { "id": "c8613760-0def-4570-b3de-887fb6178b30" }
  ]
}
```

Após sucesso, o frontend atualiza sua referência de ordem original e
considera a composição salva.

------------------------------------------------------------------------

## 8. Detecção de alterações

A página mantém:

``` js
const [conteudos, setConteudos] = useState([]);
const [ordemOriginal, setOrdemOriginal] = useState([]);
```

`conteudos` representa a composição atualmente editada.

`ordemOriginal` representa a última composição conhecida como
persistida.

A função `possuiAlteracoes()` compara os IDs nas duas sequências.

Quando não existem alterações:

-   o botão **Salvar alterações** fica desabilitado.

Quando existem alterações:

-   o botão fica habilitado;
-   a interface informa que existem alterações não salvas.

Se o usuário mover itens e depois retornar exatamente à ordem original,
o sistema novamente reconhece que não existem alterações.

------------------------------------------------------------------------

## 9. Tratamento de erro

O frontend somente atualiza `ordemOriginal` após o PATCH retornar
sucesso.

Se a API falhar:

-   a nova ordem continua visível localmente;
-   a alteração continua marcada como não salva;
-   a mensagem de erro é apresentada;
-   o usuário pode tentar salvar novamente.

A composição persistida no backend não é considerada alterada até o
sucesso da operação.

------------------------------------------------------------------------

## 10. Estado durante salvamento

Durante o `Salvar alterações`:

``` text
salvando = true
```

Enquanto salva:

-   movimentações ficam desabilitadas;
-   o botão de voltar fica desabilitado;
-   o botão mostra `Salvando...`.

Após sucesso ou erro:

``` text
salvando = false
```

------------------------------------------------------------------------

## 11. Carregamento inicial

Ao abrir a tela, a página executa:

``` http
GET /api/cena-conteudos/cena/:cenaId
```

O resultado é ordenado por `ordem_exibicao`.

A ordem retornada é usada para inicializar:

``` text
conteudos
ordemOriginal
```

A resposta do endpoint contém os vínculos de composição, por exemplo:

``` json
{
  "id": "UUID",
  "cena_id": "UUID",
  "tipo_conteudo": "TEXTO",
  "conteudo_id": "UUID",
  "ordem_exibicao": 1,
  "ativo": true
}
```

O endpoint de composição não retorna os dados completos do conteúdo.

------------------------------------------------------------------------

## 12. Relação com CenaConteudo.jsx

O componente existente:

`src/components/CenaConteudo.jsx`

é responsável pela **renderização da experiência de leitura** e espera
uma estrutura contendo:

``` js
{
  tipo_conteudo,
  dados
}
```

O endpoint de composição retorna somente:

``` js
{
  id,
  cena_id,
  tipo_conteudo,
  conteudo_id,
  ordem_exibicao,
  ...
}
```

Portanto, na implementação atual, `CenaConteudo.jsx` não é utilizado
diretamente para representar cada item da lista administrativa da
Composição.

Não criar uma segunda implementação de `CenaConteudo.jsx` sem
necessidade.

Caso futuramente a composição passe a exibir prévias reais de texto,
imagem, áudio e vídeo, deve-se avaliar uma transformação/reuso
controlado da lógica existente, preservando a responsabilidade da
Biblioteca.

------------------------------------------------------------------------

## 13. Adicionar e remover conteúdos

A decisão atual é:

### Composição

Responsável por:

``` text
ORDENAR
```

### Tela da cena / telas específicas

Responsáveis por:

``` text
CRIAR
INSERIR
REMOVER
```

A tela de composição não deve voltar a incorporar os controles de
adicionar/remover sem uma nova decisão de arquitetura/UX.

Essa separação evita o problema de uma composição possuir alterações
locais de ordem enquanto, simultaneamente, conteúdos são inseridos ou
removidos.

------------------------------------------------------------------------

## 14. Estado validado na implementação

Foi utilizado como cenário de teste uma cena contendo quatro conteúdos:

``` text
TEXTO
IMAGEM
AUDIO
VIDEO
```

A composição foi reorganizada no frontend para:

``` text
1 VIDEO
2 TEXTO
3 IMAGEM
4 AUDIO
```

O frontend apresentou:

``` text
Ordem dos conteúdos salva com sucesso.
```

O GET posterior realizado pelo Bruno confirmou:

``` text
VIDEO  → ordem_exibicao = 1
TEXTO  → ordem_exibicao = 2
IMAGEM → ordem_exibicao = 3
AUDIO  → ordem_exibicao = 4
```

Os `id` de `cena_conteudos` permaneceram os mesmos; somente
`ordem_exibicao` foi reorganizada.

------------------------------------------------------------------------

## 15. Backend relacionado

O backend já estava implementado, testado e documentado antes desta
etapa.

Documento de referência:

`docs/auditoria/AUD-007-Reordenacao-Conteudos-Cena.md`

O backend possui as seguintes garantias:

-   cena deve existir;
-   todos os conteúdos ativos da cena devem estar presentes;
-   não pode haver IDs repetidos;
-   todos os IDs devem pertencer à cena;
-   reordenação ocorre em transação;
-   ordens temporárias evitam colisão com a restrição UNIQUE;
-   operação utiliza `COMMIT`/`ROLLBACK`.

O frontend não deve reproduzir essas regras de negócio.

------------------------------------------------------------------------

## 16. Diferenciação das operações

Continuam existindo duas operações distintas no backend:

### Alteração individual

``` http
PATCH /api/cena-conteudos/:id/ordem
```

### Reordenação da composição

``` http
PATCH /api/cena-conteudos/reordenar
```

A tela de Composição do Editor utiliza:

``` http
PATCH /api/cena-conteudos/reordenar
```

A existência da operação individual não justifica voltar a fazer PATCH a
cada clique de ↑/↓.

------------------------------------------------------------------------

## 17. Regra para futuras alterações

Qualquer alteração futura nesta tela deve preservar estas premissas,
salvo nova decisão explícita:

1.  A tela representa a composição narrativa da cena.
2.  A ordenação é editada localmente.
3.  ↑ e ↓ não fazem chamadas ao backend.
4.  A persistência da ordem ocorre através de uma única chamada ao
    endpoint de reordenação.
5.  O payload deve conter `cena_id` e `ordem[{ id }]`.
6.  O frontend não deve enviar `ordem_exibicao` no endpoint de
    reordenação.
7.  Inserção e remoção não fazem parte da tela de Composição.
8.  O backend continua sendo a autoridade sobre integridade e regras de
    negócio.
9.  Não alterar o contrato do backend sem necessidade comprovada.
10. Não alterar a Biblioteca para resolver uma necessidade específica do
    Editor sem antes avaliar a separação de responsabilidades.

------------------------------------------------------------------------

## 18. Próxima etapa

A etapa de reordenação funcional do Editor está concluída e validada.

A próxima frente do Editor será tratada separadamente:

**Escolhas da Cena**

A implementação deve começar por inspeção do frontend e dos
contratos/backend já existentes, seguindo a metodologia:

**inspecionar → decidir → implementar → validar → documentar**

Não presumir estruturas novas antes de verificar o código existente.

------------------------------------------------------------------------

## 19. Status

**AUD-008 --- concluída**

Status:

-   [x] Tela de composição identificada
-   [x] Fluxo de ordenação local definido
-   [x] Inclusão/remoção separadas da composição
-   [x] Endpoint `PATCH /api/cena-conteudos/reordenar` integrado
-   [x] Persistência em lote validada
-   [x] Persistência confirmada via Bruno
-   [x] Regras de UX documentadas
-   [x] Regras para futuras alterações documentadas
