const Service = require('../services/solicitacaoInclusaoObraService');

class SolicitacaoInclusaoObraController {
    static async executar(req, res, next, fn) {
        try { return await fn(); } catch (error) { return next(error); }
    }

    static criar(req, res, next) {
        return SolicitacaoInclusaoObraController.executar(req, res, next, async () => res.status(201).json({
            success: true,
            data: await Service.criar(req.usuario.id, req.body)
        }));
    }

    static listarMinhas(req, res, next) {
        return SolicitacaoInclusaoObraController.executar(req, res, next, async () => res.json({
            success: true, data: await Service.listarDoAutor(req.usuario.id)
        }));
    }

    static buscarMinha(req, res, next) {
        return SolicitacaoInclusaoObraController.executar(req, res, next, async () => res.json({
            success: true, data: await Service.buscarDoAutor(req.usuario.id, req.params.id)
        }));
    }

    static editar(req, res, next) {
        return SolicitacaoInclusaoObraController.executar(req, res, next, async () => res.json({
            success: true, data: await Service.editar(req.usuario.id, req.params.id, req.body)
        }));
    }

    static reenviar(req, res, next) {
        return SolicitacaoInclusaoObraController.executar(req, res, next, async () => res.json({
            success: true, data: await Service.reenviar(req.usuario.id, req.params.id)
        }));
    }

    static listarGestao(req, res, next) {
        return SolicitacaoInclusaoObraController.executar(req, res, next, async () => res.json({
            success: true, data: await Service.listarAdministrativo(req.query.status)
        }));
    }

    static buscarGestao(req, res, next) {
        return SolicitacaoInclusaoObraController.executar(req, res, next, async () => res.json({
            success: true, data: await Service.buscarAdministrativo(req.params.id)
        }));
    }

    static aprovar(req, res, next) {
        return SolicitacaoInclusaoObraController.executar(req, res, next, async () => res.json({
            success: true, data: await Service.avaliar(req.params.id, req.usuario.id, true)
        }));
    }

    static rejeitar(req, res, next) {
        return SolicitacaoInclusaoObraController.executar(req, res, next, async () => res.json({
            success: true, data: await Service.avaliar(
                req.params.id, req.usuario.id, false, req.body.motivo_rejeicao
            )
        }));
    }

}

module.exports = SolicitacaoInclusaoObraController;
