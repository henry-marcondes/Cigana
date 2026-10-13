BEGIN;

ALTER TABLE contratos_aceites
DROP CONSTRAINT IF EXISTS uq_contratos_aceites_usuario_versao;

CREATE UNIQUE INDEX uq_contratos_aceites_usuario_versao_livro
ON contratos_aceites (
    usuario_id,
    contrato_versao_id,
    livro_id
)
WHERE livro_id IS NOT NULL;

COMMIT;
