# DA-004 - Controle de Permissões

## Objetivo

Este diagrama representa o fluxo de validação de permissões antes da execução do conteúdo pelo Reader.

```mermaid
flowchart TD

    P[Pedido Confirmado] --> PERM[Permissões]

    PERM --> L[Livro]

    PERM --> CAP[Capítulo]

    PERM --> C[Cena]

    PERM --> A18[Conteúdo +18]

    R[Reader] --> CP[Consultar Permissões]

    CP --> LIB[Liberar Acesso]

    CP --> NEG[Negar Acesso]
```

## Observações

- As permissões são concedidas após a confirmação do pedido.
- O Reader sempre consulta o módulo de Permissões antes de exibir qualquer conteúdo.
- As permissões podem ser aplicadas em diferentes níveis da estrutura da plataforma.
```
