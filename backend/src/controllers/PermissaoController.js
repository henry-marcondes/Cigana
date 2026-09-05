const PermissaoService = require('../services/permissaoService');

class PermissaoController {

    static async listar(req, res, next) {
        try {
            const permissoes = await PermissaoService.listarPermissoes();

            return res.json({
                success: true,
                data: permissoes
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const permissao = await PermissaoService.buscarPermissaoPorId(
                req.params.id
            );

            if (!permissao) {
                return res.status(404).json({
                    success: false,
                    message: 'Permissão não encontrada.'
                });
            }

            return res.json({
                success: true,
                data: permissao
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorCodigo(req, res, next) {
        try {
            const permissao = await PermissaoService.buscarPermissaoPorCodigo(
                req.params.codigo
            );

            if (!permissao) {
                return res.status(404).json({
                    success: false,
                    message: 'Permissão não encontrada.'
                });
            }

            return res.json({
                success: true,
                data: permissao
            });
        } catch (error) {
            next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const permissao = await PermissaoService.criarPermissao(req.body);

            return res.status(201).json({
                success: true,
                message: 'Permissão criada com sucesso.',
                data: permissao
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarNome(req, res, next) {
        try {
            const permissao = await PermissaoService.alterarNome(
                req.params.id,
                req.body.nome
            );

            if (!permissao) {
                return res.status(404).json({
                    success: false,
                    message: 'Permissão não encontrada.'
                });
            }

            return res.json({
                success: true,
                message: 'Nome da permissão alterado com sucesso.',
                data: permissao
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarCodigo(req, res, next) {
        try {
            const permissao = await PermissaoService.alterarCodigo(
                req.params.id,
                req.body.codigo
            );

            if (!permissao) {
                return res.status(404).json({
                    success: false,
                    message: 'Permissão não encontrada.'
                });
            }

            return res.json({
                success: true,
                message: 'Código da permissão alterado com sucesso.',
                data: permissao
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarDescricao(req, res, next) {
        try {
            const permissao = await PermissaoService.alterarDescricao(
                req.params.id,
                req.body.descricao
            );

            if (!permissao) {
                return res.status(404).json({
                    success: false,
                    message: 'Permissão não encontrada.'
                });
            }

            return res.json({
                success: true,
                message: 'Descrição da permissão alterada com sucesso.',
                data: permissao
            });
        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const permissao = await PermissaoService.desativarPermissao(
                req.params.id
            );

            if (!permissao) {
                return res.status(404).json({
                    success: false,
                    message: 'Permissão não encontrada.'
                });
            }

            return res.json({
                success: true,
                message: 'Permissão desativada com sucesso.',
                data: permissao
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PermissaoController;
