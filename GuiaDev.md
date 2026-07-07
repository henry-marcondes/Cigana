# 📚 Projeto Cigana

🟢 1. Clonar o repositório
git clone https://github.com/henry-marcondes/cigana.git

# cd cigana

🟢 2. Backend

# cd backend
# npm install
# npm run dev

🟢 3. Frontend
# cd frontend
# npm install
# npm run dev

🟢 4. Banco de dados
Instalar PostgreSQL
Criar banco:
# CREATE DATABASE ciganas_db;
Importar:
# psql -U postgres -d ciganas_db -f schema.sql

🌐 Endpoints principais
GET /api/chapters/:id
GET /api/chapters/:id/choices
