const Livro = require('../models/Livro');
const Capitulo = require('../models/Capitulo');
const Cena = require('../models/Cena');
const CenaTexto = require('../models/CenaTexto');
const CenaImagem = require('../models/CenaImagem');
const CenaConteudo = require('../models/CenaConteudo');
const CenaAudio = require('../models/CenaAudio');
const CenaVideo = require('../models/CenaVideo');
const Escolha = require('../models/Escolha');


class EscopoObraService {

    // Obra identificada pelo parâmetro :id
    static async porLivroParam(req) {
        const livro = await Livro.buscarPorId(req.params.id);

        if (!livro) {
            throw new Error('Obra não encontrada.');
        }

        return livro.id;
    }

    // Obra identificada pelo livro_id enviado no body
    static async porLivroBody(req) {
        const livro = await Livro.buscarPorId(req.body.livro_id);

        if (!livro) {
            throw new Error('Obra não encontrada.');
        }

        return livro.id;
    }

    // Capítulo identificado pelo capitulo_id enviado no body
    static async porCapituloBody(req) {
        const capitulo = await Capitulo.buscarPorId(
            req.body.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // Capítulo identificado pelo parâmetro :id
    static async porCapituloParam(req) {
        const capitulo = await Capitulo.buscarPorId(
            req.params.id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // Cena identificada pelo cena_id enviado no body
    static async porCenaBody(req) {
        const cena = await Cena.buscarPorId(
            req.body.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // Cena identificada pelo parâmetro :id
    static async porCenaParam(req) {
        const cena = await Cena.buscarPorId(
            req.params.id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // CenaTexto identificado pelo parâmetro :id
    static async porCenaTextoParam(req) {
        const cenaTexto = await CenaTexto.buscarPorId(
            req.params.id
        );

        if (!cenaTexto) {
            throw new Error('Texto da cena não encontrado.');
        }

        const cena = await Cena.buscarPorId(
            cenaTexto.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // CenaImagem identificada pelo cena_id enviado no body
    static async porCenaImagemBody(req) {
        const cena = await Cena.buscarPorId(
            req.body.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // CenaImagem identificada pelo parâmetro :id
    static async porCenaImagemParam(req) {
        const cenaImagem = await CenaImagem.buscarPorId(
            req.params.id
        );

        if (!cenaImagem) {
            throw new Error('Imagem da cena não encontrada.');
        }

        const cena = await Cena.buscarPorId(
            cenaImagem.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // CenaConteudo identificado pelo cena_id enviado no body
    static async porCenaConteudoBody(req) {
        const cena = await Cena.buscarPorId(
            req.body.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // CenaConteudo identificado pelo parâmetro :id
    static async porCenaConteudoParam(req) {
        const cenaConteudo = await CenaConteudo.buscarPorId(
            req.params.id
        );

        if (!cenaConteudo) {
            throw new Error('Conteúdo da cena não encontrado.');
        }

        const cena = await Cena.buscarPorId(
            cenaConteudo.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }


    // CenaAudio identificado pelo cena_id enviado no body
    static async porCenaAudioBody(req) {
        const cena = await Cena.buscarPorId(
            req.body.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }


    // CenaAudio identificado pelo parâmetro :id
    static async porCenaAudioParam(req) {
        const cenaAudio = await CenaAudio.buscarPorId(
            req.params.id
        );

        if (!cenaAudio) {
            throw new Error('Áudio da cena não encontrado.');
        }

        const cena = await Cena.buscarPorId(
            cenaAudio.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    
    // CenaVideo identificado pelo cena_id enviado no body
    static async porCenaVideoBody(req) {
        const cena = await Cena.buscarPorId(
            req.body.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // CenaVideo identificado pelo parâmetro :id
    static async porCenaVideoParam(req) {
        const cenaVideo = await CenaVideo.buscarPorId(
            req.params.id
        );

        if (!cenaVideo) {
            throw new Error('Vídeo da cena não encontrado.');
        }

        const cena = await Cena.buscarPorId(
            cenaVideo.cena_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // Escolha identificada pelo parâmetro :id
    static async porEscolhaParam(req) {
        const escolha = await Escolha.buscarPorId(
            req.params.id
        );

        if (!escolha) {
            throw new Error('Escolha não encontrada.');
        }

        const cena = await Cena.buscarPorId(
            escolha.cena_origem_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }

    // Escolha identificada pelo cena_origem_id enviado no body
    static async porEscolhaCenaOrigemBody(req) {
        const cena = await Cena.buscarPorId(
            req.body.cena_origem_id
        );

        if (!cena) {
            throw new Error('Cena não encontrada.');
        }

        const capitulo = await Capitulo.buscarPorId(
            cena.capitulo_id
        );

        if (!capitulo) {
            throw new Error('Capítulo não encontrado.');
        }

        return capitulo.livro_id;
    }
    
}

module.exports = EscopoObraService;
