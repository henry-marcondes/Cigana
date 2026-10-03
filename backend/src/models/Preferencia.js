const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    grupo,
    codigo,
    nome,
    descricao,
    ordem_exibicao,
    ativo,
    criado_em,
    atualizado_em
`;

class Preferencia {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM preferencias
             WHERE ativo = TRUE
             ORDER BY grupo, ordem_exibicao, nome
        `);

        return result.rows;
    }

    static async listarPorGrupo(grupo) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM preferencias
             WHERE grupo = $1
               AND ativo = TRUE
             ORDER BY ordem_exibicao, nome
        `, [grupo]);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
            FROM preferencias
            WHERE id = $1
            AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }   

    static async buscarPorCodigo(grupo, codigo) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM preferencias
             WHERE grupo = $1
               AND codigo = $2
               AND ativo = TRUE
        `, [grupo, codigo]);

        return result.rows[0];
    }

    static async criar(preferencia, client = pool) {
        const {
            grupo,
            codigo,
            nome,
            descricao,
            ordem_exibicao
        } = preferencia;

        const result = await client.query(`
            INSERT INTO preferencias (
                grupo,
                codigo,
                nome,
                descricao,
                ordem_exibicao
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING ${CAMPOS_PUBLICOS}
        `, [
            grupo,
            codigo,
            nome,
            descricao,
            ordem_exibicao
        ]);

        return result.rows[0];
    }
}

module.exports = Preferencia;
