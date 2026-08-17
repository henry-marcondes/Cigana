const ProgressoLeitura =
    require('../models/ProgressoLeitura');

class ProgressoLeituraService {

    async listarPorUsuario(usuario_id) {
        return await ProgressoLeitura.listarPorUsuario(usuario_id);
    }


    async buscarPorId(id) {
        const progresso =
            await ProgressoLeitura.buscarPorId(id);

        if (!progresso) {
            throw new Error(
                'Progresso de leitura não encontrado.'
            );
        }

        return progresso;
    }


    async buscarPorUsuarioELivro(usuario_id, livro_id) {
        const progresso =
            await ProgressoLeitura.buscarPorUsuarioELivro(
                usuario_id,
                livro_id
            );

        if (!progresso) {
            throw new Error(
                'Progresso de leitura não encontrado.'
            );
        }

        return progresso;
    }


    async criar(progressoLeitura) {
        return await ProgressoLeitura.criar(
            progressoLeitura
        );
    }


    async atualizarCenaAtual(id, cena_atual_id) {
        const progressoExistente =
            await ProgressoLeitura.buscarPorId(id);

        if (!progressoExistente) {
            throw new Error(
                'Progresso de leitura não encontrado.'
            );
        }

        const progresso =
            await ProgressoLeitura.atualizarCenaAtual(
                id,
                cena_atual_id
            );

        return progresso;
    }


    async atualizarPercentual(id, percentual_concluido) {
        const progressoExistente =
            await ProgressoLeitura.buscarPorId(id);

        if (!progressoExistente) {
            throw new Error(
                'Progresso de leitura não encontrado.'
            );
        }

        const progresso =
            await ProgressoLeitura.atualizarPercentual(
                id,
                percentual_concluido
            );

        return progresso;
    }


    async concluirLeitura(id) {
        const progressoExistente =
            await ProgressoLeitura.buscarPorId(id);

        if (!progressoExistente) {
            throw new Error(
                'Progresso de leitura não encontrado.'
            );
        }

        const progresso =
            await ProgressoLeitura.concluirLeitura(id);

        return progresso;
    }


    async desativar(id) {
        const progressoExistente =
            await ProgressoLeitura.buscarPorId(id);

        if (!progressoExistente) {
            throw new Error(
                'Progresso de leitura não encontrado.'
            );
        }

        const progresso =
            await ProgressoLeitura.desativar(id);

        return progresso;
    }

}

module.exports = new ProgressoLeituraService();
