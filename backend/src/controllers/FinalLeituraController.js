const FinalLeituraService = require('../services/finalLeituraService');
const { success } = require('../utils/apiResponse');

class FinalLeituraController {
    async listarPorObra(req, res, next) {
        try {
            const finais = await FinalLeituraService.listarPorUsuarioELivro(
                req.usuario.id,
                req.params.livro_id
            );
            return success(res, finais, 'Finais conquistados encontrados.');
        } catch (erro) {
            return next(erro);
        }
    }

    async registrar(req, res, next) {
        try {
            const final = await FinalLeituraService.registrar(
                req.usuario.id,
                req.body.livro_id,
                req.body.cena_id
            );
            return success(res, final, 'Final registrado com sucesso.');
        } catch (erro) {
            return next(erro);
        }
    }
}

module.exports = new FinalLeituraController();
