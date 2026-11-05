-- =====================================================
-- Migration: 0053_create_gerenciamento_arquivos.sql
-- Descrição : Cria pastas e arquivos de mídia por obra
-- Projeto   : Plataforma Cigana
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE pastas_obra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    livro_id UUID NOT NULL,
    pasta_pai_id UUID,
    nome TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_pastas_obra_nome
        CHECK (btrim(nome) <> ''),
    CONSTRAINT uq_pastas_obra_id_livro
        UNIQUE (id, livro_id),
    CONSTRAINT fk_pastas_obra_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_pastas_obra_pai_mesma_obra
        FOREIGN KEY (pasta_pai_id, livro_id)
        REFERENCES pastas_obra(id, livro_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_pastas_obra_raiz_nome
    ON pastas_obra (livro_id, lower(btrim(nome)))
    WHERE pasta_pai_id IS NULL;

CREATE UNIQUE INDEX uq_pastas_obra_subpasta_nome
    ON pastas_obra (livro_id, pasta_pai_id, lower(btrim(nome)))
    WHERE pasta_pai_id IS NOT NULL;

CREATE INDEX idx_pastas_obra_livro_pai
    ON pastas_obra (livro_id, pasta_pai_id);

CREATE TABLE arquivos_midia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    livro_id UUID NOT NULL,
    pasta_id UUID,
    nome_original TEXT NOT NULL,
    chave_armazenamento TEXT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    hash_sha256 CHAR(64) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_arquivos_midia_nome_original
        CHECK (btrim(nome_original) <> ''),
    CONSTRAINT ck_arquivos_midia_tamanho_bytes
        CHECK (tamanho_bytes >= 0),
    CONSTRAINT ck_arquivos_midia_hash_sha256
        CHECK (hash_sha256 ~ '^[0-9A-Fa-f]{64}$'),
    CONSTRAINT uq_arquivos_midia_chave_armazenamento
        UNIQUE (chave_armazenamento),
    CONSTRAINT uq_arquivos_midia_id_livro
        UNIQUE (id, livro_id),
    CONSTRAINT fk_arquivos_midia_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_arquivos_midia_pasta_mesma_obra
        FOREIGN KEY (pasta_id, livro_id)
        REFERENCES pastas_obra(id, livro_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_arquivos_midia_livro_pasta
    ON arquivos_midia (livro_id, pasta_id);

CREATE INDEX idx_arquivos_midia_hash_sha256
    ON arquivos_midia (hash_sha256);

-- A prevenção de ciclos na hierarquia de pastas deverá ser validada
-- posteriormente no service, dentro de uma transação.

COMMIT;
