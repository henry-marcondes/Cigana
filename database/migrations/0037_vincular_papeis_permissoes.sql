-- AUTOR
INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id
FROM papeis p
CROSS JOIN permissoes pe
WHERE p.codigo = 'AUTOR'
  AND pe.codigo IN (
      'obra.criar',
      'obra.visualizar',
      'autor.visualizar'
  );


-- CURADOR
INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id
FROM papeis p
CROSS JOIN permissoes pe
WHERE p.codigo = 'CURADOR'
  AND pe.codigo IN (
      'obra.visualizar',
      'obra.publicar',
      'autor.visualizar'
  );


-- REVISOR
INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id
FROM papeis p
CROSS JOIN permissoes pe
WHERE p.codigo = 'REVISOR'
  AND pe.codigo IN (
      'obra.visualizar',
      'autor.visualizar',
      'moderacao.visualizar'
  );


-- EDITOR
INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id
FROM papeis p
CROSS JOIN permissoes pe
WHERE p.codigo = 'EDITOR'
  AND pe.codigo IN (
      'obra.criar',
      'obra.visualizar',
      'obra.editar',
      'obra.publicar',
      'obra.excluir',
      'autor.visualizar',
      'autor.editar'
  );


-- MODERADOR
INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id
FROM papeis p
CROSS JOIN permissoes pe
WHERE p.codigo = 'MODERADOR'
  AND pe.codigo IN (
      'obra.visualizar',
      'usuario.visualizar',
      'usuario.bloquear',
      'autor.visualizar',
      'moderacao.visualizar',
      'moderacao.operar'
  );


-- GERENTE
INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id
FROM papeis p
CROSS JOIN permissoes pe
WHERE p.codigo = 'GERENTE'
  AND pe.codigo IN (
      'obra.visualizar',
      'usuario.visualizar',
      'usuario.editar',
      'usuario.bloquear',
      'autor.visualizar',
      'autor.editar',
      'moderacao.visualizar',
      'moderacao.operar',
      'plataforma.visualizar',
      'financeiro.visualizar',
      'financeiro.operar'
  );


-- ADMINISTRADOR
INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id
FROM papeis p
CROSS JOIN permissoes pe
WHERE p.codigo = 'ADMINISTRADOR'
  AND pe.codigo IN (
      'obra.visualizar',
      'usuario.visualizar',
      'usuario.editar',
      'autor.visualizar',
      'autor.editar',
      'plataforma.visualizar',
      'plataforma.configurar'
  );
