const { body, param, validationResult } = require('express-validator');

const validarUUID = (campo) =>
    param(campo)
        .isUUID()
        .withMessage(`${campo} deve ser um UUID válido.`);

const tratarErrosValidacao = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

// Validação para criação de preferência
const validarCriacaoPreferencia = [

    body('grupo')
        .trim()
        .notEmpty()
        .withMessage('grupo é obrigatório.')
        .isLength({ max: 50 })
        .withMessage('grupo deve possuir no máximo 50 caracteres.'),

    body('codigo')
        .trim()
        .notEmpty()
        .withMessage('codigo é obrigatório.')
        .isLength({ max: 100 })
        .withMessage('codigo deve possuir no máximo 100 caracteres.'),

    body('nome')
        .trim()
        .notEmpty()
        .withMessage('nome é obrigatório.')
        .isLength({ max: 150 })
        .withMessage('nome deve possuir no máximo 150 caracteres.'),

    body('descricao')
        .optional({ nullable: true })
        .isString()
        .withMessage('descricao deve ser um texto.'),

    body('ordem_exibicao')
        .optional()
        .isInt({ min: 0 })
        .withMessage(
            'ordem_exibicao deve ser um número inteiro maior ou igual a 0.'
        ),

    tratarErrosValidacao
];

// Validação para busca por código
const validarBuscaPorCodigo = [

    param('grupo')
        .trim()
        .notEmpty()
        .withMessage('grupo é obrigatório.'),

    param('codigo')
        .trim()
        .notEmpty()
        .withMessage('codigo é obrigatório.'),

    tratarErrosValidacao
];

module.exports = {
    validarCriacaoPreferencia,
    validarBuscaPorCodigo
};
