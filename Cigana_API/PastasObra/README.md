# Testes Bruno — Pastas da obra

Configure no ambiente Bruno as variáveis `livro_id`, `livro_outro_id`, `run_id`,
`pasta_raiz_id`, `pasta_filha_id`, `pasta_neta_id`,
`pasta_pai_de_outra_obra_id`, `pasta_vazia_id`,
`pasta_com_subpasta_id`, `pasta_com_arquivo_id` e
`nome_pasta_existente_no_nivel`. Use IDs de duas obras distintas editáveis
pelo usuário autenticado e pastas existentes que correspondam aos cenários.

O primeiro request cria a raiz `Bruno raiz {{run_id}}` e o segundo cria uma
subpasta dentro dela. Informe seus IDs nas variáveis correspondentes. Para o
teste de nome duplicado, use `Bruno raiz {{run_id}}` em
`nome_pasta_existente_no_nivel`. A pasta usada no teste de exclusão com arquivo
precisa conter um registro em `arquivos_midia`. Execute a migration 0053
separadamente, conforme o processo autorizado do projeto; esta coleção não
executa setup nem limpeza de dados.

Os requests autenticados herdam a autenticação configurada na coleção ou no
ambiente Bruno. O último request remove a autenticação para verificar o 401.
