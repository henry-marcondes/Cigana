const { body, param, validationResult } =
    require('express-validator');


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


const validarCenaId = [
    param('cena_id')
        .isUUID()
        .withMessage('ID da cena inválido.'),

    validarResultado
];


const validarCriacao = [
    body('cena_id')
        .isUUID()
        .withMessage('ID da cena inválido.'),

    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('Título é obrigatório.'),

    body('legenda')
        .optional({ nullable: true })
        .trim(),

    body('descricao')
        .optional({ nullable: true })
        .trim(),

    body('video_url')
        .trim()
        .notEmpty()
        .withMessage('URL do vídeo é obrigatória.'),

    body('miniatura_url')
        .optional({ nullable: true })
        .trim(),

    body('reproducao_automatica')
        .optional()
        .isBoolean()
        .withMessage(
            'Reprodução automática deve ser verdadeira ou falsa.'
        ),

    body('reproducao_em_loop')
        .optional()
        .isBoolean()
        .withMessage(
            'Reprodução em loop deve ser verdadeira ou falsa.'
        ),

    body('ordem_exibicao')
        .isInt({ min: 1 })
        .withMessage(
            'Ordem de exibição deve ser um número inteiro maior que zero.'
        ),

    validarResultado
];


const validarAlteracaoInformacoes = [
    ...validarId,

    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('Título é obrigatório.'),

    body('legenda')
        .optional({ nullable: true })
        .trim(),

    body('descricao')
        .optional({ nullable: true })
        .trim(),

    body('miniatura_url')
        .optional({ nullable: true })
        .trim(),

    body('reproducao_automatica')
        .isBoolean()
        .withMessage(
            'Reprodução automática deve ser verdadeira ou falsa.'
        ),

    body('reproducao_em_loop')
        .isBoolean()
        .withMessage(
            'Reprodução em loop deve ser verdadeira ou falsa.'
        ),

    body('ordem_exibicao')
        .isInt({ min: 1 })
        .withMessage(
            'Ordem de exibição deve ser um número inteiro maior que zero.'
        ),

    validarResultado
];


const validarAlteracaoVideo = [
    ...validarId,

    body('video_url')
        .trim()
        .notEmpty()
        .withMessage('URL do vídeo é obrigatória.'),

    validarResultado
];


const validarDesativacao = [
    ...validarId,
    validarResultado
];


module.exports = {
    validarCenaId,
    validarCriacao,
    validarAlteracaoInformacoes,
    validarAlteracaoVideo,
    validarDesativacao
};
