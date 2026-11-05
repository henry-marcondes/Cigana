const CenaImagem = require('../models/CenaImagem');
const pool = require('../db/connection');
const CenaConteudo = require('../models/CenaConteudo');
const { executarComArquivoValidado } = require('./arquivoCenaService');

class CenaImagemService {

    static async listarPorCena(cena_id) {
        return await CenaImagem.listarPorCena(cena_id);
    }

    static async buscarPorId(id) {
        return await CenaImagem.buscarPorId(id);
    }

    static async criar(cenaImagem, client) {
        if (cenaImagem.arquivo_id) {
            return executarComArquivoValidado(
                pool,
                cenaImagem.arquivo_id,
                cenaImagem.cena_id,
                (transacao) => CenaImagem.criar(cenaImagem, transacao)
            );
        }
        return await CenaImagem.criar(cenaImagem, client);
    }

    static async alterarInformacoes(id, cenaImagem, client) {
        return await CenaImagem.alterarInformacoes(
            id,
            cenaImagem,
            client
        );
    }

    static async alterarImagem(id, imagem_url, arquivo_id, client) {
        if (arquivo_id) {
            const atual = await CenaImagem.buscarPorId(id);
            if (!atual) return null;
            return executarComArquivoValidado(
                pool,
                arquivo_id,
                atual.cena_id,
                (transacao) => CenaImagem.alterarImagem(
                    id, imagem_url, transacao, arquivo_id
                )
            );
        }
        return CenaImagem.alterarImagem(id, imagem_url, client, arquivo_id);
    }

    static async desativar(id, client) {
        const transacao = client || await pool.connect();
        const gerenciaTransacao = !client;

        try {
            if (gerenciaTransacao) {
                await transacao.query('BEGIN');
            }

            const imagem = await CenaImagem.buscarPorId(id, transacao);

            if (!imagem) {
                if (gerenciaTransacao) {
                    await transacao.query('COMMIT');
                }
                return null;
            }

            const imagemDesativada = await CenaImagem.desativar(id, transacao);

            if (!imagemDesativada) {
                throw new Error('Imagem da cena não encontrada.');
            }

            await CenaConteudo.desativarPorConteudo(
                'IMAGEM',
                id,
                transacao
            );

            if (gerenciaTransacao) {
                await transacao.query('COMMIT');
            }

            return imagemDesativada;
        } catch (error) {
            if (gerenciaTransacao) {
                await transacao.query('ROLLBACK');
            }

            throw error;
        } finally {
            if (gerenciaTransacao) {
                transacao.release();
            }
        }
    }

}

module.exports = CenaImagemService;
