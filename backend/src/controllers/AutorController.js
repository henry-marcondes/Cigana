const AutorService = require('../services/autorService');

class AutorController {

    static async listar(req, res, next) {
        try {
            const autores = await AutorService.listarAutores();

            return res.json({
                success: true,
                data: autores
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const autor = await AutorService.buscarAutorPorId(req.params.id);

            if (!autor) {
                return res.status(404).json({
                    success: false,
                    message: 'Autor não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: autor
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorUsuarioId(req, res, next) {
        try {
            const autor = await AutorService.buscarAutorPorUsuarioId(
                req.params.usuario_id
            );

            if (!autor) {
                return res.status(404).json({
                    success: false,
                    message: 'Autor não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: autor
            });
        } catch (error) {
            next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const autor = await AutorService.criarAutor(req.body);

            return res.status(201).json({
                success: true,
                message: 'Autor criado com sucesso.',
                data: autor
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarNomePublico(req, res, next) {
        try {
            const autor = await AutorService.alterarNomePublico(
                req.params.id,
                req.body.nome_publico
            );

            if (!autor) {
                return res.status(404).json({
                    success: false,
                    message: 'Autor não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Nome público alterado com sucesso.',
                data: autor
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarBiografia(req, res, next) {
        try {
            const autor = await AutorService.alterarBiografia(
                req.params.id,
                req.body.biografia
            );

            if (!autor) {
                return res.status(404).json({
                    success: false,
                    message: 'Autor não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Biografia alterada com sucesso.',
                data: autor
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarFoto(req, res, next) {
        try {
            const autor = await AutorService.alterarFoto(
                req.params.id,
                req.body.foto_url
            );

            if (!autor) {
                return res.status(404).json({
                    success: false,
                    message: 'Autor não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Foto do autor alterada com sucesso.',
                data: autor
            });
        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const autor = await AutorService.desativarAutor(req.params.id);

            if (!autor) {
                return res.status(404).json({
                    success: false,
                    message: 'Autor não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Autor desativado com sucesso.',
                data: autor
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AutorController;
