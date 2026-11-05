const { body, param, validationResult } = require('express-validator');

const validarResultado = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    return next();
};

const validarLivroId = [
    param('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),
    validarResultado
];

const validarPastaId = [
    param('id')
        .isUUID()
        .withMessage('id deve ser um UUID válido.'),
    validarResultado
];

const validarCriacaoPasta = [
    body('nome')
        .isString()
        .withMessage('nome deve ser um texto.')
        .bail()
        .custom((nome) => nome.trim() !== '')
        .withMessage('nome não pode ser vazio ou conter somente espaços.'),
    body('pasta_pai_id')
        .optional({ nullable: true })
        .isUUID()
        .withMessage('pasta_pai_id deve ser um UUID válido ou nulo.'),
    validarResultado
];

const validarRenomeacaoPasta = [
    body('nome')
        .isString()
        .withMessage('nome deve ser um texto.')
        .bail()
        .custom((nome) => nome.trim() !== '')
        .withMessage('nome não pode ser vazio ou conter somente espaços.'),
    validarResultado
];

const validarMovimentacaoPasta = [
    body('pasta_pai_id')
        .custom((id, { req }) => (
            Object.prototype.hasOwnProperty.call(req.body, 'pasta_pai_id') &&
            (id === null || (
                typeof id === 'string' &&
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
            ))
        ))
        .withMessage('pasta_pai_id é obrigatório e deve ser um UUID válido ou nulo.'),
    validarResultado
];

module.exports = {
    validarLivroId,
    validarPastaId,
    validarCriacaoPasta,
    validarRenomeacaoPasta,
    validarMovimentacaoPasta
};
