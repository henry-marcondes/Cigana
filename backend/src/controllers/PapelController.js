const PapelService = require('../services/papelService');

class PapelController {

    static async listar(req, res, next) {
        try {
            const papeis = await PapelService.listarPapeis();

            return res.json({
                success: true,
                data: papeis
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const papel = await PapelService.buscarPapelPorId(
                req.params.id
            );

            if (!papel) {
                return res.status(404).json({
                    success: false,
                    message: 'Papel não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: papel
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorCodigo(req, res, next) {
        try {
            const papel = await PapelService.buscarPapelPorCodigo(
                req.params.codigo
            );

            if (!papel) {
                return res.status(404).json({
                    success: false,
                    message: 'Papel não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: papel
            });
        } catch (error) {
            next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const papel = await PapelService.criarPapel(req.body);

            return res.status(201).json({
                success: true,
                message: 'Papel criado com sucesso.',
                data: papel
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarNome(req, res, next) {
        try {
            const papel = await PapelService.alterarNome(
                req.params.id,
                req.body.nome
            );

            if (!papel) {
                return res.status(404).json({
                    success: false,
                    message: 'Papel não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Nome do papel alterado com sucesso.',
                data: papel
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarCodigo(req, res, next) {
        try {
            const papel = await PapelService.alterarCodigo(
                req.params.id,
                req.body.codigo
            );

            if (!papel) {
                return res.status(404).json({
                    success: false,
                    message: 'Papel não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Código do papel alterado com sucesso.',
                data: papel
            });
        } catch (error) {
            next(error);
        }
    }

    static async alterarDescricao(req, res, next) {
        try {
            const papel = await PapelService.alterarDescricao(
                req.params.id,
                req.body.descricao
            );

            if (!papel) {
                return res.status(404).json({
                    success: false,
                    message: 'Papel não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Descrição do papel alterada com sucesso.',
                data: papel
            });
        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const papel = await PapelService.desativarPapel(
                req.params.id
            );

            if (!papel) {
                return res.status(404).json({
                    success: false,
                    message: 'Papel não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Papel desativado com sucesso.',
                data: papel
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PapelController;
