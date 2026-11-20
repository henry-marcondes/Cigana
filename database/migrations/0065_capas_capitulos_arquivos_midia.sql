BEGIN;

ALTER TABLE capitulos
    ADD COLUMN arquivo_capa_id UUID;

ALTER TABLE capitulos
    ADD CONSTRAINT fk_capitulos_arquivo_capa_mesma_obra
    FOREIGN KEY (arquivo_capa_id, livro_id)
    REFERENCES arquivos_midia(id, livro_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

CREATE INDEX idx_capitulos_arquivo_capa
    ON capitulos(arquivo_capa_id)
    WHERE arquivo_capa_id IS NOT NULL;

COMMIT;
