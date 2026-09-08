
# Autorização por Escopo de Obra

## Objetivo

Permitir que a autorização de operações sobre uma obra considere não apenas a permissão global do usuário, mas também sua relação com a obra específica.

## Regra definida

A autorização deve trabalhar sempre com um **identificador de obra (`livro_id`) já resolvido**.

O mecanismo de autorização não deve depender diretamente da entidade que originou esse identificador.

Exemplos:

* Livro → `livro_id`
* Capítulo → resolver `livro_id`
* Cena → resolver `livro_id` através do capítulo
* Conteúdo da Cena → resolver `livro_id` através da cena/capítulo

Depois de resolvido o `livro_id`, a autorização trabalha de forma uniforme:

```text
usuário
   +
livro_id
   +
permissão/capacidade
        ↓
   autorização
```

## Implementação atual

Enquanto o sistema de contratos ainda não existe, será utilizada a relação existente:

```text
Usuário
   ↓
Autor
   ↓
livro_autores
   ↓
Obra
```

Assim, o usuário que é Autor vinculado à obra poderá exercer a capacidade de edição sobre **aquela obra**, mesmo que seu papel global `AUTOR` não possua a permissão `obra.editar`.

### Importante

Não será adicionada `obra.editar` ao papel global `AUTOR`.

A regra é específica da obra, e não uma ampliação das permissões globais do papel.

## Futuro

Quando o módulo de contratos for implementado, a identificação do responsável/titular e das autorizações de edição deverá passar a considerar os contratos.

A estrutura da autorização continuará recebendo:

```text
usuario_id
livro_id
capacidade/permissão
```

O mecanismo interno que determina **por que** o usuário possui essa autorização poderá então evoluir de:

```text
autor → livro_autores → obra
```

para as regras definidas pelos contratos.

## Princípio arquitetural

A resolução do `livro_id` deve ficar centralizada.

As entidades:

* Capítulo
* Cena
* CenaTexto
* CenaImagem
* CenaAudio
* CenaVideo
* CenaConteudo

não devem receber regras próprias de autorização de negócio.

Elas apenas fornecem, direta ou indiretamente, o identificador necessário para chegar à obra.

## Escopo desta decisão

Esta decisão não exige alteração estrutural nas entidades de conteúdo nem criação de permissões específicas como:

```text
capitulo.editar
cena.editar
texto.editar
imagem.editar
audio.editar
video.editar
```

Continuam sendo utilizadas as capacidades de obra já definidas:

```text
obra.criar
obra.visualizar
obra.editar
obra.publicar
obra.excluir
```

A autorização por escopo complementa o RBAC existente; não o substitui.

## Diretriz de implementação

Implementar de forma incremental:

1. resolver `livro_id`;
2. centralizar a autorização por obra;
3. aplicar a autorização nas rotas que modificam recursos da obra;
4. validar;
5. somente depois avançar para outros recursos.

Não realizar nova auditoria geral ou refatoração das entidades já validadas sem necessidade concreta.
