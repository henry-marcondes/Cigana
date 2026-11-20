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

function classificarTipoArquivo(arquivo, associacoes) {
    const tiposAssociados = [...new Set(
        (associacoes || []).map((item) => item.tipo_conteudo).filter(Boolean)
    )];

    if (tiposAssociados.length === 1) {
        return { tipo_conteudo: tiposAssociados[0], tipo_identificado_por: 'CONTEUDO' };
    }
    if (tiposAssociados.length > 1) {
        return { tipo_conteudo: 'MULTIPLO', tipo_identificado_por: 'CONTEUDO' };
    }

    const mime = (arquivo.mime_type || '').toLowerCase();
    const nome = (arquivo.nome_original || '').toLowerCase();
    if (mime.startsWith('image/')) return { tipo_conteudo: 'IMAGEM', tipo_identificado_por: 'MIME' };
    if (mime.startsWith('audio/')) return { tipo_conteudo: 'AUDIO', tipo_identificado_por: 'MIME' };
    if (mime.startsWith('video/')) return { tipo_conteudo: 'VIDEO', tipo_identificado_por: 'MIME' };
    if (mime === 'text/markdown' || mime.startsWith('text/') || /\.(md|markdown|mdown|mkdn)$/.test(nome)) {
        return { tipo_conteudo: 'TEXTO', tipo_identificado_por: 'MIME' };
    }
    return { tipo_conteudo: 'OUTRO', tipo_identificado_por: 'MIME' };
}

function validarCotaDaObra(cotaBytes, consumoBytes, tamanhoNovoBytes, tamanhoAnteriorBytes = 0n) {
    const cota = BigInt(cotaBytes);
    const consumo = BigInt(consumoBytes);
    const novo = BigInt(tamanhoNovoBytes);
    const anterior = BigInt(tamanhoAnteriorBytes);
    const projetado = consumo - anterior + novo;

    // Uma substituição que reduz (ou mantém) o consumo é permitida mesmo se
    // a obra já estiver acima da cota, para que o autor possa liberar espaço.
    if (projetado > cota && novo > anterior) {
        throw erroApi(
            'O espaço disponível na obra é insuficiente para armazenar este arquivo.',
            413
        );
    }
}

function traduzirErroBanco(error) {
    if (error.code === '23505') {
        if (error.constraint === 'uq_livro_documentos_principal_ativo') {
            return erroApi('A obra já possui um documento principal. Promova o documento desejado explicitamente.', 409);
        }
        if (error.constraint === 'uq_livro_documentos_livro_arquivo') {
            return erroApi('Este arquivo já está associado à obra como documento.', 409);
        }
        return erroApi('Conflito ao registrar a chave de armazenamento.', 409);
    }

    if (error.code === '23503') {
        return erroApi('A pasta informada não pertence a esta obra.', 400);
    }

    if (error.code === '23514') {
        return erroApi(error.message, 409);
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
    static async obterResumoArmazenamento(livro_id) {
        const dados = await ArquivoMidia.buscarDadosArmazenamentoPorLivro(livro_id);
        if (!dados) throw erroApi('Obra não encontrada.', 404);

        const cota = BigInt(dados.cota_armazenamento_bytes);
        const grupos = new Map();
        const arquivos = dados.arquivos.map((arquivo) => {
            const classificacao = classificarTipoArquivo(arquivo, arquivo.associacoes);
            const tamanho = BigInt(arquivo.tamanho_bytes);
            const atual = grupos.get(classificacao.tipo_conteudo) || {
                tipo_conteudo: classificacao.tipo_conteudo,
                quantidade_arquivos: 0,
                tamanho_total_bytes: 0n
            };
            atual.quantidade_arquivos += 1;
            atual.tamanho_total_bytes += tamanho;
            grupos.set(classificacao.tipo_conteudo, atual);

            return {
                ...arquivo,
                tamanho_bytes: tamanho.toString(),
                tipo_conteudo: classificacao.tipo_conteudo,
                tipo_identificado_por: classificacao.tipo_identificado_por,
                tem_associacao: (arquivo.associacoes || []).length > 0
            };
        });

        for (const tipo of ['TEXTO', 'IMAGEM', 'AUDIO', 'VIDEO', 'MULTIPLO', 'OUTRO']) {
            if (!grupos.has(tipo)) {
                grupos.set(tipo, {
                    tipo_conteudo: tipo,
                    quantidade_arquivos: 0,
                    tamanho_total_bytes: 0n
                });
            }
        }

        const consumo = arquivos.reduce(
            (soma, arquivo) => soma + BigInt(arquivo.tamanho_bytes),
            0n
        );
        const disponivel = cota - consumo;
        const percentual = cota === 0n
            ? (consumo === 0n ? 0 : 100)
            : Number((consumo * 10000n + cota / 2n) / cota) / 100;

        return {
            livro_id: dados.livro_id,
            cota_total_bytes: cota.toString(),
            consumo_utilizado_bytes: consumo.toString(),
            espaco_disponivel_bytes: disponivel.toString(),
            percentual_utilizado: percentual,
            quantidade_arquivos: arquivos.length,
            consumo_por_tipo: [...grupos.values()].map((grupo) => ({
                ...grupo,
                tamanho_total_bytes: grupo.tamanho_total_bytes.toString()
            })),
            arquivos
        };
    }

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

    static async criar(livro_id, pasta_id, nome_original, stream, aposRegistro = null) {
        let objeto;
        try {
            return await executarComObraBloqueada(livro_id, async (client) => {
                const pastaConfirmada = await validarPastaDaObra(
                    pasta_id,
                    livro_id,
                    client
                );

                const obra = await client.query(
                    'SELECT cota_armazenamento_bytes FROM livros WHERE id=$1 AND ativo=TRUE',
                    [livro_id]
                );
                if (!obra.rows[0]) throw erroApi('Obra não encontrada.', 404);

                objeto = await gravarObjeto(livro_id, stream, nome_original, 'upload');
                const consumo = await ArquivoMidia.buscarConsumoRegistradoPorLivro(livro_id, client);
                validarCotaDaObra(
                    obra.rows[0].cota_armazenamento_bytes,
                    consumo,
                    objeto.tamanho_bytes
                );

                const arquivo = await ArquivoMidia.criar({
                    livro_id,
                    pasta_id: pastaConfirmada,
                    nome_original,
                    ...objeto
                }, client);
                if (aposRegistro) {
                    const resultadoVinculo = await aposRegistro(client, arquivo);
                    return { ...arquivo, resultado_vinculo: resultadoVinculo };
                }
                return arquivo;
            });
        } catch (error) {
            if (objeto?.chave_armazenamento) {
                await armazenamento.removerObjeto(livro_id, objeto.chave_armazenamento)
                    .catch(() => console.error(`Falha ao remover upload não confirmado da obra ${livro_id}; requer reconciliação.`));
            }
            throw error;
        }
    }

    static async renomear(id, livro_id, nome_original) {
        return executarComObraBloqueada(livro_id, async (client) => {
            const arquivo = await ArquivoMidia.buscarPorId(id, client, true);

            if (!arquivo || arquivo.livro_id !== livro_id) {
                throw erroApi('Arquivo gerenciado não encontrado nesta obra.', 404);
            }

            const documentoMarkdown = await client.query(
                'SELECT 1 FROM livro_documentos WHERE arquivo_id=$1 AND ativo=TRUE LIMIT 1',
                [id]
            );
            if (documentoMarkdown.rowCount && !/\.(md|markdown)$/i.test(nome_original)) {
                throw erroApi('Um documento Markdown deve manter a extensão .md ou .markdown.', 409);
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

    static async substituirConteudo(id, livro_id, stream, opcoes = {}) {
        let novoObjeto;
        let atualizado;

        try {
            atualizado = await executarComObraBloqueada(livro_id, async (client) => {
                const arquivo = await ArquivoMidia.buscarPorId(id, client, true);

                if (!arquivo || arquivo.livro_id !== livro_id) {
                    throw erroApi('Arquivo gerenciado não encontrado nesta obra.', 404);
                }

                if (opcoes.markdownGerenciado) {
                    if (!/\.(md|markdown)$/i.test(arquivo.nome_original)
                        || !['text/markdown', 'text/plain', 'text/x-markdown'].includes(arquivo.mime_type)) {
                        throw erroApi('O arquivo associado não é Markdown.', 409);
                    }
                    if (typeof opcoes.hashEsperado !== 'string'
                        || !/^[a-f0-9]{64}$/i.test(opcoes.hashEsperado)) {
                        throw erroApi('Hash de versão esperado inválido.', 400);
                    }
                    if (arquivo.hash_sha256 !== opcoes.hashEsperado.toLowerCase()) {
                        throw erroApi('O arquivo foi alterado desde a última leitura. Recarregue o conteúdo antes de salvar.', 409);
                    }
                    const objetoAnterior = await armazenamento.abrirObjeto(livro_id, arquivo.chave_armazenamento);
                    const partes = [];
                    for await (const parte of objetoAnterior.criarStream()) partes.push(parte);
                    const hashFisico = require('node:crypto').createHash('sha256').update(Buffer.concat(partes)).digest('hex');
                    if (hashFisico !== opcoes.hashEsperado.toLowerCase()) {
                        throw erroApi('O arquivo foi alterado desde a última leitura. Recarregue o conteúdo antes de salvar.', 409);
                    }
                }

                if (!opcoes.documentoMarkdown && !opcoes.markdownGerenciado) {
                    const documento = await client.query(
                        'SELECT 1 FROM livro_documentos WHERE arquivo_id=$1 AND ativo=TRUE LIMIT 1',
                        [id]
                    );
                    if (documento.rowCount) {
                        throw erroApi('Documentos Markdown devem ser atualizados pelo endpoint com controle de versão.', 409);
                    }
                }

                const obra = await client.query(
                    'SELECT cota_armazenamento_bytes FROM livros WHERE id=$1 AND ativo=TRUE',
                    [livro_id]
                );
                if (!obra.rows[0]) throw erroApi('Obra não encontrada.', 404);

                novoObjeto = await gravarObjeto(
                    livro_id,
                    stream,
                    arquivo.nome_original,
                    'substituição'
                );
                const consumo = await ArquivoMidia.buscarConsumoRegistradoPorLivro(livro_id, client);
                validarCotaDaObra(
                    obra.rows[0].cota_armazenamento_bytes,
                    consumo,
                    novoObjeto.tamanho_bytes,
                    arquivo.tamanho_bytes
                );

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
            if (novoObjeto?.chave_armazenamento) {
                await armazenamento.removerObjeto(livro_id, novoObjeto.chave_armazenamento)
                    .catch(() => console.error(`Falha ao remover substituição não confirmada do arquivo ${id}; requer reconciliação.`));
            }
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

            const textoNarrativo = await client.query(
                'SELECT 1 FROM cena_textos WHERE arquivo_id=$1 LIMIT 1', [id]
            );
            if (textoNarrativo.rowCount) {
                throw erroApi('O arquivo está vinculado a um texto narrativo e não pode ser desativado.', 409);
            }

            const documento = await client.query(
                'SELECT 1 FROM livro_documentos WHERE arquivo_id=$1 AND ativo=TRUE LIMIT 1',
                [id]
            );
            if (documento.rowCount) {
                throw erroApi('Desative primeiro o vínculo documental antes de desativar o arquivo.', 409);
            }

            const capaCapitulo = await client.query(
                'SELECT 1 FROM capitulos WHERE arquivo_capa_id=$1 AND ativo=TRUE LIMIT 1',
                [id]
            );
            if (capaCapitulo.rowCount) {
                throw erroApi('O arquivo está sendo usado como capa de capítulo. Selecione outra capa antes de desativá-lo.', 409);
            }

            return ArquivoMidia.desativar(id, client);
        });
    }
}

module.exports = ArquivoMidiaService;
