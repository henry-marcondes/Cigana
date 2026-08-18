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
        .withMessage('ID da avaliação deve ser um UUID válido.'),

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

const validarUsuarioELivro = [
    param('usuario_id')
        .isUUID()
        .withMessage('usuario_id deve ser um UUID válido.'),

    param('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),

    validarResultado
];

const validarCriacaoAvaliacao = [
    body('usuario_id')
        .isUUID()
        .withMessage('usuario_id deve ser um UUID válido.'),

    body('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),

    body('nota')
        .isInt({ min: 1, max: 5 })
        .withMessage('Nota deve ser um número inteiro entre 1 e 5.'),

    body('comentario')
        .optional({ nullable: true })
        .isString()
        .withMessage('Comentário deve ser um texto.'),

    validarResultado
];

const validarAlteracaoNota = [
    param('id')
        .isUUID()
        .withMessage('ID da avaliação deve ser um UUID válido.'),

    body('nota')
        .isInt({ min: 1, max: 5 })
        .withMessage('Nota deve ser um número inteiro entre 1 e 5.'),

    validarResultado
];

const validarAlteracaoComentario = [
    param('id')
        .isUUID()
        .withMessage('ID da avaliação deve ser um UUID válido.'),

    body('comentario')
        .isString()
        .withMessage('Comentário deve ser um texto.'),

    validarResultado
];

module.exports = {
    validarId,
    validarUsuarioId,
    validarLivroId,
    validarUsuarioELivro,
    validarCriacaoAvaliacao,
    validarAlteracaoNota,
    validarAlteracaoComentario
};
