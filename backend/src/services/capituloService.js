const Capitulo = require('../models/Capitulo');
const ArquivoMidia = require('../models/ArquivoMidia');

function erroValidacao(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

class CapituloService {

    static async listarPorLivro(livro_id) {
        return await Capitulo.listarPorLivro(livro_id);
    }

    static async buscarPorId(id) {
        return await Capitulo.buscarPorId(id);
    }

    static async buscarLivroIdPorCapitulo(capitulo_id) {
        const capitulo = await Capitulo.buscarPorId(capitulo_id);

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    static async buscarPorSlug(livro_id, slug) {
        return await Capitulo.buscarPorSlug(livro_id, slug);
    }

    static async criar(capitulo) {
        return await Capitulo.criar(capitulo);
    }

    static async alterarInformacoes(id, capitulo) {
        if (Object.prototype.hasOwnProperty.call(capitulo, 'arquivo_capa_id')) {
            if (capitulo.arquivo_capa_id === null) {
                capitulo.capa_url = null;
            } else {
                const atual = await Capitulo.buscarPorId(id);
                const arquivo = await ArquivoMidia.buscarPorId(capitulo.arquivo_capa_id);
                if (!atual || !arquivo || arquivo.livro_id !== atual.livro_id || !arquivo.mime_type?.toLowerCase().startsWith('image/')) {
                    throw erroValidacao('A capa deve ser uma imagem ativa armazenada na mesma obra do capítulo.');
                }
                capitulo.capa_url = null;
            }
        }
        return await Capitulo.alterarInformacoes(id, capitulo);
    }

    static async alterarCapa(id, capa_url) {
        return await Capitulo.alterarCapa(id, capa_url);
    }

    static async desativar(id) {
        return await Capitulo.desativar(id);
    }
}

module.exports = CapituloService;
