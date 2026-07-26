
# NA-001 — Estrutura de Cenas

**Tipo:** Nota Arquitetural

**Identificador:** NA-001

**Título:** Estrutura de Cenas para Conteúdo Interativo

**Status:** Aprovada

**Versão:** 1.0.0

**Data:** 10/07/2026

**Relacionamentos:**

* EFLI — Capítulo 8 (Banco de Dados)
* EFLI — Capítulo 14 (Leitor Interativo)
* Futuro Catálogo de Entidades

---

# 1. Contexto

Durante a definição do modelo conceitual da Plataforma de Livros Interativos surgiu a necessidade de 
representar conteúdos que vão além da leitura tradicional.

Alguns capítulos poderão conter diálogos, escolhas, jogos, quizzes, animações, vídeos, áudios e outros 
recursos interativos, permitindo narrativas lineares ou ramificadas.

A utilização do conceito tradicional de **Página** mostrou-se limitada para representar esse tipo de conteúdo.

---

# 2. Problema

Modelar um capítulo apenas como uma sequência de páginas dificulta a implementação de funcionalidades como:

* Narrativas não lineares.
* Escolhas do leitor.
* Múltiplos finais.
* RPGs narrativos.
* Visual Novels.
* Jogos educativos.
* Cursos interativos.
* Simulações.
* Conteúdo multimídia.

Além disso, a ideia de "página" pressupõe uma leitura sequencial, enquanto a plataforma pretende oferecer 
experiências mais dinâmicas.

---

# 3. Decisão

A arquitetura da plataforma adotará o conceito de **Cena** como unidade fundamental de apresentação e interação 
dentro de um capítulo.

Cada capítulo será composto por uma ou mais cenas organizadas de acordo com a lógica definida pelo autor.

As cenas poderão ser apresentadas de forma linear ou estabelecer caminhos alternativos por meio das interações 
do usuário.

---

# 4. Responsabilidades da Cena

Uma cena poderá conter um ou mais elementos de conteúdo, tais como:

* Texto.
* Imagens.
* Áudio.
* Vídeo.
* Personagens.
* Diálogos.
* Escolhas.
* Minijogos.
* Formulários.
* Questionários.
* Recursos multimídia.
* Outros componentes interativos.

---

# 5. Navegação

As cenas poderão estabelecer relacionamentos entre si.

Essa estrutura permitirá:

* Fluxo linear.
* Fluxo ramificado.
* Retorno para cenas anteriores.
* Múltiplos finais.
* Eventos condicionais.
* Continuação baseada nas decisões do usuário.

---

# 6. Benefícios

A adoção da estrutura de cenas proporciona diversas vantagens arquiteturais:

* Maior flexibilidade para criação de conteúdos.
* Suporte a livros tradicionais e interativos.
* Compatibilidade com RPGs narrativos e visual novels.
* Reutilização da mesma arquitetura para diferentes tipos de conteúdo digital.
* Evolução futura da plataforma sem necessidade de alterações estruturais significativas.

---

# 7. Impacto na Arquitetura

A introdução da entidade **Cena** impactará diretamente:

* Modelagem conceitual do banco de dados.
* Catálogo de entidades.
* Leitor Interativo.
* Sistema de progresso de leitura.
* Sistema de permissões.
* Recursos de interatividade.

A implementação detalhada será definida durante a modelagem das entidades conceituais.

---

# 8. Observações

A adoção da estrutura de cenas não altera o foco inicial da Plataforma de Livros Interativos.

O objetivo permanece a publicação e comercialização de livros interativos.

Entretanto, essa decisão arquitetural prepara a plataforma para suportar novos formatos de conteúdo 
digital, preservando a compatibilidade com a arquitetura geral definida na EFLI.

---

# Histórico de Revisões

| Versão | Data       | Alteraçã                                                  |
| ------ | ---------- | --------------------------------------------------------- |
| 1.0.0  | 10/07/2026 | Criação da Nota Arquitetural NA-001 — Estrutura de Cenas. |
