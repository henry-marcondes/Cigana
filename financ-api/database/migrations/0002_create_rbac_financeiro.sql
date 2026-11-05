CREATE TABLE financeiro.usuarios_financeiros (
    usuario_id_externo uuid PRIMARY KEY,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    criado_por_usuario_id_externo uuid,
    atualizado_por_usuario_id_externo uuid
);

CREATE TABLE financeiro.papeis_financeiros (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo varchar(100) NOT NULL UNIQUE,
    nome varchar(150) NOT NULL UNIQUE,
    descricao text,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    criado_por_usuario_id_externo uuid,
    atualizado_por_usuario_id_externo uuid,
    CONSTRAINT papeis_financeiros_codigo_nao_vazio
        CHECK (btrim(codigo) <> ''),
    CONSTRAINT papeis_financeiros_nome_nao_vazio
        CHECK (btrim(nome) <> '')
);

CREATE TABLE financeiro.permissoes_financeiras (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo varchar(150) NOT NULL UNIQUE,
    nome varchar(150) NOT NULL,
    descricao text,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    criado_por_usuario_id_externo uuid,
    atualizado_por_usuario_id_externo uuid,
    CONSTRAINT permissoes_financeiras_codigo_nao_vazio
        CHECK (btrim(codigo) <> ''),
    CONSTRAINT permissoes_financeiras_nome_nao_vazio
        CHECK (btrim(nome) <> '')
);

CREATE TABLE financeiro.usuario_papeis_financeiros (
    usuario_id_externo uuid NOT NULL,
    papel_id bigint NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    atribuido_por_usuario_id_externo uuid,
    atualizado_por_usuario_id_externo uuid,
    CONSTRAINT usuario_papeis_financeiros_pk
        PRIMARY KEY (usuario_id_externo, papel_id),
    CONSTRAINT usuario_papeis_financeiros_usuario_fk
        FOREIGN KEY (usuario_id_externo)
        REFERENCES financeiro.usuarios_financeiros (usuario_id_externo)
        ON DELETE CASCADE,
    CONSTRAINT usuario_papeis_financeiros_papel_fk
        FOREIGN KEY (papel_id)
        REFERENCES financeiro.papeis_financeiros (id)
        ON DELETE CASCADE
);

CREATE INDEX usuario_papeis_financeiros_papel_idx
    ON financeiro.usuario_papeis_financeiros (papel_id);

CREATE TABLE financeiro.papel_permissoes_financeiras (
    papel_id bigint NOT NULL,
    permissao_id bigint NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    atribuido_por_usuario_id_externo uuid,
    atualizado_por_usuario_id_externo uuid,
    CONSTRAINT papel_permissoes_financeiras_pk
        PRIMARY KEY (papel_id, permissao_id),
    CONSTRAINT papel_permissoes_financeiras_papel_fk
        FOREIGN KEY (papel_id)
        REFERENCES financeiro.papeis_financeiros (id)
        ON DELETE CASCADE,
    CONSTRAINT papel_permissoes_financeiras_permissao_fk
        FOREIGN KEY (permissao_id)
        REFERENCES financeiro.permissoes_financeiras (id)
        ON DELETE CASCADE
);

CREATE INDEX papel_permissoes_financeiras_permissao_idx
    ON financeiro.papel_permissoes_financeiras (permissao_id);
