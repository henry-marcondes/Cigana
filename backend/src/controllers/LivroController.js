const LivroService = require('../services/livroService');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function detectarTipoImagem(buffer) {
    if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
    if (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a') return 'gif';
    return null;
}

class LivroController {

    static async listarParaDecisaoEditorial(req, res, next) {
        try {
            const livros = await LivroService.listarParaDecisaoEditorial();

            return res.json({
                success: true,
                data: livros
            });
        } catch (error) {
            next(error);
        }
    }

    static async listar(req, res, next) {
        try {
            const livros = await LivroService.listar();

            return res.json({
                success: true,
                data: livros
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const livro = await LivroService.buscarPorId(id);

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorSlug(req, res, next) {
        try {
            const { slug } = req.params;

            const livro = await LivroService.buscarPorSlug(slug);

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const livro = await LivroService.criar(req.body);

            return res.status(201).json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }
    
    static async criarParaAutor(req, res, next) {
    try {
        const usuario_id = req.usuario.id;

        const livro =
            await LivroService.criarParaAutor(
                usuario_id,
                req.body
            );

        return res.status(201).json({
            success: true,
            data: livro
        });

    } catch (error) {
        next(error);
    }
}

    static async alterarInformacoes(req, res, next) {
        try {
            const { id } = req.params;

            const livro = await LivroService.alterarInformacoes(
                id,
                req.body
            );

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status_livro_id } = req.body;

            const livro = await LivroService.alterarStatus(
                id,
                status_livro_id
            );

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async enviarParaRevisao(req, res, next) {
        try {
            const livro = await LivroService.enviarParaRevisao(req.params.id);

            return res.json({
                success: true,
                message: 'Obra enviada para revisão editorial.',
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarVisibilidade(req, res, next) {
        try {
            const { id } = req.params;
            const { visibilidade_livro_id } = req.body;

            const livro = await LivroService.alterarVisibilidade(
                id,
                visibilidade_livro_id
            );

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async publicar(req, res, next) {
        try {
            const livro = await LivroService.publicar(req.params.id);

            return res.json({
                success: true,
                message: 'Obra publicada com sucesso.',
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarDecisaoEditorial(req, res, next) {
        try {
            const decisao = await LivroService.buscarDecisaoEditorial(
                req.params.id
            );

            return res.json({
                success: true,
                data: decisao
            });
        } catch (error) {
            next(error);
        }
    }

    static async decidirEditorial(req, res, next) {
        try {
            const decisao = await LivroService.decidirEditorial(
                req.params.id,
                req.body.decisao,
                req.usuario.id,
                req.body.motivo_rejeicao
            );

            return res.json({
                success: true,
                message: req.body.decisao === 'APROVADA'
                    ? 'Obra aprovada editorialmente.'
                    : 'Obra rejeitada editorialmente.',
                data: decisao
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarCapa(req, res, next) {
        try {
            const { id } = req.params;
            let capa_url;

            if (Buffer.isBuffer(req.body)) {
                const extensao = detectarTipoImagem(req.body);
                if (!extensao) {
                    return res.status(400).json({
                        success: false,
                        message: 'Formato de imagem inválido. Use PNG, JPEG, WEBP ou GIF.'
                    });
                }

                const nomeArquivo = `${uuidv4()}.${extensao}`;
                const diretorio = path.join(__dirname, '../../../media/capas');
                await fs.mkdir(diretorio, { recursive: true });
                await fs.writeFile(path.join(diretorio, nomeArquivo), req.body, { flag: 'wx' });
                const porta = process.env.PORT || 3001;
                const origemApi = process.env.API_URL || `http://localhost:${porta}`;
                capa_url = `${origemApi}/media/capas/${nomeArquivo}`;
            } else {
                ({ capa_url } = req.body);
            }

            const livro = await LivroService.alterarCapa(id, capa_url);

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const { id } = req.params;

            const livro = await LivroService.desativar(id);

            if (!livro) {
                return res.status(404).json({
                    success: false,
                    message: 'Livro não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Livro desativado com sucesso.',
                data: livro
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LivroController;
