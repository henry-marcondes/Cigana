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
        ordem_exibicao
    } = req.body;

    if (titulo === undefined &&
        slug === undefined &&
        resumo === undefined &&
        texto_introdutorio === undefined &&
        ordem_exibicao === undefined) {

        return res.status(400).json({
            success: false,
            message: 'Informe ao menos uma informação para alteração.'
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
