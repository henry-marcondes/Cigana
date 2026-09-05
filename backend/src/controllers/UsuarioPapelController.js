const UsuarioPapelService =
    require('../services/usuarioPapelService');

class UsuarioPapelController {

    static async listarPorUsuario(req, res, next) {
        try {
            const papeis =
                await UsuarioPapelService.listarPorUsuario(
                    req.params.usuarioId
                );

            return res.json({
                success: true,
                data: papeis
            });
        } catch (error) {
            next(error);
        }
    }

    static async listarPorPapel(req, res, next) {
        try {
            const usuarios =
                await UsuarioPapelService.listarPorPapel(
                    req.params.papelId
                );

            return res.json({
                success: true,
                data: usuarios
            });
        } catch (error) {
            next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const vinculo =
                await UsuarioPapelService.buscarPorId(
                    req.params.id
                );

            if (!vinculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vínculo entre usuário e papel não encontrado.'
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

    static async buscarPorUsuarioEPapel(req, res, next) {
        try {
            const vinculo =
                await UsuarioPapelService.buscarPorUsuarioEPapel(
                    req.params.usuarioId,
                    req.params.papelId
                );

            if (!vinculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vínculo entre usuário e papel não encontrado.'
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
                await UsuarioPapelService.criar(
                    req.body.usuario_id,
                    req.body.papel_id
                );

            return res.status(201).json({
                success: true,
                message: 'Papel vinculado ao usuário com sucesso.',
                data: vinculo
            });
        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const vinculo =
                await UsuarioPapelService.desativar(
                    req.params.id
                );

            if (!vinculo) {
                return res.status(404).json({
                    success: false,
                    message: 'Vínculo entre usuário e papel não encontrado.'
                });
            }

            return res.json({
                success: true,
                message: 'Vínculo entre usuário e papel desativado com sucesso.',
                data: vinculo
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UsuarioPapelController;
