-- =====================================================
-- Migration: 0026_create_cena_conteudos.sql
-- Descrição : Organização dos conteúdos das cenas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE cena_conteudos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cena_id UUID NOT NULL,

    tipo_conteudo TEXT NOT NULL,

    conteudo_id UUID NOT NULL,

    ordem_exibicao INTEGER NOT NULL DEFAULT 1,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_cena_conteudos_tipo
        CHECK (
            tipo_conteudo IN (
                'TEXTO',
                'IMAGEM',
                'AUDIO',
                'VIDEO'
            )
        ),

    CONSTRAINT ck_cena_conteudos_ordem
        CHECK (ordem_exibicao > 0),

    CONSTRAINT fk_cena_conteudos_cena
        FOREIGN KEY (cena_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_cena_conteudos_cena
    ON cena_conteudos (cena_id);

CREATE UNIQUE INDEX uq_cena_conteudos_cena_ordem
    ON cena_conteudos (cena_id, ordem_exibicao)
    WHERE ativo = TRUE;
