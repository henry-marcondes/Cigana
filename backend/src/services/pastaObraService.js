const pool = require('../db/connection');
const PastaObra = require('../models/PastaObra');

function erroApi(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function traduzirErroBanco(error) {
    if (error.code === '23505') {
        return erroApi(
            'Já existe uma pasta com esse nome nesta localização.',
            409
        );
    }

    if (error.code === '23503') {
        return erroApi('A pasta informada não está disponível nesta obra.', 400);
    }

    return error;
}

async function executarComObraBloqueada(livro_id, operacao) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const obra = await client.query(
            'SELECT id FROM livros WHERE id = $1 FOR UPDATE',
            [livro_id]
        );

        if (obra.rowCount === 0) {
            throw erroApi('Obra não encontrada.', 404);
        }

        const resultado = await operacao(client);
        await client.query('COMMIT');
        return resultado;
    } catch (error) {
        await client.query('ROLLBACK');
        throw traduzirErroBanco(error);
    } finally {
        client.release();
    }
}

function montarHierarquia(pastas) {
    const porId = new Map();
    const raizes = [];

    for (const pasta of pastas) {
        porId.set(pasta.id, { ...pasta, subpastas: [] });
    }

    for (const pasta of porId.values()) {
        if (pasta.pasta_pai_id && porId.has(pasta.pasta_pai_id)) {
            porId.get(pasta.pasta_pai_id).subpastas.push(pasta);
        } else {
            raizes.push(pasta);
        }
    }

    return raizes;
}

class PastaObraService {
    static async buscarLivroIdPorId(id) {
        const livro_id = await PastaObra.buscarLivroIdPorId(id);

        if (!livro_id) {
            throw erroApi('Pasta não encontrada.', 404);
        }

        return livro_id;
    }

    static async criar(livro_id, dados) {
        return executarComObraBloqueada(livro_id, async (client) => {
            if (dados.pasta_pai_id) {
                const pai = await PastaObra.buscarPorId(
                    dados.pasta_pai_id,
                    client
                );

                if (!pai || pai.livro_id !== livro_id) {
                    throw erroApi(
                        'A pasta pai não pertence a esta obra ou não está ativa.',
                        400
                    );
                }
            }

            return PastaObra.criar({
                livro_id,
                pasta_pai_id: dados.pasta_pai_id || null,
                nome: dados.nome
            }, client);
        });
    }

    static async listar(livro_id) {
        const pastas = await PastaObra.listarPorLivro(livro_id);
        return montarHierarquia(pastas);
    }

    static async renomear(id, livro_id, nome) {
        return executarComObraBloqueada(livro_id, async (client) => {
            const pasta = await PastaObra.buscarPorId(id, client, true);

            if (!pasta || pasta.livro_id !== livro_id) {
                throw erroApi('Pasta não encontrada nesta obra.', 404);
            }

            return PastaObra.renomear(id, nome, client);
        });
    }

    static async mover(id, livro_id, pasta_pai_id) {
        return executarComObraBloqueada(livro_id, async (client) => {
            const pasta = await PastaObra.buscarPorId(id, client, true);

            if (!pasta || pasta.livro_id !== livro_id) {
                throw erroApi('Pasta não encontrada nesta obra.', 404);
            }

            if (pasta_pai_id) {
                const pai = await PastaObra.buscarPorId(
                    pasta_pai_id,
                    client,
                    true
                );

                if (!pai || pai.livro_id !== livro_id) {
                    throw erroApi(
                        'A pasta de destino não pertence a esta obra ou não está ativa.',
                        400
                    );
                }

                if (
                    pai.id === pasta.id ||
                    await PastaObra.ehDescendente(
                        id,
                        pasta_pai_id,
                        livro_id,
                        client
                    )
                ) {
                    throw erroApi(
                        'Não é possível mover uma pasta para dentro de si mesma ou de uma subpasta.',
                        400
                    );
                }
            }

            return PastaObra.mover(id, pasta_pai_id || null, client);
        });
    }

    static async excluir(id, livro_id) {
        return executarComObraBloqueada(livro_id, async (client) => {
            const pasta = await PastaObra.buscarPorId(id, client, true);

            if (!pasta || pasta.livro_id !== livro_id) {
                throw erroApi('Pasta não encontrada nesta obra.', 404);
            }

            if (await PastaObra.possuiConteudo(id, client)) {
                throw erroApi(
                    'A pasta deve estar vazia para ser excluída.',
                    409
                );
            }

            return PastaObra.desativar(id, client);
        });
    }
}

module.exports = PastaObraService;
