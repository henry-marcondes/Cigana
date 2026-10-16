-- Migration: 0050_create_finais_leitura.sql
-- Descrição: Marca cenas finais e registra finais conquistados pelos leitores.

ALTER TABLE cenas
    ADD COLUMN cena_final BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE finais_leitura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    livro_id UUID NOT NULL,
    cena_id UUID NOT NULL,
    confirmado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_finais_leitura_usuario_livro_cena
        UNIQUE (usuario_id, livro_id, cena_id),
    CONSTRAINT fk_finais_leitura_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_finais_leitura_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_finais_leitura_cena
        FOREIGN KEY (cena_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_finais_leitura_usuario_livro
    ON finais_leitura (usuario_id, livro_id);
