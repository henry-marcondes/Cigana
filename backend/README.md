# Ciganas - Backend API

API Node.js + Express para o livro interativo Ciganas.

## Setup

### 1. Instalar dependências
\`\`\`bash
npm install
\`\`\`

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` com:
\`\`\`
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ciganas_db
DB_USER=postgres
DB_PASSWORD=5563
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
\`\`\`

### 3. Rodar o servidor
\`\`\`bash
npm run dev
\`\`\`

## Endpoints

### Books
- `GET /api/books` - Listar todos os livros
- `GET /api/books/:id` - Obter um livro específico
- `POST /api/books` - Criar novo livro
- `PUT /api/books/:id` - Atualizar livro
- `DELETE /api/books/:id` - Deletar livro

### Chapters
- `GET /api/chapters/book/:bookId` - Listar capítulos de um livro
- `GET /api/chapters/:id` - Obter um capítulo com suas escolhas

### Progress
- `GET /api/progress/:userId/:bookId` - Obter progresso do usuário
- `POST /api/progress` - Criar progresso
- `PUT /api/progress/:userId/:bookId` - Atualizar progresso
