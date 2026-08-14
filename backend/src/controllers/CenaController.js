
const CenaService = require('../services/cenaService');

class CenaController {

static async listarPorCapitulo(req, res) {
    try {
        const { capitulo_id } = req.params;

        const cenas = await CenaService.listarPorCapitulo(
            capitulo_id
        );

        return res.json({
            success: true,
            data: cenas
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

static async buscarPorId(req, res) {
    try {
        const { id } = req.params;

        const cena = await CenaService.buscarPorId(id);

        return res.json({
            success: true,
            data: cena
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

static async buscarPorSlug(req, res) {
    try {
        const {
            capitulo_id,
            slug
        } = req.params;

        const cena = await CenaService.buscarPorSlug(
            capitulo_id,
            slug
        );

        return res.json({
            success: true,
            data: cena
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

static async buscarCenaInicial(req, res) {
    try {
        const { capitulo_id } = req.params;

        const cena = await CenaService.buscarCenaInicial(
            capitulo_id
        );

        return res.json({
            success: true,
            data: cena
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

static async criar(req, res) {
    try {
        const cena = await CenaService.criar(req.body);

        return res.status(201).json({
            success: true,
            message: 'Cena criada com sucesso.',
            data: cena
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

static async alterarInformacoes(req, res) {
    try {
        const { id } = req.params;

        const cena = await CenaService.alterarInformacoes(
            id,
            req.body
        );

        return res.json({
            success: true,
            message: 'Cena alterada com sucesso.',
            data: cena
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

static async definirCenaInicial(req, res) {
    try {
        const { id } = req.params;

        const cena = await CenaService.definirCenaInicial(id);

        return res.json({
            success: true,
            message: 'Cena inicial definida com sucesso.',
            data: cena
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

static async desativar(req, res) {
    try {
        const { id } = req.params;

        const cena = await CenaService.desativar(id);

        return res.json({
            success: true,
            message: 'Cena desativada com sucesso.',
            data: cena
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

}

module.exports = CenaController;
