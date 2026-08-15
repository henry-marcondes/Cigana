const CenaAudio = require('../models/CenaAudio');

class CenaAudioService {

    static async listarPorCena(cena_id) {
        return await CenaAudio.listarPorCena(cena_id);
    }

    static async buscarPorId(id) {
        return await CenaAudio.buscarPorId(id);
    }

    static async criar(cenaAudio) {
        return await CenaAudio.criar(cenaAudio);
    }

    static async alterarInformacoes(id, cenaAudio) {
        return await CenaAudio.alterarInformacoes(id, cenaAudio);
    }

    static async alterarAudio(id, audio_url) {
        return await CenaAudio.alterarAudio(id, audio_url);
    }

    static async desativar(id) {
        return await CenaAudio.desativar(id);
    }

}

module.exports = CenaAudioService;
