# AUD-010 — Implementação e Validação de Escolhas

## 1. Objetivo

Registrar a etapa de implementação, consolidação e validação das regras de **Escolhas** na Plataforma Leitura, dando continuidade ao `AUD-009 — Escolhas-Regras-e-Escopo.md`.

## 2. Escopo

Foram implementados e validados:

- autorização de operações de edição de Escolhas pelo escopo da obra;
- resolução de `livro_id` a partir da cena de origem;
- reordenação de escolhas em lote;
- validação da composição completa da ordem;
- transação para reordenação;
- proteção contra colisões de ordem;
- obrigatoriedade de cena de destino;
- unicidade da ordem entre escolhas ativas de uma mesma cena.

## 3. Autorização e escopo

As operações de edição utilizam `obra.editar` por meio de `autorizarObra`.

Para criação e reordenação:

```text
cena_origem_id → Cena → Capítulo → livro_id
```

Método:

```text
EscopoObraService.porEscolhaCenaOrigemBody
```

Para alterações identificadas por `:id`:

```text
:id → Escolha → cena_origem_id → Cena → Capítulo → livro_id
```

Método:

```text
EscopoObraService.porEscolhaParam
```

O `EscopoObraService` permanece responsável somente pela resolução do escopo da obra.

## 4. Reordenação em lote

Endpoint:

```http
PATCH /api/escolhas/reordenar
```

Corpo:

```json
{
  "cena_origem_id": "UUID",
  "ordem": [
    { "id": "UUID" },
    { "id": "UUID" },
    { "id": "UUID" }
  ]
}
```

A posição no array determina a nova `ordem_exibicao`.

Regras:

1. a cena de origem deve existir;
2. a quantidade enviada deve ser igual à quantidade de escolhas ativas;
3. não pode haver IDs repetidos;
4. todas as escolhas devem pertencer à cena de origem;
5. somente escolhas ativas participam da composição.

Mensagens consolidadas:

```text
Cena não encontrada.
A ordem deve conter todas as escolhas ativas da cena.
A ordem não pode conter escolhas repetidas.
Uma ou mais escolhas informadas não pertencem à cena.
```

## 5. Transação

A reordenação utiliza:

```text
BEGIN
→ validação
→ ordens temporárias
→ ordens definitivas
→ COMMIT
```

Em erro:

```text
ROLLBACK
```

Os valores temporários permanecem positivos, respeitando `CHECK (ordem_exibicao > 0)` e evitando colisões com a futura unicidade.

`Escolha.listarPorCenaOrigem()` e `Escolha.reordenar()` aceitam `client` opcional para participar da mesma transação PostgreSQL.

## 6. Validação HTTP

Foi criada `validarReordenacao`, validando:

- `cena_origem_id` como UUID;
- `ordem` como array;
- `ordem.*.id` como UUID.

Fluxo:

```text
autenticar
→ autorizarObra
→ validarReordenacao
→ EscolhaController.reordenar
→ EscolhaService.reordenar
```

## 7. Validação prática

Cena utilizada:

```text
501768dc-7161-478a-b8dc-2e0d1cfbc6bd
```

Antes:

```text
ordem 1 → 8e79dd75-ff7c-42fb-8f73-f58f201c9f85
           "alterei o texto"

ordem 2 → 2f99da0c-7d29-4ee9-82cd-010387b2e8bd
           "Ir para pagina 3"
```

Depois:

```text
ordem 1 → 2f99da0c-7d29-4ee9-82cd-010387b2e8bd
           "Ir para pagina 3"

ordem 2 → 8e79dd75-ff7c-42fb-8f73-f58f201c9f85
           "alterei o texto"
```

A API retornou `success: true`, com as escolhas na nova ordem. A operação foi considerada validada.

## 8. Verificação dos dados antes da migration

Destinos nulos:

```sql
SELECT COUNT(*) AS destinos_nulos
FROM escolhas
WHERE cena_destino_id IS NULL;
```

Resultado:

```text
0
```

Ordens duplicadas entre escolhas ativas:

```sql
SELECT
    cena_origem_id,
    ordem_exibicao,
    COUNT(*) AS quantidade
FROM escolhas
WHERE ativo = TRUE
GROUP BY cena_origem_id, ordem_exibicao
HAVING COUNT(*) > 1;
```

Resultado:

```text
(0 rows)
```

Os dados existentes estavam compatíveis com as novas regras.

## 9. Migration 0038

Foi criada uma nova migration, mantendo `0015_create_escolhas.sql` intacta, preservando o histórico de evolução do banco.

A migration aplica:

```sql
ALTER TABLE escolhas
    ALTER COLUMN cena_destino_id SET NOT NULL;

CREATE UNIQUE INDEX uq_escolhas_origem_ordem
    ON escolhas (cena_origem_id, ordem_exibicao)
    WHERE ativo = TRUE;
```

## 10. Estado estrutural final

`cena_destino_id` é `NOT NULL`.

Existe:

```text
uq_escolhas_origem_ordem
```

com:

```text
UNIQUE (cena_origem_id, ordem_exibicao)
WHERE ativo = true
```

Também permanece:

```text
CHECK (ordem_exibicao > 0)
```

Assim, duas escolhas ativas da mesma cena não podem ocupar a mesma posição, enquanto cenas diferentes podem utilizar a mesma ordem e escolhas desativadas não participam da restrição.

## 11. Rotas consolidadas

```http
POST /api/escolhas/
PATCH /api/escolhas/:id/texto
PATCH /api/escolhas/:id/destino
PATCH /api/escolhas/:id/ordem
PATCH /api/escolhas/reordenar
DELETE /api/escolhas/:id
GET /api/escolhas/cena/:cena_origem_id
GET /api/escolhas/:id
```

A desativação permanece utilizando `obra.excluir`, conforme decisão já existente, sem alteração para `autorizarObra`.

## 12. Decisões preservadas

Não foram alteradas:

- separação entre Biblioteca e Editor;
- distinção entre Autor e Editor;
- hierarquia Obra → Capítulos → Cenas → Conteúdos → Escolhas;
- autorização usuário → papel → permissão;
- banco como fonte de verdade para autorização;
- centralização da resolução do escopo da obra;
- destino pertencente à mesma obra da origem;
- independência entre ordem da escolha e destino;
- composição narrativa da cena.

## 13. Estado da etapa

**Concluída e validada.**

Implementação, validação HTTP essencial, verificação dos dados e migration estrutural foram concluídas.

### Próxima etapa

Integrar Escolhas à interface do Editor, começando pela **inspeção da tela atual de edição de Cena**.

Metodologia:

```text
inspecionar → decidir → implementar → validar → avançar
```

Não criar uma segunda estrutura de composição antes de verificar a composição de Conteúdos já existente no Editor.
