function validarCriacaoCapitulo(req, res, next) {
    const {
        livro_id,
        titulo,
        slug,
        ordem_exibicao
    } = req.body;

    if (!livro_id) {
        return res.status(400).json({
            success: false,
            message: 'livro_id é obrigatório.'
        });
    }

    if (!titulo) {
        return res.status(400).json({
            success: false,
            message: 'titulo é obrigatório.'
        });
    }

    if (!slug) {
        return res.status(400).json({
            success: false,
            message: 'slug é obrigatório.'
        });
    }

    if (ordem_exibicao === undefined || ordem_exibicao === null) {
        return res.status(400).json({
            success: false,
            message: 'ordem_exibicao é obrigatório.'
        });
    }

    return next();
}

function validarAlteracaoInformacoesCapitulo(req, res, next) {
    const {
        titulo,
        slug,
        resumo,
        texto_introdutorio,
        ordem_exibicao,
        capa_url
    } = req.body;

    if (titulo === undefined &&
        slug === undefined &&
        resumo === undefined &&
        texto_introdutorio === undefined &&
        ordem_exibicao === undefined &&
        capa_url === undefined) {

        return res.status(400).json({
            success: false,
            message: 'Informe ao menos uma informação para alteração.'
        });
    }

    if (capa_url !== undefined && capa_url !== null && typeof capa_url !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'capa_url deve ser um texto ou nulo.'
        });
    }

    return next();
}

function validarAlteracaoCapaCapitulo(req, res, next) {
    if (req.body.capa_url === undefined) {
        return res.status(400).json({
            success: false,
            message: 'capa_url é obrigatório.'
        });
    }

    return next();
}

module.exports = {
    validarCriacaoCapitulo,
    validarAlteracaoInformacoesCapitulo,
    validarAlteracaoCapaCapitulo
};
