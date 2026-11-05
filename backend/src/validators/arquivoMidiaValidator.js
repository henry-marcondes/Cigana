const { body, header, param, query, validationResult } = require('express-validator');

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

const validarArquivoId = [
    param('id')
        .isUUID()
        .withMessage('id deve ser um UUID válido.'),
    validarResultado
];

const validarPastaOpcional = [
    query('pasta_id')
        .optional()
        .isUUID()
        .withMessage('pasta_id deve ser um UUID válido.'),
    validarResultado
];

const validarUpload = [
    header('x-nome-original')
        .custom((nome) => typeof nome === 'string' && nome.trim() !== '')
        .withMessage('O cabeçalho X-Nome-Original é obrigatório.'),
    validarResultado
];

const validarRenomeacao = [
    body('nome_original')
        .isString()
        .withMessage('nome_original deve ser um texto.')
        .bail()
        .custom((nome) => nome.trim() !== '')
        .withMessage('nome_original não pode ser vazio ou conter somente espaços.'),
    validarResultado
];

const validarMovimentacao = [
    body('pasta_id')
        .custom((id, { req }) => (
            Object.prototype.hasOwnProperty.call(req.body, 'pasta_id') &&
            (id === null || (
                typeof id === 'string' &&
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
            ))
        ))
        .withMessage('pasta_id é obrigatório e deve ser um UUID válido ou nulo.'),
    validarResultado
];

module.exports = {
    validarLivroId,
    validarArquivoId,
    validarPastaOpcional,
    validarUpload,
    validarRenomeacao,
    validarMovimentacao
};
