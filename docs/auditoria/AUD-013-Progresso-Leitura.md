# AUD-013 — Progresso de Leitura

**Projeto:** Plataforma de Livros Cigana (Plataforma Leitura)  
**Área:** Biblioteca — Leitor de obras  
**Tipo:** Auditoria técnica e registro de implementação  
**Status:** Implementação validada manualmente  
**Data:** 13/10/2026

## 1. Objetivo

Documentar a implementação do registro e da atualização do progresso de leitura, incluindo a cena atual, o percentual de cenas visitadas e a persistência do histórico de visitas.

Este documento estabelece as regras que devem ser preservadas em futuras alterações no leitor, evitando regressões no cálculo do progresso e na navegação de obras interativas.

## 2. Estrutura da leitura

A estrutura editorial da plataforma é:

Obra → Capítulos → Cenas → Conteúdos → Escolhas.

O progresso de leitura está associado ao usuário e à obra. O registro armazena, entre outras informações:

- Identificação do progresso.
- Usuário e obra associados.
- Versão da obra.
- Identificação da cena atual.
- Percentual de leitura.
- Indicador de conclusão.
- Data e hora da última leitura.
- Situação ativa do registro.

A tabela `progresso_leitura` mantém o estado atual do progresso. Como esse registro isoladamente não permite reconstruir todas as cenas visitadas, foi implementada uma estrutura adicional para persistir as visitas.

## 3. Regras de negócio

### 3.1. Inicialização do progresso

No primeiro acesso autenticado a uma obra:

1. O frontend consulta o progresso do usuário para aquela obra.
2. Se o registro existir, ele será utilizado.
3. Se a consulta retornar HTTP 404, o frontend inicia a criação do progresso.
4. O registro inicial é confirmado pela resposta da API.
5. A cena inicial é contabilizada como visita, conforme as regras implementadas no backend.

A ausência inicial de progresso é uma situação esperada. O HTTP 404 dessa consulta não deve ser apresentado no console como erro inesperado.

Erros reais de autenticação, autorização e servidor devem continuar sendo registrados.

### 3.2. Atualização na transição entre cenas

A cada transição para uma cena diferente, o frontend utiliza o service existente de progresso de leitura para solicitar a atualização.

Endpoint utilizado:

`PATCH /api/progresso-leitura/:id/cena`

O corpo da requisição contém a identificação da nova cena:

`cena_atual_id`

A atualização deve manter coerência entre a cena atual, o histórico de visitas e as datas de atualização do progresso.

A mesma cena não deve gerar uma nova contagem quando for revisitada.

### 3.3. Cálculo percentual

O percentual é calculado com base nas cenas distintas visitadas pelo leitor em relação ao total de cenas ativas cadastradas na obra.

**Fórmula:**

`percentual_concluido = (cenas distintas visitadas / total de cenas ativas) * 100`

O resultado deve respeitar os limites de 0% a 100% e a precisão definida pela coluna existente no banco de dados.

O denominador considera todas as cenas ativas da obra, inclusive aquelas que pertencem a caminhos narrativos alternativos. Cenas inativas não entram na contagem.

O cálculo utiliza o histórico persistido de visitas, e não somente o campo `cena_atual_id`.

### 3.4. Prevenção de contagem duplicada

A estrutura de visitas possui uma restrição de unicidade para a combinação entre o progresso e a cena.

Dessa forma, uma mesma cena não pode ser contabilizada duas vezes para o mesmo progresso, mesmo que o leitor:

- Retorne ao início da obra.
- Refaça um caminho já percorrido.
- Reabra uma cena anteriormente visitada.
- Navegue repetidamente entre cenas.

A contagem considera cenas distintas, e não a quantidade de transições realizadas.

### 3.5. Consistência transacional

O backend executa, na mesma transação, as operações necessárias para:

1. Registrar a visita de maneira idempotente.
2. Contabilizar as visitas distintas.
3. Contar as cenas ativas da obra.
4. Calcular o percentual.
5. Atualizar a cena atual e as datas do progresso.

Esse procedimento reduz o risco de inconsistências decorrentes de requisições concorrentes ou de falhas entre operações relacionadas.

### 3.6. Progressos anteriores à implementação

Como não existia histórico completo de visitas, não é possível reconstruir as cenas percorridas anteriormente à implantação.

A inicialização dos progressos existentes registra somente a cena atual conhecida, quando elegível e válida para a obra.

Não se deve inventar ou presumir visitas anteriores que não estejam registradas.

Consequentemente, o percentual de um progresso antigo pode refletir apenas o histórico conhecido a partir da implantação da funcionalidade, e não todo o percurso realmente realizado no passado.

## 4. Percentual e conclusão narrativa

O campo `percentual_concluido` representa a proporção de cenas ativas da obra que foram visitadas.

O campo `concluido` representa um estado diferente e não deve ser alterado automaticamente apenas porque o percentual chegou a 100%.

Assim, é válido encontrar:

- `percentual_concluido = 100.00`
- `concluido = false`

Esse resultado indica que todas as cenas ativas cadastradas foram visitadas, mas que a conclusão narrativa ainda não foi registrada.

A regra de conclusão narrativa deverá ser tratada separadamente, conforme as definições editoriais da plataforma.

## 5. Componentes envolvidos

Os componentes relacionados à funcionalidade incluem:

- `frontend/src/components/RegistroProgresso.js`: inicialização do progresso e acionamento da atualização na transição entre cenas.
- `frontend/src/services/progressoLeitura.js`: comunicação do frontend com os endpoints de progresso.
- `backend/src/models/ProgressoLeitura.js`: persistência e atualização dos dados do progresso.
- `backend/src/services/progressoLeituraService.js`: regras de negócio do progresso de leitura.
- `backend/src/routes/progressoLeituraRoutes.js`: exposição das operações da API.
- Migration de criação da estrutura de visitas: persistência do histórico e inicialização dos progressos existentes.

Os nomes exatos da tabela de visitas e do arquivo de migration devem ser conferidos no repositório antes de qualquer alteração futura.

## 6. Validação manual realizada

A validação foi executada por meio da navegação na Biblioteca e de consultas ao PostgreSQL.

### 6.1. Atualização da cena atual

Foram realizadas consultas antes e depois da navegação. Os resultados demonstraram que:

- O mesmo registro de progresso foi mantido.
- `cena_atual_id` mudou conforme a nova cena visitada.
- `ultima_leitura_em` foi atualizada.
- `atualizado_em` foi atualizada.

### 6.2. Evolução do percentual

Durante a leitura de uma obra, foram observados os seguintes valores:

| Etapa | Percentual observado |
|---|---:|
| Estado inicial observado | 10% |
| Após avançar uma cena | 20% |
| Após percorrer novas cenas | 40% |
| Após revisitar cenas anteriores | 40% |
| Continuação do percurso | 90% |
| Após visitar a última cena restante | 100% |

Os valores observados confirmaram o aumento do percentual conforme novas cenas eram visitadas e a ausência de aumento ao revisitar cenas já contabilizadas.

### 6.3. Resultado final da API

A consulta final retornou:

- `percentual_concluido`: `100.00`
- `cena_atual_id`: `2b98ea8e-8b59-4b6e-9ac6-83cdebbec87f`
- `ativo`: `true`
- `concluido`: `false`

As datas `ultima_leitura_em` e `atualizado_em` estavam atualizadas.

O resultado foi considerado correto de acordo com as regras de negócio definidas.

**Escopo da validação:** testes automatizados e testes Bruno não foram executados nesta etapa. A validação descrita é manual.

## 7. Cuidados para futuras alterações

Antes de modificar o progresso de leitura, observar os seguintes pontos:

1. Não remover o histórico persistido de visitas.
2. Não substituir a contagem de cenas distintas pela quantidade de transições.
3. Não contar cenas inativas no total da obra.
4. Não excluir os caminhos alternativos do denominador.
5. Preservar a transação que mantém visita, percentual e cena atual consistentes.
6. Não implementar o cálculo percentual no frontend.
7. Não alterar automaticamente `concluido` quando o percentual atingir 100%.
8. Preservar o tratamento do 404 esperado na inicialização.
9. Evitar regressões na prevenção de chamadas concorrentes.
10. Inspecionar as migrations e os contratos existentes antes de propor alterações estruturais.

## 8. Conclusão

A implementação do progresso de leitura por cenas visitadas foi validada manualmente na Plataforma Cigana.

O mecanismo registra a cena atual, contabiliza cenas distintas, evita duplicidade nas revisitas e calcula o percentual em relação ao total de cenas ativas da obra.

A conclusão narrativa permanece independente do percentual.

Este documento registra as decisões técnicas e as regras de negócio que devem orientar futuras manutenções da Biblioteca e do leitor de obras interativas.

## 9. Finais narrativos

As confirmações de finais narrativos são persistidas em `finais_leitura`, separadamente do percentual global e do campo `progresso_leitura.concluido`. A confirmação não altera o percentual nem reinicializa o progresso. O detalhamento da implementação está em `AUD-016-Cenas-Finais.md`.

Esta seção documenta a separação estrutural implementada; a validação visual do fluxo de finais ainda depende da execução manual na interface.
