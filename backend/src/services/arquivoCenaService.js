function erro(message, statusCode) {
    const resultado = new Error(message);
    resultado.statusCode = statusCode;
    return resultado;
}

function traduzirErroArquivo(error) {
    if (error.code === '23505' && error.message?.includes('Arquivo gerenciado já foi utilizado')) {
        error.statusCode = 409;
        error.message = 'Este arquivo já foi utilizado e não pode ser associado novamente.';
    }
    return error;
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

async function validarArquivoDaObra(arquivo_id, livro_id, client) {
    const result = await client.query(`
        SELECT id FROM arquivos_midia
         WHERE id = $1 AND livro_id = $2 AND ativo = TRUE
         FOR UPDATE
    `, [arquivo_id, livro_id]);
    if (!result.rowCount) {
        const existe = await client.query(
            'SELECT id, ativo FROM arquivos_midia WHERE id = $1', [arquivo_id]
        );
        if (!existe.rowCount || !existe.rows[0].ativo) {
            throw erro('Arquivo gerenciado não encontrado ou inativo.', 404);
        }
        throw erro('O arquivo gerenciado não pertence a esta obra.', 400);
    }
}

async function resolverLivroDoConteudo({ cena_id, livro_id }, client) {
    if (!cena_id && livro_id) return livro_id;
    if (!cena_id) throw erro('livro_id é obrigatório quando cena_id não é informado.', 400);
    const result = await client.query(`
        SELECT cap.livro_id
          FROM cenas c JOIN capitulos cap ON cap.id = c.capitulo_id
         WHERE c.id = $1 AND c.ativo = TRUE AND cap.ativo = TRUE
    `, [cena_id]);
    const livroDaCena = result.rows[0]?.livro_id;
    if (!livroDaCena) throw erro('Cena não encontrada.', 404);
    if (livro_id && livro_id !== livroDaCena) {
        throw erro('A cena informada não pertence à obra indicada.', 400);
    }
    return livroDaCena;
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
        throw traduzirErroArquivo(error);
    } finally {
        client.release();
    }
}

async function executarComArquivoDaObraValidado(pool, arquivo_id, livro_id, operacao) {
    if (!arquivo_id) return operacao(null);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await validarArquivoDaObra(arquivo_id, livro_id, client);
        const resultado = await operacao(client);
        await client.query('COMMIT');
        return resultado;
    } catch (error) {
        await client.query('ROLLBACK');
        throw traduzirErroArquivo(error);
    } finally {
        client.release();
    }
}

module.exports = {
    validarArquivoDaCena,
    executarComArquivoValidado,
    executarComArquivoDaObraValidado,
    resolverLivroDoConteudo
};
