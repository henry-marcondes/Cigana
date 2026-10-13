```mermaid

flowchart TD
    A([Livro]) --> B[Capitulos]
    B --> C[/paginas\]
    C --> D[textos]
    C --> E[audios]
    C --> F[imagens]
    C --> G[videos]
    D --> H{escolhas}
    E --> H
    F --> H
    G --> H
    H --> I([próxima paginas ou escolhas])

```

