
# Composição — Reordenação dos Conteúdos de uma Cena

## 1. Objetivo

A operação de reordenação permite alterar a sequência em que os conteúdos ativos de uma cena são apresentados na experiência de leitura.

A ordem faz parte da composição narrativa da cena.

A estrutura editorial considerada é:

**Obra → Capítulos → Cenas → Conteúdos**

Os conteúdos de uma cena podem ser:

* TEXTO
* IMAGEM
* AUDIO
* VIDEO

A sequência desses conteúdos é determinada pelo campo `ordem_exibicao`.

---

## 2. Endpoint

```http
PATCH /api/cena-conteudos/reordenar
```

### Autenticação

A operação exige autenticação.

### Autorização

A autorização é realizada por meio de:

```text
autorizarObra(EscopoObraService.porCenaConteudoBody)
```

A autorização utiliza o `livro_id` da obra resolvido pelo escopo correspondente.

A operação não deve criar uma regra de autorização específica para cada conteúdo individual.

---

## 3. Request

### Body

```json
{
  "cena_id": "UUID",
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

### Regra da ordem

A posição do conteúdo no array determina sua nova ordem.

Exemplo:

```json
{
  "ordem": [
    { "id": "ID-TEXTO" },
    { "id": "ID-IMAGEM" },
    { "id": "ID-AUDIO" },
    { "id": "ID-VIDEO" }
  ]
}
```

resulta em:

```text
ID-TEXTO  → ordem_exibicao = 1
ID-IMAGEM → ordem_exibicao = 2
ID-AUDIO  → ordem_exibicao = 3
ID-VIDEO  → ordem_exibicao = 4
```

O cliente não precisa enviar `ordem_exibicao`.

---

## 4. Validator

O Validator é responsável somente pela validação estrutural dos dados recebidos.

Regras:

* `cena_id` deve ser informado;
* `cena_id` deve ser um UUID válido;
* `ordem` deve ser um array com pelo menos um elemento;
* cada item de `ordem` deve possuir um `id`;
* cada `id` deve ser um UUID válido.

O Validator não verifica regras de negócio.

---

## 5. Regras de negócio

As regras de negócio são responsabilidade do `CenaConteudoService`.

### 5.1 A cena deve existir

Caso a cena não exista:

```text
404
Cena não encontrada.
```

### 5.2 A ordem deve conter todos os conteúdos ativos

A quantidade de IDs recebidos deve ser igual à quantidade de conteúdos ativos da cena.

Caso contrário:

```text
400
A ordem deve conter todos os conteúdos ativos da cena.
```

Isso impede que o cliente reordene somente parte dos conteúdos ativos.

### 5.3 Não são permitidos conteúdos repetidos

Todos os IDs recebidos devem ser únicos.

Caso contrário:

```text
400
A ordem não pode conter conteúdos repetidos.
```

### 5.4 Todos os conteúdos devem pertencer à cena

Cada ID recebido deve corresponder a um conteúdo ativo da própria cena informada.

Caso contrário:

```text
400
Um ou mais conteúdos informados não pertencem à cena.
```

---

## 6. Integridade da ordenação

A tabela `cena_conteudos` possui a restrição:

```sql
CHECK (ordem_exibicao > 0)
```

e um índice único parcial:

```sql
UNIQUE (cena_id, ordem_exibicao)
WHERE ativo = TRUE
```

Portanto, a alteração de ordem não pode simplesmente trocar diretamente os valores entre registros, pois isso poderia gerar conflito temporário com a restrição UNIQUE.

---

## 7. Estratégia de reordenação

A reordenação é realizada dentro de uma transação.

Fluxo:

```text
BEGIN
  ↓
validar cena
  ↓
buscar conteúdos ativos
  ↓
validar quantidade
  ↓
validar IDs únicos
  ↓
validar pertencimento à cena
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

### Ordens temporárias

As ordens temporárias devem permanecer dentro da regra:

```text
ordem_exibicao > 0
```

Por isso foi adotada a estratégia:

```text
quantidade = N
baseTemporaria = N + 1
```

Os conteúdos recebem temporariamente:

```text
N + 1
N + 2
...
2N
```

Somente depois são atribuídas as ordens definitivas:

```text
1
2
...
N
```

Essa estratégia evita colisões com as ordens normais e respeita a restrição `CHECK`.

---

## 8. Responsabilidades por camada

### Route

Define:

```http
PATCH /api/cena-conteudos/reordenar
```

e aplica:

* autenticação;
* autorização da obra;
* validação;
* controller.

### Controller

Recebe:

```text
cena_id
ordem
```

e delega a operação ao Service.

Não contém regra de negócio.

### Service

Responsável por:

* verificar existência da cena;
* buscar conteúdos ativos;
* validar quantidade;
* validar duplicidade;
* validar pertencimento;
* abrir transação;
* executar a reordenação;
* realizar `COMMIT`;
* realizar `ROLLBACK` em caso de erro.

### Model

Responsável pelas operações de persistência dos registros de `cena_conteudos`.

O método `reordenar` recebe o `client` da transação para que suas operações façam parte da mesma transação aberta pelo Service.

---

## 9. Diferenciação de operações

A operação de reordenação em lote não substitui a operação individual:

```http
PATCH /api/cena-conteudos/:id/ordem
```

As duas operações possuem finalidades diferentes.

### Alteração individual

```http
PATCH /api/cena-conteudos/:id/ordem
```

Altera a ordem de um conteúdo específico.

### Reordenação da composição

```http
PATCH /api/cena-conteudos/reordenar
```

Recebe a composição completa dos conteúdos ativos da cena e define sua sequência final.

---

## 10. Testes validados

A operação foi validada através do Bruno.

### Caso válido

Resultado:

```text
200 OK
```

A ordem foi alterada de:

```text
IMAGEM → AUDIO → VIDEO → TEXTO
```

para:

```text
TEXTO → IMAGEM → AUDIO → VIDEO
```

Um `GET` posterior confirmou a persistência da nova ordem no banco.

### Ordem incompleta

Request contendo somente parte dos conteúdos ativos.

Resultado:

```text
400
A ordem deve conter todos os conteúdos ativos da cena.
```

### Conteúdo repetido

Request contendo o mesmo conteúdo mais de uma vez.

Resultado:

```text
400
A ordem não pode conter conteúdos repetidos.
```

### Conteúdo pertencente a outra cena

Request contendo um conteúdo existente, porém pertencente a outra cena.

Resultado:

```text
400
Um ou mais conteúdos informados não pertencem à cena.
```

---

## 11. Decisão arquitetural

A reordenação representa uma operação de **composição da cena**.

A responsabilidade pela sequência dos conteúdos permanece na entidade `cena_conteudos`, através de `ordem_exibicao`.

O Editor deverá manipular a composição completa da cena e enviar a nova sequência ao endpoint de reordenação.

A Biblioteca não deve precisar conhecer a mecânica de reordenação. Ela apenas consome os conteúdos ordenados pela API.

---

## 12. Integração da criação e exclusão de conteúdos com a composição

### 12.1 Objetivo

Garantir que os conteúdos criados nas telas específicas da cena sejam automaticamente vinculados à composição por meio da tabela `cena_conteudos`.

A composição continua sendo responsável exclusivamente pela ordenação dos conteúdos já vinculados.

### 12.2 Fluxo de criação

As telas de Textos, Imagens, Áudios e Vídeos passaram a executar duas operações ao criar um conteúdo:

1. Criar o registro na tabela específica do tipo de conteúdo.
2. Criar o vínculo correspondente em `cena_conteudos`.

O fluxo adotado é:

```text
Cadastro do conteúdo
        ↓
POST /api/cena-textos
POST /api/cena-imagens
POST /api/cena-audios
POST /api/cena-videos
        ↓
Consultar a composição atual
        ↓
Calcular a próxima ordem disponível
        ↓
POST /api/cena-conteudos
        ↓
Conteúdo disponível na composição
```

Cada cadastro utiliza apenas o endpoint correspondente ao seu tipo. O fluxo é sequencial, e o vínculo é criado após a criação do registro específico.

### 12.3 Payload de vinculação

O vínculo é criado por meio de:

```http
POST /api/cena-conteudos
```

Exemplo para texto:

```json
{
  "cena_id": "UUID-DA-CENA",
  "tipo_conteudo": "TEXTO",
  "conteudo_id": "UUID-DO-TEXTO",
  "ordem_exibicao": 5
}
```

Para os demais tipos, `tipo_conteudo` recebe `IMAGEM`, `AUDIO` ou `VIDEO`, e `conteudo_id` corresponde ao registro recém-criado.

A próxima ordem é calculada a partir dos conteúdos ativos já existentes na composição. Se não houver conteúdo, a ordem inicial será `1`; caso contrário, será o maior valor atual acrescido de `1`.

### 12.4 Funções do frontend

| Tela | Função responsável | Responsabilidade |
|---|---|---|
| Textos | `criarTexto(event)` | Criar o texto, consultar a composição, calcular a próxima ordem e inserir o vínculo. |
| Imagens | `criarImagem(event)` | Criar a imagem e vinculá-la à composição. |
| Áudios | `salvarAudio(event)` | No modo de criação, criar o áudio e vinculá-lo à composição; preservar o fluxo de edição existente. |
| Vídeos | `salvarVideo(event)` | No modo de criação, criar o vídeo e vinculá-lo à composição; preservar o fluxo de edição existente. |

As funções de criação atualizam o estado local da tela após as operações. Nos formulários de Áudio e Vídeo, a lógica de edição permanece separada do novo vínculo de criação.

### 12.5 Exclusão e autorização

Foi identificada uma inconsistência nas rotas `DELETE` dos conteúdos: elas utilizavam `autorizar('obra.excluir')`, embora as operações de criação e alteração utilizassem autorização baseada no escopo da obra.

As rotas foram ajustadas para utilizar `autorizarObra` com o escopo específico de cada recurso:

| Recurso | Escopo de autorização |
|---|---|
| Texto | `EscopoObraService.porCenaTextoParam` |
| Imagem | `EscopoObraService.porCenaImagemParam` |
| Áudio | `EscopoObraService.porCenaAudioParam` |
| Vídeo | `EscopoObraService.porCenaVideoParam` |

A alteração alinha a autorização de exclusão ao escopo da obra, sem exigir a permissão genérica `obra.excluir` nessa rota.

As quatro exclusões foram testadas com sucesso pelo fluxo do frontend.

### 12.6 Responsabilidades preservadas

A implementação mantém a separação entre as telas:

- **Telas específicas:** criar, editar e remover os registros de seus respectivos tipos.
- **Composição:** visualizar e reordenar os conteúdos já vinculados.
- **Backend:** validar os dados, autorizar as operações e persistir os registros e vínculos.

A tela de Composição não foi alterada para incluir controles de criação ou exclusão.

### 12.7 Testes realizados

Foram validados os seguintes comportamentos:

- criação de Texto com inclusão automática na composição;
- criação de Imagem com inclusão automática na composição;
- criação de Áudio com inclusão automática na composição;
- criação de Vídeo com inclusão automática na composição;
- composição conjunta dos quatro tipos;
- reordenação dos conteúdos e persistência da ordem;
- exclusão dos conteúdos pelo frontend após o ajuste das rotas.

**Status da integração:** validada manualmente.

### 12.8 Observação técnica

A criação do registro específico e a criação do vínculo em `cena_conteudos` são duas requisições distintas. Portanto, o fluxo atual não constitui uma única transação envolvendo as duas operações. Caso a segunda operação falhe, o registro específico poderá existir sem vínculo na composição. O tratamento transacional conjunto poderá ser avaliado em uma etapa futura, se necessário.

---

## 13. Contrato resumido

```http
PATCH /api/cena-conteudos/reordenar
```

Request:

```json
{
  "cena_id": "UUID",
  "ordem": [
    { "id": "UUID" },
    { "id": "UUID" }
  ]
}
```

Sucesso:

```text
200 OK
```

Erros de negócio:

```text
400 Bad Request
404 Not Found
```

A operação deve preservar a integridade da sequência e nunca deixar a cena em um estado de ordenação parcial.
