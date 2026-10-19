const pool = require('../db/connection');

class AnaliseProgressoLeitura {
    static async obterIndicadoresFavoritos() {
        const result = await pool.query(`
            WITH favoritos_elegiveis AS (
                SELECT
                    f.usuario_id,
                    f.livro_id,
                    l.titulo,
                    l.categoria_id
                  FROM favoritos f
                  INNER JOIN livros l
                    ON l.id = f.livro_id
                   AND l.ativo = TRUE
                 WHERE f.ativo = TRUE
            ),
            favoritos_por_obra AS (
                SELECT
                    livro_id,
                    titulo,
                    COUNT(*)::INTEGER AS quantidade_favoritos
                  FROM favoritos_elegiveis
                 GROUP BY livro_id, titulo
            ),
            favoritos_por_categoria AS (
                SELECT
                    c.id AS categoria_id,
                    c.nome AS categoria,
                    COUNT(*)::INTEGER AS quantidade_favoritos
                  FROM favoritos_elegiveis fe
                  INNER JOIN categorias c
                    ON c.id = fe.categoria_id
                 GROUP BY c.id, c.nome
            ),
            obras_por_usuario AS (
                SELECT
                    usuario_id,
                    COUNT(DISTINCT livro_id)::INTEGER AS quantidade_obras
                  FROM favoritos_elegiveis
                 GROUP BY usuario_id
            ),
            distribuicao_usuarios AS (
                SELECT
                    quantidade_obras,
                    COUNT(*)::INTEGER AS quantidade_usuarios
                  FROM obras_por_usuario
                 GROUP BY quantidade_obras
            )
            SELECT
                (SELECT COUNT(*)::INTEGER FROM favoritos_elegiveis)
                    AS favoritos_ativos,
                (
                    SELECT COUNT(DISTINCT usuario_id)::INTEGER
                      FROM favoritos_elegiveis
                ) AS usuarios_distintos,
                (
                    SELECT COUNT(*)::INTEGER
                      FROM favoritos
                     WHERE ativo = FALSE
                ) AS favoritos_inativos,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'livro_id', livro_id,
                                'titulo', titulo,
                                'quantidade_favoritos', quantidade_favoritos
                            )
                            ORDER BY quantidade_favoritos DESC, titulo, livro_id
                        )
                          FROM favoritos_por_obra
                    ),
                    '[]'::JSON
                ) AS obras_mais_favoritadas,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'categoria_id', categoria_id,
                                'categoria', categoria,
                                'quantidade_favoritos', quantidade_favoritos
                            )
                            ORDER BY quantidade_favoritos DESC, categoria, categoria_id
                        )
                          FROM favoritos_por_categoria
                    ),
                    '[]'::JSON
                ) AS favoritos_por_categoria,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'quantidade_obras', quantidade_obras,
                                'quantidade_usuarios', quantidade_usuarios
                            )
                            ORDER BY quantidade_obras
                        )
                          FROM distribuicao_usuarios
                    ),
                    '[]'::JSON
                ) AS distribuicao_usuarios
        `);

        return result.rows[0];
    }

    static async obterIndicadoresPorObra() {
        const result = await pool.query(`
            WITH obras_ativas AS (
                SELECT id, titulo
                  FROM livros
                 WHERE ativo = TRUE
            ),
            progresso_por_obra AS (
                SELECT
                    p.livro_id,
                    COUNT(DISTINCT p.usuario_id)::INTEGER AS leitores,
                    COUNT(*)::INTEGER AS registros_progresso,
                    ROUND(AVG(p.percentual_concluido), 2)
                        AS percentual_medio,
                    COUNT(*) FILTER (
                        WHERE p.concluido = TRUE
                    )::INTEGER AS registros_concluidos,
                    COUNT(DISTINCT p.usuario_id) FILTER (
                        WHERE p.concluido = TRUE
                    )::INTEGER AS leitores_concluidos
                  FROM progresso_leitura p
                  INNER JOIN obras_ativas o
                    ON o.id = p.livro_id
                 WHERE p.ativo = TRUE
                 GROUP BY p.livro_id
            )
            SELECT
                o.id AS livro_id,
                o.titulo,
                COALESCE(po.leitores, 0)::INTEGER AS leitores,
                COALESCE(po.registros_progresso, 0)::INTEGER
                    AS registros_progresso,
                COALESCE(po.percentual_medio, 0::NUMERIC)
                    AS percentual_medio,
                COALESCE(po.registros_concluidos, 0)::INTEGER
                    AS registros_concluidos,
                COALESCE(po.leitores_concluidos, 0)::INTEGER
                    AS leitores_concluidos,
                CASE
                    WHEN COALESCE(po.registros_progresso, 0) = 0
                        THEN 0::NUMERIC
                    ELSE ROUND(
                        po.registros_concluidos::NUMERIC * 100
                        / po.registros_progresso::NUMERIC,
                        2
                    )
                END AS percentual_concluidos
              FROM obras_ativas o
              LEFT JOIN progresso_por_obra po
                ON po.livro_id = o.id
             ORDER BY o.titulo, o.id
        `);

        return result.rows;
    }

    static async obterIndicadoresPorCategoria() {
        const result = await pool.query(`
            WITH categorias_ativas AS (
                SELECT id, nome
                  FROM categorias
                 WHERE ativo = TRUE
            ),
            obras_ativas_por_categoria AS (
                SELECT l.categoria_id, COUNT(*)::INTEGER AS total_obras
                  FROM livros l
                  INNER JOIN categorias_ativas c
                    ON c.id = l.categoria_id
                 WHERE l.ativo = TRUE
                 GROUP BY l.categoria_id
            ),
            progressos_elegiveis AS (
                SELECT
                    l.categoria_id,
                    p.usuario_id,
                    p.livro_id,
                    p.concluido,
                    p.percentual_concluido
                  FROM progresso_leitura p
                  INNER JOIN livros l
                    ON l.id = p.livro_id
                   AND l.ativo = TRUE
                  INNER JOIN categorias_ativas c
                    ON c.id = l.categoria_id
                 WHERE p.ativo = TRUE
            ),
            progresso_por_categoria AS (
                SELECT
                    categoria_id,
                    COUNT(DISTINCT usuario_id)::INTEGER AS leitores,
                    COUNT(*)::INTEGER AS registros_progresso,
                    COUNT(DISTINCT livro_id) FILTER (
                        WHERE concluido = FALSE
                    )::INTEGER AS obras_em_andamento,
                    COUNT(DISTINCT livro_id) FILTER (
                        WHERE concluido = TRUE
                    )::INTEGER AS obras_concluidas,
                    ROUND(AVG(percentual_concluido), 2) AS percentual_medio
                  FROM progressos_elegiveis
                 GROUP BY categoria_id
            ),
            total_geral AS (
                SELECT COUNT(*)::INTEGER AS registros_progresso
                  FROM progressos_elegiveis
            )
            SELECT
                c.id AS categoria_id,
                c.nome AS categoria,
                COALESCE(o.total_obras, 0)::INTEGER AS total_obras,
                COALESCE(pc.leitores, 0)::INTEGER AS leitores,
                COALESCE(pc.registros_progresso, 0)::INTEGER
                    AS registros_progresso,
                COALESCE(pc.obras_em_andamento, 0)::INTEGER
                    AS obras_em_andamento,
                COALESCE(pc.obras_concluidas, 0)::INTEGER
                    AS obras_concluidas,
                CASE
                    WHEN tg.registros_progresso = 0 THEN 0::NUMERIC
                    ELSE ROUND(
                        COALESCE(pc.registros_progresso, 0)::NUMERIC * 100
                        / tg.registros_progresso::NUMERIC,
                        2
                    )
                END AS participacao_percentual,
                COALESCE(pc.percentual_medio, 0::NUMERIC)
                    AS percentual_medio
              FROM categorias_ativas c
              LEFT JOIN obras_ativas_por_categoria o
                ON o.categoria_id = c.id
              LEFT JOIN progresso_por_categoria pc
                ON pc.categoria_id = c.id
             CROSS JOIN total_geral tg
             ORDER BY c.nome, c.id
        `);

        return result.rows;
    }

    static async obterIndicadores() {
        const result = await pool.query(`
            WITH progressos_ativos AS (
                SELECT id, usuario_id, percentual_concluido, concluido
                  FROM progresso_leitura
                 WHERE ativo = TRUE
            ),
            visitas_distintas AS (
                SELECT DISTINCT
                    v.progresso_id,
                    v.cena_id
                  FROM progresso_leitura_cenas_visitadas v
                  INNER JOIN progressos_ativos p
                    ON p.id = v.progresso_id
            )
            SELECT
                COUNT(DISTINCT p.usuario_id)::INTEGER
                    AS leitores_com_progresso_ativo,
                COUNT(*)::INTEGER
                    AS registros_progresso_ativos,
                COUNT(*) FILTER (
                    WHERE p.percentual_concluido = 0
                )::INTEGER AS percentual_0,
                COUNT(*) FILTER (
                    WHERE p.percentual_concluido > 0
                      AND p.percentual_concluido <= 25
                )::INTEGER AS percentual_ate_25,
                COUNT(*) FILTER (
                    WHERE p.percentual_concluido > 25
                      AND p.percentual_concluido <= 50
                )::INTEGER AS percentual_ate_50,
                COUNT(*) FILTER (
                    WHERE p.percentual_concluido > 50
                      AND p.percentual_concluido <= 75
                )::INTEGER AS percentual_ate_75,
                COUNT(*) FILTER (
                    WHERE p.percentual_concluido > 75
                      AND p.percentual_concluido < 100
                )::INTEGER AS percentual_antes_100,
                COUNT(*) FILTER (
                    WHERE p.percentual_concluido = 100
                )::INTEGER AS percentual_100,
                COUNT(*) FILTER (
                    WHERE p.concluido = TRUE
                )::INTEGER AS leituras_concluidas,
                COUNT(*) FILTER (
                    WHERE p.concluido = FALSE
                )::INTEGER AS leituras_nao_concluidas,
                (
                    SELECT COUNT(*)::INTEGER
                      FROM visitas_distintas
                ) AS cenas_distintas_visitadas
              FROM progressos_ativos p
        `);

        const indicadores = result.rows[0];

        return {
            leitores_com_progresso_ativo:
                indicadores.leitores_com_progresso_ativo,
            registros_progresso_ativos:
                indicadores.registros_progresso_ativos,
            distribuicao_percentual: [
                { faixa: '0%', quantidade: indicadores.percentual_0 },
                { faixa: '>0% a 25%', quantidade: indicadores.percentual_ate_25 },
                { faixa: '>25% a 50%', quantidade: indicadores.percentual_ate_50 },
                { faixa: '>50% a 75%', quantidade: indicadores.percentual_ate_75 },
                { faixa: '>75% e <100%', quantidade: indicadores.percentual_antes_100 },
                { faixa: '100%', quantidade: indicadores.percentual_100 }
            ],
            leituras_concluidas: {
                concluidas: indicadores.leituras_concluidas,
                nao_concluidas: indicadores.leituras_nao_concluidas
            },
            cenas_distintas_visitadas:
                indicadores.cenas_distintas_visitadas
        };
    }
}

module.exports = AnaliseProgressoLeitura;
