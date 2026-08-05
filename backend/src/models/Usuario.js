const pool = require('../db/connection');

const CAMPOS_PUBLICAS = `id, email, email_verificado_em, ultimo_login_em, ativo, criado_em, atualizado_em`;

const CAMPOS_RETORNO = `id, email, email_verificado_em, ultimo_login_em, ativo, criado_em, atualizado_em`;

const CAMPOS_PRIVADAS = `senha_hash`;

const TODOS_CAMPOS = ` ${CAMPOS_PUBLICAS}, ${CAMPOS_PRIVADAS}`;

class Usuario {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICAS} FROM usuarios
            WHERE ativo = TRUE
            ORDER BY criado_em DESC`);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(
            `
            SELECT ${CAMPOS_PUBLICAS}
              FROM usuarios
             WHERE id = $1
             AND ativo = TRUE`,
            [id]);

        return result.rows[0];
    }

    static async buscarPorEmail(email) {
        const result = await pool.query(
            `
            SELECT ${TODOS_CAMPOS}
            FROM usuarios
            WHERE LOWER(email) = LOWER($1)
            AND ativo = TRUE`,
           [email] );

        return result.rows[0];
    }

    static async buscarCredenciaisPorEmail(email) {

        const result = await pool.query(
        `
        SELECT
            ${TODOS_CAMPOS}
        FROM usuarios
        WHERE LOWER(email) = LOWER($1)
          AND ativo = TRUE `,
        [email] );

    return result.rows[0];
}

    static async criar(usuario, client = pool) {
        const {
            email,
            senha_hash
        } = usuario;

        const result = await client.query(
            `
            INSERT INTO usuarios (
                email,
                senha_hash
            )
            VALUES ($1, $2)
            RETURNING ${CAMPOS_RETORNO} `,
            [ email, senha_hash ] );

        return result.rows[0];
    }

    static async atualizar(id, usuario, client = pool) {
        const {
            email
        } = usuario;

        const result = await client.query(
            `
            UPDATE usuarios
               SET email = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING ${CAMPOS_RETORNO} `,
            [ email, id ] );

        return result.rows[0];
    }

    static async alterarSenha(id, novaSenhaHash, client = pool) {
        const result = await client.query(
            `
            UPDATE usuarios
               SET senha_hash = $1,
                   atualizado_em = NOW()
             WHERE id = $2
               AND ativo = TRUE
            RETURNING ${CAMPOS_RETORNO} `,
            [ novaSenhaHash,id] );

        return result.rows[0];
    }

    static async registrarLogin(id, client = pool) {
        const result = await client.query(
            `
            UPDATE usuarios
               SET ultimo_login_em = NOW(),
                   atualizado_em = NOW()
             WHERE id = $1
               AND ativo = TRUE
            RETURNING ${CAMPOS_RETORNO} `,
            [id] );

        return result.rows[0];
    }

    static async verificarEmail(id, client = pool) {
        const result = await client.query(
            `
            UPDATE usuarios
               SET email_verificado_em = NOW(),
                   atualizado_em = NOW()
             WHERE id = $1
               AND ativo = TRUE
            RETURNING ${CAMPOS_RETORNO} `,
            [id] );

        return result.rows[0];
    }

    static async desativar(id, client = pool) {
        const result = await client.query(
            `
            UPDATE usuarios
               SET ativo = FALSE,
                   atualizado_em = NOW()
             WHERE id = $1
               AND ativo = TRUE
            RETURNING ${CAMPOS_RETORNO} `,
            [id] );

        return result.rows[0];
    }

}

module.exports = Usuario;
