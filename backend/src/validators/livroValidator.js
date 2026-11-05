function validarCriacaoLivro(req, res, next) {
    const {
        categoria_id,
        classificacao_indicativa_id,
        idioma_id,
        status_livro_id,
        visibilidade_livro_id,
        titulo,
        slug
    } = req.body;

    if (
        !categoria_id ||
        !classificacao_indicativa_id ||
        !idioma_id ||
        !status_livro_id ||
        !visibilidade_livro_id ||
        !titulo ||
        !slug
    ) {
        return res.status(400).json({
            success: false,
            message: 'Campos obrigatórios não informados.'
        });
    }

    return next();
}


function validarAlteracaoInformacoesLivro(req, res, next) {
    const {
        titulo,
        slug
    } = req.body;

    if (!titulo || !slug) {
        return res.status(400).json({
            success: false,
            message: 'Título e slug são obrigatórios.'
        });
    }

    return next();
}


function validarAlteracaoStatusLivro(req, res, next) {
    const { status_livro_id } = req.body;

    if (!status_livro_id) {
        return res.status(400).json({
            success: false,
            message: 'status_livro_id é obrigatório.'
        });
    }

    return next();
}


function validarAlteracaoVisibilidadeLivro(req, res, next) {
    const { visibilidade_livro_id } = req.body;

    if (!visibilidade_livro_id) {
        return res.status(400).json({
            success: false,
            message: 'visibilidade_livro_id é obrigatório.'
        });
    }

    return next();
}


function validarAlteracaoCapaLivro(req, res, next) {
    if (Buffer.isBuffer(req.body)) {
        if (req.body.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'A imagem da capa está vazia.'
            });
        }

        return next();
    }

    const { capa_url } = req.body || {};

    if (!capa_url) {
        return res.status(400).json({
            success: false,
            message: 'capa_url é obrigatório.'
        });
    }

    return next();
}

function validarDecisaoEditorial(req, res, next) {
    const { decisao, motivo_rejeicao } = req.body || {};

    if (!['APROVADA', 'REJEITADA'].includes(decisao)) {
        return res.status(400).json({
            success: false,
            message: 'A decisão editorial deve ser APROVADA ou REJEITADA.'
        });
    }

    if (
        motivo_rejeicao !== undefined &&
        motivo_rejeicao !== null &&
        typeof motivo_rejeicao !== 'string'
    ) {
        return res.status(400).json({
            success: false,
            message: 'motivo_rejeicao deve ser um texto.'
        });
    }

    return next();
}

function validarCriacaoLivroParaAutor(req, res, next) {
    const { solicitacao_id } = req.body || {};
    if (!solicitacao_id || typeof solicitacao_id !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'solicitacao_id é obrigatório para criar a obra aprovada.'
        });
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(solicitacao_id)) {
        return res.status(400).json({
            success: false,
            message: 'solicitacao_id deve ser um UUID válido.'
        });
    }

    return next();
}


module.exports = {
    validarCriacaoLivro,
    validarAlteracaoInformacoesLivro,
    validarAlteracaoStatusLivro,
    validarAlteracaoVisibilidadeLivro,
    validarAlteracaoCapaLivro,
    validarCriacaoLivroParaAutor,
    validarDecisaoEditorial
};
