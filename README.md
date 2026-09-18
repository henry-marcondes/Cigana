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

# 📖 Projeto Ciganas

**Cigana** é o nome utilizado durante o desenvolvimento do projeto.

**Ciganas** é a identidade da plataforma de livros interativos.

O objetivo final é criar uma experiência em que:

> **o leitor não apenas acompanha a história — ele participa dela.**

---
