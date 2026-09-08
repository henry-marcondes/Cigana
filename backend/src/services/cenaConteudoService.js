const pool = require('../db/connection');
const CenaConteudo = require('../models/CenaConteudo');
const Cena = require('../models/Cena');

const MODELOS_CONTEUDO = {
    TEXTO: require('../models/CenaTexto'),
    IMAGEM: require('../models/CenaImagem'),
    AUDIO: require('../models/CenaAudio'),
    VIDEO: require('../models/CenaVideo')
};

class CenaConteudoService {

    static async listarPorCena(cena_id) {

        const cena = await Cena.buscarPorId(cena_id);

        if (!cena) {
            const erro = new Error('Cena não encontrada.');
            erro.status = 404;
            throw erro;
        }

        return await CenaConteudo.listarPorCena(cena_id);
    }

    static async buscarPorId(id) {

        const cenaConteudo = await CenaConteudo.buscarPorId(id);

        if (!cenaConteudo) {
            const erro = new Error('Conteúdo da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        return cenaConteudo;
    }

    static async criar(dados) {

        const {
            cena_id,
            tipo_conteudo,
            conteudo_id,
            ordem_exibicao
        } = dados;

        const cena = await Cena.buscarPorId(cena_id);

        if (!cena) {
            const erro = new Error('Cena não encontrada.');
            erro.status = 404;
            throw erro;
        }

        const ModeloConteudo = MODELOS_CONTEUDO[tipo_conteudo];

        if (!ModeloConteudo) {
            const erro = new Error('Tipo de conteúdo inválido.');
            erro.status = 400;
            throw erro;
        }

        const conteudo = await ModeloConteudo.buscarPorId(conteudo_id);

        if (!conteudo) {
            const erro = new Error('Conteúdo não encontrado.');
            erro.status = 404;
            throw erro;
        }

        if (conteudo.cena_id !== cena_id) {
            const erro = new Error(
                'O conteúdo informado não pertence à cena.'
            );
            erro.status = 400;
            throw erro;
        }

        return await CenaConteudo.criar({
            cena_id,
            tipo_conteudo,
            conteudo_id,
            ordem_exibicao
        });
    }

    static async alterarOrdem(id, ordem_exibicao) {

        const cenaConteudo = await CenaConteudo.buscarPorId(id);

        if (!cenaConteudo) {
            const erro = new Error('Conteúdo da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        return await CenaConteudo.alterarOrdem(
            id,
            ordem_exibicao
        );
    }

    static async reordenar(cena_id, ordem) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const cena = await Cena.buscarPorId(cena_id);

        if (!cena) {
            const erro = new Error('Cena não encontrada.');
            erro.status = 404;
            throw erro;
        }

        const conteudosAtuais =
            await CenaConteudo.listarPorCena(cena_id, client);

        if (conteudosAtuais.length !== ordem.length) {
            const erro = new Error(
                'A ordem deve conter todos os conteúdos ativos da cena.'
            );
            erro.status = 400;
            throw erro;
        }

        const idsAtuais = new Set(
            conteudosAtuais.map(conteudo => conteudo.id)
        );

        const idsRecebidos = ordem.map(item => item.id);

        const idsUnicos = new Set(idsRecebidos);

        if (idsUnicos.size !== idsRecebidos.length) {
            const erro = new Error(
                'A ordem não pode conter conteúdos repetidos.'
            );
            erro.status = 400;
            throw erro;
        }

        for (const id of idsRecebidos) {

            if (!idsAtuais.has(id)) {
                const erro = new Error(
                    'Um ou mais conteúdos informados não pertencem à cena.'
                );
                erro.status = 400;
                throw erro;
            }
        }

        const dados = await CenaConteudo.reordenar(
            cena_id,
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

    static async alterarTipoConteudo(id, tipo_conteudo) {

        const cenaConteudo = await CenaConteudo.buscarPorId(id);

        if (!cenaConteudo) {
            const erro = new Error('Conteúdo da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        const ModeloConteudo = MODELOS_CONTEUDO[tipo_conteudo];

        if (!ModeloConteudo) {
            const erro = new Error('Tipo de conteúdo inválido.');
            erro.status = 400;
            throw erro;
        }

        const conteudo = await ModeloConteudo.buscarPorId(
            cenaConteudo.conteudo_id
        );

        if (!conteudo) {
            const erro = new Error('Conteúdo não encontrado.');
            erro.status = 404;
            throw erro;
        }

        if (conteudo.cena_id !== cenaConteudo.cena_id) {
            const erro = new Error(
                'O conteúdo não pertence à cena.'
            );
            erro.status = 400;
            throw erro;
        }

        return await CenaConteudo.alterarTipoConteudo(
            id,
            tipo_conteudo
        );
    }

    static async desativar(id) {

        const cenaConteudo = await CenaConteudo.buscarPorId(id);

        if (!cenaConteudo) {
            const erro = new Error('Conteúdo da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        return await CenaConteudo.desativar(id);
    }
}

module.exports = CenaConteudoService;
