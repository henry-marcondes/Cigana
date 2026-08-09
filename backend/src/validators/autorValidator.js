function validarCriacaoAutor(req, res, next) {
    const {
        usuario_id,
        nome_publico,
        biografia,
        foto_url
    } = req.body;

    if (!usuario_id) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id é obrigatório.'
        });
    }

    if (!nome_publico || typeof nome_publico !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'nome_publico é obrigatório e deve ser um texto.'
        });
    }

    if (biografia !== undefined && biografia !== null &&
        typeof biografia !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'biografia deve ser um texto.'
        });
    }

    if (foto_url !== undefined && foto_url !== null &&
        typeof foto_url !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'foto_url deve ser um texto.'
        });
    }

    next();
}


function validarNomePublico(req, res, next) {
    const { nome_publico } = req.body;

    if (!nome_publico || typeof nome_publico !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'nome_publico é obrigatório e deve ser um texto.'
        });
    }

    next();
}


function validarBiografia(req, res, next) {
    const { biografia } = req.body;

    if (biografia === undefined || biografia === null) {
        return res.status(400).json({
            success: false,
            message: 'biografia é obrigatória.'
        });
    }

    if (typeof biografia !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'biografia deve ser um texto.'
        });
    }

    next();
}


function validarFoto(req, res, next) {
    const { foto_url } = req.body;

    if (foto_url === undefined || foto_url === null) {
        return res.status(400).json({
            success: false,
            message: 'foto_url é obrigatória.'
        });
    }

    if (typeof foto_url !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'foto_url deve ser um texto.'
        });
    }

    next();
}


module.exports = {
    validarCriacaoAutor,
    validarNomePublico,
    validarBiografia,
    validarFoto
};
