const ArquivoMidiaService = require('../services/arquivoMidiaService');
const apiResponse = require('../utils/apiResponse');

function responderErro(res, error) {
    return apiResponse.error(
        res,
        error.message,
        error.statusCode || 500
    );
}

class ArquivoMidiaController {
    static async emitirUrl(req, res) {
        try {
            const dados = await ArquivoMidiaService.emitirUrl(req.params.id);
            return apiResponse.success(res, dados);
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async entregar(req, res) {
        try {
            const { arquivo, criarStream, tamanho } = await ArquivoMidiaService.entregar(
                req.params.id,
                req.query.exp,
                req.query.assinatura
            );
            const intervalo = req.headers.range;
            let inicio = 0;
            let fim = tamanho - 1;
            let status = 200;

            if (intervalo) {
                const correspondencia = /^bytes=(\d*)-(\d*)$/.exec(intervalo);
                if (!correspondencia || tamanho === 0) {
                    res.set('Content-Range', `bytes */${tamanho}`);
                    return res.status(416).end();
                }
                const [, inicioTexto, fimTexto] = correspondencia;
                if (!inicioTexto && !fimTexto) {
                    res.set('Content-Range', `bytes */${tamanho}`);
                    return res.status(416).end();
                }
                if (!inicioTexto) {
                    const sufixo = Number(fimTexto);
                    if (!Number.isSafeInteger(sufixo) || sufixo <= 0) {
                        res.set('Content-Range', `bytes */${tamanho}`);
                        return res.status(416).end();
                    }
                    inicio = Math.max(0, tamanho - sufixo);
                } else {
                    inicio = Number(inicioTexto);
                    fim = fimTexto ? Number(fimTexto) : fim;
                }
                if (!Number.isSafeInteger(inicio) || !Number.isSafeInteger(fim) || inicio < 0 || fim < inicio || inicio >= tamanho) {
                    res.set('Content-Range', `bytes */${tamanho}`);
                    return res.status(416).end();
                }
                fim = Math.min(fim, tamanho - 1);
                status = 206;
                res.set('Content-Range', `bytes ${inicio}-${fim}/${tamanho}`);
                res.set('Accept-Ranges', 'bytes');
                res.set('Content-Length', String(fim - inicio + 1));
                res.status(status);
                res.set('Content-Type', arquivo.mime_type);
                res.set('Cache-Control', 'private, no-store');
                res.set('X-Content-Type-Options', 'nosniff');
                res.set('Content-Security-Policy', "default-src 'none'; sandbox");
                const stream = criarStream({ start: inicio, end: fim });
                return stream.on('error', () => res.destroy()).pipe(res);
            }

            res.status(status);
            res.set('Content-Type', arquivo.mime_type);
            res.set('Content-Length', String(tamanho));
            res.set('Accept-Ranges', 'bytes');
            res.set('Cache-Control', 'private, no-store');
            res.set('X-Content-Type-Options', 'nosniff');
            res.set('Content-Security-Policy', "default-src 'none'; sandbox");
            const stream = criarStream();
            return stream.on('error', () => res.destroy()).pipe(res);
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async criar(req, res) {
        try {
            const arquivo = await ArquivoMidiaService.criar(
                req.livro_id,
                req.query.pasta_id || null,
                req.get('X-Nome-Original'),
                req
            );

            return apiResponse.success(
                res,
                arquivo,
                'Arquivo enviado com sucesso.',
                201
            );
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async listar(req, res) {
        try {
            const arquivos = await ArquivoMidiaService.listar(req.livro_id);
            return apiResponse.success(res, arquivos);
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async renomear(req, res) {
        try {
            const arquivo = await ArquivoMidiaService.renomear(
                req.params.id,
                req.livro_id,
                req.body.nome_original
            );

            return apiResponse.success(
                res,
                arquivo,
                'Arquivo renomeado com sucesso.'
            );
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async mover(req, res) {
        try {
            const arquivo = await ArquivoMidiaService.mover(
                req.params.id,
                req.livro_id,
                req.body.pasta_id
            );

            return apiResponse.success(
                res,
                arquivo,
                'Arquivo movido com sucesso.'
            );
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async substituirConteudo(req, res) {
        try {
            const arquivo = await ArquivoMidiaService.substituirConteudo(
                req.params.id,
                req.livro_id,
                req
            );

            return apiResponse.success(
                res,
                arquivo,
                'Conteúdo do arquivo substituído com sucesso.'
            );
        } catch (error) {
            return responderErro(res, error);
        }
    }

    static async desativar(req, res) {
        try {
            const arquivo = await ArquivoMidiaService.desativar(
                req.params.id,
                req.livro_id
            );

            return apiResponse.success(
                res,
                arquivo,
                'Arquivo desativado com sucesso.'
            );
        } catch (error) {
            return responderErro(res, error);
        }
    }
}

module.exports = ArquivoMidiaController;
