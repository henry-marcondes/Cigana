# AUD-011 --- Estilo Markdown no Conteúdo das Cenas

## 1. Objetivo

Registrar o ajuste de renderização e apresentação de textos Markdown na
área de leitura da plataforma Cigana, para preservar o comportamento em
futuras alterações do leitor.

Este documento registra o que foi ajustado, os componentes envolvidos e
os pontos que ainda podem ser avaliados posteriormente. Não propõe
mudanças na arquitetura nem amplia o escopo da implementação.

## 2. Escopo

-   Componente de renderização:
    `frontend/src/components/CenaConteudo.jsx` (confirmar o caminho real
    do diretório `components` no repositório).
-   Página de leitura:
    `frontend/src/app/livros/[slug]/capitulos/[capituloSlug]/cenas/[cenaSlug]/page.jsx`.
-   Fluxo de carregamento dos conteúdos:
    `carregarDadosLeituraCena(cena)`.
-   Componente de apresentação da leitura: `LeituraCena`.
-   Conteúdo afetado: itens cujo `tipo_conteudo` é `TEXTO`.

## 3. Problema identificado

O conteúdo Markdown já era interpretado por `react-markdown`, mas
títulos como `#`, `##` e `###` não apresentavam destaque visual
suficiente.

A causa identificada foi a ausência de estilos explícitos para os
elementos HTML gerados pelo Markdown. O Tailwind CSS Preflight normaliza
a aparência padrão de elementos como títulos, de modo que eles podem
ficar visualmente semelhantes ao texto comum.

## 4. Solução aplicada

O componente utiliza a biblioteca `react-markdown`:

``` jsx
import ReactMarkdown from 'react-markdown';
```

No bloco `TEXTO`, o componente recebe `dados.texto` e define classes
Tailwind para os elementos gerados pelo Markdown.

Elementos estilizados:

  -----------------------------------------------------------------------
  Elemento Markdown/HTML              Apresentação definida
  ----------------------------------- -----------------------------------
  `h1` (`#`)                          Título principal, maior, em negrito
                                      e com espaçamento

  `h2` (`##`)                         Título de seção, com tamanho
                                      intermediário e espaçamento

  `h3` (`###`)                        Subtítulo, com destaque visual

  `p`                                 Parágrafos com margem inferior

  `ul`                                Lista não ordenada com marcadores e
                                      espaçamento

  `ol`                                Lista ordenada numerada e
                                      espaçamento

  `blockquote`                        Citação com borda lateral e estilo
                                      itálico

  `hr`                                Separador horizontal com margens
  -----------------------------------------------------------------------

O mapeamento é feito pela propriedade `components` de `ReactMarkdown`.
Isso permite manter o conteúdo em Markdown e controlar sua apresentação
no componente, sem inserir marcação HTML manual nos textos dos livros.

O conteúdo é fornecido com fallback para string vazia:

``` jsx
{dados.texto || ''}
```

A classe `whitespace-pre-line` foi considerada desnecessária no
contêiner de Markdown, pois a interpretação de parágrafos e quebras de
linha deve ficar a cargo do renderizador Markdown.

## 5. Tipografia

Foi proposta a utilização da fonte Ubuntu Mono por meio de
`next/font/google`, com pesos 400 e 700. A tipografia ainda é
provisória: a avaliação definitiva foi deixada para outro momento.

A classe genérica `font-mono` não garante, isoladamente, o uso da fonte
Ubuntu Mono. Quando a fonte específica estiver sendo utilizada, o
elemento de leitura deve receber a classe gerada por `Ubuntu_Mono`.

A prioridade atual é manter a formatação que já melhorou a leitura. A
escolha final da fonte poderá ser revisada posteriormente, após observar
textos mais longos.

## 6. Fluxo de leitura preservado

A página de leitura segue o fluxo existente:

1.  `CenaPage` obtém o livro pelo slug.
2.  Obtém o capítulo relacionado ao livro.
3.  Obtém a cena relacionada ao capítulo.
4.  Executa `carregarDadosLeituraCena(cena)` para obter `conteudos` e
    `escolhas`.
5.  Encaminha os dados para `LeituraCena`.
6.  `CenaConteudo` apresenta cada tipo de conteúdo e interpreta o
    Markdown nos itens `TEXTO`.

Não foi identificada necessidade de alterar `page.jsx` para corrigir a
apresentação dos títulos. A correção foi concentrada no componente
responsável por renderizar o conteúdo.

É importante que `dados.texto` contenha o texto Markdown já carregado.
Se a origem for um arquivo `.md` referenciado por `texto_url`, o
carregamento desse arquivo deve ocorrer no fluxo de serviço apropriado
antes da renderização.

## 7. Validação realizada

Após a alteração, foi informado que:

-   A formatação Markdown passou a apresentar os títulos corretamente.
-   O resultado visual ficou melhor.
-   Aparentemente, o restante da apresentação continuou correto.
-   A avaliação definitiva da fonte foi adiada.

O registro não afirma que todos os tipos de conteúdo foram submetidos a
uma bateria completa de testes automatizados. A validação relatada foi
feita visualmente na aplicação.

## 8. Cuidados para futuras alterações

-   Não remover a propriedade `components` de `ReactMarkdown` sem
    verificar o efeito sobre títulos, listas, citações e separadores.
-   Preservar a hierarquia visual de `h1`, `h2` e `h3`.
-   Manter o conteúdo dos livros em Markdown, sem codificar a formatação
    diretamente nos componentes de cada livro.
-   Não alterar a página de leitura ou o serviço de carregamento sem uma
    necessidade identificada.
-   Ao mudar a tipografia, comparar a leitura de cenas longas e
    verificar legibilidade, espaçamento e contraste.
-   Preservar os blocos de imagem, áudio e vídeo do componente
    `CenaConteudo`.

## 9. Resultado

A renderização Markdown do conteúdo textual das cenas recebeu estilos
explícitos para títulos, parágrafos, listas, citações e separadores. A
página de leitura permaneceu sem alteração, e a fonte Ubuntu Mono ficou
como possibilidade em avaliação, não como decisão tipográfica
definitiva.

## 10. Estado

**Situação:** ajuste visual aplicado e considerado satisfatório para o
momento.

**Pendente:** avaliar posteriormente se a Ubuntu Mono é a melhor opção
para a leitura prolongada. Não há necessidade de ampliar o escopo
enquanto a apresentação atual atender ao objetivo.
