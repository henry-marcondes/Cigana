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

## 5. Validação

As verificações `node --check` dos arquivos backend alterados e `git diff --check` passaram. `npm run build` compilou o frontend e concluiu a etapa de TypeScript, mas falhou durante a geração estática da rota preexistente `/dashboard/contratos`, que usa `useSearchParams()` sem uma boundary de `Suspense`. A rota está fora do escopo desta implementação.

Validação visual, integração com banco e execução da migration permanecem pendentes. A migration `0050` não foi executada porque o ambiente do banco não foi identificado como seguro para alteração. Registrar os resultados somente após executar o roteiro manual definido para Estúdio, Biblioteca, preservação do progresso e autorização.
