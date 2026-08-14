const Escolha = require('../models/Escolha');

class EscolhaService {

    static async listarPorCenaOrigem(cena_origem_id) {
        return await Escolha.listarPorCenaOrigem(cena_origem_id);
    }

    static async buscarPorId(id) {
        return await Escolha.buscarPorId(id);
    }

    static async criar(escolha, client) {
        return await Escolha.criar(escolha, client);
    }

    static async alterarTexto(id, texto, client) {
        return await Escolha.alterarTexto(id, texto, client);
    }

    static async alterarDestino(id, cena_destino_id, client) {
        return await Escolha.alterarDestino(id, cena_destino_id, client);
    }

    static async alterarOrdemExibicao(id, ordem_exibicao, client) {
        return await Escolha.alterarOrdemExibicao(id, ordem_exibicao, client);
    }

    static async desativar(id, client) {
        return await Escolha.desativar(id, client);
    }

}

module.exports = EscolhaService;
