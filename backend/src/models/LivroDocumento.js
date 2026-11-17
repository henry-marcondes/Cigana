const pool = require('../db/connection');

class LivroDocumento {
    static async listarPorLivro(livro_id, client = pool) {
        const result = await client.query(`
            SELECT ld.id, ld.livro_id, ld.arquivo_id, ld.papel, ld.ativo,
                   ld.criado_em, ld.atualizado_em, a.nome_original,
                   a.mime_type, a.tamanho_bytes, a.hash_sha256
              FROM livro_documentos ld
              JOIN arquivos_midia a ON a.id = ld.arquivo_id
             WHERE ld.livro_id = $1 AND ld.ativo = TRUE AND a.ativo = TRUE
             ORDER BY CASE ld.papel WHEN 'PRINCIPAL' THEN 0 ELSE 1 END, ld.criado_em
        `, [livro_id]);
        return result.rows;
    }

    static async buscar(livro_id, arquivo_id, client = pool, bloquear = false) {
        const result = await client.query(`
            SELECT ld.id, ld.livro_id, ld.arquivo_id, ld.papel, ld.ativo,
                   a.nome_original, a.mime_type, a.tamanho_bytes, a.hash_sha256,
                   a.chave_armazenamento, a.ativo AS arquivo_ativo
              FROM livro_documentos ld
              JOIN arquivos_midia a ON a.id = ld.arquivo_id
             WHERE ld.livro_id = $1 AND ld.arquivo_id = $2
             ${bloquear ? 'FOR UPDATE OF ld, a' : ''}
        `, [livro_id, arquivo_id]);
        return result.rows[0];
    }

    static async buscarPrincipal(livro_id, client = pool) {
        const result = await client.query(`
            SELECT ld.id, ld.livro_id, ld.arquivo_id, ld.papel,
                   a.nome_original, a.mime_type, a.tamanho_bytes, a.hash_sha256
              FROM livro_documentos ld JOIN arquivos_midia a ON a.id = ld.arquivo_id
             WHERE ld.livro_id = $1 AND ld.papel = 'PRINCIPAL'
               AND ld.ativo = TRUE AND a.ativo = TRUE
        `, [livro_id]);
        return result.rows[0];
    }

    static async criar({ livro_id, arquivo_id, papel }, client = pool) {
        const result = await client.query(`
            INSERT INTO livro_documentos (livro_id, arquivo_id, papel)
            VALUES ($1, $2, $3)
            RETURNING id, livro_id, arquivo_id, papel, ativo, criado_em, atualizado_em
        `, [livro_id, arquivo_id, papel]);
        return result.rows[0];
    }

    static async promover(livro_id, arquivo_id, client) {
        await client.query(`UPDATE livro_documentos SET papel = 'SECUNDARIO', atualizado_em = NOW()
            WHERE livro_id = $1 AND papel = 'PRINCIPAL' AND ativo = TRUE`, [livro_id]);
        const result = await client.query(`UPDATE livro_documentos SET papel = 'PRINCIPAL', atualizado_em = NOW()
            WHERE livro_id = $1 AND arquivo_id = $2 AND ativo = TRUE
            RETURNING id, livro_id, arquivo_id, papel, ativo, atualizado_em`, [livro_id, arquivo_id]);
        return result.rows[0];
    }

    static async desativar(livro_id, arquivo_id, client) {
        const result = await client.query(`UPDATE livro_documentos SET ativo = FALSE, atualizado_em = NOW()
            WHERE livro_id = $1 AND arquivo_id = $2 AND ativo = TRUE
            RETURNING id, livro_id, arquivo_id, papel, ativo`, [livro_id, arquivo_id]);
        return result.rows[0];
    }
}

module.exports = LivroDocumento;
