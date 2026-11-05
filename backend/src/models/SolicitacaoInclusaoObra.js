const pool = require('../db/connection');

const CAMPOS = `
    id, autor_id, titulo, slug, resumo, categoria_id,
    classificacao_indicativa_id, idioma_id, status, avaliado_por,
    avaliado_em, motivo_rejeicao, livro_id, criado_em, atualizado_em
`;

class SolicitacaoInclusaoObra {
    static async criar(dados, client = pool) {
        const result = await client.query(`
            INSERT INTO solicitacoes_inclusao_obras (
                autor_id, titulo, slug, resumo, categoria_id,
                classificacao_indicativa_id, idioma_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING ${CAMPOS}
        `, [dados.autor_id, dados.titulo, dados.slug, dados.resumo,
            dados.categoria_id, dados.classificacao_indicativa_id, dados.idioma_id]);
        return result.rows[0];
    }

    static async listarPorAutor(autor_id) {
        const result = await pool.query(`
            SELECT s.*,
                   c.nome AS categoria_nome,
                   ci.nome AS classificacao_indicativa_nome,
                   i.nome AS idioma_nome,
                   COALESCE((
                       SELECT json_agg(h ORDER BY h.criado_em, h.id)
                         FROM historico_solicitacoes_inclusao_obras h
                        WHERE h.solicitacao_id = s.id
                   ), '[]'::JSON) AS historico
              FROM solicitacoes_inclusao_obras s
              JOIN categorias c ON c.id = s.categoria_id
              JOIN classificacoes_indicativas ci ON ci.id = s.classificacao_indicativa_id
              JOIN idiomas i ON i.id = s.idioma_id
             WHERE s.autor_id = $1 ORDER BY s.criado_em DESC
        `, [autor_id]);
        return result.rows;
    }

    static async buscarPorId(id, client = pool) {
        const result = await client.query(`
            SELECT s.*, a.usuario_id, a.nome_publico,
                   c.nome AS categoria_nome,
                   ci.nome AS classificacao_indicativa_nome,
                   i.nome AS idioma_nome
              FROM solicitacoes_inclusao_obras s
              JOIN autores a ON a.id = s.autor_id
              JOIN categorias c ON c.id = s.categoria_id
              JOIN classificacoes_indicativas ci ON ci.id = s.classificacao_indicativa_id
              JOIN idiomas i ON i.id = s.idioma_id
             WHERE s.id = $1
        `, [id]);
        return result.rows[0] || null;
    }

    static async buscarParaConsumo(id, usuario_id, client) {
        const result = await client.query(`
            SELECT s.*, a.usuario_id
              FROM solicitacoes_inclusao_obras s
              JOIN autores a ON a.id = s.autor_id
             WHERE s.id = $1 AND a.usuario_id = $2 AND a.ativo = TRUE
             FOR UPDATE OF s
        `, [id, usuario_id]);
        return result.rows[0] || null;
    }

    static async buscarDoAutorParaAtualizacao(id, usuario_id, client) {
        const result = await client.query(`
            SELECT s.*, a.usuario_id
              FROM solicitacoes_inclusao_obras s
              JOIN autores a ON a.id = s.autor_id
             WHERE s.id = $1 AND a.usuario_id = $2 AND a.ativo = TRUE
             FOR UPDATE OF s
        `, [id, usuario_id]);
        return result.rows[0] || null;
    }

    static async buscarParaAvaliacao(id, client) {
        const result = await client.query(`
            SELECT * FROM solicitacoes_inclusao_obras
             WHERE id = $1 FOR UPDATE
        `, [id]);
        return result.rows[0] || null;
    }

    static async listar(status = null) {
        const result = await pool.query(`
            SELECT s.*, a.usuario_id, a.nome_publico,
                   c.nome AS categoria_nome,
                   ci.nome AS classificacao_indicativa_nome,
                   i.nome AS idioma_nome
              FROM solicitacoes_inclusao_obras s
              JOIN autores a ON a.id = s.autor_id
              JOIN categorias c ON c.id = s.categoria_id
              JOIN classificacoes_indicativas ci ON ci.id = s.classificacao_indicativa_id
              JOIN idiomas i ON i.id = s.idioma_id
             WHERE ($1::VARCHAR IS NULL OR s.status = $1)
             ORDER BY s.criado_em DESC
        `, [status]);
        return result.rows;
    }

    static async atualizarProposta(id, dados, client = pool) {
        const result = await client.query(`
            UPDATE solicitacoes_inclusao_obras
               SET titulo = $1, slug = $2, resumo = $3, categoria_id = $4,
                   classificacao_indicativa_id = $5, idioma_id = $6,
                   atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $7 AND status = 'RECUSADA'
             RETURNING ${CAMPOS}
        `, [dados.titulo, dados.slug, dados.resumo, dados.categoria_id,
            dados.classificacao_indicativa_id, dados.idioma_id, id]);
        return result.rows[0] || null;
    }

    static async atualizarPropostaAprovadaComConflito(id, dados, client) {
        const result = await client.query(`
            UPDATE solicitacoes_inclusao_obras
               SET titulo = $1, slug = $2, resumo = $3, categoria_id = $4,
                   classificacao_indicativa_id = $5, idioma_id = $6,
                   status = 'PENDENTE', avaliado_por = NULL, avaliado_em = NULL,
                   motivo_rejeicao = NULL, atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $7 AND status = 'APROVADA' AND livro_id IS NULL
             RETURNING ${CAMPOS}
        `, [dados.titulo, dados.slug, dados.resumo, dados.categoria_id,
            dados.classificacao_indicativa_id, dados.idioma_id, id]);
        return result.rows[0] || null;
    }

    static async reenviar(id, client = pool) {
        const result = await client.query(`
            UPDATE solicitacoes_inclusao_obras
               SET status = 'PENDENTE', avaliado_por = NULL, avaliado_em = NULL,
                   motivo_rejeicao = NULL, atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $1 AND status = 'RECUSADA'
             RETURNING ${CAMPOS}
        `, [id]);
        return result.rows[0] || null;
    }

    static async avaliar(id, status, avaliador_id, motivo = null, client = pool) {
        const result = await client.query(`
            UPDATE solicitacoes_inclusao_obras
               SET status = $1, avaliado_por = $2, avaliado_em = CURRENT_TIMESTAMP,
                   motivo_rejeicao = $3, atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $4 AND status = 'PENDENTE'
             RETURNING ${CAMPOS}
        `, [status, avaliador_id, motivo, id]);
        return result.rows[0] || null;
    }

    static async marcarUtilizada(id, livro_id, client) {
        const result = await client.query(`
            UPDATE solicitacoes_inclusao_obras
               SET status = 'UTILIZADA', livro_id = $1,
                   atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $2 AND status = 'APROVADA' AND livro_id IS NULL
             RETURNING ${CAMPOS}
        `, [livro_id, id]);
        return result.rows[0] || null;
    }

    static async adicionarHistorico(id, evento, dados, usuario_id, motivo = null, client = pool) {
        const result = await client.query(`
            INSERT INTO historico_solicitacoes_inclusao_obras
                (solicitacao_id, evento, dados_proposta, realizado_por, motivo)
            VALUES ($1, $2, $3::JSONB, $4, $5)
            RETURNING id, solicitacao_id, evento, dados_proposta,
                      realizado_por, motivo, criado_em
        `, [id, evento, JSON.stringify(dados), usuario_id, motivo]);
        return result.rows[0];
    }

    static async listarHistorico(id) {
        const result = await pool.query(`
            SELECT id, solicitacao_id, evento, dados_proposta,
                   realizado_por, motivo, criado_em
              FROM historico_solicitacoes_inclusao_obras
             WHERE solicitacao_id = $1 ORDER BY criado_em, id
        `, [id]);
        return result.rows;
    }
}

module.exports = SolicitacaoInclusaoObra;
