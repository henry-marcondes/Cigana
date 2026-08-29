# 📚 Projeto Cigana

**Ciganas** é uma plataforma de **livros interativos**, desenvolvida para permitir que o leitor não apenas leia uma história, mas também **interaja com seu conteúdo e tome decisões que podem alterar o desenvolvimento da narrativa**.

O projeto está sendo desenvolvido com uma arquitetura separada entre **Backend (API REST)** e **Frontend (aplicação web)**, utilizando PostgreSQL como banco de dados.

---

## 🎯 Objetivo

A plataforma tem como objetivo disponibilizar livros digitais estruturados em uma narrativa interativa.

A leitura é organizada hierarquicamente:

```text
Biblioteca
   ↓
Livro
   ↓
Capítulos
   ↓
Cenas
   ↓
Escolhas
   ↓
Próxima Cena / Capítulo
```

As **Cenas** são o elemento central da narrativa. Elas podem possuir texto, imagens, áudio, vídeo e escolhas que determinam os próximos caminhos da história.

---

# 🏗️ Arquitetura do projeto

O projeto está dividido em duas aplicações principais:

```text
Cigana/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── server.js
│   │
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── services/
│   │
│   └── ...
│
├── media/
│   ├── imagens/
│   ├── audios/
│   └── videos/
│
└── README.md
```

---

# 🚀 Tecnologias

## Backend

* Node.js
* Express
* PostgreSQL
* API REST
* JWT / mecanismos de autenticação
* bcrypt para proteção de senhas
* Nodemailer / Brevo SMTP para envio de e-mails
* Express Validator
* CORS

## Frontend

* Next.js
* React
* Tailwind CSS
* JavaScript

## Banco de dados

* PostgreSQL 16
* Docker

## Strorage

* Todo conteúdo do Livro esta estruturado para servicesStorage

## Testes da API

* Bruno
* OpenCollection / arquivos YAML

---

# 📖 Estrutura do conteúdo

A estrutura narrativa da plataforma foi organizada em diferentes níveis.

### Biblioteca

A biblioteca organiza os livros disponíveis na plataforma.

### Livro

Representa uma obra completa e possui informações como:

* título
* slug
* descrição
* capa
* categoria
* classificação indicativa
* autores
* capítulos

### Capítulo

Um livro possui um ou mais capítulos.

Os capítulos possuem:

* título
* slug
* texto/conteúdo
* ordem de exibição
* cena inicial
* status de ativo

O conteúdo textual dos capítulos utiliza **Markdown (`.md`) como padrão**, podendo também ser utilizado `.txt` quando necessário.

### Cena

A cena é o elemento central da narrativa interativa.

Uma cena pode possuir:

* texto
* ordem de exibição
* indicação de cena inicial
* imagens
* áudios
* vídeos
* escolhas
* marcadores

### Escolhas

As escolhas permitem que o leitor participe da narrativa.

Uma escolha pode direcionar o leitor para outra cena, permitindo construir diferentes caminhos dentro do livro.

---

# 🎬 Recursos multimídia

As cenas podem ser associadas a diferentes tipos de mídia:

```text
Cena
 ├── Texto
 ├── Imagem
 ├── Áudio
 └── Vídeo
```

A estrutura de mídia foi separada em entidades específicas:

* `CenaImagem`
* `CenaAudio`
* `CenaVideo`
* `CenaTexto`

Os arquivos de mídia são organizados em:

```text
media/
├── imagens/
├── audios/
└── videos/
```

---

# 🏷️ Marcadores

A plataforma possui uma estrutura de **Marcadores**, utilizada para identificar ou controlar características específicas da narrativa.

Os marcadores podem posteriormente ser utilizados para implementar comportamentos condicionais dentro das histórias interativas.

---

# 👤 Usuários e autenticação

A plataforma possui estrutura própria para gerenciamento de usuários.

Entre os recursos implementados estão:

* cadastro de usuário
* consulta de usuário
* alteração de dados
* alteração de senha
* recuperação de senha
* autenticação de e-mail
* gerenciamento de tokens de segurança

A infraestrutura de tokens utiliza uma única tabela para diferentes processos:

```text
tokens_usuario
```

Atualmente a estrutura atende aos processos:

```text
VERIFICACAO_EMAIL
ALTERACAO_SENHA
RECUPERACAO_SENHA
```

Os tokens possuem:

* 6 dígitos
* validade limitada
* uso único
* limite de tentativas
* armazenamento seguro através de hash

---

# ✉️ Serviço de e-mail

O backend possui um serviço de envio de e-mails integrado ao **Brevo SMTP**.

Esse serviço é utilizado principalmente nos processos relacionados à autenticação e recuperação de acesso.

Fluxos previstos:

```text
Cadastro
   ↓
Verificação de e-mail
```

e:

```text
Esqueci minha senha
   ↓
Token de recuperação
   ↓
Validação
   ↓
Nova senha
```

---

# 🔐 Organização do Backend

O backend segue uma separação de responsabilidades baseada em camadas:

```text
Route
  ↓
Validator
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
PostgreSQL
```

### Routes

Responsáveis por definir os endpoints da API.

### Validators

Responsáveis por validar os dados recebidos pelas requisições.

### Controllers

Responsáveis por receber as requisições e devolver as respostas HTTP.

### Services

Responsáveis pelas regras de negócio.

### Models

Responsáveis pela comunicação com o banco de dados.

### Database

Responsável pela persistência dos dados no PostgreSQL.

---

# 📦 Resposta padrão da API

A API utiliza um padrão comum de resposta através do utilitário:

```text
utils/apiResponse.js
```

As respostas seguem uma estrutura consistente, por exemplo:

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {}
}
```

Em caso de erro:

```json
{
  "success": false,
  "message": "Descrição do erro."
}
```

Essa padronização permite que o frontend trate as respostas da API de maneira uniforme.

---

# 🗄️ Banco de dados

O banco utilizado pelo projeto é:

```text
PostgreSQL 16
```

O desenvolvimento utiliza PostgreSQL executando através de Docker.

A estrutura do banco é criada e atualizada através de **migrations SQL**.

Entre as entidades já estruturadas estão:

```text
Usuario
PerfilUsuario
Autor
Livro
LivroAutor
Capitulo
Cena
CenaImagem
CenaAudio
CenaVideo
Escolha
Marcador
Favorito
Avaliacao
Comentario
ProgressoLeitura
tokens_usuario
```

A modelagem permite que a plataforma evolua posteriormente para recursos 
sociais, avaliações, favoritos, comentários e acompanhamento da leitura.

---

# 🧪 Testes da API

Os endpoints do backend são testados utilizando o **Bruno**.

Os testes estão organizados por entidade:

```text
Cigana_API/
├── Autor/
├── Avaliacao/
├── Capitulos/
├── Cenas/
├── Escolhas/
├── Comentario/
├── Favorito/
└── PerfilUsuario/
```

A metodologia adotada durante o desenvolvimento é:

```text
Migration
   ↓
Model
   ↓
Service
   ↓
Controller
   ↓
Validator
   ↓
Routes
   ↓
Teste da API
```

Cada etapa é implementada e validada antes da próxima.

---

# 🌐 Frontend

O frontend está sendo reconstruído utilizando:

```text
Next.js
React
Tailwind CSS
```

A aplicação utiliza a estrutura `app/` do Next.js.

Entre as áreas já estruturadas estão:

```text
/login
/cadastro
/dashboard
/livros
/livros/[slug]
/livros/[slug]/capitulos/[slug]
/alteracao-senha
/usuarios
```

A comunicação com o backend é realizada através dos serviços localizados em:

```text
frontend/src/services/
```

Incluindo o serviço de autenticação e o wrapper responsável pelas chamadas à API.

---

# 🔗 Comunicação entre Frontend e Backend

Durante o desenvolvimento local:

```text
Frontend
http://localhost:3000
       │
       │ HTTP / REST
       ↓
Backend
http://localhost:3001
       │
       ↓
PostgreSQL
```

O frontend não acessa diretamente o banco de dados.

Toda comunicação com os dados ocorre através da API REST do backend.

---

# 📚 Fluxo de leitura

O fluxo básico da plataforma é:

```text
Biblioteca
    ↓
Selecionar Livro
    ↓
Livro
    ↓
Selecionar Capítulo
    ↓
Cena Inicial
    ↓
Leitura da Cena
    ↓
Escolha
    ↓
Próxima Cena
    ↓
Continuação da narrativa
```

Dessa forma, o livro deixa de ser apenas uma sequência linear de páginas e passa a 
funcionar como uma **narrativa interativa**.

---

# 💾 Progresso de leitura

A plataforma possui uma estrutura preparada para registrar o progresso do leitor.

O objetivo é permitir futuramente que o usuário possa:

* continuar uma leitura de onde parou;
* registrar a cena atual;
* acompanhar livros iniciados;
* manter seu histórico de leitura.

A entidade relacionada ao recurso é:

```text
ProgressoLeitura
```

---

# 🧩 Entidades principais

A arquitetura atual pode ser representada de forma simplificada:

```text
                 ┌──────────────┐
                 │  Biblioteca  │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │    Livro     │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Capítulo   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │     Cena     │
                 └──────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     ┌─────────┐   ┌─────────┐   ┌─────────┐
     │ Imagem  │   │ Áudio   │   │ Vídeo   │
     └─────────┘   └─────────┘   └─────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Escolhas   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ Próxima Cena │
                 └──────────────┘
```

---

# 🛠️ Status do projeto

O projeto encontra-se em **desenvolvimento ativo**.

### Backend

A infraestrutura principal já possui:

* [x] Estrutura do servidor Express
* [x] Conexão PostgreSQL
* [x] Migrations
* [x] Usuários
* [x] Perfis
* [x] Autores
* [x] Livros
* [x] Capítulos
* [x] Cenas
* [x] Escolhas
* [x] Imagens de cenas
* [x] Áudios de cenas
* [x] Vídeos de cenas
* [x] Marcadores
* [x] Autenticação de e-mail
* [x] Recuperação de senha
* [x] Alteração de senha
* [x] Serviço de e-mail
* [x] Padronização das respostas da API
* [x] Testes dos principais endpoints

### Frontend

Em desenvolvimento:

* [x] Estrutura Next.js
* [x] Integração com API
* [x] Autenticação
* [x] Cadastro
* [x] Alteração de senha
* [x] Biblioteca
* [x] Listagem de livros
* [x] Página do livro
* [x] Estrutura de capítulos
* [ ] Leitura completa das cenas
* [ ] Navegação pelas escolhas
* [ ] Exibição dos recursos multimídia
* [ ] Persistência completa do progresso
* [ ] Recursos sociais
* [ ] Demais recursos da plataforma

---

# 🚧 Próximas etapas

A evolução do projeto seguirá, preferencialmente, a mesma metodologia utilizada na reconstrução 
do backend.

Próximas áreas:

```text
Frontend
   ↓
Biblioteca / Livros
   ↓
Capítulos
   ↓
Cenas
   ↓
Escolhas
   ↓
Conteúdo multimídia
   ↓
Progresso de leitura
   ↓
Experiência completa do leitor
```

---

# 📌 Princípios de desenvolvimento

Durante a construção da plataforma são adotados alguns princípios:

* Separação clara de responsabilidades.
* Backend e frontend independentes.
* API REST como camada de comunicação.
* Regras de negócio concentradas nos Services.
* Validação de entrada através dos Validators.
* Respostas padronizadas da API.
* Desenvolvimento incremental.
* Teste de cada etapa antes de avançar.
* Uso de migrations para controle da estrutura do banco.
* Preservação da estrutura existente quando ela já atende ao objetivo do projeto.

---

# 📖 Projeto Ciganas

**Cigana** é o nome utilizado durante o desenvolvimento do projeto.

**Ciganas** é a identidade da plataforma de livros interativos.

O objetivo final é criar uma experiência em que:

> **o leitor não apenas acompanha a história — ele participa dela.**

---
