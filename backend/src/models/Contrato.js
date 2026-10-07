const pool = require('../db/connection');

const CAMPOS = `
    id,
    tipo,
    codigo,
    nome,
    descricao,
    ativo,
    criado_em,
    atualizado_em
`;

class Contrato {

    static async listar({ ativo = null, tipo = null } = {}) {
        const filtros = [];
        const valores = [];

        if (ativo !== null) {
            valores.push(ativo);
            filtros.push(`ativo = $${valores.length}`);
        }

        if (tipo !== null) {
            valores.push(tipo);
            filtros.push(`tipo = $${valores.length}`);
        }

        const where = filtros.length
            ? `WHERE ${filtros.join(' AND ')}`
            : '';

        const result = await pool.query(`
            SELECT ${CAMPOS}
            FROM contratos
            ${where}
            ORDER BY nome
        `, valores);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS}
            FROM contratos
            WHERE id = $1
        `, [id]);

        return result.rows[0] || null;
    }

    static async buscarPorCodigo(codigo) {
        const result = await pool.query(`
            SELECT ${CAMPOS}
            FROM contratos
            WHERE codigo = $1
        `, [codigo]);

        return result.rows[0] || null;
    }

    static async criar(dados, client = pool) {
        const result = await client.query(`
            INSERT INTO contratos (
                tipo,
                codigo,
                nome,
                descricao
            )
            VALUES ($1, $2, $3, $4)
            RETURNING ${CAMPOS}
        `, [
            dados.tipo,
            dados.codigo,
            dados.nome,
            dados.descricao || null
        ]);

        return result.rows[0];
    }

    static async atualizar(id, dados, client = pool) {
        const result = await client.query(`
            UPDATE contratos
            SET
                tipo = $1,
                codigo = $2,
                nome = $3,
                descricao = $4,
                atualizado_em = NOW()
            WHERE id = $5
            RETURNING ${CAMPOS}
        `, [
            dados.tipo,
            dados.codigo,
            dados.nome,
            dados.descricao || null,
            id
        ]);

        return result.rows[0] || null;
    }

    static async ativar(id, client = pool) {
        const result = await client.query(`
            UPDATE contratos
            SET
                ativo = TRUE,
                atualizado_em = NOW()
            WHERE id = $1
            RETURNING ${CAMPOS}
        `, [id]);

        return result.rows[0] || null;
    }

    static async desativar(id, client = pool) {
        const result = await client.query(`
            UPDATE contratos
            SET
                ativo = FALSE,
                atualizado_em = NOW()
            WHERE id = $1
            RETURNING ${CAMPOS}
        `, [id]);

        return result.rows[0] || null;
    }
}

module.exports = Contrato;
