DO $$
DECLARE
    usuarios_sem_origem integer;
    issuer_configurado text;
BEGIN
    SELECT count(*)
      INTO usuarios_sem_origem
      FROM financeiro.usuarios_financeiros
     WHERE usuario_id_externo <> 'e4fc3e89-16b3-4e56-8353-3e7c7676083a'::uuid;

    IF usuarios_sem_origem > 0 THEN
        RAISE EXCEPTION
            'Migration 0003 cancelada: % usuário(s) financeiro(s) não possuem origem externa comprovada.',
            usuarios_sem_origem;
    END IF;

    IF NOT EXISTS (
        SELECT 1
          FROM financeiro.usuarios_financeiros
         WHERE usuario_id_externo = 'e4fc3e89-16b3-4e56-8353-3e7c7676083a'::uuid
    ) THEN
        RAISE EXCEPTION
            'Migration 0003 cancelada: usuário financeiro interno aprovado não foi encontrado.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
          FROM financeiro.usuarios_financeiros AS usuario
          INNER JOIN financeiro.usuario_papeis_financeiros AS usuario_papel
            ON usuario_papel.usuario_id_externo = usuario.usuario_id_externo
          INNER JOIN financeiro.papeis_financeiros AS papel
            ON papel.id = usuario_papel.papel_id
         WHERE usuario.usuario_id_externo = 'e4fc3e89-16b3-4e56-8353-3e7c7676083a'::uuid
           AND papel.codigo = 'ADMIN_RBAC_FINANCEIRO'
    ) THEN
        RAISE EXCEPTION
            'Migration 0003 cancelada: vínculo existente com ADMIN_RBAC_FINANCEIRO não foi encontrado.';
    END IF;

    issuer_configurado := NULLIF(current_setting('financ_api.jwt_issuer', true), '');
    IF issuer_configurado IS NULL THEN
        RAISE EXCEPTION
            'Migration 0003 cancelada: issuer JWT não foi fornecido pelo runner de migrations.';
    END IF;
END $$;

CREATE TABLE financeiro.plataformas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo varchar(50) NOT NULL UNIQUE,
    nome varchar(120) NOT NULL,
    issuer varchar(255) NOT NULL UNIQUE,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT plataformas_codigo_nao_vazio CHECK (btrim(codigo) <> ''),
    CONSTRAINT plataformas_nome_nao_vazio CHECK (btrim(nome) <> ''),
    CONSTRAINT plataformas_issuer_nao_vazio CHECK (btrim(issuer) <> '')
);

INSERT INTO financeiro.plataformas (codigo, nome, issuer)
VALUES (
    'CIGANA',
    'Plataforma Cigana',
    current_setting('financ_api.jwt_issuer')
);

ALTER TABLE financeiro.usuarios_financeiros
    ADD COLUMN id uuid;

-- O UUID interno e4fc... foi confirmado pelo responsável do projeto e é preservado.
UPDATE financeiro.usuarios_financeiros
   SET id = usuario_id_externo
 WHERE usuario_id_externo = 'e4fc3e89-16b3-4e56-8353-3e7c7676083a'::uuid;

ALTER TABLE financeiro.usuarios_financeiros
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN id SET NOT NULL;

ALTER TABLE financeiro.usuario_papeis_financeiros
    DROP CONSTRAINT usuario_papeis_financeiros_usuario_fk,
    DROP CONSTRAINT usuario_papeis_financeiros_pk;

ALTER TABLE financeiro.usuarios_financeiros
    DROP CONSTRAINT usuarios_financeiros_pkey;

ALTER TABLE financeiro.usuarios_financeiros
    ADD CONSTRAINT usuarios_financeiros_pkey PRIMARY KEY (id);

ALTER TABLE financeiro.usuario_papeis_financeiros
    ADD COLUMN usuario_financeiro_id uuid;

UPDATE financeiro.usuario_papeis_financeiros AS usuario_papel
   SET usuario_financeiro_id = usuario.id
  FROM financeiro.usuarios_financeiros AS usuario
 WHERE usuario.usuario_id_externo = usuario_papel.usuario_id_externo;

ALTER TABLE financeiro.usuario_papeis_financeiros
    ALTER COLUMN usuario_financeiro_id SET NOT NULL;

ALTER TABLE financeiro.usuario_papeis_financeiros
    DROP COLUMN usuario_id_externo;

ALTER TABLE financeiro.usuario_papeis_financeiros
    ADD CONSTRAINT usuario_papeis_financeiros_pk
        PRIMARY KEY (usuario_financeiro_id, papel_id),
    ADD CONSTRAINT usuario_papeis_financeiros_usuario_fk
        FOREIGN KEY (usuario_financeiro_id)
        REFERENCES financeiro.usuarios_financeiros (id)
        ON DELETE CASCADE;

ALTER TABLE financeiro.usuarios_financeiros
    DROP COLUMN usuario_id_externo;

CREATE TABLE financeiro.identidades_externas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plataforma_id uuid NOT NULL,
    usuario_financeiro_id uuid NOT NULL,
    usuario_id_externo uuid NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT identidades_externas_plataforma_fk
        FOREIGN KEY (plataforma_id)
        REFERENCES financeiro.plataformas (id),
    CONSTRAINT identidades_externas_usuario_financeiro_fk
        FOREIGN KEY (usuario_financeiro_id)
        REFERENCES financeiro.usuarios_financeiros (id),
    CONSTRAINT identidades_externas_plataforma_usuario_uk
        UNIQUE (plataforma_id, usuario_id_externo),
    CONSTRAINT identidades_externas_usuario_financeiro_uk
        UNIQUE (usuario_financeiro_id)
);

CREATE FUNCTION financeiro.proteger_associacao_identidade_externa()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION
            'Identidade externa não pode ser excluída; desative o vínculo para preservar o histórico.';
    END IF;

    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.plataforma_id IS DISTINCT FROM OLD.plataforma_id
       OR NEW.usuario_financeiro_id IS DISTINCT FROM OLD.usuario_financeiro_id
       OR NEW.usuario_id_externo IS DISTINCT FROM OLD.usuario_id_externo
       OR NEW.criado_em IS DISTINCT FROM OLD.criado_em THEN
        RAISE EXCEPTION
            'Identidade externa não pode ser reassociada; altere o vínculo somente por migration explícita e auditada.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER identidades_externas_associacao_imutavel
    BEFORE UPDATE OR DELETE ON financeiro.identidades_externas
    FOR EACH ROW
    EXECUTE FUNCTION financeiro.proteger_associacao_identidade_externa();

INSERT INTO financeiro.identidades_externas (
    plataforma_id,
    usuario_financeiro_id,
    usuario_id_externo
)
SELECT plataforma.id,
       usuario.id,
       '6ad662a5-4bb5-4111-bb05-c9b03c4abc13'::uuid
  FROM financeiro.plataformas AS plataforma
  INNER JOIN financeiro.usuarios_financeiros AS usuario
    ON usuario.id = 'e4fc3e89-16b3-4e56-8353-3e7c7676083a'::uuid
 WHERE plataforma.codigo = 'CIGANA';
