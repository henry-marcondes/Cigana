const CenaAudioService = require('../services/cenaAudioService');

class CenaAudioController {

    static async listarPorCena(req, res, next) {
        try {
            const { cena_id } = req.params;

            const audios = await CenaAudioService.listarPorCena(cena_id);

            return res.status(200).json({
                success: true,
                data: audios
            });

        } catch (error) {
            next(error);
        }
    }

    static async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const audio = await CenaAudioService.buscarPorId(id);

            if (!audio) {
                return res.status(404).json({
                    success: false,
                    message: 'Áudio da cena não encontrado.'
                });
            }

            return res.status(200).json({
                success: true,
                data: audio
            });

        } catch (error) {
            next(error);
        }
    }

    static async criar(req, res, next) {
        try {
            const audio = await CenaAudioService.criar(req.body);

            return res.status(201).json({
                success: true,
                data: audio
            });

        } catch (error) {
            next(error);
        }
    }

    static async alterarInformacoes(req, res, next) {
        try {
            const { id } = req.params;

            const audio = await CenaAudioService.alterarInformacoes(
                id,
                req.body
            );

            if (!audio) {
                return res.status(404).json({
                    success: false,
                    message: 'Áudio da cena não encontrado.'
                });
            }

            return res.status(200).json({
                success: true,
                data: audio
            });

        } catch (error) {
            next(error);
        }
    }

    static async alterarAudio(req, res, next) {
        try {
            const { id } = req.params;
            const { audio_url } = req.body;

            const audio = await CenaAudioService.alterarAudio(
                id,
                audio_url
            );

            if (!audio) {
                return res.status(404).json({
                    success: false,
                    message: 'Áudio da cena não encontrado.'
                });
            }

            return res.status(200).json({
                success: true,
                data: audio
            });

        } catch (error) {
            next(error);
        }
    }

    static async desativar(req, res, next) {
        try {
            const { id } = req.params;

            const audio = await CenaAudioService.desativar(id);

            if (!audio) {
                return res.status(404).json({
                    success: false,
                    message: 'Áudio da cena não encontrado.'
                });
            }

            return res.status(200).json({
                success: true,
                data: audio
            });

        } catch (error) {
            next(error);
        }
    }

}

module.exports = CenaAudioController;
