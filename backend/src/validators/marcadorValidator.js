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
        .withMessage('ID do marcador deve ser um UUID válido.'),

    validarResultado
];

const validarCriacaoMarcador = [
    body('usuario_id')
        .isUUID()
        .withMessage('usuario_id deve ser um UUID válido.'),

    body('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),

    body('cena_id')
        .optional({ nullable: true })
        .isUUID()
        .withMessage('cena_id deve ser um UUID válido.'),

    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('Título é obrigatório.'),

    body('observacao')
        .optional({ nullable: true })
        .isString()
        .withMessage('Observação deve ser um texto.'),

    body('categoria')
        .optional({ nullable: true })
        .isString()
        .withMessage('Categoria deve ser um texto.'),

    body('ordem_exibicao')
        .isInt({ min: 1 })
        .withMessage('ordem_exibicao deve ser um número inteiro maior que zero.'),

    validarResultado
];

const validarAlteracaoInformacoes = [
    param('id')
        .isUUID()
        .withMessage('ID do marcador deve ser um UUID válido.'),

    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('Título é obrigatório.'),

    body('observacao')
        .optional({ nullable: true })
        .isString()
        .withMessage('Observação deve ser um texto.'),

    body('categoria')
        .optional({ nullable: true })
        .isString()
        .withMessage('Categoria deve ser um texto.'),

    body('ordem_exibicao')
        .isInt({ min: 1 })
        .withMessage('ordem_exibicao deve ser um número inteiro maior que zero.'),

    validarResultado
];

const validarAlteracaoCena = [
    param('id')
        .isUUID()
        .withMessage('ID do marcador deve ser um UUID válido.'),

    body('cena_id')
        .isUUID()
        .withMessage('cena_id deve ser um UUID válido.'),

    validarResultado
];

module.exports = {
    validarId,
    validarCriacaoMarcador,
    validarAlteracaoInformacoes,
    validarAlteracaoCena
};
