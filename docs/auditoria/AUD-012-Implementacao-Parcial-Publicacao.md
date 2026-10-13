# AUD-012 — Aprovação editorial e publicação de obras

## Estado

Fluxo implementado. A aprovação editorial é persistida separadamente da
publicação; aprovar não altera status/visibilidade nem torna a obra pública.

## Inspeção do fluxo editorial

O status `em-revisao` (“Livro aguardando revisão”) é usado como fila editorial.
Não havia fluxo de decisão de obra nem armazenamento do resultado. O fluxo
existente de aprovação de solicitação de Autor permanece separado.

## Endpoints

- `POST /api/livros/:id/enviar-revisao`, sem payload. Exige autenticação e
  autorização efetiva para a obra (vínculo ativo como Autor ou permissão
  `obra.editar`). Só aceita obra ativa em `em-elaboracao` com visibilidade
  `rascunho`; altera apenas o status para `em-revisao`.
- `GET /api/livros/gestao/editorial`: lista obras ativas em `em-revisao` e sua
  decisão, se houver. Exige `moderacao.visualizar`.
- `GET /api/livros/:id/decisao-editorial`: consulta a decisão. Usa a proteção
  existente de leitura da obra.
- `PATCH /api/livros/:id/decisao-editorial`, corpo
  `{"decisao":"APROVADA"}` ou
  `{"decisao":"REJEITADA","motivo_rejeicao":"..."}`. Exige
  `obra.aprovar`; só aceita obras ativas em `em-revisao`, e apenas uma decisão
  pode ser registrada por obra.
- O estado existente `em-revisao` coloca a obra na fila; a submissão dedicada
  está descrita acima e não cria novo estado ou entidade de fluxo.
- `POST /api/livros/:id/publicar`, sem payload. Exige `obra.publicar`, decisão
  `APROVADA`, obra ativa em `em-revisao`, regularização e aceites contratuais
  obrigatórios. Aprovação não chama este endpoint automaticamente.

As rotas de aprovação e publicação usam permissões distintas e consultam as
permissões efetivas no banco. `0048_decisoes_editoriais_obras.sql` cria o
registro persistente da decisão e vincula ao papel Administrador as permissões
existentes `moderacao.visualizar` e `obra.publicar`, além da nova `obra.aprovar`.
Grants de `obra.publicar` dos demais papéis são desativados para manter a
publicação exclusiva ao Administrador nesta etapa. `moderacao.operar` não foi
reutilizada porque também é concedida ao papel Moderador. Os vínculos
desativados permanecem registrados.

## Regras do fluxo

- A fila administrativa usa o status existente `em-revisao`; não foi criado
  estado de livro novo nem fluxo de submissão.
- O Autor autorizado pode solicitar a revisão da própria obra pelo Estúdio.
  A transição é restrita a `em-elaboracao` + `rascunho` e preserva a
  visibilidade. Não aprova nem publica a obra.
- A decisão é persistida com obra, decisor, data e motivo opcional de rejeição.
  Não se pode alterar uma decisão registrada nesta etapa.
- Aprovação não modifica o status ou a visibilidade.
- Rejeição fica registrada e a obra não pode ser publicada.
- Criação direta como `publicado`/`publica` e uso dos endpoints genéricos para
  mudar status para `publicado` ou visibilidade para `publica` são recusados;
  a publicação passa pelo endpoint dedicado e pelas verificações editoriais.
- Obras inativas, arquivadas, fora de `em-revisao`, sem aprovação, com
  regularização incompleta ou aceite contratual obrigatório pendente são
  rejeitadas pelo backend.
- A publicação atualiza status para `publicado` e visibilidade para `publica`
  na mesma transação, sob bloqueio da obra, e exige decisão `APROVADA`.
- Os filtros públicos existentes continuam exigindo obra ativa, status ativo
  `publicado` e visibilidade ativa `publica`.

## Requisitos verificados pelo service

- Deve haver ao menos um vínculo ativo com Autor.
- A regularização de cada Autor vinculado é verificada por
  `PessoaService.verificarRegularizacao`.
- Para cada contrato ativo de `DIREITOS_AUTORAIS`, exige-se versão ativa e
  aceite por cada Autor vinculado para aquela obra, usando os métodos de
  `ContratoService` existentes.
- Não há entidade ou serviço separado para a “documentação do Autor” no
  sistema inspecionado. Nenhuma estrutura genérica de documentação foi criada.

## Arquivos desta implementação

- `backend/src/models/Livro.js`
- `backend/src/services/livroService.js`
- `backend/src/controllers/LivroController.js`
- `backend/src/routes/livroRoutes.js`
- `backend/src/services/autorizacaoService.js`
- `backend/src/validators/livroValidator.js`
- `database/migrations/0048_decisoes_editoriais_obras.sql`
- `frontend/src/app/admin/page.jsx`
- `frontend/src/app/admin/obras/page.jsx`
- `frontend/src/app/estudio/obras/[id]/page.jsx`
- `frontend/src/services/livro.js`
- `frontend/src/services/permissoesEfetivas.js`

O `server.js` já monta `livroRoutes` em `/api/livros`, portanto não precisou
ser alterado. O endpoint de publicação não recebe corpo; os de decisão usam o
validator existente de livros, sem alteração do contrato dos endpoints antigos.

## Interface

No Estúdio, “Enviar para revisão” aparece para Autor vinculado ou usuário com
permissão efetiva `obra.editar`, somente para obra em elaboração e rascunho.
A chamada é confirmada e apresenta carregamento e resultado; a autorização
definitiva e a situação atual são verificadas no backend.

O acesso administrativo está na área existente em `/admin/obras`. A fila separa
obras aguardando decisão, aprovadas aguardando publicação e rejeitadas. A
pré-visualização abre `/estudio/obras/:id/visualizar`; a leitura privada é
permitida a quem tem `moderacao.visualizar` ou vínculo de Autor com a obra.
“Aprovar obra” e “Rejeitar obra” aparecem com `obra.aprovar`; “Publicar obra”
aparece separadamente para aprovadas e exige `obra.publicar`. As operações
pedem confirmação, mostram carregamento e exibem erros retornados pela API.

No gerenciamento do Estúdio, o botão de publicação aparece somente para quem
tem `obra.publicar` e quando a obra está em revisão e aprovada.

## Validação manual

1. Aplicar a migration `0048_decisoes_editoriais_obras.sql` pelo processo
   normal do projeto.
2. No Estúdio, abrir a obra em `em-elaboracao` e `rascunho` como Autor vinculado.
3. Acionar “Enviar para revisão” e confirmar; verificar resposta de sucesso e
   que o status mudou para `em-revisao` enquanto a visibilidade segue `rascunho`.
4. Acessar `/admin/obras` como Administrador, abrir “Analisar conteúdo” e
   conferir a obra na pré-visualização.
5. Aprovar a obra. Confirmar que ela aparece em “Aprovadas — aguardando
   publicação” e segue indisponível publicamente.
6. Acionar “Publicar obra” e confirmar. Verificar a resposta de sucesso e,
   quando apropriado, consultar que status/visibilidade são `publicado`/`publica`.
7. Abrir a Biblioteca e buscar a obra pelo slug. A listagem e busca públicas
   devem encontrá-la após a publicação.
8. Validar rejeição em outra obra de revisão não publicada; confirmar que
   aparece como rejeitada e que `POST /api/livros/:id/publicar` retorna `409`.
9. Com usuário sem `obra.aprovar`, tentar `PATCH /api/livros/:id/decisao-editorial`
   e confirmar `403`, sem alterar a decisão.
10. Com usuário sem `obra.publicar`, tentar `POST /api/livros/:id/publicar` e
   confirmar `403`, sem alterar status ou visibilidade.
11. Com usuário Curador ou Editor, confirmar que não possui mais `obra.publicar`
    após a migration e que a tentativa direta ao endpoint retorna `403`.
12. Tentar `POST /api/livros/:id/enviar-revisao` com usuário sem autorização
    sobre a obra e confirmar `403`; em seguida, confirmar que status e
    visibilidade não mudaram.
13. Confirmar que a obra pública e os fluxos de edição e leitura existentes
    continuam acessíveis conforme suas permissões.

Não foram executados testes automatizados ou cenários Bruno. A validação
manual e a consulta de dados ficam a cargo do responsável pelo projeto.

## Restrições a preservar

Não aprovar nem publicar automaticamente após submissão; não permitir enviar
para revisão obra inativa ou fora de `em-elaboracao`/`rascunho`; não permitir publicar obra
rejeitada, inativa, fora de revisão, sem aprovação ou com requisito contratual
ou cadastral pendente; não atualizar status e visibilidade em operações
separadas; manter as permissões `obra.aprovar` e `obra.publicar` distintas e
preservar os critérios de disponibilidade pública da Biblioteca.
