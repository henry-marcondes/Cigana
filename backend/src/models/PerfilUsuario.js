const pool = require('../db/connection');

const CAMPOS_PUBLICOS = `
    id,
    usuario_id,
    nome,
    sobrenome,
    nome_usuario,
    avatar_url,
    biografia,
    idioma_id,
    ativo,
    criado_em,
    atualizado_em
`;

class PerfilUsuario {

    static async listar() {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM perfis_usuario
             WHERE ativo = TRUE
             ORDER BY criado_em DESC
        `);

        return result.rows;
    }

    static async buscarPorId(id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM perfis_usuario
             WHERE id = $1
               AND ativo = TRUE
        `, [id]);

        return result.rows[0];
    }

    static async buscarPorUsuarioId(usuario_id) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM perfis_usuario
             WHERE usuario_id = $1
               AND ativo = TRUE
        `, [usuario_id]);

        return result.rows[0];
    }

    static async buscarPorNomeUsuario(nome_usuario) {
        const result = await pool.query(`
            SELECT ${CAMPOS_PUBLICOS}
              FROM perfis_usuario
             WHERE LOWER(nome_usuario) = LOWER($1)
               AND ativo = TRUE
        `, [nome_usuario]);

        return result.rows[0];
    }

    static async criar(perfil, client = pool) {

        const {
            usuario_id,
            nome,
            sobrenome,
            nome_usuario,
            avatar_url,
            biografia,
            idioma_id
        } = perfil;

        const result = await client.query(
            `
            INSERT INTO perfis_usuario (
            usuario_id,
            nome,
            sobrenome,
            nome_usuario,
            avatar_url,
            biografia,
            idioma_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
            ${CAMPOS_PUBLICOS}
            `,
        [
            usuario_id,
            nome,
            sobrenome,
            nome_usuario,
            avatar_url,
            biografia,
            idioma_id
        ]
    );

    return result.rows[0];
  }

    static async alterarDadosPessoais(id, perfil, client = pool) {

        const {
            nome,
            sobrenome
        } = perfil;

        const result = await client.query(
            `
            UPDATE perfis_usuario
           SET nome = $1,
               sobrenome = $2,
               atualizado_em = NOW()
            WHERE id = $3
            AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS} `,
        [nome, sobrenome, id]
    );

    return result.rows[0];
  }

    static async alterarNomeUsuario(id, nome_usuario, client = pool) {

        const result = await client.query(
            `
            UPDATE perfis_usuario
            SET nome_usuario = $1,
               atualizado_em = NOW()
            WHERE id = $2
            AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS} `,
        [nome_usuario, id] );

    return result.rows[0];
  }

    static async alterarAvatar(id, avatar_url, client = pool) {

        const result = await client.query(
            `
            UPDATE perfis_usuario
            SET avatar_url = $1,
               atualizado_em = NOW()
            WHERE id = $2
            AND ativo = TRUE
            RETURNING ${CAMPOS_PUBLICOS} `,
        [avatar_url, id]
     );

    return result.rows[0];
  }

    static async alterarBiografia(id, biografia, client = pool) {

    const result = await client.query(
        `
        UPDATE perfis_usuario
           SET biografia = $1,
               atualizado_em = NOW()
         WHERE id = $2
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
        `,
        [biografia, id]
    );

    return result.rows[0];
  }

    static async alterarIdioma(id, idioma_id, client = pool) {

    const result = await client.query(
        `
        UPDATE perfis_usuario
           SET idioma_id = $1,
               atualizado_em = NOW()
         WHERE id = $2
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
        `,
        [idioma_id, id]
    );

    return result.rows[0];
  }

    static async desativar(id, client = pool) {

    const result = await client.query(
        `
        UPDATE perfis_usuario
           SET ativo = FALSE,
               atualizado_em = NOW()
         WHERE id = $1
           AND ativo = TRUE
        RETURNING
            ${CAMPOS_PUBLICOS}
        `,
        [id]
    );

    return result.rows[0];
  }

}

module.exports = PerfilUsuario;
