const PapelPermissaoService = require('../services/papelPermissaoService');

class PapelPermissaoController {

    static async listarPorPapel(req, res, next) {
        try {
            const permissoes =
                await PapelPermissaoService.listarPorPapel(
                    req.params.papelId
                );

            return res.json({
                success: true,
                data: permissoes
            });
        } catch (error) {
            next(error);
        }
    }

    static async listarPorPermissao(req, res, next) {
        try {
            const papeis =
                await PapelPermissaoService.listarPorPermissao(
                    req.params.permissaoId
                );

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
            const vinculo =
                await PapelPermissaoService.buscarPorId(
                    req.params.id
                );

            if (!vinculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vínculo entre papel e permissão não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: vinculo
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorPapelEPermissao(req, res, next) {
        try {
            const vinculo =
                await PapelPermissaoService.buscarPorPapelEPermissao(
                    req.params.papelId,
                    req.params.permissaoId
                );

            if (!vinculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vínculo entre papel e permissão não encontrado.'
                });
            }

            return res.json({
                success: true,
                data: vinculo
            });
        } catch (error) {
            next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const vinculo =
                await PapelPermissaoService.criar(
                    req.body.papel_id,
                    req.body.permissao_id
                );

            return res.status(201).json({
                success: true,
                message: 'Permissão vinculada ao papel com sucesso.',
                data: vinculo
            });
        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const vinculo =
                await PapelPermissaoService.desativar(
                    req.params.id
                );

            if (!vinculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vínculo entre papel e permissão não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Vínculo entre papel e permissão desativado com sucesso.',
                data: vinculo
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PapelPermissaoController;
