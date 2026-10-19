BEGIN;

INSERT INTO permissoes (
    nome,
    codigo,
    descricao
)
VALUES (
    'Visualizar análise de dados',
    'analise_dados.visualizar',
    'Permite consultar indicadores e relatórios administrativos da plataforma.'
)
ON CONFLICT (codigo) DO UPDATE
   SET nome = EXCLUDED.nome,
       descricao = EXCLUDED.descricao,
       ativo = TRUE,
       atualizado_em = CURRENT_TIMESTAMP;

UPDATE papel_permissoes pp
   SET ativo = FALSE,
       atualizado_em = CURRENT_TIMESTAMP
  FROM papeis p, permissoes pm
 WHERE pp.papel_id = p.id
   AND pp.permissao_id = pm.id
   AND pm.codigo = 'analise_dados.visualizar'
   AND pp.ativo = TRUE
   AND p.codigo NOT IN ('ADMINISTRADOR', 'GERENTE');

INSERT INTO papel_permissoes (
    papel_id,
    permissao_id
)
SELECT p.id, pm.id
  FROM papeis p
 CROSS JOIN permissoes pm
 WHERE p.codigo IN ('ADMINISTRADOR', 'GERENTE')
   AND pm.codigo = 'analise_dados.visualizar'
ON CONFLICT (papel_id, permissao_id) DO UPDATE
   SET ativo = TRUE,
       atualizado_em = CURRENT_TIMESTAMP;

COMMIT;
