function erro(message, statusCode) {
    const resultado = new Error(message);
    resultado.statusCode = statusCode;
    return resultado;
}

async function validarArquivoDaCena(arquivo_id, cena_id, client) {
    const result = await client.query(`
        SELECT a.id
          FROM arquivos_midia a
          JOIN cenas c ON c.id = $2
          JOIN capitulos cap ON cap.id = c.capitulo_id
         WHERE a.id = $1
           AND a.livro_id = cap.livro_id
           AND a.ativo = TRUE
         FOR UPDATE OF a
    `, [arquivo_id, cena_id]);

    if (!result.rowCount) {
        const existe = await client.query(
            'SELECT id, ativo FROM arquivos_midia WHERE id = $1',
            [arquivo_id]
        );
        if (!existe.rowCount || !existe.rows[0].ativo) {
            throw erro('Arquivo gerenciado não encontrado ou inativo.', 404);
        }
        throw erro('O arquivo gerenciado não pertence à obra desta cena.', 400);
    }
}

async function executarComArquivoValidado(pool, arquivo_id, cena_id, operacao) {
    if (!arquivo_id) return operacao(null);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await validarArquivoDaCena(arquivo_id, cena_id, client);
        const resultado = await operacao(client);
        await client.query('COMMIT');
        return resultado;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { validarArquivoDaCena, executarComArquivoValidado };
