# Testes Bruno — Arquivos gerenciados

Configure as variáveis `livro_id`, `livro_outro_id`, `pasta_id`,
`pasta_de_outra_obra_id`, `arquivo_id` e `run_id` no ambiente Bruno. Use obras
que o usuário autenticado possa editar. Os uploads são enviados como corpo
binário (`application/octet-stream`) e o nome original é enviado em
`X-Nome-Original`.

Os requests de upload e substituição de exemplo usam texto simples como bytes,
para permitir execução sem incluir fixtures no diretório público de mídia.
Para verificar MIME de um formato específico, envie bytes reais desse formato.
O request de falha de gravação e o de falha ao atualizar metadados são cobertos
pelos testes unitários com falhas simuladas; a API não inclui ganchos de falha
para testes Bruno.

Execute os requests em ordem: upload, liste a obra e copie o `id` retornado
para `arquivo_id`; em seguida execute renomeação, movimentações, substituição e
desativação. Para o upload dentro de pasta, forneça `pasta_id`. A pasta de outra
obra deve ser um UUID real pertencente a `livro_outro_id`. Requests não devem
ser executados com dados de produção.

Os requests autenticados herdam a autenticação configurada na coleção ou no
ambiente Bruno. O último request remove a autenticação para verificar a
resposta 401.
