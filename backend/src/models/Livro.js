const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    categoria_id,
    classificacao_indicativa_id,
    idioma_id,
    status_livro_id,
    visibilidade_livro_id,
    titulo,
    slug,
    resumo,
    capa_url,
    isbn,
    ano_publicacao,
    data_publicacao,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

const CAMPOS_PUBLICOS_QUALIFICADOS = `
    l.id,
    l.categoria_id,
    l.classificacao_indicativa_id,
    l.idioma_id,
    l.status_livro_id,
    l.visibilidade_livro_id,
    l.titulo,
    l.slug,
    l.resumo,
    l.capa_url,
    l.isbn,
    l.ano_publicacao,
    l.data_publicacao,
    l.ordem_exibicao,
    l.ativo,
    l.criado_em,
    l.atualizado_em
`;

class Livro {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS_QUALIFICADOS}
              FROM livros l
              INNER JOIN status_livro s
                ON s.id = l.status_livro_id
               AND s.ativo = TRUE
              INNER JOIN visibilidade_livro v
                ON v.id = l.visibilidade_livro_id
               AND v.ativo = TRUE
             WHERE l.ativo = TRUE
               AND s.slug = 'publicado'
               AND v.slug = 'publica'
             ORDER BY l.ordem_exibicao, l.titulo
        `);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM livros
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorSlug(slug) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS_QUALIFICADOS}
              FROM livros l
              INNER JOIN status_livro s
                ON s.id = l.status_livro_id
               AND s.ativo = TRUE
              INNER JOIN visibilidade_livro v
                ON v.id = l.visibilidade_livro_id
               AND v.ativo = TRUE
             WHERE LOWER(l.slug) = LOWER($1)
               AND l.ativo = TRUE
               AND s.slug = 'publicado'
               AND v.slug = 'publica'
        `, [slug]);

        return result.rows[0];
    }

    static async estaDisponivelPublicamente(id) {
        const result = await pool.query(`
            SELECT 1
              FROM livros l
              INNER JOIN status_livro s
                ON s.id = l.status_livro_id
               AND s.ativo = TRUE
              INNER JOIN visibilidade_livro v
                ON v.id = l.visibilidade_livro_id
               AND v.ativo = TRUE
             WHERE l.id = $1
               AND l.ativo = TRUE
               AND s.slug = 'publicado'
               AND v.slug = 'publica'
             LIMIT 1
        `, [id]);

        return result.rowCount > 0;
    }

    static async listarAguardandoDecisaoEditorial() {
        const result = await pool.query(`
            SELECT
                ${CAMPOS_PUBLICOS_QUALIFICADOS},
                de.decisao AS decisao_editorial,
                de.motivo_rejeicao,
                de.decidido_em AS decisao_editorial_em
              FROM livros l
              INNER JOIN status_livro s
                ON s.id = l.status_livro_id
               AND s.ativo = TRUE
              LEFT JOIN decisoes_editoriais de
                ON de.livro_id = l.id
             WHERE l.ativo = TRUE
               AND s.slug = 'em-revisao'
             ORDER BY l.atualizado_em DESC, l.titulo
        `);

        return result.rows;
    }

    static async buscarDecisaoEditorial(id, client = pool) {
        const result = await client.query(`
            SELECT
                id,
                livro_id,
                decisao,
                decidido_por,
                motivo_rejeicao,
                decidido_em
              FROM decisoes_editoriais
             WHERE livro_id = $1
        `, [id]);

        return result.rows[0] || null;
    }

    static async registrarDecisaoEditorial(
        id,
        decisao,
        decidido_por,
        motivo_rejeicao = null
    ) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const livro = await client.query(`
                SELECT l.id, l.ativo, s.slug AS status_slug, s.ativo AS status_ativo
                  FROM livros l
                  INNER JOIN status_livro s
                    ON s.id = l.status_livro_id
                 WHERE l.id = $1
                 FOR UPDATE OF l
            `, [id]);

            if (livro.rowCount === 0) {
                const erro = new Error('Obra não encontrada.');
                erro.statusCode = 404;
                throw erro;
            }

            if (!livro.rows[0].ativo) {
                const erro = new Error(
                    'Obras inativas não podem receber decisão editorial.'
                );
                erro.statusCode = 409;
                throw erro;
            }

            if (
                !livro.rows[0].status_ativo ||
                livro.rows[0].status_slug !== 'em-revisao'
            ) {
                const erro = new Error(
                    'Somente obras em revisão podem receber decisão editorial.'
                );
                erro.statusCode = 409;
                throw erro;
            }

            const decisaoExistente = await this.buscarDecisaoEditorial(
                id,
                client
            );
            if (decisaoExistente) {
                const erro = new Error(
                    `Esta obra já recebeu a decisão editorial "${decisaoExistente.decisao}".`
                );
                erro.statusCode = 409;
                throw erro;
            }

            const result = await client.query(`
                INSERT INTO decisoes_editoriais (
                    livro_id,
                    decisao,
                    decidido_por,
                    motivo_rejeicao
                )
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    livro_id,
                    decisao,
                    decidido_por,
                    motivo_rejeicao,
                    decidido_em
            `, [
                id,
                decisao,
                decidido_por,
                decisao === 'REJEITADA' ? motivo_rejeicao : null
            ]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async criar(livro, client = pool) {

        const {
            categoria_id,
            classificacao_indicativa_id,
            idioma_id,
            status_livro_id,
            visibilidade_livro_id,
            titulo,
            slug,
            resumo,
            capa_url,
            isbn,
            ano_publicacao,
            data_publicacao,
            ordem_exibicao
        } = livro;

        const result = await client.query(`
            INSERT INTO livros (
                categoria_id,
                classificacao_indicativa_id,
                idioma_id,
                status_livro_id,
                visibilidade_livro_id,
                titulo,
                slug,
                resumo,
                capa_url,
                isbn,
                ano_publicacao,
                data_publicacao,
                ordem_exibicao
            )
            VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,$8,$9,
                $10,$11,$12,$13
            )
            RETURNING
                ${CAMPOS_PUBLICOS}
        `, [
            categoria_id,
            classificacao_indicativa_id,
            idioma_id,
            status_livro_id,
            visibilidade_livro_id,
            titulo,
            slug,
            resumo,
            capa_url,
            isbn,
            ano_publicacao,
            data_publicacao,
            ordem_exibicao
        ]);

        return result.rows[0];
    }

    static async alterarInformacoes(id, livro, client = pool) {

    const {
        titulo,
        slug,
        resumo,
        isbn,
        ano_publicacao,
        data_publicacao,
        ordem_exibicao
    } = livro;

    const result = await client.query(`
        UPDATE livros
           SET titulo = $1,
               slug = $2,
               resumo = $3,
               isbn = $4,
               ano_publicacao = $5,
               data_publicacao = $6,
               ordem_exibicao = $7,
               atualizado_em = NOW()
         WHERE id = $8
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
    `, [
        titulo,
        slug,
        resumo,
        isbn,
        ano_publicacao,
        data_publicacao,
        ordem_exibicao,
        id
    ]);

    return result.rows[0];
}

static async alterarStatus(id, status_livro_id, client = pool) {

    const result = await client.query(`
        UPDATE livros
           SET status_livro_id = $1,
               atualizado_em = NOW()
         WHERE id = $2
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
    `, [status_livro_id, id]);

    return result.rows[0];
}

static async enviarParaRevisao(id) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const livro = await client.query(`
            SELECT
                l.id,
                l.ativo,
                s.slug AS status_slug,
                s.ativo AS status_ativo,
                v.slug AS visibilidade_slug,
                v.ativo AS visibilidade_ativa
              FROM livros l
              LEFT JOIN status_livro s
                ON s.id = l.status_livro_id
              LEFT JOIN visibilidade_livro v
                ON v.id = l.visibilidade_livro_id
             WHERE l.id = $1
             FOR UPDATE OF l
        `, [id]);

        if (livro.rowCount === 0) {
            const erro = new Error('Obra não encontrada.');
            erro.statusCode = 404;
            throw erro;
        }

        const atual = livro.rows[0];
        if (!atual.ativo) {
            const erro = new Error('Obras inativas não podem ser enviadas para revisão.');
            erro.statusCode = 409;
            throw erro;
        }

        if (!atual.status_ativo || !atual.visibilidade_ativa) {
            const erro = new Error(
                'A obra possui status ou visibilidade inativo.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        const decisaoEditorial = await this.buscarDecisaoEditorial(id, client);
        const primeiraSubmissao =
            atual.status_slug === 'em-elaboracao' &&
            atual.visibilidade_slug === 'rascunho' &&
            !decisaoEditorial;
        const reenvioRejeitado =
            atual.status_slug === 'em-revisao' &&
            atual.visibilidade_slug === 'rascunho' &&
            decisaoEditorial?.decisao === 'REJEITADA';

        if (!primeiraSubmissao && !reenvioRejeitado) {
            const erro = new Error(
                'A obra deve estar em elaboração e sem decisão editorial, ou em revisão com decisão rejeitada, sempre com visibilidade rascunho.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        if (reenvioRejeitado) {
            // A ausência de decisão editorial representa uma nova submissão pendente.
            await client.query(`
                DELETE FROM decisoes_editoriais
                 WHERE livro_id = $1
                   AND decisao = 'REJEITADA'
            `, [id]);

            const result = await client.query(`
                SELECT ${CAMPOS_PUBLICOS}
                  FROM livros
                 WHERE id = $1
            `, [id]);

            await client.query('COMMIT');
            return result.rows[0];
        }

        const statusRevisao = await client.query(`
            SELECT id
              FROM status_livro
             WHERE slug = 'em-revisao'
               AND ativo = TRUE
             LIMIT 1
        `);

        if (statusRevisao.rowCount === 0) {
            const erro = new Error('Status "Em revisão" não está cadastrado ou ativo.');
            erro.statusCode = 500;
            throw erro;
        }

        const result = await client.query(`
            UPDATE livros
               SET status_livro_id = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [statusRevisao.rows[0].id, id]);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

static async alterarVisibilidade(id, visibilidade_livro_id, client = pool) {

    const result = await client.query(`
        UPDATE livros
           SET visibilidade_livro_id = $1,
               atualizado_em = NOW()
         WHERE id = $2
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
    `, [visibilidade_livro_id, id]);

    return result.rows[0];
}

static async publicarAtomico(id) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const livroAtivo = await client.query(`
            SELECT
                l.id,
                s.slug AS status_slug,
                de.decisao AS decisao_editorial
              FROM livros l
              INNER JOIN status_livro s
                ON s.id = l.status_livro_id
               AND s.ativo = TRUE
              LEFT JOIN decisoes_editoriais de
                ON de.livro_id = l.id
             WHERE l.id = $1
               AND l.ativo = TRUE
             FOR UPDATE OF l
        `, [id]);

        if (livroAtivo.rowCount === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        if (
            livroAtivo.rows[0].status_slug !== 'em-revisao' ||
            livroAtivo.rows[0].decisao_editorial !== 'APROVADA'
        ) {
            const erro = new Error(
                'Apenas obras aprovadas editorialmente e ainda em revisão podem ser publicadas.'
            );
            erro.statusCode = 409;
            throw erro;
        }

        const statusPublicado = await client.query(`
            SELECT id
              FROM status_livro
             WHERE slug = 'publicado'
               AND ativo = TRUE
             LIMIT 1
        `);
        const visibilidadePublica = await client.query(`
            SELECT id
              FROM visibilidade_livro
             WHERE slug = 'publica'
               AND ativo = TRUE
             LIMIT 1
        `);

        if (
            statusPublicado.rowCount === 0 ||
            visibilidadePublica.rowCount === 0
        ) {
            const erro = new Error(
                'Status "Publicado" ou visibilidade "Pública" não está cadastrado ou ativo.'
            );
            erro.statusCode = 500;
            throw erro;
        }

        const result = await client.query(`
            UPDATE livros
               SET status_livro_id = $1,
                   visibilidade_livro_id = $2,
                   atualizado_em = NOW()
             WHERE id = $3
               AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS}
        `, [
            statusPublicado.rows[0].id,
            visibilidadePublica.rows[0].id,
            id
        ]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

static async alterarCapa(id, capa_url, client = pool) {

    const result = await client.query(`
        UPDATE livros
           SET capa_url = $1,
               atualizado_em = NOW()
         WHERE id = $2
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
    `, [capa_url, id]);

    return result.rows[0];
}

static async desativar(id, client = pool) {

    const result = await client.query(`
        UPDATE livros
           SET ativo = FALSE,
               atualizado_em = NOW()
         WHERE id = $1
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
    `, [id]);

    return result.rows[0];
}

}

module.exports = Livro;
