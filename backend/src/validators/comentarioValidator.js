const { body, param, validationResult } = require('express-validator');

const validarResultado = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

const validarId = [
    param('id')
        .isUUID()
        .withMessage('ID do comentário deve ser um UUID válido.'),

    validarResultado
];

const validarUsuarioId = [
    param('usuario_id')
        .isUUID()
        .withMessage('usuario_id deve ser um UUID válido.'),

    validarResultado
];

const validarLivroId = [
    param('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),

    validarResultado
];

const validarCriacaoComentario = [
    body('usuario_id')
        .isUUID()
        .withMessage('usuario_id deve ser um UUID válido.'),

    body('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),

    body('texto')
        .isString()
        .withMessage('Texto do comentário deve ser um texto.')
        .notEmpty()
        .withMessage('Texto do comentário é obrigatório.'),

    validarResultado
];

const validarAlteracaoTexto = [
    param('id')
        .isUUID()
        .withMessage('ID do comentário deve ser um UUID válido.'),

    body('texto')
        .isString()
        .withMessage('Texto do comentário deve ser um texto.')
        .notEmpty()
        .withMessage('Texto do comentário é obrigatório.'),

    validarResultado
];

module.exports = {
    validarId,
    validarUsuarioId,
    validarLivroId,
    validarCriacaoComentario,
    validarAlteracaoTexto
};
