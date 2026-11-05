const pool = require('../db/connection');
const CenaVideo = require('../models/CenaVideo');
const CenaConteudo = require('../models/CenaConteudo');
const { executarComArquivoValidado } = require('./arquivoCenaService');

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
        if (cenaVideo.arquivo_id) {
            return executarComArquivoValidado(
                pool, cenaVideo.arquivo_id, cenaVideo.cena_id,
                (transacao) => CenaVideo.criar(cenaVideo, transacao)
            );
        }
        return CenaVideo.criar(cenaVideo);
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

    static async alterarVideo(id, video_url, arquivo_id) {

        const videoExistente = await CenaVideo.buscarPorId(id);

        if (!videoExistente) {
            throw new Error('Vídeo da cena não encontrado.');
        }

        const videoAtualizado = arquivo_id
            ? await executarComArquivoValidado(
                pool, arquivo_id, videoExistente.cena_id,
                (transacao) => CenaVideo.alterarVideo(
                    id, video_url, transacao, arquivo_id
                )
            )
            : await CenaVideo.alterarVideo(id, video_url, undefined, arquivo_id);

        return videoAtualizado;
    }

    static async desativar(id) {
        const client = await pool.connect();
        let transacaoIniciada = false;

        try {
            await client.query('BEGIN');
            transacaoIniciada = true;

            const videoExistente = await CenaVideo.buscarPorId(id, client);

            if (!videoExistente) {
                throw new Error('Vídeo da cena não encontrado.');
            }

            const videoDesativado = await CenaVideo.desativar(id, client);

            if (!videoDesativado) {
                throw new Error('Vídeo da cena não encontrado.');
            }

            await CenaConteudo.desativarPorConteudo(
                'VIDEO',
                id,
                client
            );

            await client.query('COMMIT');
            transacaoIniciada = false;

            return videoDesativado;
        } catch (error) {
            if (transacaoIniciada) {
                await client.query('ROLLBACK');
            }

            throw error;
        } finally {
            client.release();
        }
    }

}

module.exports = CenaVideoService;
