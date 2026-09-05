function validarCriacaoPermissao(req, res, next) {
    const {
        nome,
        codigo,
        descricao
    } = req.body;

    if (!nome || typeof nome !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'nome é obrigatório e deve ser um texto.'
        });
    }

    if (!codigo || typeof codigo !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'codigo é obrigatório e deve ser um texto.'
        });
    }

    if (descricao !== undefined && descricao !== null &&
        typeof descricao !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'descricao deve ser um texto.'
        });
    }

    next();
}


function validarNome(req, res, next) {
    const { nome } = req.body;

    if (!nome || typeof nome !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'nome é obrigatório e deve ser um texto.'
        });
    }

    next();
}


function validarCodigo(req, res, next) {
    const { codigo } = req.body;

    if (!codigo || typeof codigo !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'codigo é obrigatório e deve ser um texto.'
        });
    }

    next();
}


function validarDescricao(req, res, next) {
    const { descricao } = req.body;

    if (descricao === undefined || descricao === null) {
        return res.status(400).json({
            success: false,
            message: 'descricao é obrigatória.'
        });
    }

    if (typeof descricao !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'descricao deve ser um texto.'
        });
    }

    next();
}


module.exports = {
    validarCriacaoPermissao,
    validarNome,
    validarCodigo,
    validarDescricao
};
