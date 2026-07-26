
# NA-002 — Canal de Comunicação

**Tipo:** Nota Arquitetural

**Identificador:** NA-002

**Título:** Abstração do Canal de Comunicação

**Status:** Aprovada

**Versão:** 1.0.0

**Data:** 12/07/2026

**Relacionamentos:**

* EFLI — Capítulo 19 (Canal de Comunicação)
* Commerce Lite
* Pedidos
* Payment Engine

---

# 1. Contexto

Durante a definição da integração da Plataforma de Livros Interativos com o WhatsApp, 
identificou-se que o canal de comunicação não deve fazer parte da lógica de negócio da 
plataforma.

Embora o WhatsApp Business seja o primeiro meio de comunicação adotado, a arquitetura 
deve permanecer preparada para incorporar outros canais sem necessidade de alterações 
significativas nos módulos centrais.

---

# 2. Decisão

A plataforma adotará o conceito de **Canal de Comunicação** como um módulo independente.

Os canais específicos, como WhatsApp Business, e-mail, Telegram, chat interno ou outros 
serviços, serão tratados como implementações desse módulo.

O núcleo da plataforma não dependerá de um provedor específico de comunicação.

---

# 3. Objetivos

O módulo Canal de Comunicação deverá:

* Centralizar a comunicação com os usuários.
* Desacoplar os módulos internos dos provedores de mensagens.
* Permitir a substituição ou inclusão de novos canais.
* Facilitar futuras automações de comunicação.

---

# 4. Implementação Inicial

Na primeira fase da plataforma, o módulo utilizará o WhatsApp Business como principal canal 
de comunicação.

Essa implementação atenderá aos processos de:

* Atendimento ao cliente.
* Comunicação durante o processo de compra.
* Recebimento de comprovantes.
* Suporte ao usuário.

---

# 5. Evolução

A arquitetura permanecerá preparada para incorporar novos canais, incluindo:

* E-mail.
* Telegram.
* Chat interno.
* Notificações push.
* Outros provedores de mensagens.

A substituição ou inclusão de canais não deverá impactar os módulos centrais da plataforma.

---

# 6. Reutilização

O módulo Canal de Comunicação foi concebido de forma independente para permitir sua reutilização em 
outros projetos desenvolvidos pela equipe.

Sua arquitetura deverá permanecer desacoplada das regras de negócio específicas da Plataforma de Livros 
Interativos, favorecendo sua evolução como componente reutilizável.

---

# Histórico de Revisões

| Versão | Data       | Alteração                                                   |
| ------ | ---------- | ----------------------------------------------------------- |
| 1.0.0  | 12/07/2026 | Criação da Nota Arquitetural NA-002 — Canal de Comunicação. |
