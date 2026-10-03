-- =====================================================
-- Seed: 0008_seed_preferencias.sql
-- Descrição : Inserção das preferências disponíveis
--             para os usuários
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

INSERT INTO preferencias (
    grupo,
    codigo,
    nome,
    descricao,
    ordem_exibicao,
    ativo
)
VALUES

-- =====================================================
-- FINALIDADE DA LEITURA
-- =====================================================

(
    'FINALIDADE_LEITURA',
    'DIVERSAO',
    'Diversão',
    NULL,
    1,
    TRUE
),

(
    'FINALIDADE_LEITURA',
    'ESTUDO',
    'Estudo',
    NULL,
    2,
    TRUE
),

(
    'FINALIDADE_LEITURA',
    'CONHECIMENTO',
    'Conhecimento',
    NULL,
    3,
    TRUE
),

(
    'FINALIDADE_LEITURA',
    'TRABALHO',
    'Trabalho',
    NULL,
    4,
    TRUE
),

-- =====================================================
-- FORMATO DA LEITURA
-- =====================================================

(
    'FORMATO_LEITURA',
    'DIGITAL',
    'Digital',
    NULL,
    1,
    TRUE
),

(
    'FORMATO_LEITURA',
    'IMPRESSO',
    'Impresso',
    NULL,
    2,
    TRUE
),

-- =====================================================
-- MEIO DE LEITURA
-- =====================================================

(
    'MEIO_LEITURA',
    'CELULAR',
    'Celular',
    NULL,
    1,
    TRUE
),

(
    'MEIO_LEITURA',
    'TABLET',
    'Tablet',
    NULL,
    2,
    TRUE
),

(
    'MEIO_LEITURA',
    'COMPUTADOR',
    'Computador',
    NULL,
    3,
    TRUE
),

(
    'MEIO_LEITURA',
    'KINDLE',
    'Kindle',
    NULL,
    4,
    TRUE
),

(
    'MEIO_LEITURA',
    'OUTRO',
    'Outro',
    NULL,
    5,
    TRUE
)

ON CONFLICT (grupo, codigo)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ordem_exibicao = EXCLUDED.ordem_exibicao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

COMMIT;
