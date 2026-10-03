### ARC-007-Mapeamento-Dados.md
# Mapeamento dos Dados de Utilização

## 1. Objetivo

Esta etapa tem como objetivo mapear os dados de utilização já coletados pela Plataforma de Livros Cigana, identificar o significado de cada informação disponível e estabelecer quais análises administrativas podem ser realizadas utilizando as estruturas existentes.

O objetivo não é criar uma nova estrutura de armazenamento para analytics neste momento, mas compreender como os dados atualmente persistidos podem ser utilizados na futura área administrativa e de análise dos usuários.

A implementação das futuras funcionalidades deverá preservar as estruturas, regras de negócio e contratos de API já validados.

---

## 2. Princípio adotado

A plataforma já possui estruturas destinadas ao armazenamento de informações relacionadas à utilização das obras.

Dessa forma, a estratégia adotada nesta etapa é:

> **utilizar os dados operacionais existentes como fonte para as futuras consultas e análises administrativas, evitando duplicação de informações ou criação prematura de estruturas específicas de analytics.**

A criação de novas estruturas somente deverá ser considerada posteriormente caso seja identificada uma necessidade que não possa ser atendida adequadamente pelos dados existentes.

---

# 3. Dados de utilização existentes

Foram identificadas as seguintes estruturas relacionadas à utilização:

- `progresso_leitura`;
- `marcadores`;
- `favoritos`;
- `avaliacoes`;
- `comentarios`.

Além dessas estruturas, as **preferências do usuário** passam a integrar a base disponível para futuras análises administrativas.

---

# 4. Progresso de Leitura

## 4.1 Finalidade

A tabela `progresso_leitura` representa o estado atual da leitura de uma obra por determinado usuário.

A estrutura possui relação direta entre:

> usuário → obra → cena atual.

A tabela possui uma restrição de unicidade para `usuario_id` e `livro_id`, indicando que a estrutura foi concebida para manter o progresso atual de cada usuário em cada obra.

## 4.2 Dados disponíveis

| Campo | Significado |
|---|---|
| `usuario_id` | Usuário relacionado ao progresso |
| `livro_id` | Obra que está sendo lida |
| `versao_livro` | Versão da obra relacionada ao progresso |
| `cena_atual_id` | Cena em que o usuário se encontra |
| `percentual_concluido` | Percentual atual de conclusão da obra |
| `concluido` | Indica se a leitura foi concluída |
| `ultima_leitura_em` | Data e hora da última leitura registrada |
| `ativo` | Estado do registro |
| `criado_em` | Data e hora de criação do progresso |
| `atualizado_em` | Data e hora da última atualização |

O percentual possui validação entre 0 e 100.

## 4.3 Análises possíveis

Sem modificar a estrutura existente, podem ser obtidos indicadores como:

- quantidade de usuários que iniciaram uma obra;
- quantidade de usuários que concluíram uma obra;
- percentual médio de conclusão;
- obras com maior quantidade de leitores;
- obras com maior quantidade de conclusões;
- quantidade de leituras em andamento;
- usuários que iniciaram uma obra mas ainda não a concluíram;
- distribuição dos leitores por faixa de progresso;
- última atividade de leitura;
- obras com maior quantidade de leitores ativos;
- relação entre progresso de leitura e avaliações;
- relação entre progresso de leitura e favoritos.

## 4.4 Limitação analítica

É importante registrar que `progresso_leitura` representa o **estado atual** do progresso e não um histórico detalhado de cada evento de leitura.

A existência de uma única relação por usuário e obra significa que a estrutura não permite, sozinha, reconstruir:

- cada sessão de leitura;
- tempo gasto em cada sessão;
- quantidade de acessos;
- sequência histórica de cenas visitadas;
- quantidade de vezes que uma cena foi acessada.

Portanto, essas informações não devem ser inferidas a partir do percentual ou da data de última leitura.

---

# 5. Marcadores

## 5.1 Finalidade

A tabela `marcadores` registra marcações realizadas pelo usuário durante a leitura.

O marcador possui relação com:

> usuário → obra → cena.

A estrutura também permite armazenar informações descritivas associadas à marcação.

## 5.2 Dados disponíveis

| Campo | Significado |
|---|---|
| `usuario_id` | Usuário que criou o marcador |
| `livro_id` | Obra relacionada |
| `cena_id` | Cena marcada |
| `titulo` | Título atribuído ao marcador |
| `observacao` | Observação associada |
| `categoria` | Categoria do marcador |
| `ordem_exibicao` | Ordem de apresentação |
| `ativo` | Estado do marcador |
| `criado_em` | Data de criação |
| `atualizado_em` | Data da última atualização |

## 5.3 Análises possíveis

A estrutura permite futuramente analisar:

- quantidade de marcadores por usuário;
- obras com maior quantidade de marcações;
- cenas mais marcadas;
- distribuição de marcadores por categoria;
- quantidade média de marcadores por obra;
- usuários que utilizam frequentemente o recurso de marcação;
- relação entre cenas marcadas e progresso de leitura.

## 5.4 Limitação analítica

Os marcadores representam ações persistidas, mas não constituem um histórico de todas as interações do usuário com a leitura.

Não é possível determinar, apenas com essa estrutura:

- quantas vezes uma cena foi visualizada;
- quanto tempo o usuário permaneceu em uma cena;
- quando o marcador foi criado e posteriormente removido, caso o registro apenas tenha sido desativado.

---

# 6. Favoritos

## 6.1 Finalidade

A tabela `favoritos` representa a relação entre um usuário e uma obra marcada como favorita.

Existe uma restrição de unicidade entre `usuario_id` e `livro_id`, evitando múltiplos registros do mesmo relacionamento.

## 6.2 Dados disponíveis

| Campo | Significado |
|---|---|
| `usuario_id` | Usuário que favoritou a obra |
| `livro_id` | Obra favoritada |
| `ativo` | Estado atual do favorito |
| `criado_em` | Data de criação |
| `atualizado_em` | Data da última alteração |

## 6.3 Análises possíveis

Podem ser obtidos:

- quantidade de favoritos por obra;
- obras mais favoritedas;
- quantidade de obras favoritas por usuário;
- usuários com maior utilização do recurso;
- relação entre favoritos e progresso de leitura;
- relação entre favoritos e avaliações;
- evolução dos favoritos utilizando as datas disponíveis;
- quantidade de favoritos ativos.

## 6.4 Limitação analítica

A estrutura representa principalmente o **estado atual** da relação usuário/obra.

Ela não constitui um histórico completo de eventos de:

> favoritar → desfavoritar → favoritar novamente.

Portanto, não deve ser utilizada para afirmar quantas vezes um usuário realizou essa ação.

---

# 7. Avaliações

## 7.1 Finalidade

A tabela `avaliacoes` registra a avaliação atribuída por um usuário a uma obra.

A nota possui restrição entre 1 e 5 e existe unicidade entre usuário e obra.

## 7.2 Dados disponíveis

| Campo | Significado |
|---|---|
| `usuario_id` | Usuário que realizou a avaliação |
| `livro_id` | Obra avaliada |
| `nota` | Nota atribuída, de 1 a 5 |
| `comentario` | Comentário associado à avaliação |
| `ativo` | Estado da avaliação |
| `criado_em` | Data de criação |
| `atualizado_em` | Data da última alteração |

## 7.3 Análises possíveis

A estrutura permite calcular:

- quantidade de avaliações por obra;
- média das avaliações;
- distribuição das notas de 1 a 5;
- obras melhor avaliadas;
- obras com maior quantidade de avaliações;
- quantidade de usuários que avaliaram;
- relação entre avaliação e progresso de leitura;
- relação entre avaliação e favorito;
- evolução das avaliações ao longo do tempo.

## 7.4 Limitação analítica

Como existe uma relação única entre usuário e obra, a estrutura representa a avaliação atual daquele usuário para aquela obra.

Não é possível reconstruir todas as alterações históricas da nota apenas com a tabela atual.

---

# 8. Comentários

## 8.1 Finalidade

A tabela `comentarios` registra comentários realizados pelos usuários em relação às obras.

A estrutura relaciona o comentário diretamente ao usuário e à obra.

## 8.2 Dados disponíveis

| Campo | Significado |
|---|---|
| `usuario_id` | Usuário que realizou o comentário |
| `livro_id` | Obra relacionada |
| `texto` | Conteúdo do comentário |
| `ativo` | Estado do comentário |
| `criado_em` | Data de criação |
| `atualizado_em` | Data da última alteração |

## 8.3 Análises possíveis

Podem ser obtidos:

- quantidade de comentários por obra;
- quantidade de comentários por usuário;
- obras com maior participação dos leitores;
- usuários mais participativos;
- evolução da quantidade de comentários;
- quantidade de comentários ativos;
- relação entre comentários e avaliações;
- relação entre comentários e progresso de leitura.

## 8.4 Limitação analítica

A estrutura permite analisar a existência e o volume dos comentários, mas não fornece, por si só, informações como:

- visualizações de um comentário;
- quantidade de respostas;
- reações;
- sentimento do comentário;
- histórico completo de edição.

Essas análises somente poderão ser realizadas caso existam outras estruturas ou funcionalidades que forneçam essas informações.

---

# 9. Preferências do Usuário

As preferências do usuário passam a integrar a base de informações disponíveis para a futura administração.

As preferências representam características configuráveis pelo próprio usuário e podem ser utilizadas para análises de perfil de utilização.

## 9.1 Possíveis análises

Dependendo das preferências existentes, poderão ser realizadas consultas como:

- distribuição dos usuários por preferência;
- preferências mais utilizadas;
- combinação de preferências com obras consumidas;
- combinação de preferências com progresso de leitura;
- relação entre preferências e favoritos;
- relação entre preferências e avaliações;
- segmentação dos usuários para análises administrativas.

As preferências devem ser tratadas como **dados de configuração/perfil**, e não como eventos de utilização.

---

# 10. Visão consolidada

Os dados atualmente disponíveis permitem construir uma visão relacionada ao comportamento do usuário:

```text
                         USUÁRIO
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
     Preferências      Utilização        Interação
          │                 │                 │
          │        ┌────────┼────────┐    ┌────┼────┐
          │        │        │        │    │    │    │
          │    Progresso  Marcadores Favoritos Avaliações
          │                                      │
          │                                      │
          └──────────────────────────────────── Comentários
```

Essa estrutura permite relacionar diferentes dimensões da utilização sem necessidade de duplicar os dados.

---

# 11. Indicadores possíveis sem alteração estrutural

Com as estruturas existentes, a futura área administrativa poderá inicialmente disponibilizar indicadores como:

### Usuários

- quantidade de usuários com progresso de leitura;
- quantidade de usuários que favoritaram obras;
- quantidade de usuários que avaliaram;
- quantidade de usuários que comentaram;
- quantidade de usuários que utilizaram marcadores.

### Obras

- obras com maior número de leitores;
- obras com maior progresso médio;
- obras mais concluídas;
- obras mais favoritedas;
- obras mais avaliadas;
- obras com melhor média de avaliação;
- obras com maior quantidade de comentários;
- obras com maior quantidade de marcadores.

### Engajamento

- usuários que iniciaram leituras;
- usuários que concluíram leituras;
- percentual médio de conclusão;
- favoritos por usuário;
- avaliações por usuário;
- comentários por usuário;
- marcadores por usuário.

### Relações entre comportamentos

Também será possível cruzar os dados:

```text
Progresso × Favoritos
Progresso × Avaliações
Progresso × Comentários
Preferências × Progresso
Preferências × Favoritos
Preferências × Avaliações
```

Esses cruzamentos poderão ajudar a identificar padrões de utilização.

---

# 12. Dados que não devem ser inferidos

A análise administrativa deverá respeitar os limites das estruturas existentes.

Não devem ser apresentados como dados coletados informações que não estejam efetivamente armazenadas.

Por exemplo, as estruturas atuais não permitem afirmar diretamente:

- tempo total de leitura;
- quantidade de sessões de leitura;
- quantidade de acessos à plataforma;
- quantidade de vezes que uma cena foi visualizada;
- tempo gasto em cada cena;
- histórico completo de navegação;
- sequência completa de escolhas realizadas;
- histórico completo de alterações de avaliações;
- histórico completo de favoritar/desfavoritar.

Essas informações somente poderão ser disponibilizadas caso sejam coletadas e armazenadas por mecanismos específicos em uma etapa futura.

---

# 13. Classificação dos dados

Para facilitar o desenvolvimento da futura área administrativa, os dados podem ser classificados em três grupos.

## 13.1 Dados de estado

Representam a situação atual:

- progresso atual;
- cena atual;
- percentual concluído;
- obra concluída;
- favorito ativo;
- avaliação atual;
- comentário ativo.

## 13.2 Dados de interação persistida

Representam ações que deixaram um registro:

- criação de marcador;
- criação de favorito;
- avaliação;
- comentário;
- atualização do progresso.

## 13.3 Dados de configuração

Representam preferências ou configurações do usuário:

- preferências do usuário.

Essa classificação será importante para evitar interpretar um estado atual como se fosse um histórico de eventos.

---

# 14. Conclusão

A Plataforma de Livros Cigana já possui uma base suficiente para iniciar a construção da camada de consultas e análises administrativas.

As estruturas existentes permitem analisar:

- utilização das obras;
- progresso de leitura;
- conclusão;
- favoritos;
- avaliações;
- comentários;
- marcadores;
- preferências dos usuários.

Neste momento, **não é necessária a criação de uma nova estrutura de analytics**.

A próxima implementação deverá utilizar os dados já existentes e preservar os contratos e regras validados.

A principal limitação identificada é que as estruturas atuais armazenam predominantemente **estado atual e registros de interação persistidos**, e não um histórico detalhado de eventos de utilização.

Consequentemente, análises relacionadas a sessões, tempo de leitura, acessos, navegação detalhada e histórico de alterações não deverão ser implementadas como se esses dados já fossem coletados.

## Próxima etapa

Após este mapeamento, a implementação poderá avançar para a integração administrativa do **Progresso de Leitura**, utilizando os dados existentes para definir as primeiras consultas, filtros e indicadores.

A partir dessa primeira integração, o mesmo padrão poderá ser aplicado progressivamente a:

1. Favoritos;
2. Avaliações;
3. Comentários;
4. Marcadores;
5. Preferências.
