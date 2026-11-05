const pool = require('../db/connection');
const ArquivoMidia = require('../models/ArquivoMidia');
const PastaObra = require('../models/PastaObra');
const armazenamento = require('../storage/armazenamentoArquivosMidiaLocal');
const assinaturaMidia = require('../utils/arquivoMidiaAssinatura');

function erroApi(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function traduzirErroBanco(error) {
    if (error.code === '23505') {
        return erroApi('Conflito ao registrar a chave de armazenamento.', 409);
    }

    if (error.code === '23503') {
        return erroApi('A pasta informada não pertence a esta obra.', 400);
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

async function validarPastaDaObra(pasta_id, livro_id, client) {
    if (!pasta_id) return null;

    const pasta = await PastaObra.buscarPorId(pasta_id, client, Boolean(client));

    if (!pasta || pasta.livro_id !== livro_id) {
        throw erroApi(
            'A pasta informada não pertence a esta obra ou não está ativa.',
            400
        );
    }

    return pasta.id;
}

async function gravarObjeto(livro_id, stream, nome_original, contexto) {
    try {
        return await armazenamento.gravarStream(
            livro_id,
            stream,
            nome_original
        );
    } catch (error) {
        if (error.statusCode) throw error;

        console.error(
            `Falha ao gravar arquivo gerenciado; qualquer conteúdo temporário foi preservado para reconciliação (${contexto}, obra ${livro_id}).`
        );
        throw erroApi(
            'Não foi possível concluir a gravação do arquivo. O conteúdo incerto foi preservado fora do acesso normal.',
            500
        );
    }
}

class ArquivoMidiaService {
    static async emitirUrl(id) {
        const arquivo = await ArquivoMidia.buscarPorId(id);
        if (!arquivo) throw erroApi('Arquivo gerenciado indisponível.', 404);
        const { expiracao, assinatura } = assinaturaMidia.emitir(id);
        return {
            arquivo_id: id,
            url: `/api/arquivos-midia/${id}/conteudo?exp=${expiracao}&assinatura=${assinatura}`,
            expira_em: new Date(expiracao * 1000).toISOString()
        };
    }

    static async entregar(id, expiracao, assinatura) {
        const verificacao = assinaturaMidia.validar(id, expiracao, assinatura);
        if (verificacao.expirado) throw erroApi('A assinatura da mídia expirou.', 410);
        if (!verificacao.valido) throw erroApi('Assinatura da mídia inválida.', 403);

        const arquivo = await ArquivoMidia.buscarPorId(id);
        if (!arquivo) throw erroApi('Arquivo gerenciado indisponível.', 404);
        try {
            const objeto = await armazenamento.abrirObjeto(
                arquivo.livro_id,
                arquivo.chave_armazenamento
            );
            return { arquivo, ...objeto };
        } catch (error) {
            if (error.code === 'ENOENT' || error.statusCode === 404) {
                throw erroApi('Arquivo gerenciado indisponível.', 404);
            }
            throw error;
        }
    }

    static async buscarLivroIdPorId(id) {
        const livro_id = await ArquivoMidia.buscarLivroIdPorId(id);

        if (!livro_id) {
            throw erroApi('Arquivo gerenciado não encontrado.', 404);
        }

        return livro_id;
    }

    static async listar(livro_id) {
        return ArquivoMidia.listarPorLivro(livro_id);
    }

    static async criar(livro_id, pasta_id, nome_original, stream) {
        await validarPastaDaObra(pasta_id, livro_id);

        const objeto = await gravarObjeto(
            livro_id,
            stream,
            nome_original,
            'upload'
        );

        try {
            return await executarComObraBloqueada(livro_id, async (client) => {
                const pastaConfirmada = await validarPastaDaObra(
                    pasta_id,
                    livro_id,
                    client
                );

                return ArquivoMidia.criar({
                    livro_id,
                    pasta_id: pastaConfirmada,
                    nome_original,
                    ...objeto
                }, client);
            });
        } catch (error) {
            console.error(
                `Metadados do upload não foram confirmados; objeto preservado para reconciliação (obra ${livro_id}, chave ${objeto.chave_armazenamento}).`
            );
            throw error;
        }
    }

    static async renomear(id, livro_id, nome_original) {
        return executarComObraBloqueada(livro_id, async (client) => {
            const arquivo = await ArquivoMidia.buscarPorId(id, client, true);

            if (!arquivo || arquivo.livro_id !== livro_id) {
                throw erroApi('Arquivo gerenciado não encontrado nesta obra.', 404);
            }

            return ArquivoMidia.renomear(id, nome_original, client);
        });
    }

    static async mover(id, livro_id, pasta_id) {
        return executarComObraBloqueada(livro_id, async (client) => {
            const arquivo = await ArquivoMidia.buscarPorId(id, client, true);

            if (!arquivo || arquivo.livro_id !== livro_id) {
                throw erroApi('Arquivo gerenciado não encontrado nesta obra.', 404);
            }

            const pastaConfirmada = await validarPastaDaObra(
                pasta_id,
                livro_id,
                client
            );

            return ArquivoMidia.mover(id, pastaConfirmada, client);
        });
    }

    static async substituirConteudo(id, livro_id, stream) {
        const existente = await ArquivoMidia.buscarPorId(id);

        if (!existente || existente.livro_id !== livro_id) {
            throw erroApi('Arquivo gerenciado não encontrado nesta obra.', 404);
        }

        const novoObjeto = await gravarObjeto(
            livro_id,
            stream,
            existente.nome_original,
            'substituição'
        );

        let atualizado;

        try {
            atualizado = await executarComObraBloqueada(livro_id, async (client) => {
                const arquivo = await ArquivoMidia.buscarPorId(id, client, true);

                if (!arquivo || arquivo.livro_id !== livro_id) {
                    throw erroApi('Arquivo gerenciado não encontrado nesta obra.', 404);
                }

                const atual = await ArquivoMidia.substituirConteudo(
                    id,
                    novoObjeto,
                    client
                );

                if (!atual) {
                    throw erroApi(
                        'Arquivo gerenciado não está mais ativo.',
                        404
                    );
                }

                return { anterior: arquivo, atual };
            });
        } catch (error) {
            console.error(
                `Metadados da substituição não foram confirmados; novo objeto preservado para reconciliação (obra ${livro_id}, arquivo ${id}, chave ${novoObjeto.chave_armazenamento}).`
            );
            throw error;
        }

        try {
            await armazenamento.removerObjeto(
                livro_id,
                atualizado.anterior.chave_armazenamento
            );
        } catch (error) {
            console.error(
                `Substituição confirmada, mas o conteúdo anterior não pôde ser removido e requer reconciliação (obra ${livro_id}, arquivo ${id}).`
            );
        }

        return atualizado.atual;
    }

    static async desativar(id, livro_id) {
        return executarComObraBloqueada(livro_id, async (client) => {
            const arquivo = await ArquivoMidia.buscarPorId(id, client, true);

            if (!arquivo || arquivo.livro_id !== livro_id) {
                throw erroApi('Arquivo gerenciado não encontrado nesta obra.', 404);
            }

            return ArquivoMidia.desativar(id, client);
        });
    }
}

module.exports = ArquivoMidiaService;
