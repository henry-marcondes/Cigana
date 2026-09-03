# Instruções do Projeto Cigana

## Idioma e contexto

- Responda, explique, documente e nomeie mensagens de trabalho em português do Brasil, salvo quando um contrato técnico existente exigir outro idioma.
- Este projeto é a **Plataforma Leitura**, atualmente chamada **Cigana**: uma plataforma de livros interativos.
- Preserve a terminologia de domínio já adotada no código e nas migrations.

## Arquitetura e tecnologias

- O backend é uma API REST em **Node.js, Express e PostgreSQL**.
- O frontend é uma aplicação **Next.js, React e Tailwind CSS**.
- O backend segue a separação `routes` → `controllers` → `services` → `models`, com `validators`, `middleware` e `utils` como camadas de apoio. Respeite essa organização.
- Os arquivos estáticos de mídia ficam em `media/` e são expostos pelo backend em `/media`.
- O frontend concentra rotas em `frontend/src/app`, componentes em `frontend/src/components` e comunicação HTTP em `frontend/src/services`.

## Domínio e experiência da plataforma

- Biblioteca e Editor são áreas distintas da plataforma.
- O **Editor** é a área de criação, edição e organização das obras.
- **Autor** é uma entidade de domínio e não é sinônimo de Editor; não misture responsabilidades, regras ou nomenclaturas dessas duas noções.
- Use a experiência validada da Biblioteca como referência para a visualização das obras no Editor, sem transformar as duas áreas na mesma funcionalidade.
- Preserve a hierarquia narrativa existente: livro → capítulo → cena → conteúdos/mídias e escolhas.

## Banco de dados

- As migrations em `database/migrations/` são a fonte de verdade da estrutura do banco de dados.
- Antes de alterar persistência, consulte a migration e os models relacionados; crie uma nova migration para evolução de esquema, sem reescrever migrations já aplicadas.
- Há um `database/schema_atual.sql` com estrutura legada e limitada (`books`, `chapters`, `choices` e `user_progress`). Não o use como referência primária quando divergir das migrations ou dos models atuais em português.
- Use os scripts existentes (`database/migrar.sh` e `database/seed.sh`) de acordo com a necessidade da tarefa; não presuma que seeds ou dados locais possam ser apagados.

## API, contratos e validação

- Preserve os contratos existentes da API — rotas, métodos, payloads, respostas, autenticação e códigos de status — e não altere funcionalidades já validadas sem necessidade explícita.
- Antes de modificar código existente, inspecione o fluxo relacionado, os contratos de rota, controller, service, model, validator, frontend consumidor e testes Bruno.
- Não recrie funcionalidades que já existam; localize e estenda a implementação atual quando ela atender ao objetivo.
- Preserve nomenclatura, convenções, idioma e padrões já utilizados pelo projeto, inclusive os nomes de rotas atuais em português.
- Considere que parte da documentação de endpoints, especialmente `backend/README.md`, pode estar desatualizada; confira o código e a coleção Bruno antes de tomar decisões de compatibilidade.

## Fluxo obrigatório de trabalho

- Não faça refatorações nem alterações fora do escopo da tarefa.
- Trabalhe incrementalmente, uma etapa por vez. Conclua e valide uma etapa antes de iniciar a seguinte.
- Para alterações de backend, siga preferencialmente esta ordem:

  1. Service
  2. Controller
  3. Validator
  4. Routes
  5. `server.js`
  6. Bruno
  7. Testes automatizados
  8. Validação final

- Teste cada alteração antes de avançar. Execute a validação mais próxima da mudança e, ao fim, valide a integração afetada.
- Não modifique arquivos não relacionados ao objetivo. Preserve alterações locais preexistentes feitas por outras pessoas.

## Testes

- Os testes de API são mantidos na coleção Bruno `Cigana_API/`, usando arquivos YAML e `opencollection.yml`.
- Para qualquer alteração de contrato de API autorizada, atualize ou acrescente os cenários Bruno do domínio correspondente, sem quebrar cenários existentes.
- Há testes de models em `backend/tests/models/` e verificações técnicas em `backend/src/tests/`. O script `npm test` do backend ainda não está configurado como runner; inspecione a estratégia existente antes de introduzir dependências ou comandos novos.
- Não declare uma alteração como concluída sem registrar a validação executada e seu resultado.

## Segurança e qualidade

- Não exponha segredos, credenciais ou conteúdo de arquivos `.env`.
- Mantenha autenticação JWT, validação de entrada e tratamento de erros coerentes com os módulos existentes.
- Prefira mudanças pequenas, compatíveis e verificáveis a reestruturações amplas.
