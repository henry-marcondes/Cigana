# Backend — Plataforma Leitura (Cigana)

API REST da Plataforma Leitura, atualmente chamada Cigana. Ela sustenta a Biblioteca, destinada à leitura e descoberta de obras, e o Editor, destinado à criação, edição e organização das obras.

> Autor é uma entidade de domínio da plataforma; não é sinônimo de Editor.

## Tecnologias

- Node.js
- Express
- PostgreSQL (`pg`)
- JWT e `bcrypt`
- Express Validator
- Nodemailer
- CORS

## Arquitetura

O código-fonte está em `src/` e segue as camadas abaixo:

```text
routes → controllers → services → models → PostgreSQL
                   ↘ validators / middleware / utils
```

| Diretório                  | Responsabilidade                                         |
| -------------------------- | -------------------------------------------------------- |
| `routes/`                  | Define rotas, verbos HTTP e composição de middlewares.   |
| `controllers/`             | Recebe a requisição HTTP e delega a operação ao serviço. |
| `services/`                | Implementa regras de negócio e coordena persistência.    |
| `models/`                  | Executa consultas ao banco de dados.                     |
| `validators/`              | Valida parâmetros e corpos de requisição.                |
| `middleware/`              | Trata autenticação JWT e erros.                          |
| `services/EmailService.js` | Centraliza o envio de e-mails dos fluxos de conta.       |
| `utils/`                   | Contém utilitários de resposta, JWT e geração de slug.   |
| ------------------------------------------------------------------------------------ |

O servidor é iniciado por `src/server.js`, possui health check em `GET /` e disponibiliza os ativos da pasta raiz `media/` em `/media`.

## Pré-requisitos

- Node.js e npm
- PostgreSQL disponível localmente ou em ambiente configurado

## Configuração local

1. Instale as dependências:

   ```bash
   cd backend
   npm install
   ```

2. Crie `backend/.env` com as variáveis do ambiente. Não versione credenciais.

   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ciganas_db
   DB_USER=postgres
   DB_PASSWORD=defina_uma_senha_local
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. Crie/evolua a estrutura do banco pelas migrations do repositório:

   ```bash
   ./database/migrar.sh
   ```

   Execute o comando a partir da raiz do projeto. Para aplicar uma migration específica, informe seu caminho como argumento. Seeds de referência podem ser aplicados com `./database/seed.sh caminho/do/seed.sql`.

4. Inicie a API:

   ```bash
   npm run dev
   ```

   Para execução sem observação de arquivos, use `npm start`.

Por padrão, a API responde em `http://localhost:3001`.

## Banco de dados

As migrations em `../database/migrations/` são a fonte de verdade da estrutura do PostgreSQL. Toda evolução de schema deve ser feita por uma nova migration, sem alterar migrations já aplicadas.

O arquivo `../database/schema_atual.sql` é um dump legado e não representa integralmente o domínio atual. Em caso de divergência, prevalecem as migrations e os models atuais.

Os principais grupos de persistência são:

- referência e catálogo: idiomas, classificações indicativas, biblioteca, categorias, status e visibilidade;
- identidade: usuários, perfis, autores e tokens de usuário;
- obras: livros, relação livro–autor, capítulos e cenas;
- conteúdo de cena: textos, imagens, áudios, vídeos e ordenação de conteúdos;
- interação: escolhas, progresso de leitura, marcadores, favoritos, avaliações e comentários.

## Rotas da API

O prefixo base é `/api`. As rotas montadas atualmente são:

| Recurso | Prefixo |
| --- | --- |
| Usuários e autenticação | `/api/usuarios` |
| Perfis de usuário | `/api/perfis` |
| Autores | `/api/autores` |
| Livros | `/api/livros` |
| Relação livro–autor | `/api/livro-autores` |
| Capítulos | `/api/capitulos` |
| Cenas | `/api/cenas` |
| Escolhas | `/api/escolhas` |
| Conteúdos de cena | `/api/cena-conteudos` |
| Textos de cena | `/api/cena-textos` |
| Imagens de cena | `/api/cena-imagens` |
| Áudios de cena | `/api/cena-audios` |
| Vídeos de cena | `/api/cena-videos` |
| Progresso de leitura | `/api/progresso-leitura` |
| Marcadores | `/api/marcadores` |
| Favoritos | `/api/favoritos` |
| Avaliações | `/api/avaliacoes` |
| Comentários | `/api/comentarios` |
| Tokens de usuário | `/api/tokens-usuario` |

As definições completas de métodos, parâmetros, payloads, respostas e cenários de erro estão nos arquivos em `src/routes/`, seus validators e na coleção Bruno. Antes de alterar um contrato, confira esses três pontos e os consumidores no frontend.

Algumas rotas exigem JWT no cabeçalho:

```http
Authorization: Bearer <token>
```

O CORS aceita, por padrão, o endereço definido em `FRONTEND_URL` (ou `http://localhost:3000`).

## Testes e validação

Os testes de contrato da API são mantidos com Bruno em `../Cigana_API/`, por meio de arquivos YAML e `opencollection.yml`.

Para uma alteração de backend, siga preferencialmente esta sequência:

1. Service
2. Controller
3. Validator
4. Routes
5. `server.js`, quando for necessário registrar uma nova rota
6. Cenários Bruno
7. Testes automatizados
8. Validação da integração afetada

Há testes de models em `tests/models/` e verificações técnicas em `src/tests/`. O script `npm test` ainda não está configurado como runner; verifique a estratégia existente antes de adicionar ferramentas ou dependências de teste.

## Diretrizes de manutenção

- Preserve contratos existentes da API e funcionalidades já validadas.
- Inspecione os fluxos relacionados antes de mudar código existente: route, controller, service, model, validator, consumidores e testes Bruno.
- Faça mudanças incrementais e valide cada etapa antes de avançar.
- Não recrie uma funcionalidade já existente e não faça refatorações fora do escopo da tarefa.
- Mantenha as convenções atuais de nomes, rotas e respostas.
- Não exponha valores de `.env`, tokens ou credenciais em código, documentação ou logs.
