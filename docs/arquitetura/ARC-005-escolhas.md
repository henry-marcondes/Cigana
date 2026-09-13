
# Gerenciamento de Escolhas no Editor

## Status

**Concluído e validado.**

A funcionalidade de gerenciamento de escolhas foi implementada no Editor da Plataforma Leitura, utilizando integralmente os contratos de API já existentes e validados no backend.

## Localização

A funcionalidade está disponível em:

`/estudio/obras/[id]/capitulos/[capituloId]/cenas/[cenaId]/escolhas`

A página gerencia as escolhas originadas pela cena atualmente selecionada.

## Estrutura funcional

A página foi organizada em quatro áreas principais:

1. **Identificação da cena atual**

   * Obra
   * Capítulo
   * Cena
   * Retorno para a página da cena

2. **Visão Estrutural da Obra**

   * Exibe os capítulos da obra.
   * Exibe as respectivas cenas.
   * Destaca o capítulo e a cena atualmente selecionados.
   * Funciona como mapa/orientação para auxiliar a decisão do destino de uma escolha.

3. **Gerenciamento das Escolhas**

   * Lista as escolhas existentes.
   * Exibe a ordem.
   * Exibe o texto da escolha.
   * Exibe capítulo e cena de destino.
   * Permite criar, editar, excluir e reordenar.

4. **Visualização**

   * O botão **Visualizar a Obra Inteira** abre a experiência correspondente da Biblioteca, permitindo verificar o fluxo narrativo.

## Criação e edição

A cena de origem é definida automaticamente pela cena que está sendo administrada.

O destino é definido através de dois seletores:

* **Capítulo de destino**
* **Cena de destino**

A escolha pode ser criada informando:

* texto;
* capítulo de destino;
* cena de destino;
* ordem de exibição, determinada automaticamente pela página.

Na edição, texto e destino utilizam os respectivos endpoints já existentes no backend.

## Reordenação

A reordenação foi implementada através dos controles de mover para cima e mover para baixo.

Ao alterar a posição de uma escolha, a página envia a nova ordem completa para:

`PATCH /api/escolhas/reordenar`

utilizando o contrato já validado:

```json
{
  "cena_origem_id": "...",
  "ordem": [
    { "id": "..." },
    { "id": "..." }
  ]
}
```

A interação visual é ligeiramente diferente da utilizada na **Composição da Cena**, pois aqui a ordenação representa a sequência das opções narrativas disponíveis ao leitor. O comportamento, entretanto, foi testado e validado.

## Exclusão

A exclusão utiliza:

`DELETE /api/escolhas/:id`

A operação foi validada com sucesso.

## Contratos utilizados

A página utiliza os endpoints existentes para:

* carregar a obra;
* carregar o capítulo;
* carregar a cena;
* carregar capítulos da obra;
* carregar cenas dos capítulos;
* listar escolhas da cena;
* criar escolha;
* alterar texto;
* alterar destino;
* reordenar escolhas;
* desativar escolha.

Nenhuma alteração foi realizada no backend durante esta etapa.

## Validação realizada

Fluxos testados e aprovados:

* [x] Criar nova escolha
* [x] Selecionar capítulo de destino
* [x] Selecionar cena de destino
* [x] Navegar entre capítulos
* [x] Navegar entre cenas
* [x] Visualizar a Obra Inteira
* [x] Reordenar escolhas
* [x] Excluir escolha

## Decisões preservadas

A implementação mantém as decisões conceituais estabelecidas anteriormente:

* a escolha pertence à cena de origem atual;
* `cena_origem_id` não é editável pelo usuário;
* o destino pode estar em outra cena da mesma obra;
* o destino pode estar em outro capítulo;
* a **Visão Estrutural** é uma ferramenta de orientação, não o mecanismo de seleção do destino;
* a decisão efetiva do destino ocorre através dos seletores de capítulo e cena;
* a Biblioteca continua separada do Editor;
* nenhuma nova entidade foi criada;
* nenhum contrato de backend foi alterado.

## Resultado

A funcionalidade de **Escolhas** está considerada **implementada, testada e validada**.

Esta etapa está encerrada.
