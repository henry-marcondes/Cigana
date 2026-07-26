# DA-005 - Integrações Externas

## Objetivo

Este diagrama apresenta a relação entre o núcleo da plataforma e os serviços externos, preservando o baixo acoplamento da arquitetura.

```mermaid
flowchart LR

    CORE[Core da Plataforma] --> COM[Canal de Comunicação]

    CORE --> PAY[Payment Engine]

    CORE --> STO[Storage]

    COM --> WPP[WhatsApp Business]

    COM --> EMAIL[E-mail]

    COM --> TEL[Telegram]

    PAY --> INTER[Banco Inter PJ]

    PAY --> PIX[PIX]

    PAY --> OUT[Outros Bancos]

    STO --> S3[Amazon S3]

    STO --> R2[Cloudflare R2]

    CORE --> IA[Inteligência Artificial]
```

## Observações

- O Core da Plataforma não depende diretamente de serviços externos.
- Cada integração deve ocorrer por meio de interfaces e adaptadores.
- Novos provedores podem ser incorporados sem alterar as regras de negócio da plataforma.
```
