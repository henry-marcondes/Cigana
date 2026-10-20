const pool = require('../db/connection');

const FUSO_HORARIO = 'America/Sao_Paulo';

class AnaliseAvaliacoesComentarios {
    static async obterIndicadoresAtuais() {
        const [gerais, porObra] = await Promise.all([
            pool.query(`
                SELECT
                    COUNT(*)::INTEGER AS quantidade,
                    AVG(nota) AS media,
                    COUNT(*) FILTER (WHERE nota = 1)::INTEGER AS nota_1,
                    COUNT(*) FILTER (WHERE nota = 2)::INTEGER AS nota_2,
                    COUNT(*) FILTER (WHERE nota = 3)::INTEGER AS nota_3,
                    COUNT(*) FILTER (WHERE nota = 4)::INTEGER AS nota_4,
                    COUNT(*) FILTER (WHERE nota = 5)::INTEGER AS nota_5,
                    COUNT(*) FILTER (
                        WHERE comentario IS NOT NULL
                          AND BTRIM(comentario) <> ''
                    )::INTEGER AS com_comentario,
                    COUNT(*) FILTER (
                        WHERE comentario IS NULL
                           OR BTRIM(comentario) = ''
                    )::INTEGER AS sem_comentario,
                    (
                        SELECT COUNT(*)::INTEGER
                          FROM comentarios
                         WHERE ativo = TRUE
                    ) AS comentarios_independentes
                  FROM avaliacoes
                 WHERE ativo = TRUE
            `),
            pool.query(`
                WITH avaliacoes_por_obra AS (
                    SELECT
                        livro_id,
                        COUNT(*)::INTEGER AS quantidade,
                        AVG(nota) AS media,
                        COUNT(*) FILTER (WHERE nota = 1)::INTEGER AS nota_1,
                        COUNT(*) FILTER (WHERE nota = 2)::INTEGER AS nota_2,
                        COUNT(*) FILTER (WHERE nota = 3)::INTEGER AS nota_3,
                        COUNT(*) FILTER (WHERE nota = 4)::INTEGER AS nota_4,
                        COUNT(*) FILTER (WHERE nota = 5)::INTEGER AS nota_5,
                        COUNT(*) FILTER (
                            WHERE comentario IS NOT NULL
                              AND BTRIM(comentario) <> ''
                        )::INTEGER AS com_comentario,
                        COUNT(*) FILTER (
                            WHERE comentario IS NULL
                               OR BTRIM(comentario) = ''
                        )::INTEGER AS sem_comentario
                      FROM avaliacoes
                     WHERE ativo = TRUE
                     GROUP BY livro_id
                ),
                comentarios_por_obra AS (
                    SELECT livro_id, COUNT(*)::INTEGER AS quantidade
                      FROM comentarios
                     WHERE ativo = TRUE
                     GROUP BY livro_id
                )
                SELECT
                    l.id AS livro_id,
                    l.titulo,
                    COALESCE(a.quantidade, 0)::INTEGER AS avaliacoes_quantidade,
                    a.media AS avaliacoes_media,
                    COALESCE(a.nota_1, 0)::INTEGER AS avaliacoes_nota_1,
                    COALESCE(a.nota_2, 0)::INTEGER AS avaliacoes_nota_2,
                    COALESCE(a.nota_3, 0)::INTEGER AS avaliacoes_nota_3,
                    COALESCE(a.nota_4, 0)::INTEGER AS avaliacoes_nota_4,
                    COALESCE(a.nota_5, 0)::INTEGER AS avaliacoes_nota_5,
                    COALESCE(a.com_comentario, 0)::INTEGER
                        AS avaliacoes_com_comentario,
                    COALESCE(a.sem_comentario, 0)::INTEGER
                        AS avaliacoes_sem_comentario,
                    COALESCE(c.quantidade, 0)::INTEGER
                        AS comentarios_independentes
                  FROM livros l
                  LEFT JOIN avaliacoes_por_obra a
                    ON a.livro_id = l.id
                  LEFT JOIN comentarios_por_obra c
                    ON c.livro_id = l.id
                 WHERE l.ativo = TRUE
                 ORDER BY l.titulo, l.id
            `)
        ]);

        const geral = gerais.rows[0];

        return {
            avaliacoes: {
                quantidade: geral.quantidade,
                media: geral.media === null ? null : Number(geral.media),
                distribuicao_notas: {
                    1: geral.nota_1,
                    2: geral.nota_2,
                    3: geral.nota_3,
                    4: geral.nota_4,
                    5: geral.nota_5
                },
                com_comentario: geral.com_comentario,
                sem_comentario: geral.sem_comentario
            },
            comentarios_independentes: {
                quantidade: geral.comentarios_independentes
            },
            por_obra: porObra.rows.map((obra) => ({
                livro_id: obra.livro_id,
                titulo: obra.titulo,
                avaliacoes: {
                    quantidade: obra.avaliacoes_quantidade,
                    media: obra.avaliacoes_media === null
                        ? null
                        : Number(obra.avaliacoes_media),
                    distribuicao_notas: {
                        1: obra.avaliacoes_nota_1,
                        2: obra.avaliacoes_nota_2,
                        3: obra.avaliacoes_nota_3,
                        4: obra.avaliacoes_nota_4,
                        5: obra.avaliacoes_nota_5
                    },
                    com_comentario: obra.avaliacoes_com_comentario,
                    sem_comentario: obra.avaliacoes_sem_comentario
                },
                comentarios_independentes: {
                    quantidade: obra.comentarios_independentes
                }
            }))
        };
    }

    static async obterEvolucao({ data_inicial, data_final, agrupamento }) {
        const unidades = {
            dia: { truncamento: 'day', intervalo: '1 day' },
            mes: { truncamento: 'month', intervalo: '1 month' },
            ano: { truncamento: 'year', intervalo: '1 year' }
        };
        const unidade = unidades[agrupamento];

        const result = await pool.query(`
            WITH periodos AS (
                SELECT generate_series(
                    date_trunc($3, $1::date::timestamp),
                    date_trunc($3, $2::date::timestamp),
                    $4::interval
                ) AS periodo
            ),
            contagens AS (
                SELECT
                    date_trunc($3, criado_em AT TIME ZONE $5) AS periodo,
                    'avaliacoes'::TEXT AS dominio,
                    COUNT(*)::INTEGER AS quantidade
                  FROM avaliacoes
                 WHERE criado_em >= ($1::date::timestamp AT TIME ZONE $5)
                   AND criado_em < (($2::date + 1)::timestamp AT TIME ZONE $5)
                 GROUP BY 1

                UNION ALL

                SELECT
                    date_trunc($3, criado_em AT TIME ZONE $5) AS periodo,
                    'comentarios_associados'::TEXT AS dominio,
                    COUNT(*)::INTEGER AS quantidade
                  FROM avaliacoes
                 WHERE criado_em >= ($1::date::timestamp AT TIME ZONE $5)
                   AND criado_em < (($2::date + 1)::timestamp AT TIME ZONE $5)
                   AND comentario IS NOT NULL
                   AND BTRIM(comentario) <> ''
                 GROUP BY 1

                UNION ALL

                SELECT
                    date_trunc($3, criado_em AT TIME ZONE $5) AS periodo,
                    'comentarios_independentes'::TEXT AS dominio,
                    COUNT(*)::INTEGER AS quantidade
                  FROM comentarios
                 WHERE criado_em >= ($1::date::timestamp AT TIME ZONE $5)
                   AND criado_em < (($2::date + 1)::timestamp AT TIME ZONE $5)
                 GROUP BY 1
            )
            SELECT
                to_char(p.periodo, 'YYYY-MM-DD') AS periodo,
                COALESCE(MAX(c.quantidade) FILTER (
                    WHERE c.dominio = 'avaliacoes'
                ), 0)::INTEGER AS avaliacoes,
                COALESCE(MAX(c.quantidade) FILTER (
                    WHERE c.dominio = 'comentarios_associados'
                ), 0)::INTEGER AS comentarios_associados,
                COALESCE(MAX(c.quantidade) FILTER (
                    WHERE c.dominio = 'comentarios_independentes'
                ), 0)::INTEGER AS comentarios_independentes
              FROM periodos p
              LEFT JOIN contagens c
                ON c.periodo = p.periodo
             GROUP BY p.periodo
             ORDER BY p.periodo
        `, [
            data_inicial,
            data_final,
            unidade.truncamento,
            unidade.intervalo,
            FUSO_HORARIO
        ]);

        return result.rows;
    }
}

module.exports = AnaliseAvaliacoesComentarios;
