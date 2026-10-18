# AUD-016 — Cenas Finais

**Projeto:** Plataforma Cigana  
**Área:** Estúdio e Biblioteca  
**Status:** Implementação técnica registrada; validação visual pendente.

## 1. Regras implementadas

- Cada cena possui `cena_final`, com padrão `false`; não há limite de cenas finais por obra.
- Uma confirmação é única por usuário, obra e cena final. Repetições preservam a primeira data em `confirmado_em`.
- A confirmação de final é independente do progresso global e não o modifica.
- Desmarcar a cena como final não remove os registros existentes.

## 2. Persistência

A migration `0050_create_finais_leitura.sql` adiciona `cenas.cena_final` e cria `finais_leitura`, com relações para usuário, obra e cena, unicidade por usuário/obra/cena e FKs sem exclusão em cascata. A migration foi criada, mas não executada nesta etapa.

## 3. API e autorização

- `POST /api/cenas` e `PUT /api/cenas/:id` recebem `cena_final` opcional e seguem a autorização existente `obra.editar`.
- `GET /api/finais-leitura/livro/:livro_id` lista apenas os registros do usuário autenticado.
- `POST /api/finais-leitura` recebe `livro_id` e `cena_id`; o usuário é derivado do token. A API verifica acesso à obra e valida, dentro de transação, que a cena está ativa, marcada como final e pertence à obra indicada.
- Confirmações concorrentes são protegidas pela restrição única e `ON CONFLICT DO NOTHING`.

As rotas preexistentes de progresso de leitura não foram alteradas. As novas rotas de finais não as utilizam para identidade ou autorização.

## 4. Interface

O Estúdio permite marcar a opção **Cena Final** na criação e edição e indica a marcação na listagem. O leitor da Biblioteca apresenta a orientação ao carregar uma cena final, permite confirmar ou continuar e mostra a data da primeira confirmação. A página da obra consulta o histórico do usuário. A prévia do Estúdio não registra finais.

# Adendo — Validação visual das Cenas Finais

**Data da validação:** 18/10/2026  
**Documento de referência:** `AUD-016-Cenas-Finais.md`  
**Escopo:** validação funcional pela interface do Estúdio e da Biblioteca.

## 1. Resultado geral

Foram executados 15 testes visuais na interface da Plataforma Cigana.

**Resultado: 15 testes aprovados, sem falhas funcionais identificadas.**

A validação contemplou a marcação de cenas finais, a navegação narrativa, o registro de conquistas, a preservação do histórico, a autenticação e o isolamento dos dados entre leitores.

## 2. Testes realizados

| Nº | Verificação | Resultado |
|---:|-------------------------------------------------------------------------|--------|
|  1 | Marcar uma cena como final no Estúdio, salvar e identificar na listagem | PASSOU |
|  2 | Reabrir a cena e confirmar a persistência da marcação                   | PASSOU |
|  3 | Marcar múltiplas cenas finais na mesma obra                             | PASSOU |
|  4 | Desmarcar uma cena final sem desmarcar as demais                        | PASSOU |
|  5 | Reconhecer uma cena final durante a leitura na Biblioteca               | PASSOU |
|  6 | Reconhecer múltiplas cenas finais na mesma obra                         | PASSOU |
|  7 | Continuar explorando sem registrar o final                              | PASSOU |
|  8 | Registrar explicitamente um final                                       | PASSOU |
|  9 | Retornar a um final conquistado e preservar a data e hora originais     | PASSOU |
| 10 | Registrar finais diferentes e preservar individualmente cada conquista  | PASSOU |
| 11 | Consultar o histórico de finais conquistados na obra atual              | PASSOU |
| 12 | Desmarcar uma cena final já conquistada e preservar o histórico         | PASSOU |
| 13 | Tentar registrar um final sem autenticação, recebe solicitação de login | PASSOU |
| 14 | Efetuar login e registrar o final normalmente                           | PASSOU |
| 15 | Verificar o isolamento do histórico entre dois usuários                 | PASSOU |

## 3. Comportamentos confirmados

### 3.1. Estúdio

- Uma obra aceita múltiplas cenas finais.
- A marcação permanece após salvar e reabrir a edição.
- Cada cena pode ser marcada ou desmarcada individualmente.
- Desmarcar uma cena não altera a marcação das demais.

### 3.2. Biblioteca

- Ao chegar a uma cena marcada como final, o leitor recebe a orientação correspondente.
- As opções **Registrar este final** e **Continuar explorando** são apresentadas.
- Continuar explorando permite seguir a navegação sem registrar automaticamente a conquista.
- O registro exige uma ação explícita do leitor.
- Após a conquista, a Biblioteca apresenta a data e a hora do registro.
- Retornar à mesma cena mantém a data e a hora originais.
- Finais diferentes podem ser conquistados independentemente.

### 3.3. Histórico e desmarcação

- O histórico apresenta as conquistas do leitor na obra atual.
- Desmarcar uma cena no Estúdio não apaga uma conquista registrada anteriormente.
- Após a desmarcação, a cena deixa de ser reconhecida como final conquistado durante 
  a navegação atual.
- O histórico anterior permanece disponível.

### 3.4. Autenticação e isolamento

- A leitura da obra permanece acessível sem login.
- O registro de uma conquista exige autenticação.
- Após o login, o registro pode ser realizado normalmente.
- Dois usuários podem conquistar o mesmo final de forma independente.
- O histórico do segundo usuário apresentou somente as conquistas realizadas por ele.
- Não foram observados vazamentos de dados entre as contas testadas.

## 4. Validação técnica pendente

O percentual global de exploração não é apresentado na interface da Biblioteca. Por esse motivo, não foi possível verificar visualmente se o registro de uma conquista mantém esse percentual inalterado.

Fica pendente uma verificação técnica específica para confirmar que:

- Registrar um final não altera automaticamente o percentual global de exploração.
- O cálculo existente continua baseado nas cenas distintas visitadas em relação ao total de cenas elegíveis.
- Registrar uma conquista não força o percentual para 100%.

Essa pendência não representa uma falha funcional identificada. Trata-se de uma regra ainda não verificada por meio de teste técnico.

## 5. Conclusão da validação visual

A etapa de validação visual das Cenas Finais está concluída, com 15 testes aprovados e nenhuma falha funcional identificada.

Os comportamentos observados estão de acordo com as regras de negócio definidas para marcação de cenas finais, exploração narrativa, registro explícito de conquistas, preservação do histórico e isolamento entre leitores.

A conclusão da validação técnica do percentual global de exploração permanece pendente.

**Status da validação visual: CONCLUÍDA.**

**Status da validação técnica do percentual: PENDENTE.**
