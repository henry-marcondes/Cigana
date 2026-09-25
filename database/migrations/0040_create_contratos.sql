-- =====================================================
-- Migration: 0040_create_contratos.sql
-- Descrição : Estrutura genérica de contratos e aceites
-- Projeto   : Plataforma Cigana
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50) NOT NULL,
    codigo VARCHAR(100) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contratos_codigo UNIQUE (codigo),
    CONSTRAINT ck_contratos_tipo CHECK (
        tipo IN ('DIREITOS_AUTORAIS','RESPONSABILIDADES_EDITORIAIS','PRESTACAO_SERVICOS','OUTROS')
    )
);

CREATE INDEX idx_contratos_tipo ON contratos (tipo);
CREATE INDEX idx_contratos_ativo ON contratos (ativo);

CREATE TABLE contrato_versoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id UUID NOT NULL,
    versao VARCHAR(20) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    publicado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_contrato_versoes_contrato FOREIGN KEY (contrato_id)
        REFERENCES contratos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_contrato_versoes_versao UNIQUE (contrato_id, versao),
    CONSTRAINT ck_contrato_versoes_status CHECK (status IN ('RASCUNHO','ATIVA','ENCERRADA')),
    CONSTRAINT ck_contrato_versoes_publicado CHECK (
        (status = 'RASCUNHO' AND publicado_em IS NULL)
        OR
        (status IN ('ATIVA','ENCERRADA') AND publicado_em IS NOT NULL)
    )
);

CREATE INDEX idx_contrato_versoes_contrato ON contrato_versoes (contrato_id);
CREATE INDEX idx_contrato_versoes_status ON contrato_versoes (status);
CREATE UNIQUE INDEX uq_contrato_versao_ativa ON contrato_versoes (contrato_id) WHERE status = 'ATIVA';

CREATE TABLE contrato_obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id UUID NOT NULL,
    livro_id UUID NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_contrato_obras_contrato FOREIGN KEY (contrato_id)
        REFERENCES contratos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_obras_livro FOREIGN KEY (livro_id)
        REFERENCES livros(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_contrato_obras UNIQUE (contrato_id, livro_id)
);

CREATE INDEX idx_contrato_obras_contrato ON contrato_obras (contrato_id);
CREATE INDEX idx_contrato_obras_livro ON contrato_obras (livro_id);

CREATE TABLE contratos_aceites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_versao_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    aceito_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    registro_eletronico UUID NOT NULL DEFAULT gen_random_uuid(),
    ip_origem INET,
    user_agent TEXT,
    dados_tecnicos JSONB,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_contratos_aceites_versao FOREIGN KEY (contrato_versao_id)
        REFERENCES contrato_versoes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_contratos_aceites_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_contratos_aceites_registro UNIQUE (registro_eletronico)
);

CREATE INDEX idx_contratos_aceites_versao ON contratos_aceites (contrato_versao_id);
CREATE INDEX idx_contratos_aceites_usuario ON contratos_aceites (usuario_id);
CREATE INDEX idx_contratos_aceites_aceito_em ON contratos_aceites (aceito_em);

COMMIT;
