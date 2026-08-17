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
        .withMessage('ID inválido.')
];


const validarUsuarioId = [
    param('usuario_id')
        .isUUID()
        .withMessage('ID do usuário inválido.'),

    validarResultado
];


const validarUsuarioELivro = [
    param('usuario_id')
        .isUUID()
        .withMessage('ID do usuário inválido.'),

    param('livro_id')
        .isUUID()
        .withMessage('ID do livro inválido.'),

    validarResultado
];


const validarCriacao = [
    body('usuario_id')
        .isUUID()
        .withMessage('ID do usuário inválido.'),

    body('livro_id')
        .isUUID()
        .withMessage('ID do livro inválido.'),

    body('versao_livro')
        .isInt({ min: 1 })
        .withMessage(
            'Versão do livro deve ser um número inteiro maior que zero.'),

    body('cena_atual_id')
        .optional({ nullable: true })
        .isUUID()
        .withMessage('ID da cena atual inválido.'),

    body('percentual_concluido')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage(
            'Percentual concluído deve estar entre 0 e 100.'
        ),

    body('concluido')
        .optional()
        .isBoolean()
        .withMessage(
            'Concluído deve ser verdadeiro ou falso.'
        ),

    validarResultado
];


const validarAtualizacaoCenaAtual = [
    ...validarId,

    body('cena_atual_id')
        .isUUID()
        .withMessage('ID da cena atual inválido.'),

    validarResultado
];


const validarAtualizacaoPercentual = [
    ...validarId,

    body('percentual_concluido')
        .isFloat({ min: 0, max: 100 })
        .withMessage(
            'Percentual concluído deve estar entre 0 e 100.'
        ),

    validarResultado
];


const validarConclusao = [
    ...validarId,

    validarResultado
];


const validarDesativacao = [
    ...validarId,

    validarResultado
];


module.exports = {
    validarUsuarioId,
    validarId,
    validarUsuarioELivro,
    validarCriacao,
    validarAtualizacaoCenaAtual,
    validarAtualizacaoPercentual,
    validarConclusao,
    validarDesativacao
};
