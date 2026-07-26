BEGIN;

INSERT INTO idiomas (
    nome,
    nome_nativo,
    codigo_iso_639_1,
    codigo_iso_639_2,
    locale
)
VALUES
    ('Português', 'Português', 'pt', 'por', 'pt-BR'),
    ('English', 'English', 'en', 'eng', 'en-US'),
    ('Español', 'Español', 'es', 'spa', 'es-ES'),
    ('Français', 'Français', 'fr', 'fra', 'fr-FR'),
    ('Deutsch', 'Deutsch', 'de', 'deu', 'de-DE'),
    ('Italiano', 'Italiano', 'it', 'ita', 'it-IT');

ON CONFLICT (codigo_iso_639_1)
DO UPDATE SET
    nome = EXCLUDED.nome,
    nome_nativo = EXCLUDED.nome_nativo,
    codigo_iso_639_2 = EXCLUDED.codigo_iso_639_2,
    locale = EXCLUDED.locale,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

COMMIT;
