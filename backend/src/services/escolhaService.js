const pool = require('../db/connection');
const Escolha = require('../models/Escolha');
const Cena = require('../models/Cena');
const Capitulo = require('../models/Capitulo');

class EscolhaService {

    static async listarPorCenaOrigem(cena_origem_id) {
        return await Escolha.listarPorCenaOrigem(cena_origem_id);
    }

    static async buscarPorId(id) {
        return await Escolha.buscarPorId(id);
    }

    static async criar(escolha, client) {

        const {
            cena_origem_id,
            cena_destino_id
        } = escolha;

        const cenaOrigem = await Cena.buscarPorId(
            cena_origem_id
        );

        if (!cenaOrigem) {
            throw new Error('Cena de origem não encontrada.');
        }

        const cenaDestino = await Cena.buscarPorId(
            cena_destino_id
        );

        if (!cenaDestino) {
            throw new Error('Cena de destino não encontrada.');
        }

        const capituloOrigem = await Capitulo.buscarPorId(
            cenaOrigem.capitulo_id
        );

        if (!capituloOrigem) {
            throw new Error(
                'Capítulo da cena de origem não encontrado.'
            );
        }

        const capituloDestino = await Capitulo.buscarPorId(
            cenaDestino.capitulo_id
        );

        if (!capituloDestino) {
            throw new Error(
                'Capítulo da cena de destino não encontrado.'
            );
        }

        if (capituloOrigem.livro_id !== capituloDestino.livro_id) {
            throw new Error(
                'A cena de destino deve pertencer à mesma obra da cena de origem.'
            );
        }

        return await Escolha.criar(escolha, client);
    }

    static async alterarTexto(id, texto, client) {
        return await Escolha.alterarTexto(
            id,
            texto,
            client
        );
    }

    static async alterarDestino(id, cena_destino_id, client) {

        const escolha = await Escolha.buscarPorId(id);

        if (!escolha) {
            throw new Error('Escolha não encontrada.');
        }

        const cenaOrigem = await Cena.buscarPorId(
            escolha.cena_origem_id
        );

        if (!cenaOrigem) {
            throw new Error('Cena de origem não encontrada.');
        }

        const cenaDestino = await Cena.buscarPorId(
            cena_destino_id
        );

        if (!cenaDestino) {
            throw new Error('Cena de destino não encontrada.');
        }

        const capituloOrigem = await Capitulo.buscarPorId(
            cenaOrigem.capitulo_id
        );

        if (!capituloOrigem) {
            throw new Error(
                'Capítulo da cena de origem não encontrado.'
            );
        }

        const capituloDestino = await Capitulo.buscarPorId(
            cenaDestino.capitulo_id
        );

        if (!capituloDestino) {
            throw new Error(
                'Capítulo da cena de destino não encontrado.'
            );
        }

        if (capituloOrigem.livro_id !== capituloDestino.livro_id) {
            throw new Error(
                'A cena de destino deve pertencer à mesma obra da cena de origem.'
            );
        }

        return await Escolha.alterarDestino(
            id,
            cena_destino_id,
            client
        );
    }

    static async alterarOrdemExibicao(
        id,
        ordem_exibicao,
        client
    ) {
        return await Escolha.alterarOrdemExibicao(
            id,
            ordem_exibicao,
            client
        );
    }

    static async reordenar(cena_origem_id, ordem) {

        const client = await pool.connect();

        try {

            await client.query('BEGIN');

            const cena = await Cena.buscarPorId(
                cena_origem_id
            );

            if (!cena) {
                const erro = new Error(
                    'Cena não encontrada.'
                );
                erro.status = 404;
                throw erro;
            }

            const escolhasAtuais =
                await Escolha.listarPorCenaOrigem(
                    cena_origem_id,
                    client
                );

            if (escolhasAtuais.length !== ordem.length) {
                const erro = new Error(
                    'A ordem deve conter todas as escolhas ativas da cena.'
                );
                erro.status = 400;
                throw erro;
            }

            const idsAtuais = new Set(
                escolhasAtuais.map(escolha => escolha.id)
            );

            const idsRecebidos = ordem.map(
                item => item.id
            );

            const idsUnicos = new Set(idsRecebidos);

            if (idsUnicos.size !== idsRecebidos.length) {
                const erro = new Error(
                    'A ordem não pode conter escolhas repetidas.'
                );
                erro.status = 400;
                throw erro;
            }

            for (const id of idsRecebidos) {

                if (!idsAtuais.has(id)) {
                    const erro = new Error(
                        'Uma ou mais escolhas informadas não pertencem à cena.'
                    );
                    erro.status = 400;
                    throw erro;
                }
            }

            const dados = await Escolha.reordenar(
                cena_origem_id,
                ordem,
                client
            );

            await client.query('COMMIT');

            return dados;

        } catch (error) {

            await client.query('ROLLBACK');

            throw error;

        } finally {

            client.release();
        }
    }

    static async desativar(id, client) {
        return await Escolha.desativar(
            id,
            client
        );
    }

}

module.exports = EscolhaService;
