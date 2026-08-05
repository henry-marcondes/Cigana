# DOM-003 — Decisão Arquitetural (Congelada)

## Princípio

A plataforma deve permitir navegação completa como visitante, sem necessidade de autenticação.

O cadastro de usuário será exigido apenas para funcionalidades que dependam de uma identidade persistente.

Exemplos:

Salvar progresso de leitura;
Favoritar livros;
Publicar livros;
Tornar-se autor;
Assinar planos;
Comprar conteúdo;
Comentar (quando existir);
Sincronizar dados entre dispositivos.

### RN-PL-001 — (Revisão Plataforma Leitura)

O progresso de leitura é salvo automaticamente sempre que o leitor avança para uma nova cena ou realiza 
uma ação que altere seu estado de leitura. O usuário não precisa executar um salvamento manual.

### Etapa 5.1.2 - implementação do módulo Usuarios.

1. Implementar models/Usuario.js
2. Testar Usuario.js

3. Implementar models/PerfilUsuario.js
4. Testar PerfilUsuario.js

5. Implementar validators/usuarioValidator.js
6. Testar Validator

7. Implementar services/usuarioService.js
   - utilizando transações (BEGIN, COMMIT, ROLLBACK)
8. Testar Service

9. Implementar controllers/usuarioController.js
10. Testar Controller

11. Implementar routes/usuarios.js
12. Testar a API completa

### ARC-001--Um método = Uma responsabilidade  (ARC = Arquitetura)
1. cada método do model executa uma única operação sobre a tabela.
   nunca ter métodos "genéricos" que alterm campos de natureza difentes.

2. Nomes de parâmetros devem expressar sua finalidade.
   sempre que um parâmetro representar uma alteração específica, seu nome deverá deixar isso explícito.

3. Parâmetros representam a entidade
   Os parâmetros dos métodos representarão a entidade que está sendo manipulada, e não nomes genéricos 
   como dados.
   Exemplos:
   ❌ Evitar
   criar(dados)
   atualizar(id, dados)

   ✅ Adotar
   criar(usuario)
   atualizar(id, usuario)
   criar(perfil)
   criar(livro)
   criar(categoria)
   criar(cena)
   criar(comentario)
   assim o código 'fala por si', não é necessário abrir o método para descobrir o que contém o objeto.

4. Evitar o uso do SELECT *,Todos os Models deverão listar explicitamente as colunas retornadas. 

    Vantagens:
        segurança;
        desempenho;
        evita vazamento de colunas futuras;
        código mais legível.




