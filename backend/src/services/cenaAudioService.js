const CenaAudio = require('../models/CenaAudio');
const pool = require('../db/connection');
const CenaConteudo = require('../models/CenaConteudo');
const { executarComArquivoValidado } = require('./arquivoCenaService');

class CenaAudioService {

    static async listarPorCena(cena_id) {
        return await CenaAudio.listarPorCena(cena_id);
    }

    static async buscarPorId(id) {
        return await CenaAudio.buscarPorId(id);
    }

    static async criar(cenaAudio) {
        if (cenaAudio.arquivo_id) {
            return executarComArquivoValidado(
                pool, cenaAudio.arquivo_id, cenaAudio.cena_id,
                (transacao) => CenaAudio.criar(cenaAudio, transacao)
            );
        }
        return CenaAudio.criar(cenaAudio);
    }

    static async alterarInformacoes(id, cenaAudio) {
        return await CenaAudio.alterarInformacoes(id, cenaAudio);
    }

    static async alterarAudio(id, audio_url, arquivo_id) {
        if (arquivo_id) {
            const atual = await CenaAudio.buscarPorId(id);
            if (!atual) return null;
            return executarComArquivoValidado(
                pool, arquivo_id, atual.cena_id,
                (transacao) => CenaAudio.alterarAudio(
                    id, audio_url, transacao, arquivo_id
                )
            );
        }
        return CenaAudio.alterarAudio(id, audio_url, undefined, arquivo_id);
    }

    static async desativar(id) {
        const client = await pool.connect();
        let transacaoIniciada = false;

        try {
            await client.query('BEGIN');
            transacaoIniciada = true;

            const audio = await CenaAudio.buscarPorId(id, client);

            if (!audio) {
                await client.query('COMMIT');
                transacaoIniciada = false;
                return null;
            }

            const audioDesativado = await CenaAudio.desativar(id, client);

            if (!audioDesativado) {
                throw new Error('Áudio da cena não encontrado.');
            }

            await CenaConteudo.desativarPorConteudo('AUDIO', id, client);

            await client.query('COMMIT');
            transacaoIniciada = false;

            return audioDesativado;
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

module.exports = CenaAudioService;
