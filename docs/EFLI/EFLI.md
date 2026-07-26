
```markdown
# EFLI 
## Especificação Funcional da Plataforma de Livros Interativos

> **Documento Mestre do Projeto**

| Campo         | Valor                                                         |
|---------------|---------------------------------------------------------------|
| Documento     | EFLI                                                          |
| Nome          | Especificação Funcional da Plataforma de Livros Interativos   |
| Versão        | 1.0.0                                                         |
| Status        | Em Desenvolvimento                                            |
| Última Atualização | 09/07/2026                                               |
| Repositório   | Plataforma de Livros Interativos                              |
| Responsável   | Henry Fernando Espindola Marcondes                            |
---------------------------------------------------------------------------------

# Controle de Revisões

| Versão | Data       | Etapa               | Alteração                               | Commit |
|:------:|:----------:|---------------------|-----------------------------------------|:------:|
| 1.0.0  | 09/07/2026 | Fundação do Projeto | Criação da EFLI e definição da          |        |
                                            | metodologia oficial de desenvolvimento. |   —    |
---

| Versão | Data       | Etapa                   | Alteração                            | Commit |
| ------ | ---------- | ----------------------- | ------------------------------------ | ------ |
| 1.0.1  | 12/07/2026 | Encerramento da Etapa 0 | Conclusão da Especificação Funcional,| 
                                                | Notas Arquiteturais e Diagramas de   |
                                                | Arquitetura. Início oficial da Etapa |
                                                | 1 — Fundação da Plataforma.          |    —   |

---

| Fase | Etapa               | Status          | Versão | Observações         |
| ---- | ------------------- | --------------- | ------ | ------------------- |
| 0    | Arquitetura         | 🟡 Em andamento | 1.0.0  | Fundação do projeto |
| 1    | MVP                 | ⚪ Não iniciada  | —      |                     |
| 2    | Recursos Avançados  | ⚪ Não iniciada  | —      |                     |
| 3    | Plataforma Completa | ⚪ Não iniciada  | —      |                     |
---


| Etapa | Descrição                  | Status         |
| ----- | -------------------------- | -------------- |
| 0.1   | Levantamento de Requisitos | ✅ Concluída    |
| 0.2   | Fluxo Comercial            | ✅ Concluída    |
| 0.3   | Modelagem do Banco         | ⏳ Em andamento |
| 0.4   | Arquitetura Backend        | ⬜ Pendente     |
| 0.5   | Arquitetura Frontend       | ⬜ Pendente     |
| 0.6   | Segurança                  | ⬜ Pendente     |
---


| Versão    | Significado                            |
| --------- | -------------------------------------- |
| **1.0.x** | Alterações apenas na documentação.     |
| **1.1.x** | Conclusão de etapas da arquitetura.    |
| **1.2.x** | MVP em desenvolvimento.                |
| **2.0.0** | Primeira versão pública da plataforma. |
| **3.0.0** | Payment Engine integrado.              |

# Índice

## Parte I — Visão Geral

### Capítulo 1 — Introdução
Apresentação da plataforma e propósito do projeto.

### Capítulo 2 — Objetivos
Objetivos gerais, objetivos técnicos e objetivos comerciais.

### Capítulo 3 — Filosofia do Projeto
Princípios de desenvolvimento, reutilização de componentes e evolução contínua.

### Capítulo 4 — Escopo
O que faz parte da plataforma e o que está fora do escopo inicial (MVP).

---

## Parte II — Arquitetura

### Capítulo 5 — Arquitetura Geral
Visão dos principais módulos da plataforma.

### Capítulo 6 — Arquitetura Backend

### Capítulo 7 — Arquitetura Frontend

### Capítulo 8 — Banco de Dados

### Capítulo 9 — APIs

### Capítulo 10 — Segurança

---

## Parte III — Regras de Negócio

### Capítulo 11 — Biblioteca

### Capítulo 12 — Livros

### Capítulo 13 — Capítulos

### Capítulo 14 — Leitor Interativo

### Capítulo 15 — Commerce Lite

### Capítulo 16 — Pedidos

### Capítulo 17 — Permissões de Acesso

### Capítulo 18 — Conteúdo Adulto (+18)

---

## Parte IV — Integrações

### Capítulo 19 — Canal de Comunicação

### Capítulo 20 — Payment Engine

### Capítulo 21 — Banco Inter PJ

### Capítulo 22 — Serviços Externos

---

## Parte V — Desenvolvimento

### Capítulo 23 — Roadmap

### Capítulo 24 — Metodologia de Desenvolvimento

### Capítulo 25 — Padrões de Código

### Capítulo 26 — Estratégia de Testes

### Capítulo 27 — Controle de Versionamento

### Capítulo 28 — Critérios para Encerramento de Etapas

---

## Parte VI — Evolução

### Capítulo 29 — Decisões Arquiteturais (ADRs)

### Capítulo 30 — Histórico do Projeto

### Capítulo 31 — Próximas Evoluções

---

# Estado do Documento

Este documento é a referência oficial da Plataforma de Livros Interativos.

Toda decisão de arquitetura, regra de negócio ou evolução funcional deverá 
ser registrada na EFLI antes de sua implementação.

Sempre que houver divergência entre o código e a documentação, a EFLI deverá 
ser revisada para refletir corretamente a decisão adotada.

Este documento evoluirá continuamente durante todo o ciclo de vida da plataforma 
e deverá permanecer sincronizado com o repositório GitHub.
```


# Capítulo 1 — Introdução

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 09/07/2026

---

# 1. Objetivo da Plataforma

A Plataforma de Livros Interativos é um sistema web desenvolvido para publicação, 
comercialização e consumo de conteúdos digitais interativos.

Seu objetivo é oferecer uma experiência de leitura moderna, permitindo que livros, 
capítulos e outros conteúdos digitais possam integrar diferentes recursos multimídia, 
mecanismos de interação e controle de acesso, atendendo tanto conteúdos gratuitos 
quanto conteúdos comerciais.

A plataforma foi concebida desde o início para crescer de forma modular, permitindo a 
incorporação de novas funcionalidades sem comprometer sua arquitetura.

---

# 2. Motivação

O projeto surgiu da necessidade de disponibilizar livros digitais que ofereçam uma 
experiência superior aos formatos tradicionais, combinando texto, imagens, áudio, 
vídeo, elementos interativos e diferentes formas de navegação.

Além da leitura, a plataforma busca fornecer uma infraestrutura completa para distribuição 
de conteúdo digital, contemplando autenticação, gerenciamento de permissões, comercialização 
de produtos e futura automação financeira.

---

# 3. Visão Geral

A plataforma será composta por módulos independentes, cada um responsável por uma função 
específica do sistema.

Entre os principais módulos previstos estão:

* Autenticação de usuários.
* Biblioteca digital.
* Leitor interativo.
* Commerce Lite.
* Controle de permissões.
* Área administrativa.
* Payment Engine (evolução futura).
* Integrações com serviços externos.

Essa organização permite que novos recursos sejam adicionados gradualmente, preservando a 
estabilidade da plataforma.

---

# 4. Público-Alvo

A plataforma foi concebida para atender usuários interessados em conteúdos digitais interativos, 
incluindo materiais gratuitos, conteúdos premium e publicações destinadas ao público adulto, 
respeitando as políticas de classificação indicativa e controle de acesso.

Sua arquitetura também permitirá futura utilização por autores, editores e administradores 
responsáveis pela publicação e gerenciamento do conteúdo.

---

# 5. Princípios Fundamentais

O desenvolvimento da plataforma seguirá os seguintes princípios:

* Arquitetura modular.
* Evolução contínua.
* Reutilização de componentes.
* Simplicidade na implementação.
* Documentação como fonte oficial do projeto.
* Segurança como requisito permanente.
* Escalabilidade desde as primeiras versões.

Esses princípios orientarão todas as decisões técnicas e funcionais registradas 
na EFLI.

---

# 6. Visão de Longo Prazo

A Plataforma de Livros Interativos será desenvolvida inicialmente como um 
                Produto Mínimo Viável (MVP), 
priorizando funcionalidades essenciais para publicação, comercialização e leitura 
dos livros.

Ao longo de sua evolução, novos módulos serão incorporados, incluindo automação financeira, 
integração com o Banco Inter PJ, múltiplos provedores de pagamento, recursos avançados de 
interatividade e componentes reutilizáveis que poderão ser empregados em outros projetos.

A arquitetura da plataforma foi planejada para permitir esse crescimento de forma incremental, 
preservando a compatibilidade entre as versões e reduzindo a necessidade de refatorações estruturais.


# Capítulo 2 — Objetivos

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 09/07/2026

---

# 1. Objetivo Geral

Desenvolver uma plataforma web para publicação, comercialização e leitura de conteúdos digitais 
interativos, oferecendo uma experiência moderna, segura, escalável e preparada para evolução contínua.

A plataforma deverá permitir que leitores acessem conteúdos gratuitos e comerciais por meio de uma 
interface intuitiva, enquanto administradores e futuros autores disponham de ferramentas para gerenciar 
publicações, permissões e recursos da plataforma.

---

# 2. Objetivos de Negócio

Os objetivos de negócio da Plataforma de Livros Interativos são:

* Disponibilizar uma biblioteca digital organizada e de fácil navegação.
* Permitir a comercialização de livros, capítulos e outros conteúdos digitais.
* Oferecer uma experiência de compra simples, iniciando com o Commerce Lite e 
  evoluindo para um sistema financeiro totalmente automatizado.
* Criar uma plataforma sustentável para distribuição de conteúdo digital.
* Possibilitar a expansão futura para novos modelos de negócio, como assinaturas, 
  coleções, cursos e conteúdos exclusivos.
* Reduzir a dependência de plataformas de terceiros para o gerenciamento comercial e financeiro.

---

# 3. Objetivos Técnicos

O desenvolvimento da plataforma deverá seguir princípios de engenharia de software que garantam 
qualidade, organização e facilidade de manutenção.

Os principais objetivos técnicos são:

* Arquitetura modular.
* Baixo acoplamento entre os módulos.
* Alta coesão das funcionalidades.
* Facilidade de manutenção.
* Escalabilidade horizontal e funcional.
* Código reutilizável em futuros projetos.
* Documentação atualizada e integrada ao repositório.
* Desenvolvimento incremental baseado na EFLI.
* Compatibilidade com futuras integrações financeiras.

---

# 4. Objetivos de Evolução

A plataforma deverá evoluir continuamente sem exigir reestruturações significativas.

Entre os principais objetivos de evolução estão:

* Implantação do Payment Engine.
* Integração com Banco Inter PJ.
* Automatização do processo de vendas.
* Expansão da biblioteca para múltiplos autores.
* Inclusão de novos tipos de conteúdo digital.
* Recursos avançados de interatividade.
* APIs para integração com outros sistemas.
* Reutilização dos componentes em futuros projetos.

Cada nova funcionalidade deverá preservar a compatibilidade com a arquitetura existente.

---

# 5. Critérios de Sucesso

A Plataforma de Livros Interativos será considerada bem-sucedida quando atender aos seguintes critérios:

* Disponibilizar uma experiência de leitura intuitiva e estável.
* Permitir a comercialização de conteúdos digitais desde as primeiras versões do sistema.
* Possibilitar a evolução para automação financeira sem necessidade de refatorações estruturais.
* Manter a documentação técnica sincronizada com o desenvolvimento do projeto.
* Facilitar a entrada de novos desenvolvedores por meio de documentação clara e arquitetura organizada.
* Servir como base tecnológica para outros projetos que compartilhem componentes reutilizáveis.

Os objetivos descritos neste capítulo deverão orientar todas as decisões de arquitetura, desenvolvimento e 
evolução da plataforma ao longo de seu ciclo de vida.


# Capítulo 3 — Filosofia do Projeto

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 09/07/2026

---

# 1. Propósito

A Plataforma de Livros Interativos será desenvolvida seguindo princípios que priorizam simplicidade, 
organização, qualidade e evolução contínua.

Mais do que construir uma aplicação para publicação de livros, o projeto busca estabelecer uma base 
tecnológica sólida, capaz de crescer de forma sustentável ao longo do tempo.

Todas as decisões técnicas e funcionais deverão estar alinhadas com os princípios definidos neste capítulo.

---

# 2. Evolução Incremental

O desenvolvimento será realizado de forma incremental.

Cada funcionalidade deverá ser planejada, documentada, implementada e validada antes do início da etapa seguinte.

Essa abordagem reduz riscos, evita retrabalho e permite que a plataforma esteja sempre em um estado funcional.

O objetivo é disponibilizar versões utilizáveis desde as fases iniciais do projeto.

---

# 3. Documentação como Fonte Oficial

A documentação faz parte do produto.

Toda decisão relevante de arquitetura, regra de negócio ou evolução funcional deverá ser registrada 
na EFLI antes de sua implementação.

A documentação deverá permanecer sincronizada com o código-fonte durante todo o ciclo de vida da plataforma.

---

# 4. Arquitetura Modular

Cada módulo deverá possuir uma responsabilidade bem definida.

Os módulos deverão apresentar baixo acoplamento e alta coesão, permitindo manutenção, testes e evolução 
independentes sempre que possível.

Novas funcionalidades deverão ser incorporadas por meio da criação ou evolução de módulos específicos, 
preservando a estabilidade do restante do sistema.

---

# 5. Reutilização de Componentes

Sempre que viável, os componentes desenvolvidos deverão ser reutilizáveis em outros projetos.

Essa diretriz aplica-se tanto ao código quanto às regras de negócio, APIs, bibliotecas internas e serviços.

A reutilização deverá ser considerada durante o planejamento da arquitetura, evitando dependências desnecessárias 
com funcionalidades específicas da plataforma.

---

# 6. Simplicidade

As soluções adotadas deverão atender às necessidades da etapa atual sem introduzir complexidade desnecessária.

A plataforma evoluirá conforme a demanda do projeto, preservando uma arquitetura preparada para crescimento, 
mas implementando inicialmente apenas os recursos necessários para cada fase.

---

# 7. Qualidade

A qualidade será considerada um requisito permanente.

Cada etapa do desenvolvimento deverá contemplar:

* documentação atualizada;
* implementação organizada;
* testes funcionais;
* validação antes da continuidade do projeto.

Nenhuma etapa será considerada concluída sem atender a esses critérios.

---

# 8. Independência Tecnológica

Sempre que possível, a plataforma deverá evitar dependências excessivas de serviços externos.

Integrações com provedores de pagamento, autenticação ou outros serviços deverão ocorrer por 
meio de módulos bem definidos, permitindo substituições futuras com impacto mínimo sobre a arquitetura.

Esse princípio orienta, por exemplo, a evolução do Commerce Lite para um Payment Engine próprio e a 
integração planejada com o Banco Inter PJ.

---

# 9. Escalabilidade

A arquitetura deverá permitir crescimento gradual sem exigir reestruturações significativas.

Novos módulos, tipos de conteúdo, formas de comercialização e integrações poderão ser incorporados 
preservando a compatibilidade com os componentes existentes.

---

# 10. Visão de Longo Prazo

A Plataforma de Livros Interativos será construída com foco em continuidade.

O objetivo não é apenas entregar um Produto Mínimo Viável (MVP), mas estabelecer uma plataforma capaz 
de evoluir continuamente, incorporando novas funcionalidades, novos modelos de negócio e componentes 
reutilizáveis sem comprometer sua arquitetura.

Cada decisão tomada durante o desenvolvimento deverá considerar não apenas a necessidade imediata da 
etapa atual, mas também seu impacto na evolução futura da plataforma.


# Capítulo 4 — Escopo

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 09/07/2026

---

# 1. Escopo do Projeto

A Plataforma de Livros Interativos tem como objetivo fornecer uma solução completa para publicação, 
comercialização e consumo de conteúdos digitais interativos.

O projeto contempla o desenvolvimento de uma arquitetura modular, preparada para crescimento contínuo, 
permitindo a incorporação de novos recursos sem comprometer a estabilidade do sistema.

O foco inicial da plataforma é a publicação e comercialização de livros interativos, mantendo sua arquitetura 
preparada para futuras expansões.

---

# 2. Escopo do MVP

O Produto Mínimo Viável (MVP) deverá disponibilizar as funcionalidades essenciais para que a plataforma 
possa operar em ambiente de produção.

O MVP compreenderá:

* Cadastro e autenticação de usuários.
* Biblioteca digital.
* Cadastro de livros.
* Organização por capítulos.
* Leitor interativo.
* Controle de permissões de acesso.
* Commerce Lite para gerenciamento de pedidos.
* Integração com WhatsApp para atendimento comercial.
* Área administrativa para gerenciamento do conteúdo.
* Suporte a conteúdos gratuitos e premium.
* Controle de acesso para conteúdos classificados como +18.

O objetivo do MVP é permitir que a plataforma publique e comercialize livros desde suas primeiras versões.

---

# 3. Funcionalidades Fora do Escopo do MVP

As funcionalidades abaixo fazem parte da visão de longo prazo da plataforma, porém não serão implementadas 
durante o desenvolvimento inicial.

Entre elas destacam-se:

* Payment Engine próprio.
* Integração automática com Banco Inter PJ.
* Confirmação automática de pagamentos via PIX.
* Sistema de assinaturas.
* Marketplace para múltiplos autores.
* APIs públicas.
* Aplicativos móveis.
* Recursos avançados de gamificação.
* Inteligência artificial aplicada ao conteúdo.
* Internacionalização.

Esses recursos poderão ser incorporados em versões futuras sem alterar a arquitetura fundamental da plataforma.

---

# 4. Evolução Planejada

O desenvolvimento da plataforma seguirá uma estratégia incremental.

Cada nova funcionalidade deverá representar uma evolução natural da arquitetura existente, evitando reescritas 
completas ou mudanças incompatíveis.

O crescimento do sistema ocorrerá por meio da adição de novos módulos e da expansão dos módulos já existentes.

Sempre que possível, funcionalidades inicialmente implementadas de forma manual deverão evoluir para processos 
automatizados, preservando a compatibilidade com os componentes já desenvolvidos.

---

# 5. Controle de Escopo

Toda nova funcionalidade proposta durante o desenvolvimento deverá ser analisada antes de sua implementação.

Caso a funcionalidade não seja necessária para a conclusão da etapa atual, ela deverá ser registrada na EFLI 
como evolução futura, permanecendo documentada até que faça parte do planejamento oficial do projeto.

Esse processo garante que o projeto mantenha foco em seus objetivos, reduzindo riscos, evitando aumento 
descontrolado do escopo e preservando a qualidade do desenvolvimento.


# Capítulo 5 — Arquitetura Geral

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 09/07/2026

---

# 1. Visão Geral da Arquitetura

A Plataforma de Livros Interativos será desenvolvida utilizando uma arquitetura modular orientada ao domínio 
do negócio.

Cada módulo possuirá responsabilidades claramente definidas e deverá evoluir de forma independente sempre que 
possível.

Essa abordagem reduz o acoplamento entre componentes, facilita a manutenção do sistema e permite a incorporação 
de novas funcionalidades sem comprometer a arquitetura existente.

---

# 2. Organização da Arquitetura

A arquitetura da plataforma será dividida em três grupos de módulos:

* Módulos Core
* Módulos de Apoio
* Módulos de Integração

Cada grupo possui responsabilidades específicas dentro da plataforma.

---

# 3. Módulos Core

Os módulos Core representam o núcleo funcional da plataforma.

São responsáveis pelas principais regras de negócio e pela operação do sistema.

Os módulos Core inicialmente previstos são:

* Auth

  * Cadastro de usuários.
  * Autenticação.
  * Autorização.
  * Recuperação de senha.

* Biblioteca

  * Organização dos livros.
  * Categorias.
  * Pesquisa.
  * Destaques.

* Livros

  * Cadastro.
  * Informações.
  * Estrutura editorial.

* Reader

  * Leitura.
  * Navegação.
  * Recursos interativos.
  * Continuação da leitura.

* Commerce Lite

  * Produtos.
  * Pedidos.
  * Histórico de compras.

* Permissões

  * Controle de acesso.
  * Liberação de conteúdo.
  * Conteúdo premium.
  * Conteúdo adulto (+18).

---

# 4. Módulos de Apoio

Os módulos de apoio oferecem funcionalidades administrativas e operacionais.

Entre eles destacam-se:

* Administração
* Configurações
* Relatórios
* Auditoria
* Logs
* Notificações

Esses módulos apoiam a operação da plataforma sem interferir diretamente nas regras principais 
de negócio.

---

# 5. Módulos de Integração

Os módulos de integração concentram toda comunicação com serviços externos.

Entre eles estão:

* WhatsApp
* Banco Inter PJ
* Payment Engine
* E-mail
* Webhooks
* APIs de terceiros

A centralização dessas integrações reduz dependências e facilita futuras substituições de 
provedores.

---

# 6. Comunicação entre os Módulos

Cada módulo deverá comunicar-se com os demais por meio de interfaces bem definidas.

Sempre que possível, módulos não deverão acessar diretamente regras internas de outros módulos.

Essa estratégia preserva o baixo acoplamento e facilita testes, manutenção e evolução do sistema.

---

# 7. Evolução da Arquitetura

Novos módulos poderão ser incorporados conforme a evolução da plataforma.

Toda nova funcionalidade deverá ser analisada quanto à possibilidade de reutilização e integração com os 
componentes existentes.

A arquitetura deverá permanecer modular, organizada e preparada para suportar novas áreas de negócio sem 
necessidade de reestruturações significativas.

---

# 8. Princípios Arquiteturais

A arquitetura da Plataforma de Livros Interativos seguirá os seguintes princípios:

* Modularidade.
* Baixo acoplamento.
* Alta coesão.
* Reutilização de componentes.
* Evolução incremental.
* Separação de responsabilidades.
* Independência de integrações externas.
* Facilidade de manutenção.
* Escalabilidade.

```
```

# Capítulo 6 — Arquitetura do Backend

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 09/07/2026

---

# 1. Objetivo

O backend da Plataforma de Livros Interativos será responsável por implementar todas as regras de 
negócio, controlar o acesso aos dados, gerenciar integrações externas e disponibilizar APIs para 
comunicação com o frontend.

Sua arquitetura deverá priorizar organização, modularidade, reutilização de componentes e facilidade 
de manutenção.

---

# 2. Arquitetura em Camadas

O backend será organizado em camadas com responsabilidades bem definidas.

As principais camadas serão:

* API
* Aplicação
* Domínio
* Infraestrutura
* Persistência

Cada camada deverá conhecer apenas as responsabilidades necessárias para executar sua função.

---

# 3. Camada de API

Responsável por:

* Expor endpoints REST.
* Receber requisições.
* Validar dados de entrada.
* Controlar autenticação e autorização.
* Encaminhar as solicitações para a camada de aplicação.
* Retornar respostas padronizadas ao cliente.

Essa camada não deverá conter regras de negócio.

---

# 4. Camada de Aplicação

A camada de aplicação será responsável por coordenar os casos de uso da plataforma.

Entre suas responsabilidades estão:

* Orquestrar processos.
* Coordenar múltiplos serviços.
* Executar fluxos de negócio.
* Aplicar regras de aplicação.

Ela funcionará como intermediária entre a API e o domínio.

---

# 5. Camada de Domínio

A camada de domínio conterá as regras centrais da plataforma.

Entre elas:

* Biblioteca.
* Livros.
* Capítulos.
* Pedidos.
* Permissões.
* Commerce Lite.
* Payment Engine.

O domínio deverá permanecer independente de frameworks e tecnologias específicas 
sempre que possível.

---

# 6. Camada de Infraestrutura

A infraestrutura será responsável por toda comunicação com recursos externos.

Inclui:

* Banco de dados.
* Serviços de e-mail.
* WhatsApp.
* Banco Inter PJ.
* Webhooks.
* Serviços de armazenamento.
* APIs externas.

Mudanças em provedores externos deverão afetar apenas esta camada.

---

# 7. Persistência

A camada de persistência será responsável por:

* acesso ao banco de dados;
* consultas;
* gravações;
* atualização de registros;
* remoção de dados.

O acesso aos dados deverá ocorrer por meio de componentes específicos, evitando que regras de 
negócio dependam diretamente da tecnologia de banco utilizada.

---

# 8. Organização dos Módulos

Cada módulo do sistema deverá manter sua própria organização interna.

Exemplo:

* API
* Serviços
* Regras de negócio
* Persistência
* Modelos
* Esquemas
* Testes

Essa organização facilita a manutenção e reduz o acoplamento entre funcionalidades.

---

# 9. Princípios do Backend

O desenvolvimento do backend seguirá os seguintes princípios:

* Separação de responsabilidades.
* Baixo acoplamento.
* Alta coesão.
* Reutilização de código.
* Testabilidade.
* Escalabilidade.
* Independência de integrações externas.
* Organização modular.

Esses princípios deverão orientar toda evolução da arquitetura do backend.


# Capítulo 7 — Arquitetura do Frontend

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 09/07/2026

---

# 1. Objetivo

O frontend da Plataforma de Livros Interativos será responsável por proporcionar uma interface moderna, 
intuitiva e responsiva, permitindo que os usuários interajam com todos os recursos da plataforma de 
forma simples e eficiente.

Sua arquitetura deverá privilegiar organização, reutilização de componentes, escalabilidade e facilidade 
de manutenção.

---

# 2. Arquitetura Baseada em Módulos

O frontend será organizado por módulos de negócio.

Cada módulo concentrará todos os elementos necessários para sua própria funcionalidade, incluindo 
páginas, componentes, serviços, estados, hooks e testes.

Essa organização reduz dependências entre funcionalidades e facilita a evolução da aplicação.

---

# 3. Módulos Principais

Os módulos inicialmente previstos são:

* Auth
* Biblioteca
* Livros
* Reader
* Commerce Lite
* Permissões
* Administração

Novos módulos poderão ser incorporados conforme a evolução da plataforma.

---

# 4. Componentes Compartilhados

Funcionalidades reutilizáveis deverão ser disponibilizadas por meio de componentes 
compartilhados.

Exemplos:

* Botões.
* Formulários.
* Modais.
* Tabelas.
* Paginação.
* Barras de navegação.
* Componentes de layout.

Esses componentes deverão permanecer independentes das regras específicas de cada módulo.

---

# 5. Gerenciamento de Estado

O gerenciamento de estado deverá priorizar simplicidade e organização.

Estados globais serão utilizados apenas quando realmente necessários.

Sempre que possível, o estado permanecerá restrito ao módulo responsável pela funcionalidade.

---

# 6. Comunicação com o Backend

Toda comunicação com o backend ocorrerá por meio das APIs oficiais da plataforma.

O frontend não deverá implementar regras de negócio que pertençam ao backend.

Sua responsabilidade será apresentar informações ao usuário, coletar dados de entrada e encaminhar 
solicitações para os serviços correspondentes.

---

# 7. Responsividade

A interface deverá ser responsiva desde as primeiras versões.

A plataforma deverá oferecer boa experiência de uso em:

* Computadores.
* Tablets.
* Smartphones.

A adaptação para diferentes resoluções fará parte do desenvolvimento contínuo da interface.

---

# 8. Reutilização

Componentes visuais deverão ser desenvolvidos para reutilização sempre que possível.

A padronização visual reduzirá duplicação de código e facilitará futuras evoluções da 
interface.

---

# 9. Evolução

Novas funcionalidades deverão ser incorporadas por meio da criação de novos módulos ou expansão 
dos módulos existentes.

A arquitetura deverá preservar baixo acoplamento, organização e facilidade de manutenção durante 
toda a evolução da plataforma.

# Capítulo 8 — Banco de Dados

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 09/07/2026

---

# 1. Objetivo

O banco de dados da Plataforma de Livros Interativos será responsável por armazenar de forma consistente 
todas as informações necessárias para operação da plataforma.

Sua modelagem será baseada nas entidades do domínio do negócio, priorizando organização, integridade, 
escalabilidade e facilidade de evolução.

Os detalhes técnicos da implementação física do banco de dados serão documentados separadamente 
em `docs/banco/modelo_er.md`.

---

# 2. Modelagem Conceitual

A modelagem do banco será orientada pelas entidades que representam os principais conceitos da plataforma.

Cada entidade possuirá responsabilidades claramente definidas e relacionamentos consistentes com as demais.

Essa abordagem permitirá que o modelo evolua naturalmente conforme novas funcionalidades forem incorporadas.

---

# 3. Entidades Principais

A arquitetura inicial da plataforma contempla as seguintes entidades conceituais:

## Usuário

Representa as pessoas que utilizam a plataforma.

Responsabilidades:

* Autenticação.
* Perfil.
* Preferências.
* Permissões de acesso.
* Histórico de utilização.

---

## Livro

Representa uma publicação disponível na biblioteca.

Responsabilidades:

* Informações editoriais.
* Organização do conteúdo.
* Classificação.
* Disponibilidade.

---

## Capítulo

Representa uma unidade de conteúdo pertencente a um livro.

Responsabilidades:

* Estrutura da leitura.
* Sequenciamento.
* Conteúdo.
* Recursos interativos.

---

## Categoria

Responsável pela organização temática da biblioteca.

---

## Produto

Representa um item comercializável.

Um produto poderá representar um livro completo, um conjunto de capítulos ou outros conteúdos digitais disponibilizados pela plataforma.

---

## Pedido

Representa uma intenção de compra realizada por um usuário.

Seu ciclo de vida será independente do mecanismo de pagamento utilizado.

---

## Item de Pedido

Representa cada item pertencente a um pedido.

Essa separação permite que um mesmo pedido contenha múltiplos produtos.

---

## Permissão

Define quais conteúdos um usuário está autorizado a acessar.

A concessão de permissões poderá ocorrer por compra, administração ou futuras regras de negócio.

---

## Sessão de Leitura

Responsável por armazenar o progresso de leitura do usuário.

Permite continuidade da leitura entre diferentes dispositivos.

---

## Autor

Representa os responsáveis pela criação dos conteúdos publicados.

Sua estrutura permitirá futura expansão para múltiplos autores.

---

## Arquivo

Representa recursos digitais utilizados pela plataforma.

Exemplos:

* Imagens.
* Áudios.
* Vídeos.
* Documentos.

---

# 4. Evolução da Modelagem

Novas entidades poderão ser incorporadas conforme a evolução da plataforma.

Entre elas:

* Pagamentos.
* Assinaturas.
* Planos.
* Notificações.
* Avaliações.
* Comentários.
* Estatísticas.
* Recursos de inteligência artificial.

A inclusão dessas entidades deverá preservar a compatibilidade com o modelo conceitual existente.

---

# 5. Integridade

Todas as entidades deverão possuir relacionamentos consistentes, preservando a integridade das informações 
e evitando duplicidade de dados.

A modelagem privilegiará normalização, clareza e facilidade de manutenção.

---

# 6. Separação entre Modelo Conceitual e Modelo Físico

A EFLI documenta exclusivamente o modelo conceitual da plataforma.

A implementação física do banco de dados, incluindo tabelas, tipos de dados, índices, chaves e otimizações 
específicas, será documentada em arquivos próprios da arquitetura técnica.

Essa separação garante maior independência entre as regras de negócio e a tecnologia utilizada para persistência 
dos dados.


## Nota Arquitetural 01 — Estrutura de Cenas

Durante a definição da arquitetura conceitual da Plataforma de Livros Interativos foi identificada a necessidade 
de suportar conteúdos com alto nível de interatividade, incluindo narrativas não lineares, diálogos, escolhas, 
jogos, quizzes e outros recursos dinâmicos.

Dessa forma, considera-se que um **Capítulo** não representa necessariamente uma sequência fixa de páginas, mas 
sim uma coleção organizada de **Cenas**.

Uma **Cena** representa uma unidade de apresentação e interação da narrativa, podendo conter diferentes 
elementos, tais como:

* Texto.
* Imagens.
* Áudio.
* Vídeo.
* Personagens.
* Diálogos.
* Escolhas.
* Minijogos.
* Formulários.
* Recursos multimídia.
* Outros componentes interativos.

As cenas poderão estabelecer relacionamentos entre si, permitindo fluxos lineares ou ramificados, de acordo com 
as regras definidas pelo conteúdo.

Essa abordagem amplia significativamente a capacidade da plataforma para suportar livros interativos, RPGs narrativos, 
visual novels, cursos interativos e outros formatos de conteúdo digital.

A modelagem definitiva da entidade **Cena**, seus relacionamentos e suas regras de negócio será detalhada durante 
a especificação das entidades conceituais da plataforma, preservando a compatibilidade com a arquitetura geral definida 
na EFLI.


# Capítulo 9 — APIs

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 09/07/2026

---

# 1. Objetivo

As APIs da Plataforma de Livros Interativos constituem a interface oficial de comunicação entre o frontend, 
o backend e futuras integrações externas.

Seu objetivo é disponibilizar serviços de forma organizada, segura e consistente, preservando o desacoplamento 
entre os diferentes componentes da arquitetura.

A API representa o contrato público da plataforma e deverá permanecer estável sempre que possível.

---

# 2. Organização por Domínio

As APIs serão organizadas de acordo com os módulos de negócio da plataforma.

Os principais grupos previstos são:

* Auth
* Usuários
* Biblioteca
* Livros
* Capítulos
* Reader
* Commerce Lite
* Pedidos
* Permissões
* Administração

Essa organização facilita a manutenção e reduz o acoplamento entre funcionalidades.

---

# 3. Responsabilidades

Cada grupo de APIs será responsável apenas pelas operações relacionadas ao seu domínio.

As APIs deverão:

* Receber requisições.
* Validar dados de entrada.
* Encaminhar as solicitações para as regras de negócio.
* Retornar respostas padronizadas.

As regras de negócio deverão permanecer no backend, nunca na camada de API.

---

# 4. Comunicação

Toda comunicação entre frontend e backend deverá ocorrer exclusivamente por meio das 
APIs oficiais da plataforma.

O acesso direto ao banco de dados por aplicações clientes não será permitido.

Essa separação garante maior segurança, flexibilidade e facilidade de evolução.

---

# 5. Versionamento

As APIs deverão ser preparadas para versionamento.

Sempre que alterações incompatíveis forem necessárias, novas versões deverão coexistir com as 
anteriores durante o período de migração.

Essa estratégia reduz impactos sobre aplicações clientes e integrações externas.

---

# 6. Padronização

As APIs deverão seguir um padrão único de nomenclatura, estrutura de respostas e tratamento de erros.

Essa padronização facilitará o desenvolvimento do frontend, dos testes automatizados e das integrações 
futuras.

---

# 7. Segurança

Todas as APIs protegidas deverão exigir autenticação e autorização conforme as permissões do usuário.

Informações sensíveis deverão ser tratadas de acordo com os princípios de segurança definidos na arquitetura 
da plataforma.

---

# 8. Evolução

Novos serviços poderão ser incorporados conforme a evolução da plataforma.

As APIs deverão preservar compatibilidade com os módulos existentes e manter um contrato claro entre os componentes 
do sistema.

A documentação detalhada de endpoints, parâmetros, contratos de requisição e resposta será mantida em `docs/api/`, 
permitindo que a EFLI permaneça focada na arquitetura conceitual.


# Capítulo 10 — Segurança

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 10/07/2026

---

# 1. Objetivo

A segurança da Plataforma de Livros Interativos tem como objetivo proteger usuários, conteúdos, informações comerciais 
e recursos da plataforma.

A arquitetura de segurança deverá considerar tanto aspectos técnicos quanto regras de negócio, garantindo que cada 
usuário tenha acesso apenas aos recursos para os quais possui autorização.

---

# 2. Princípios de Segurança

Toda implementação deverá seguir os seguintes princípios:

* Autenticação obrigatória para recursos protegidos.
* Autorização baseada em permissões.
* Menor privilégio possível.
* Validação de todas as operações no backend.
* Proteção das informações sensíveis.
* Registro de eventos relevantes para auditoria.

Esses princípios deverão orientar todas as funcionalidades da plataforma.

---

# 3. Autenticação

A autenticação será responsável por identificar o usuário perante a plataforma.

Entre suas responsabilidades estão:

* Login.
* Encerramento de sessão.
* Recuperação de acesso.
* Gerenciamento da identidade do usuário.

Os mecanismos técnicos poderão evoluir ao longo do projeto sem alterar as regras de negócio.

---

# 4. Autorização

Após autenticado, cada usuário terá acesso apenas aos recursos permitidos.

A autorização será baseada em permissões associadas ao usuário e às regras definidas pela plataforma.

Nenhum conteúdo protegido deverá ser disponibilizado sem validação prévia no backend.

---

# 5. Proteção do Conteúdo

O acesso a livros, capítulos, cenas e demais conteúdos digitais será controlado por regras de permissão.

Entre os critérios previstos estão:

* Conteúdo gratuito.
* Conteúdo premium.
* Conteúdo adquirido.
* Conteúdo administrativo.
* Conteúdo classificado como +18.

A simples ocultação de elementos na interface não será considerada mecanismo de segurança.

Toda autorização deverá ser validada pelo backend.

---

# 6. Segurança Comercial

As operações relacionadas à comercialização de produtos deverão preservar a integridade dos pedidos e dos 
direitos de acesso concedidos aos usuários.

A evolução do Commerce Lite para o Payment Engine deverá manter compatibilidade com esse modelo de segurança, 
garantindo que permissões sejam concedidas apenas após a confirmação das regras de negócio definidas para cada 
processo de venda.

---

# 7. Integrações Externas

Toda integração com serviços externos deverá ocorrer por canais seguros e mecanismos de autenticação apropriados.

As credenciais de acesso a provedores externos deverão permanecer protegidas e nunca ser expostas ao frontend.

---

# 8. Auditoria

Eventos relevantes para a segurança da plataforma poderão ser registrados para fins de rastreabilidade, diagnóstico 
e suporte.

Entre os eventos passíveis de registro estão:

* Autenticações.
* Alterações de permissões.
* Operações administrativas.
* Processos de compra.
* Integrações externas.

A política de auditoria poderá evoluir conforme as necessidades da plataforma.

---

# 9. Evolução

A arquitetura de segurança deverá acompanhar a evolução da plataforma, incorporando novos mecanismos de proteção 
sempre que necessário, sem comprometer a compatibilidade com os módulos existentes.

Toda nova funcionalidade deverá ser analisada sob a perspectiva da segurança antes de sua implementação.


# Capítulo 11 — Biblioteca

## Status

**Status:** Em desenvolvimento

**Versão:** 1.1.0

**Última atualização:** 10/07/2026

---

# 1. Objetivo

O módulo Biblioteca é responsável pela organização, descoberta e acesso aos conteúdos disponibilizados pela 
Plataforma de Livros Interativos.

Para atender às diferentes necessidades dos usuários, a Biblioteca é composta por dois ambientes complementares:

* **Catálogo**, destinado à descoberta e divulgação dos conteúdos disponíveis na plataforma.
* **Minha Biblioteca**, destinada ao gerenciamento dos conteúdos aos quais cada usuário possui acesso.

Essa separação permite uma experiência mais intuitiva, facilita a evolução da plataforma e mantém claramente 
distintas as funções de divulgação e consumo dos conteúdos.

---

# 2. Catálogo

O Catálogo representa a vitrine pública da plataforma.

Seu objetivo é permitir que visitantes e usuários explorem o acervo disponível, conheçam novos conteúdos e obtenham 
informações antes da leitura ou da aquisição.

O Catálogo poderá apresentar:

* Livros.
* Coleções.
* Séries.
* Conteúdos gratuitos.
* Conteúdos premium.
* Lançamentos.
* Destaques.
* Recomendações.

A presença de um conteúdo no Catálogo não implica autorização para sua leitura.

---

# 3. Minha Biblioteca

Minha Biblioteca representa o acervo pessoal de cada usuário.

Ela reúne exclusivamente os conteúdos para os quais o usuário possui permissão de acesso, independentemente da 
forma como essa permissão foi concedida.

As permissões poderão ser obtidas por diferentes mecanismos, incluindo:

* Conteúdos gratuitos.
* Aquisição de produtos.
* Liberação administrativa.
* Campanhas promocionais.
* Futuras regras de negócio.

Minha Biblioteca será o ponto principal de acesso do usuário aos conteúdos autorizados.

---

# 4. Organização do Acervo

Os conteúdos poderão ser organizados utilizando diferentes critérios, incluindo:

* Categoria.
* Autor.
* Série ou coleção.
* Data de publicação.
* Popularidade.
* Data da aquisição.
* Último acesso.
* Continuação da leitura.

Novos critérios poderão ser incorporados conforme a evolução da plataforma.

---

# 5. Pesquisa

O Catálogo deverá disponibilizar mecanismos de pesquisa para facilitar a localização de conteúdos.

A pesquisa poderá considerar informações como:

* Título.
* Autor.
* Categoria.
* Palavras-chave.
* Descrição.

Futuramente, mecanismos inteligentes de recomendação poderão complementar a pesquisa tradicional.

---

# 6. Informações dos Conteúdos

Cada conteúdo poderá apresentar informações como:

* Capa.
* Título.
* Autor.
* Categoria.
* Descrição resumida.
* Classificação indicativa.
* Tipo de acesso (gratuito ou premium).
* Informações editoriais.

Essas informações auxiliam o usuário na descoberta e seleção dos conteúdos.

---

# 7. Controle de Acesso

O controle de acesso aos conteúdos será baseado em permissões.

O Catálogo poderá apresentar conteúdos protegidos, porém a autorização para leitura será sempre 
validada pelo backend.

A aquisição de um conteúdo não altera o Catálogo.

Após a concessão da permissão correspondente, o conteúdo passa a integrar Minha Biblioteca, tornando-se 
disponível para leitura.

---

# 8. Continuidade da Leitura

Minha Biblioteca será responsável por apresentar o progresso individual de leitura do usuário.

Entre as funcionalidades previstas estão:

* Continuar de onde parou.
* Histórico de leitura.
* Favoritos.
* Últimos conteúdos acessados.
* Progresso por capítulo.
* Evolução futura para progresso por cena e demais elementos interativos.

---

# 9. Evolução

A Biblioteca deverá permanecer preparada para suportar novos formatos de conteúdo sem necessidade de alterações 
estruturais significativas.

Entre as evoluções previstas destacam-se:

* Recomendações personalizadas.
* Avaliações.
* Comentários.
* Inteligência artificial para descoberta de conteúdos.
* Organização por coleções.
* Organização por séries.
* Novos formatos de conteúdo digital.

---

# 10. Princípios

A Biblioteca seguirá os seguintes princípios:

* Separação entre descoberta e consumo de conteúdo.
* Organização consistente do acervo.
* Facilidade de navegação.
* Controle de acesso baseado em permissões.
* Evolução incremental.
* Baixo acoplamento com outros módulos.
* Reutilização de componentes.
* Compatibilidade com futuras evoluções da plataforma.


# Capítulo 12 — Livros

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 10/07/2026

---

# 1. Objetivo

O Livro representa a principal unidade de publicação da Plataforma de Livros Interativos.

Ele organiza conteúdos, recursos e informações editoriais, servindo como ponto central da experiência 
de leitura.

Na arquitetura da plataforma, um livro é tratado como uma entidade de domínio, independente do formato 
em que seu conteúdo é apresentado.

---

# 2. Estrutura Geral

Cada livro será composto por uma estrutura hierárquica organizada da seguinte forma:

```text
Livro
    └── Capítulos
            └── Cenas
                    └── Elementos Interativos
```

Essa organização permite suportar tanto livros tradicionais quanto conteúdos altamente interativos.

---

# 3. Informações Editoriais

Cada livro poderá possuir informações como:

* Título.
* Subtítulo.
* Autor.
* Categoria.
* Coleção ou série.
* Descrição.
* Capa.
* Idioma.
* Classificação indicativa.
* Versão.
* Data de publicação.
* Status de publicação.

Essas informações auxiliam na organização do catálogo e na apresentação ao usuário.

---

# 4. Organização do Conteúdo

O conteúdo do livro será dividido em capítulos.

Cada capítulo poderá conter uma ou mais cenas, organizadas de acordo com a narrativa definida pelo autor.

Essa estrutura permite desde uma leitura linear até experiências interativas com múltiplos caminhos.

---

# 5. Recursos Associados

Um livro poderá utilizar diferentes tipos de recursos digitais, incluindo:

* Imagens.
* Áudios.
* Vídeos.
* Ilustrações.
* Documentos complementares.
* Recursos interativos.

Os recursos serão organizados de forma independente do conteúdo textual, facilitando sua reutilização e 
manutenção.

---

# 6. Publicação

O ciclo de vida de um livro poderá incluir diferentes estados, como:

* Em desenvolvimento.
* Em revisão.
* Publicado.
* Arquivado.

Além disso, capítulos individuais poderão possuir estados próprios, permitindo a publicação gradual da obra.

---

# 7. Comercialização

Um livro poderá ser disponibilizado de diferentes formas:

* Gratuito.
* Premium.
* Parte de uma coleção.
* Vinculado a campanhas promocionais.
* Associado a futuros modelos de assinatura.

As regras comerciais serão tratadas pelos módulos Commerce Lite e Payment Engine, preservando a independência 
entre conteúdo e comercialização.

---

# 8. Controle de Acesso

O acesso ao livro dependerá das permissões concedidas ao usuário.

A existência de um livro no Catálogo não garante autorização para leitura.

As permissões serão verificadas pelo backend antes do acesso ao conteúdo.

---

# 9. Evolução

A arquitetura dos livros deverá permitir futuras expansões sem necessidade de alterações estruturais significativas.

Entre as evoluções previstas estão:

* Publicações seriadas.
* Edições revisadas.
* Múltiplos autores.
* Traduções.
* Conteúdo adicional.
* Estatísticas de leitura.
* Recursos avançados de interatividade.

---

# 10. Princípios

O módulo Livros seguirá os seguintes princípios:

* Organização modular do conteúdo.
* Separação entre conteúdo e comercialização.
* Flexibilidade para diferentes formatos de publicação.
* Compatibilidade com conteúdos lineares e interativos.
* Evolução incremental.
* Reutilização de recursos.
* Integração com os demais módulos da plataforma.


# Capítulo 13 — Capítulos

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 10/07/2026

---

# 1. Objetivo

O Capítulo representa a principal unidade narrativa de um livro.

Sua função é organizar uma parte da história ou do conteúdo, estruturando a sequência de cenas 
e definindo a experiência de leitura do usuário.

O capítulo é independente da forma como será comercializado, permitindo diferentes estratégias 
de distribuição sem alterar sua estrutura interna.

---

# 2. Estrutura Geral

Cada capítulo será composto por uma ou mais cenas.

A organização conceitual da plataforma é representada pela seguinte estrutura:

```text
Livro
    └── Capítulos
            └── Cenas
                    └── Elementos Interativos
```

Essa organização permite representar desde capítulos totalmente lineares até narrativas 
altamente interativas.

---

# 3. Organização das Cenas

As cenas representam a menor unidade narrativa organizada pelo capítulo.

Elas poderão ser apresentadas de forma:

* Linear.
* Ramificada.
* Condicional.
* Dinâmica.

A definição detalhada da estrutura de cenas encontra-se registrada na **NA-001 — Estrutura 
de Cenas**.

---

# 4. Conteúdo

Um capítulo poderá conter diferentes tipos de conteúdo, incluindo:

* Texto.
* Imagens.
* Áudios.
* Vídeos.
* Diálogos.
* Escolhas.
* Questionários.
* Minijogos.
* Recursos multimídia.
* Outros elementos interativos.

A plataforma não restringe um capítulo ao formato tradicional de páginas.

---

# 5. Fluxo Narrativo

Cada capítulo poderá definir seu próprio fluxo de navegação.

Esse fluxo poderá conter:

* Sequência linear.
* Escolhas do leitor.
* Caminhos alternativos.
* Eventos condicionais.
* Múltiplos finais.
* Retorno para cenas anteriores.

Essa flexibilidade permite diferentes estilos de narrativa utilizando a mesma arquitetura.

---

# 6. Estado do Capítulo

Durante seu ciclo de vida, um capítulo poderá assumir diferentes estados, tais como:

* Em desenvolvimento.
* Em revisão.
* Publicado.
* Arquivado.

Cada capítulo poderá evoluir independentemente dos demais capítulos do mesmo livro.

---

# 7. Controle de Acesso

O acesso aos capítulos será controlado pelas permissões concedidas ao usuário.

Dependendo das regras comerciais definidas para o livro, um capítulo poderá:

* Fazer parte de um livro gratuito.
* Integrar um livro premium.
* Ser disponibilizado individualmente.
* Compor pacotes de capítulos.
* Participar de campanhas promocionais.

As regras de acesso serão sempre validadas pelo backend.

---

# 8. Continuidade da Leitura

O progresso do usuário será registrado durante a leitura.

A plataforma deverá permitir que o leitor retorne ao ponto onde interrompeu a leitura.

Inicialmente, o progresso poderá ser associado ao capítulo e, futuramente, evoluir para 
o nível de cena e de elementos interativos, preservando compatibilidade com a arquitetura 
da plataforma.

---

# 9. Evolução

A arquitetura dos capítulos deverá permanecer preparada para futuras expansões.

Entre as evoluções previstas estão:

* Narrativas não lineares.
* RPGs narrativos.
* Visual novels.
* Conteúdo educacional interativo.
* Jogos baseados em escolhas.
* Recursos avançados de gamificação.

---

# 10. Princípios

O módulo Capítulos seguirá os seguintes princípios:

* Organização narrativa modular.
* Independência da comercialização.
* Compatibilidade com diferentes estilos de narrativa.
* Integração com a estrutura de cenas.
* Evolução incremental.
* Reutilização de recursos.
* Baixo acoplamento com outros módulos.


# Capítulo 14 — Reader (Leitor Interativo)

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 10/07/2026

---

# 1. Objetivo

O Reader é o módulo responsável pela apresentação e execução dos conteúdos interativos 
da plataforma.

Seu objetivo é proporcionar uma experiência de leitura dinâmica, permitindo que diferentes 
tipos de conteúdo sejam exibidos e que as interações do usuário influenciem o progresso da 
narrativa.

O Reader constitui a principal interface entre o usuário e o conteúdo publicado.

---

# 2. Responsabilidades

O Reader será responsável por:

* Apresentar o conteúdo das cenas.
* Executar elementos interativos.
* Registrar o progresso da leitura.
* Processar interações do usuário.
* Controlar a navegação entre cenas.
* Restaurar sessões anteriores.
* Comunicar eventos aos demais módulos da plataforma.

---

# 3. Modelo de Execução

O Reader executará o conteúdo seguindo a estrutura conceitual da plataforma:

```text
Livro
    └── Capítulo
            └── Cena
                    └── Elementos Interativos
```

O Reader não possui responsabilidade sobre a organização dos livros ou capítulos.

Sua função é interpretar e executar as cenas recebidas pelo sistema.

---

# 4. Execução das Cenas

Cada cena poderá conter diferentes elementos, incluindo:

* Texto.
* Imagens.
* Áudio.
* Vídeo.
* Diálogos.
* Escolhas.
* Questionários.
* Minijogos.
* Recursos multimídia.
* Outros elementos definidos pela plataforma.

O Reader deverá interpretar cada elemento de acordo com seu tipo.

---

# 5. Estado da Leitura

Durante a utilização da plataforma, o Reader manterá informações relacionadas ao estado 
da leitura.

Entre elas:

* Última cena acessada.
* Progresso do capítulo.
* Escolhas realizadas.
* Variáveis narrativas.
* Recursos desbloqueados.
* Informações necessárias para continuidade da experiência.

O modelo poderá evoluir para suportar novos tipos de estado sem necessidade de alterações 
estruturais.

---

# 6. Navegação

A navegação entre cenas poderá ocorrer de diferentes formas:

* Sequencial.
* Por decisão do usuário.
* Por condições definidas pela narrativa.
* Por eventos internos da plataforma.

Essa flexibilidade permitirá a criação de experiências lineares e não lineares.

---

# 7. Integração com Outros Módulos

O Reader trabalhará em conjunto com:

* Minha Biblioteca.
* Permissões.
* Livros.
* Capítulos.
* Commerce Lite (quando aplicável).
* Futuras funcionalidades da plataforma.

Cada módulo permanecerá responsável por suas próprias regras de negócio, mantendo o Reader 
focado exclusivamente na execução do conteúdo.

---

# 8. Continuidade da Experiência

O Reader deverá permitir que o usuário interrompa a leitura e retorne posteriormente ao mesmo 
ponto.

Sempre que possível, a plataforma restaurará automaticamente o estado da sessão de leitura, 
preservando a experiência do usuário.

---

# 9. Evolução

A arquitetura do Reader deverá permanecer preparada para incorporar novos recursos, incluindo:

* Animações.
* RPG narrativo.
* Visual novels.
* Minijogos.
* Recursos educacionais.
* Inteligência artificial.
* Conteúdo adaptativo.
* Novos tipos de elementos interativos.

---

# 10. Princípios

O Reader seguirá os seguintes princípios:

* Separação entre conteúdo e execução.
* Modularidade.
* Extensibilidade.
* Compatibilidade com diferentes formatos narrativos.
* Preservação do estado da leitura.
* Baixo acoplamento.
* Reutilização de componentes.
* Evolução incremental.


# Capítulo 15 — Commerce Lite

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 10/07/2026

---

# 1. Objetivo

O Commerce Lite é o módulo responsável por orquestrar o processo de aquisição de conteúdos da 
Plataforma de Livros Interativos.

Seu objetivo é controlar o fluxo entre a intenção de aquisição do usuário, a criação do pedido, 
a confirmação da operação e a concessão das permissões de acesso.

O Commerce Lite não realiza processamento financeiro. Sua responsabilidade é gerenciar o processo 
de aquisição de forma independente dos meios de pagamento utilizados.

---

# 2. Responsabilidades

O Commerce Lite será responsável por:

* Iniciar o processo de aquisição.
* Criar pedidos.
* Acompanhar o estado das aquisições.
* Solicitar a concessão de permissões após a confirmação da operação.
* Integrar-se com diferentes provedores de confirmação de pagamento.

---

# 3. Independência dos Meios de Pagamento

O Commerce Lite não possui conhecimento sobre a tecnologia utilizada para processar pagamentos.

A confirmação de uma aquisição poderá ocorrer por diferentes mecanismos, tais como:

* Liberação manual.
* WhatsApp Business.
* PIX manual.
* Payment Engine.
* Banco Inter.
* Outros provedores de pagamento.

Essa separação preserva a independência da arquitetura e facilita futuras integrações.

---

# 4. Fluxo Geral

O processo de aquisição seguirá, de forma conceitual, o seguinte fluxo:

```text
Catálogo
    ↓
Seleção do Conteúdo
    ↓
Commerce Lite
    ↓
Pedido
    ↓
Confirmação da Operação
    ↓
Permissão
    ↓
Minha Biblioteca
    ↓
Reader
```

Cada etapa possui responsabilidades próprias, reduzindo o acoplamento entre os módulos.

---

# 5. Pedidos

Toda aquisição iniciada pelo usuário resultará na criação de um pedido.

O pedido representará a intenção de aquisição e permanecerá aguardando a confirmação da 
operação antes da concessão das permissões correspondentes.

As regras detalhadas de pedidos serão especificadas no Capítulo 16.

---

# 6. Concessão de Permissões

Após a confirmação da operação, o Commerce Lite solicitará ao módulo de Permissões a concessão 
do direito de acesso ao conteúdo adquirido.

O acesso será baseado em permissões, nunca em alterações diretas no catálogo ou nos conteúdos.

---

# 7. Integração com Outros Módulos

O Commerce Lite trabalhará em conjunto com:

* Catálogo.
* Minha Biblioteca.
* Pedidos.
* Permissões.
* Payment Engine.
* Serviços externos de confirmação de pagamento.

Cada módulo permanecerá responsável apenas por suas atribuições específicas.

---

# 8. Evolução

A arquitetura do Commerce Lite deverá permanecer preparada para incorporar novos meios 
de aquisição e novos modelos comerciais, incluindo:

* Assinaturas.
* Promoções.
* Cupons de desconto.
* Pacotes de conteúdos.
* Licenças temporárias.
* Campanhas promocionais.
* Novos provedores financeiros.

---

# 9. Princípios

O Commerce Lite seguirá os seguintes princípios:

* Separação entre comercialização e processamento financeiro.
* Independência dos meios de pagamento.
* Concessão de acesso baseada em permissões.
* Baixo acoplamento entre módulos.
* Reutilização de componentes.
* Evolução incremental.
* Compatibilidade com futuras integrações.


# Capítulo 16 — Pedidos

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 10/07/2026

---

# 1. Objetivo

O módulo Pedidos é responsável por registrar formalmente toda intenção de aquisição realizada 
na Plataforma de Livros Interativos.

Cada pedido representa um processo de negócio independente, acompanhando sua evolução desde a 
criação até sua conclusão ou encerramento.

O pedido não concede acesso ao conteúdo. Sua função é registrar e controlar o processo comercial.

---

# 2. Responsabilidades

O módulo Pedidos será responsável por:

* Registrar novas intenções de aquisição.
* Armazenar os dados da operação.
* Controlar o estado do pedido.
* Disponibilizar informações para auditoria.
* Permitir integração com serviços financeiros.
* Servir como referência para a concessão de permissões.

---

# 3. Ciclo de Vida

Todo pedido deverá seguir um ciclo de vida bem definido.

Estados inicialmente previstos:

* Criado.
* Aguardando confirmação.
* Confirmado.
* Cancelado.
* Expirado.
* Concluído.

Novos estados poderão ser incorporados conforme a evolução da plataforma.

---

# 4. Independência Financeira

O pedido não possui responsabilidade sobre o processamento financeiro.

Sua confirmação poderá ocorrer por diferentes mecanismos, incluindo:

* Liberação manual.
* WhatsApp Business.
* PIX manual.
* Payment Engine.
* Banco Inter.
* Outros provedores.

Essa separação garante independência entre o módulo de pedidos e os serviços financeiros.

---

# 5. Relação com Permissões

Após a confirmação da operação, o pedido poderá originar a concessão das permissões correspondentes 
ao conteúdo adquirido.

O acesso ao conteúdo dependerá exclusivamente do módulo de Permissões.

---

# 6. Auditoria

Todos os pedidos permanecerão registrados, independentemente do resultado da operação.

Esse histórico permitirá:

* Auditoria.
* Estatísticas comerciais.
* Relatórios.
* Diagnóstico de falhas.
* Evolução da plataforma.

O histórico de pedidos constitui um patrimônio de informações do sistema.

---

# 7. Integração

O módulo Pedidos poderá integrar-se com:

* Commerce Lite.
* Payment Engine.
* Banco Inter.
* WhatsApp Business.
* Administração.
* Permissões.
* Minha Biblioteca.

Cada integração ocorrerá preservando a responsabilidade de cada módulo.

---

# 8. Evolução

O módulo Pedidos deverá permanecer preparado para suportar novos modelos comerciais, incluindo:

* Assinaturas.
* Renovação automática.
* Compras recorrentes.
* Licenças temporárias.
* Campanhas promocionais.
* Novos meios de confirmação de pagamento.

---

# 9. Princípios

O módulo Pedidos seguirá os seguintes princípios:

* Registro permanente das operações.
* Independência do processamento financeiro.
* Controle por estados.
* Baixo acoplamento.
* Rastreabilidade.
* Reutilização de componentes.
* Evolução incremental.

# Capítulo 17 — Permissões de Acesso

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 12/07/2026

---

# 1. Objetivo

O módulo de Permissões é responsável por controlar o acesso dos usuários aos recursos da Plataforma 
de Livros Interativos.

Toda autorização para utilização de conteúdos ou funcionalidades deverá ser concedida por meio deste 
módulo, tornando-o a referência oficial para o controle de acesso da plataforma.

---

# 2. Princípios

A arquitetura da plataforma adota o princípio de que todo acesso será baseado em permissões.

Nenhum módulo deverá implementar regras próprias de autorização.

As decisões relacionadas ao acesso serão centralizadas neste módulo.

---

# 3. Responsabilidades

O módulo será responsável por:

* Conceder permissões.
* Revogar permissões.
* Consultar permissões.
* Validar permissões durante o acesso.
* Registrar alterações relevantes para auditoria.
* Fornecer informações aos demais módulos.

---

# 4. Tipos de Permissões

A plataforma poderá conceder permissões para diferentes recursos, incluindo:

* Livros.
* Capítulos.
* Cenas.
* Conteúdos extras.
* Conteúdo adulto (+18).
* Funcionalidades administrativas.
* Recursos especiais.

Novos tipos poderão ser incorporados conforme a evolução da plataforma.

---

# 5. Origem das Permissões

As permissões poderão ser concedidas por diferentes mecanismos, tais como:

* Conteúdo gratuito.
* Aquisição de produtos.
* Liberação administrativa.
* Campanhas promocionais.
* Cupons.
* Assinaturas.
* Futuros modelos comerciais.

Independentemente da origem, todas as permissões serão tratadas de forma unificada.

---

# 6. Validação

Sempre que um usuário solicitar acesso a um recurso protegido, o backend deverá consultar 
o módulo de Permissões antes de disponibilizar o conteúdo.

A interface do usuário não será considerada mecanismo de segurança.

Todas as validações ocorrerão no servidor.

---

# 7. Integração

O módulo de Permissões poderá ser utilizado por:

* Catálogo.
* Minha Biblioteca.
* Reader.
* Commerce Lite.
* Pedidos.
* Payment Engine.
* Administração.

Cada módulo utilizará apenas os serviços públicos disponibilizados pelo módulo de Permissões.

---

# 8. Evolução

O modelo de permissões deverá permanecer preparado para suportar novos tipos de acesso, incluindo:

* Licenças temporárias.
* Assinaturas.
* Conteúdo sob demanda.
* Eventos especiais.
* Recursos exclusivos.
* Novos formatos de conteúdo.

---

# 9. Princípios Arquiteturais

O módulo de Permissões seguirá os seguintes princípios:

* Centralização das decisões de acesso.
* Separação entre autorização e regras de negócio.
* Baixo acoplamento.
* Reutilização de componentes.
* Auditoria.
* Escalabilidade.
* Evolução incremental.


# Capítulo 18 — Conteúdo Adulto (+18)

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 12/07/2026

---

# 1. Objetivo

Este capítulo define as diretrizes para a publicação, proteção e acesso a conteúdos com classificação 
indicativa na Plataforma de Livros Interativos.

O objetivo é garantir que conteúdos destinados ao público adulto sejam disponibilizados de forma 
responsável, respeitando as regras de acesso estabelecidas pela plataforma.

---

# 2. Classificação Indicativa

A plataforma permitirá a classificação indicativa dos conteúdos publicados.

Inicialmente, estão previstos os seguintes níveis:

* Livre
* 10+
* 12+
* 14+
* 16+
* 18+

Novas classificações poderão ser incorporadas conforme a evolução da plataforma ou requisitos legais de 
diferentes países.

---

# 3. Escopo da Classificação

A classificação indicativa poderá ser aplicada em diferentes níveis da estrutura de conteúdo, incluindo:

* Livro.
* Capítulo.
* Cena.

Essa flexibilidade permite que apenas partes específicas de uma obra possuam restrições de acesso.

---

# 4. Controle de Acesso

O acesso aos conteúdos classificados será controlado exclusivamente pelo módulo de Permissões.

O Reader apenas executará conteúdos cuja autorização tenha sido previamente concedida pelo backend.

A interface do usuário não constitui mecanismo de segurança.

---

# 5. Declaração de Maioridade

Na versão inicial da plataforma, o acesso a conteúdos classificados para maiores de 18 anos dependerá da 
declaração de maioridade realizada pelo próprio usuário durante o processo de cadastro ou no primeiro 
acesso a esse tipo de conteúdo.

A plataforma poderá solicitar uma confirmação adicional antes da liberação do conteúdo.

---

# 6. Evolução

A arquitetura permanecerá preparada para incorporar mecanismos mais robustos de verificação de idade, caso 
sejam necessários em versões futuras.

Entre as possibilidades previstas estão:

* Processos adicionais de confirmação de idade.
* Integração com serviços especializados de verificação.
* Adequação a requisitos legais específicos de diferentes jurisdições.

A implementação desses mecanismos dependerá da evolução da plataforma e das exigências aplicáveis.

---

# 7. Integração

O controle de conteúdos classificados poderá integrar-se com:

* Catálogo.
* Minha Biblioteca.
* Permissões.
* Reader.
* Administração.

Cada módulo manterá suas responsabilidades específicas, preservando o baixo acoplamento da arquitetura.

---

# 8. Princípios

O tratamento de conteúdos classificados seguirá os seguintes princípios:

* Responsabilidade na disponibilização do conteúdo.
* Controle de acesso centralizado.
* Separação entre classificação e execução.
* Flexibilidade para evolução.
* Compatibilidade com diferentes níveis de classificação indicativa.
* Integração com o módulo de Permissões.


# Capítulo 19 — Canal de Comunicação 

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 12/07/2026

---

# 1. Objetivo

A integração com o WhatsApp tem como objetivo disponibilizar um canal oficial de comunicação entre 
a Plataforma de Livros Interativos e seus usuários.

Na fase inicial do projeto, o WhatsApp será utilizado para apoiar o processo comercial, prestar 
atendimento e facilitar a comunicação durante a aquisição de conteúdos.

---

# 2. Papel na Arquitetura

O WhatsApp é tratado como um canal de comunicação externo.

Sua responsabilidade limita-se à interação com o usuário.

Toda a lógica de negócio permanecerá concentrada nos módulos internos da plataforma.

---

# 3. Utilização Inicial

Na primeira fase da plataforma, o WhatsApp poderá ser utilizado para:

* Atendimento ao cliente.
* Esclarecimento de dúvidas.
* Comunicação durante o processo de compra.
* Recebimento de comprovantes de pagamento.
* Envio de orientações ao usuário.
* Suporte pós-venda.

A utilização do WhatsApp não altera o funcionamento interno do Commerce Lite nem do módulo de 
Pedidos.

---

# 4. Integração com Commerce Lite

Quando o usuário optar por adquirir um conteúdo, a plataforma poderá direcioná-lo para uma conversa 
no WhatsApp.

O pedido continuará sendo controlado internamente pela plataforma.

O WhatsApp atuará apenas como canal de comunicação entre o usuário e o responsável pelo atendimento.

---

# 5. Evolução

A arquitetura permanecerá preparada para futuras evoluções, incluindo:

* WhatsApp Business.
* Integração com APIs oficiais.
* Automação de mensagens.
* Chatbots.
* Notificações automáticas.
* Acompanhamento do status dos pedidos.

Essas evoluções poderão ser incorporadas sem alterações significativas na arquitetura da plataforma.

---

# 6. Independência

A plataforma não dependerá exclusivamente do WhatsApp.

Outros canais de comunicação poderão ser incorporados futuramente, preservando o mesmo fluxo de negócio.

Entre eles:

* E-mail.
* Telegram.
* Chat interno.
* Outros serviços de mensagens.

---

# 7. Princípios

A integração com o WhatsApp seguirá os seguintes princípios:

* Separação entre comunicação e regras de negócio.
* Baixo acoplamento.
* Flexibilidade para substituição ou inclusão de novos canais.
* Evolução incremental.
* Reutilização da arquitetura de integração.


# Capítulo 20 — Payment Engine

## Status

**Status:** Planejado

**Versão:** 1.0.0

**Última atualização:** 12/07/2026

---

# 1. Objetivo

O Payment Engine é o módulo responsável pelo processamento das transações financeiras 
da Plataforma de Livros Interativos.

Sua função é intermediar a comunicação entre a plataforma e os provedores financeiros, 
mantendo o processamento de pagamentos desacoplado das regras de negócio do sistema.

O Payment Engine constitui um módulo independente, preparado para atender às necessidades 
da plataforma e futuras aplicações.

---

# 2. Responsabilidades

O Payment Engine será responsável por:

* Receber solicitações de pagamento.
* Iniciar transações financeiras.
* Consultar o estado das operações.
* Receber confirmações dos provedores financeiros.
* Informar o resultado das transações aos módulos solicitantes.
* Registrar eventos relevantes do processo financeiro.

---

# 3. Limites de Responsabilidade

O Payment Engine não será responsável por:

* Criar pedidos.
* Conceder permissões.
* Controlar o catálogo.
* Administrar conteúdos.
* Gerenciar usuários.

Essas responsabilidades permanecem nos módulos específicos da plataforma.

---

# 4. Integração com a Plataforma

A Plataforma de Livros Interativos utilizará o Payment Engine por meio de interfaces 
públicas.

A comunicação ocorrerá preservando o baixo acoplamento entre os sistemas.

A plataforma continuará operando mesmo na ausência do Payment Engine, utilizando os mecanismos 
previstos para a fase inicial do projeto.

---

# 5. Provedores Financeiros

O Payment Engine deverá permitir integração com diferentes provedores financeiros.

Entre os provedores inicialmente previstos estão:

* Banco Inter.
* PIX.
* Outros bancos.
* Outros meios de pagamento que venham a ser incorporados futuramente.

A escolha do provedor não deverá impactar os módulos internos da plataforma.

---

# 6. Evolução

O Payment Engine permanecerá preparado para suportar:

* PIX automático.
* Cartões.
* Boletos.
* Assinaturas.
* Cobranças recorrentes.
* Carteiras digitais.
* Novos meios de pagamento.

Essas evoluções deverão ocorrer sem alterar a arquitetura da Plataforma de Livros Interativos.

---

# 7. Integração

O Payment Engine poderá integrar-se com:

* Commerce Lite.
* Pedidos.
* Permissões.
* Banco Inter.
* Outros provedores financeiros.

Cada módulo continuará responsável apenas por suas atribuições específicas.

---

# 8. Princípios

O Payment Engine seguirá os seguintes princípios:

* Separação entre negócio e processamento financeiro.
* Baixo acoplamento.
* Modularidade.
* Reutilização.
* Escalabilidade.
* Evolução incremental.
* Independência dos provedores financeiros.


# Capítulo 21 — Banco Inter PJ

## Status

**Status:** Planejado

**Versão:** 1.0.0

**Última atualização:** 12/07/2026

---

# 1. Objetivo

Este capítulo define a utilização do Banco Inter PJ como primeiro provedor financeiro previsto para 
integração com o Payment Engine da Plataforma de Livros Interativos.

O Banco Inter será responsável exclusivamente pelo processamento das operações financeiras delegadas 
pelo Payment Engine.

Sua integração não altera as regras de negócio da plataforma.

---

# 2. Papel na Arquitetura

O Banco Inter PJ será tratado como um provedor financeiro externo.

Toda comunicação deverá ocorrer por intermédio do Payment Engine, que atuará como camada de abstração 
entre a plataforma e os serviços financeiros.

A Plataforma de Livros Interativos não realizará integrações diretas com a API do Banco Inter.

---

# 3. Responsabilidades

A integração com o Banco Inter poderá contemplar, entre outras funcionalidades:

* Emissão de cobranças via PIX.
* Consulta ao estado das transações.
* Recebimento de confirmações de pagamento.
* Consulta de informações financeiras relacionadas às operações.

A implementação dessas funcionalidades será realizada em etapas futuras do projeto.

---

# 4. Independência

A arquitetura da plataforma não dependerá exclusivamente do Banco Inter.

O Payment Engine deverá permitir a substituição ou inclusão de outros provedores financeiros sem 
necessidade de alterações nos módulos centrais da plataforma.

---

# 5. Evolução

Além do Banco Inter, poderão ser incorporados futuramente outros provedores financeiros, conforme 
as necessidades da plataforma.

A arquitetura permanecerá preparada para integrar novos bancos, instituições financeiras e meios de 
pagamento compatíveis com o Payment Engine.

---

# 6. Segurança

Todas as comunicações com o Banco Inter deverão seguir os requisitos de autenticação, autorização e 
criptografia definidos pela instituição financeira e pelas boas práticas de segurança adotadas 
pela plataforma.

Credenciais, certificados e demais informações sensíveis deverão ser armazenados de forma segura e nunca 
incorporados ao código-fonte da aplicação.

---

# 7. Princípios

A integração com o Banco Inter seguirá os seguintes princípios:

* Separação entre regras de negócio e serviços financeiros.
* Comunicação exclusivamente por meio do Payment Engine.
* Baixo acoplamento.
* Segurança das informações.
* Facilidade de substituição do provedor financeiro.
* Evolução incremental.


# Capítulo 22 — Serviços Externos

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 12/07/2026

---

# 1. Objetivo

Este capítulo define os princípios para integração da Plataforma de Livros Interativos com 
serviços externos.

Essas integrações têm como finalidade ampliar as capacidades da plataforma sem comprometer a 
independência do núcleo da aplicação.

---

# 2. Princípios Gerais

Os serviços externos não fazem parte do núcleo da plataforma.

Toda integração deverá ocorrer por meio de interfaces bem definidas, preservando o baixo 
acoplamento entre a aplicação e os provedores externos.

A substituição de um serviço externo não deverá exigir alterações significativas nas regras 
de negócio da plataforma.

---

# 3. Arquitetura de Integração

Sempre que possível, as integrações deverão seguir a seguinte estrutura conceitual:

```text
Core da Plataforma
        │
        ▼
Interface de Integração
        │
        ▼
Adapter
        │
        ▼
Serviço Externo
```

Essa arquitetura facilita a manutenção, os testes e a substituição de provedores.

---

# 4. Exemplos de Serviços Externos

A plataforma permanecerá preparada para integrar-se com diferentes tipos de serviços, incluindo:

* Serviços financeiros.
* Canais de comunicação.
* Armazenamento em nuvem.
* Serviços de autenticação.
* Inteligência artificial.
* Envio de e-mails.
* Serviços de notificação.
* CDN.
* Conversão de mídia.
* Outros provedores compatíveis com a arquitetura.

A inclusão desses serviços ocorrerá conforme a evolução do projeto.

---

# 5. Segurança

Toda comunicação com serviços externos deverá observar:

* Autenticação adequada.
* Criptografia dos dados em trânsito.
* Proteção das credenciais.
* Tratamento de falhas.
* Registro de eventos relevantes.
* Conformidade com as boas práticas de segurança.

Informações sensíveis deverão ser armazenadas fora do código-fonte, utilizando mecanismos 
apropriados de configuração e gerenciamento de segredos.

---

# 6. Evolução

Novos serviços externos poderão ser incorporados sem alterações significativas na arquitetura 
da plataforma.

A adoção de novos provedores deverá respeitar os princípios de modularidade, reutilização e baixo 
acoplamento definidos nesta especificação.

---

# 7. Princípios

A integração com serviços externos seguirá os seguintes princípios:

* Separação entre domínio e infraestrutura.
* Baixo acoplamento.
* Interfaces bem definidas.
* Utilização de adaptadores para comunicação com provedores.
* Facilidade de substituição de serviços.
* Evolução incremental.
* Reutilização de componentes.


# Capítulo 23 — Roadmap

## Status

**Status:** Em desenvolvimento

**Versão:** 1.0.0

**Última atualização:** 12/07/2026

---

# 1. Objetivo

Este capítulo apresenta o planejamento evolutivo da Plataforma de Livros Interativos, definindo as 
principais fases de desenvolvimento previstas para o projeto.

O roadmap tem caráter orientativo e poderá ser revisado conforme novas necessidades, prioridades ou 
oportunidades forem identificadas.

---

# 2. Fases Previstas

## Fase 1 — MVP

* Cadastro de usuários.
* Biblioteca.
* Livros.
* Capítulos.
* Cenas.
* Reader.
* Controle de permissões.
* Commerce Lite.
* Pedidos.
* Canal de Comunicação.
* Liberação manual de acesso.

---

## Fase 2 — Automação Financeira

* Payment Engine.
* Integração com Banco Inter PJ.
* PIX automático.
* Automação da concessão de permissões.

---

## Fase 3 — Evolução da Plataforma

* Gamificação.
* Estatísticas.
* Conteúdo multimídia.
* Recursos avançados do Reader.

---

## Fase 4 — Expansão

* Novos provedores financeiros.
* Novos canais de comunicação.
* Internacionalização.
* APIs públicas.
* Marketplace de conteúdos.

---

# 3. Princípios

* Evolução incremental.
* Entregas frequentes.
* Compatibilidade com versões anteriores.
* Priorização por valor entregue ao usuário.

## Estado Atual

A Etapa 0 foi concluída com a definição da arquitetura funcional da plataforma.

A partir da Etapa 1, o desenvolvimento passa a concentrar-se na implementação incremental 
dos módulos definidos nesta especificação.

A primeira atividade da Etapa 1 será a Auditoria Técnica da Plataforma, cujo objetivo é 
verificar a aderência da implementação existente à arquitetura documentada na EFLI.


# Capítulo 24 — Metodologia de Desenvolvimento

A Plataforma de Livros Interativos será desenvolvida de forma incremental.

Cada etapa seguirá o seguinte fluxo:

1. Planejamento.
2. Documentação.
3. Implementação.
4. Testes.
5. Revisão.
6. Commit.
7. Atualização da documentação.

Nenhuma etapa será considerada concluída sem validação funcional.

Todas as decisões arquiteturais relevantes deverão ser registradas antes da implementação.

A evolução do projeto ocorrerá em pequenas entregas, reduzindo riscos e facilitando a manutenção.


# Capítulo 25 — Padrões de Código

O desenvolvimento deverá seguir padrões consistentes de organização e nomenclatura.

Princípios:

* Código limpo.
* Funções pequenas.
* Responsabilidade única.
* Comentários apenas quando agregarem valor.
* Modularização.
* Reutilização de componentes.
* Baixo acoplamento.
* Alta coesão.

Sempre que possível, as regras de negócio deverão permanecer independentes das tecnologias utilizadas.

# Capítulo 26 — Estratégia de Testes

Cada etapa do projeto será validada antes do início da etapa seguinte.

Serão realizados:

- Testes unitários (quando aplicável).
- Testes funcionais.
- Testes de integração.
- Testes manuais.
- Testes de regressão.

Nenhuma funcionalidade será considerada concluída sem validação completa.

O objetivo é reduzir retrabalho e garantir estabilidade durante a evolução da plataforma.

# Capítulo 27 — Controle de Versionamento

Todo o código-fonte será mantido em repositório Git.

Cada alteração relevante deverá possuir:

- Commit descritivo.
- Atualização da documentação.
- Registro no Controle de Revisões da EFLI, quando aplicável.

As versões oficiais da plataforma serão identificadas por versionamento semântico (Semantic Versioning).

Exemplo:

1.0.0
1.1.0
1.2.0
2.0.0

# Capítulo 28 — Critérios para Encerramento de Etapas

Uma etapa será considerada concluída quando:

- Todos os objetivos previstos forem implementados.
- Os testes forem aprovados.
- A documentação estiver atualizada.
- O código estiver versionado.
- Não existirem pendências críticas.

Somente após esses critérios será iniciada uma nova etapa.

# Capítulo 29 — Decisões Arquiteturais (ADRs)

Todas as decisões arquiteturais relevantes deverão ser registradas em documentos ADR (Architecture Decision Record).

Cada ADR deverá conter:

- Contexto.
- Problema.
- Decisão adotada.
- Consequências.
- Alternativas consideradas.

As ADRs complementam a EFLI e documentam a evolução da arquitetura ao longo do projeto.

# Capítulo 30 — Histórico do Projeto

Este capítulo registra os principais marcos da evolução da Plataforma de Livros Interativos.

Entre os eventos registrados estão:

- Início do projeto.
- Criação da EFLI.
- Alterações arquiteturais relevantes.
- Novos módulos.
- Mudanças de estratégia.
- Marcos importantes de desenvolvimento.

O histórico complementa o Controle de Revisões, registrando a evolução funcional e arquitetural do projeto.

# Capítulo 31 — Próximas Evoluções

A Plataforma de Livros Interativos foi concebida para evoluir continuamente.

Entre as evoluções previstas estão:

- Payment Engine completo.
- Banco Inter PJ.
- PIX automático.
- Gamificação.
- Sistema de conquistas.
- Inventário para RPG.
- Variáveis narrativas avançadas.
- Conteúdo multimídia expandido.
- Inteligência Artificial aplicada ao Reader.
- Visual Novels.
- Marketplace de conteúdos.
- Internacionalização.
- APIs públicas.
- Aplicativos móveis.
- Novos provedores financeiros.
- Novos canais de comunicação.
- Novos tipos de elementos interativos.

As funcionalidades descritas neste capítulo representam possibilidades futuras e não constituem compromisso 
de implementação em versões específicas.
