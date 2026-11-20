const NavegacaoEstruturalService = require('../services/navegacaoEstruturalService');

class NavegacaoEstruturalController {
    static async listarPorCenaOrigem(req, res, next) {
        try {
            const data = await NavegacaoEstruturalService.listarPorCenaOrigem(req.params.cena_origem_id);
            return res.json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const data = await NavegacaoEstruturalService.buscarPorId(req.params.id);
            return res.json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const data = await NavegacaoEstruturalService.criar(req.body);
            return res.status(201).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async alterar(req, res, next) {
        try {
            const data = await NavegacaoEstruturalService.alterar(req.params.id, req.body);
            return res.json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async reordenar(req, res, next) {
        try {
            const data = await NavegacaoEstruturalService.reordenar(req.body.cena_origem_id, req.body.ordem);
            return res.json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const data = await NavegacaoEstruturalService.desativar(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Navegação estrutural não encontrada.' });
            }
            return res.json({ success: true, message: 'Navegação estrutural desativada com sucesso.', data });
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = NavegacaoEstruturalController;
