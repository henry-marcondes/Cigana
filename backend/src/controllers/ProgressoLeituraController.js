const ProgressoLeituraService = require('../services/progressoLeituraService');

const { success, error } = require('../utils/apiResponse');


class ProgressoLeituraController {

    async listarPorUsuario(req, res) {
        try {
            const progressos =
                await ProgressoLeituraService.listarPorUsuario(
                    req.params.usuario_id
                );

            return success( res, progressos, 'Progressos de leitura listados com sucesso');

        } catch (err) {
            return error( res, err.message, 500 );
        }
    }


    async buscarPorId(req, res) {
        try {
            const progresso =
                await ProgressoLeituraService.buscarPorId(
                    req.params.id
                );

            return success( res, progresso, 'Progresso de leitura encontrado com sucesso' );

        } catch (err) {
            return error(res, err.message, 404);
        }
    }


    async buscarPorUsuarioELivro(req, res) {
        try {
            const progresso =
                await ProgressoLeituraService.buscarPorUsuarioELivro(
                    req.params.usuario_id,
                    req.params.livro_id
                );

            return success(
                res,
                progresso,
                'Progresso de leitura encontrado com sucesso'
            );

        } catch (err) {
            return error(
                res,
                err.message,
                404
            );
        }
    }


    async criar(req, res) {
        try {
            const progresso =
                await ProgressoLeituraService.criar(
                    req.body
                );

            return success(
                res,
                progresso,
                'Progresso de leitura criado com sucesso',
                201
            );

        } catch (err) {
            return error(
                res,
                err.message,
                400
            );
        }
    }


    async atualizarCenaAtual(req, res) {
        try {
            const progresso =
                await ProgressoLeituraService.atualizarCenaAtual(
                    req.params.id,
                    req.body.cena_atual_id
                );

            return success(
                res,
                progresso,
                'Cena atualizada com sucesso'
            );

        } catch (err) {
            return error(
                res,
                err.message,
                400
            );
        }
    }


    async atualizarPercentual(req, res) {
        try {
            const progresso =
                await ProgressoLeituraService.atualizarPercentual(
                    req.params.id,
                    req.body.percentual_concluido
                );

            return success(
                res,
                progresso,
                'Percentual de leitura atualizado com sucesso'
            );

        } catch (err) {
            return error(
                res,
                err.message,
                400
            );
        }
    }


    async concluirLeitura(req, res) {
        try {
            const progresso =
                await ProgressoLeituraService.concluirLeitura(
                    req.params.id
                );

            return success(
                res,
                progresso,
                'Leitura concluída com sucesso'
            );

        } catch (err) {
            return error(
                res,
                err.message,
                400
            );
        }
    }


    async desativar(req, res) {
        try {
            await ProgressoLeituraService.desativar(
                req.params.id
            );

            return success(
                res,
                null,
                'Progresso de leitura desativado com sucesso'
            );

        } catch (err) {
            return error(
                res,
                err.message,
                404
            );
        }
    }

}


module.exports = new ProgressoLeituraController();
