const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    usuario_id,
    nome_publico,
    biografia,
    foto_url,
    titulo_provisorio,
    resumo,
    categoria_id,
    classificacao_indicativa_id,
    idioma_id,
    status,
    avaliado_por,
    avaliado_em,
    motivo_recusa,
    criado_em,
    atualizado_em
`;

class SolicitacaoAutor {

    static async criar(dados) {
        const {
            usuario_id,
            nome_publico,
            biografia,
            foto_url,
            titulo_provisorio,
            resumo,
            categoria_id,
            classificacao_indicativa_id,
            idioma_id
        } = dados;

        const query = `
            INSERT INTO solicitacoes_autor (
                usuario_id,
                nome_publico,
                biografia,
                foto_url,
                titulo_provisorio,
                resumo,
                categoria_id,
                classificacao_indicativa_id,
                idioma_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING ${CAMPOS_PUBLICOS}
        `;

        const values = [
            usuario_id,
            nome_publico,
            biografia ?? null,
            foto_url ?? null,
            titulo_provisorio,
            resumo ?? null,
            categoria_id,
            classificacao_indicativa_id,
            idioma_id
        ];

        const result = await pool.query(query, values);

        return result.rows[0];
    }

    static async buscarPorId(id) {
        const query = `
            SELECT ${CAMPOS_PUBLICOS}
            FROM solicitacoes_autor
            WHERE id = $1
        `;

        const result = await pool.query(query, [id]);

        return result.rows[0] || null;
    }

    static async listarPorUsuario(usuario_id) {
        const query = `
            SELECT ${CAMPOS_PUBLICOS}
            FROM solicitacoes_autor
            WHERE usuario_id = $1
            ORDER BY criado_em DESC
        `;

        const result = await pool.query(query, [usuario_id]);

        return result.rows;
    }

    static async buscarPendentePorUsuario(usuario_id) {
        const query = `
            SELECT ${CAMPOS_PUBLICOS}
            FROM solicitacoes_autor
            WHERE usuario_id = $1
              AND status = 'PENDENTE'
            LIMIT 1
        `;

        const result = await pool.query(query, [usuario_id]);

        return result.rows[0] || null;
    }

    static async listarPendentes() {
        const query = `
            SELECT ${CAMPOS_PUBLICOS}
            FROM solicitacoes_autor
            WHERE status = 'PENDENTE'
            ORDER BY criado_em ASC
        `;

        const result = await pool.query(query);

        return result.rows;
    }

    static async listarPorStatus(status) {
        const query = `
            SELECT ${CAMPOS_PUBLICOS}
            FROM solicitacoes_autor
            WHERE status = $1
            ORDER BY criado_em DESC
        `;

        const result = await pool.query(query, [status]);

        return result.rows;
    }

    static async listarTodas() {
        const query = `
            SELECT ${CAMPOS_PUBLICOS}
            FROM solicitacoes_autor
            ORDER BY criado_em DESC
        `;

        const result = await pool.query(query);

        return result.rows;
    }

    static async aprovar(id, avaliado_por) {
        const query = `
            UPDATE solicitacoes_autor
            SET
                status = 'APROVADA',
                avaliado_por = $2,
                avaliado_em = NOW(),
                motivo_recusa = NULL,
                atualizado_em = NOW()
            WHERE id = $1
              AND status = 'PENDENTE'
            RETURNING ${CAMPOS_PUBLICOS}
        `;

        const result = await pool.query(query, [id, avaliado_por]);

        return result.rows[0] || null;
    }

    static async recusar(id, avaliado_por, motivo_recusa) {
        const query = `
            UPDATE solicitacoes_autor
            SET
                status = 'RECUSADA',
                avaliado_por = $2,
                avaliado_em = NOW(),
                motivo_recusa = $3,
                atualizado_em = NOW()
            WHERE id = $1
              AND status = 'PENDENTE'
            RETURNING ${CAMPOS_PUBLICOS}
        `;

        const result = await pool.query(
            query,
            [id, avaliado_por, motivo_recusa]
        );

        return result.rows[0] || null;
    }
}

module.exports = SolicitacaoAutor;
