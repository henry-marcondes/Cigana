BEGIN;

CREATE TABLE decisoes_editoriais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    livro_id UUID NOT NULL UNIQUE,
    decisao VARCHAR(20) NOT NULL,
    decidido_por UUID NOT NULL,
    motivo_rejeicao TEXT,
    decidido_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_decisoes_editoriais_decisao
        CHECK (decisao IN ('APROVADA', 'REJEITADA')),
    CONSTRAINT ck_decisoes_editoriais_motivo
        CHECK (motivo_rejeicao IS NULL OR decisao = 'REJEITADA'),
    CONSTRAINT fk_decisoes_editoriais_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_decisoes_editoriais_usuario
        FOREIGN KEY (decidido_por)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

INSERT INTO permissoes (nome, codigo, descricao)
VALUES (
    'Aprovar obra',
    'obra.aprovar',
    'Permite aprovar ou rejeitar editorialmente uma obra.'
)
ON CONFLICT (codigo) DO UPDATE
   SET ativo = TRUE,
       atualizado_em = CURRENT_TIMESTAMP;

UPDATE papel_permissoes pp
   SET ativo = FALSE,
       atualizado_em = CURRENT_TIMESTAMP
  FROM papeis p, permissoes pm
 WHERE pp.papel_id = p.id
   AND pp.permissao_id = pm.id
   AND pm.codigo = 'obra.publicar'
   AND pp.ativo = TRUE
   AND p.codigo <> 'ADMINISTRADOR';

INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pm.id
  FROM papeis p
 CROSS JOIN permissoes pm
 WHERE p.codigo = 'ADMINISTRADOR'
   AND pm.codigo = 'moderacao.visualizar'
ON CONFLICT (papel_id, permissao_id) DO UPDATE
   SET ativo = TRUE,
       atualizado_em = CURRENT_TIMESTAMP;

INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pm.id
  FROM papeis p
 CROSS JOIN permissoes pm
 WHERE p.codigo = 'ADMINISTRADOR'
   AND pm.codigo IN (
       'obra.aprovar',
       'obra.publicar'
   )
ON CONFLICT (papel_id, permissao_id) DO UPDATE
   SET ativo = TRUE,
       atualizado_em = CURRENT_TIMESTAMP;

COMMIT;
