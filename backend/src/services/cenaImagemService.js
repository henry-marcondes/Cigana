const CenaImagem = require('../models/CenaImagem');

class CenaImagemService {

    static async listarPorCena(cena_id) {
        return await CenaImagem.listarPorCena(cena_id);
    }

    static async buscarPorId(id) {
        return await CenaImagem.buscarPorId(id);
    }

    static async criar(cenaImagem, client) {
        return await CenaImagem.criar(cenaImagem, client);
    }

    static async alterarInformacoes(id, cenaImagem, client) {
        return await CenaImagem.alterarInformacoes(
            id,
            cenaImagem,
            client
        );
    }

    static async alterarImagem(id, imagem_url, client) {
        return await CenaImagem.alterarImagem(
            id,
            imagem_url,
            client
        );
    }

    static async desativar(id, client) {
        return await CenaImagem.desativar(id, client);
    }

}

module.exports = CenaImagemService;
