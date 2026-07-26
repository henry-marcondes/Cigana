BEGIN;

INSERT INTO classificacoes_indicativas (
    nome,
    idade_minima,
    descricao
)
VALUES
    ('Livre', 0, 'Conteúdo livre para todos os públicos'),
    ('10 anos', 10, 'Não recomendado para menores de 10 anos'),
    ('12 anos', 12, 'Não recomendado para menores de 12 anos'),
    ('14 anos', 14, 'Não recomendado para menores de 14 anos'),
    ('16 anos', 16, 'Não recomendado para menores de 16 anos'),
    ('18 anos', 18, 'Conteúdo destinado exclusivamente para maiores de 18 anos')

ON CONFLICT (idade_minima)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

COMMIT;
