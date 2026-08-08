const { body, param, validationResult } = require('express-validator');

const validar = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Erro de validação.',
            errors: errors.array()
        });
    }

    next();
};

const validarBuscaPorId = [
    param('id')
        .isUUID()
        .withMessage('ID do perfil inválido.'), 
    validar
];

const validarCriacaoPerfil = [
    body('usuario_id')
        .isUUID()
        .withMessage('Usuário inválido.'),

    body('nome')
        .trim()
        .notEmpty()
        .withMessage('Nome é obrigatório.')
        .isLength({ max: 100 }),

    body('sobrenome')
        .optional()
        .trim()
        .isLength({ max: 100 }),

    body('nome_usuario')
        .trim()
        .notEmpty()
        .withMessage('Nome de usuário é obrigatório.')
        .isLength({ min: 3, max: 50 })
        .matches(/^[a-zA-Z0-9_.]+$/)
        .withMessage('Nome de usuário inválido.'),

    body('avatar_url')
        .optional({ nullable: true })
        .isURL()
        .withMessage('Avatar deve ser uma URL válida.'),

    body('biografia')
        .optional()
        .trim()
        .isLength({ max: 1000 }),

    body('idioma_id')
        .isUUID()
        .withMessage('Idioma inválido.'),

    validar
];

const validarAlteracaoDadosPessoais = [
    body('nome')
        .trim()
        .notEmpty()
        .withMessage('Nome é obrigatório.')
        .isLength({ max: 100 }),

    body('sobrenome')
        .optional()
        .trim()
        .isLength({ max: 100 }),

    validar
];

const validarAlteracaoNomeUsuario = [
    body('nome_usuario')
        .trim()
        .notEmpty()
        .withMessage('Nome de usuário é obrigatório.')
        .isLength({ min: 3, max: 50 })
        .matches(/^[a-zA-Z0-9_.]+$/)
        .withMessage('Nome de usuário inválido.'),

    validar
];

const validarAlteracaoAvatar = [
    body('avatar_url')
        .isURL()
        .withMessage('Avatar deve ser uma URL válida.'),

    validar
];

const validarAlteracaoBiografia = [
    body('biografia')
        .optional()
        .trim()
        .isLength({ max: 1000 }),

    validar
];

const validarAlteracaoIdioma = [
    body('idioma_id')
        .isUUID()
        .withMessage('Idioma inválido.'),

    validar
];

module.exports = {
    validarCriacaoPerfil,
    validarAlteracaoDadosPessoais,
    validarAlteracaoNomeUsuario,
    validarAlteracaoAvatar,
    validarAlteracaoBiografia,
    validarAlteracaoIdioma,
    validarBuscaPorId
};
