const MarcadorService = require('../services/marcadorService');
const { success, error } = require('../utils/apiResponse');

class MarcadorController {

    static async listarPorUsuario(req, res) {
        try {
            const { usuario_id } = req.params;
            const marcadores = await MarcadorService.listarPorUsuario(usuario_id);
            return success( res, marcadores, 'Marcadores encontrados com sucesso');
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async listarPorLivro(req, res) {
        try {
            const { usuario_id, livro_id } = req.params;
            const marcadores = await MarcadorService.listarPorLivro(
                usuario_id, livro_id );
            return success( res, marcadores, 'Marcadores encontrados com sucesso');
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const marcador = await MarcadorService.buscarPorId(id);
            if (!marcador) {
                return error(res, 'Marcador não encontrado.', 404);
            }
            return success( res, marcador, 'Marcador encontrado com sucesso');
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async criar(req, res) {
        try {
            const marcador = await MarcadorService.criar(req.body);
            return success( res, marcador, 'Marcador criado com sucesso', 201);
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async alterarInformacoes(req, res) {
        try {
            const { id } = req.params;
            const marcador = await MarcadorService.alterarInformacoes(
                id, req.body);

            if (!marcador) {
                return error(res, 'Marcador não encontrado.', 404);
            }
            return success( res, marcador, 'Marcador alterado com sucesso');
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async alterarCena(req, res) {
        try {
            const { id } = req.params;
            const { cena_id } = req.body;
            const marcador = await MarcadorService.alterarCena(
                id, cena_id);

            if (!marcador) {
                return error(res, 'Marcador não encontrado.', 404);
            }

            return success(res, marcador,'Cena do marcador alterada com sucesso');
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    static async desativar(req, res) {
        try {
            const { id } = req.params;
            const marcador = await MarcadorService.desativar(id);

            if (!marcador) {
                return error(res, 'Marcador não encontrado.', 404);
            }

            return success( res, marcador, 'Marcador desativado com sucesso');
        } catch (err) {
            return error(res, err.message, 400);
        }
    }
}

module.exports = MarcadorController;
