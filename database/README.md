# BANCO DE DADOS

## migrations: construir o BANCO de DADOS

1. executar os arquivos na sequência:
2. No diretório raiz do Projeto (useario:~/Cigana$)
3. $ psql -d ciganas_db -f database/migrations/0001_create_idiomas.sql
   e assim por diante.
4. pode usar o script migrar.sh para agilizar o processo
5. $ ./migrar.sh 0001_create_idiomas.sql


## seeds : usado para inserir dados.

1. usado para inserir dados quando necessário. 
2. deve ser usado em conjunto com migrations para testes
3. $ ./seeds.sh 0001_seed_idiomas.sql


## scrits : usados para manipular dados

1. usado para manutenção do banco durante a fase de desenvolvimento
2. específico para limpar os dados de teste. 
3. na raiz do projeto 9usuario:~/Cigana$) executar:
4. psql -d cigana_db -f database/scripts/limpar_dados_teste.sql
5. O que permanece
    Essas tabelas não seriam apagadas:
        idiomas
        classificacoes_indicativas
        tipos_biblioteca
        categoria
        status_livro
        visibilidade_livro
    Porque elas representam dados estruturais do sistema.
