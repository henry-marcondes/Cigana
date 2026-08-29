const CenaTexto = require('../models/CenaTexto');
const Cena = require('../models/Cena');

class CenaTextoService {

    static async listarPorCena(cena_id) {

        const cena = await Cena.buscarPorId(cena_id);

        if (!cena) {
            const erro = new Error('Cena não encontrada.');
            erro.status = 404;
            throw erro;
        }

        return await CenaTexto.listarPorCena(cena_id);
    }

    static async buscarPorId(id) {

        const cenaTexto = await CenaTexto.buscarPorId(id);

        if (!cenaTexto) {
            const erro = new Error('Texto da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        return cenaTexto;
    }

    static async criar(dados) {

        const {
            cena_id,
            texto_url
        } = dados;

        const cena = await Cena.buscarPorId(cena_id);

        if (!cena) {
            const erro = new Error('Cena não encontrada.');
            erro.status = 404;
            throw erro;
        }

        return await CenaTexto.criar({
            cena_id,
            texto_url
        });
    }

    static async alterar(id, dados) {

        const cenaTexto = await CenaTexto.buscarPorId(id);

        if (!cenaTexto) {
            const erro = new Error('Texto da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        return await CenaTexto.alterar(id, {
            texto_url: dados.texto_url
        });
    }

    static async desativar(id) {

        const cenaTexto = await CenaTexto.buscarPorId(id);

        if (!cenaTexto) {
            const erro = new Error('Texto da cena não encontrado.');
            erro.status = 404;
            throw erro;
        }

        return await CenaTexto.desativar(id);
    }
}

module.exports = CenaTextoService;
