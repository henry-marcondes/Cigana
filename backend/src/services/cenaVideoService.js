const CenaVideo = require('../models/CenaVideo');

class CenaVideoService {

    static async listarPorCena(cena_id) {

        return await CenaVideo.listarPorCena(cena_id);
    }

    static async buscarPorId(id) {

        const cenaVideo = await CenaVideo.buscarPorId(id);

        if (!cenaVideo) {
            throw new Error('Vídeo da cena não encontrado.');
        }

        return cenaVideo;
    }

    static async criar(cenaVideo) {

        return await CenaVideo.criar(cenaVideo);
    }

    static async alterarInformacoes(id, cenaVideo) {

        const videoExistente = await CenaVideo.buscarPorId(id);

        if (!videoExistente) {
            throw new Error('Vídeo da cena não encontrado.');
        }

        const videoAtualizado =
            await CenaVideo.alterarInformacoes(id, cenaVideo);

        return videoAtualizado;
    }

    static async alterarVideo(id, video_url) {

        const videoExistente = await CenaVideo.buscarPorId(id);

        if (!videoExistente) {
            throw new Error('Vídeo da cena não encontrado.');
        }

        const videoAtualizado =
            await CenaVideo.alterarVideo(id, video_url);

        return videoAtualizado;
    }

    static async desativar(id) {

        const videoExistente = await CenaVideo.buscarPorId(id);

        if (!videoExistente) {
            throw new Error('Vídeo da cena não encontrado.');
        }

        const videoDesativado =
            await CenaVideo.desativar(id);

        return videoDesativado;
    }

}

module.exports = CenaVideoService;
