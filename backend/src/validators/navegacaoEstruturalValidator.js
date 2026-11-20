const { body, param, validationResult } = require('express-validator');

const validarResultado = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    return next();
};

const validarUuidParam = (nome) => param(nome)
    .isUUID()
    .withMessage(`${nome} deve ser um UUID válido.`);

const validarListagem = [validarUuidParam('cena_origem_id'), validarResultado];

const validarBusca = [validarUuidParam('id'), validarResultado];

const validarCriacao = [
    body('cena_origem_id').isUUID().withMessage('cena_origem_id deve ser um UUID válido.'),
    body('cena_destino_id').isUUID().withMessage('cena_destino_id deve ser um UUID válido.'),
    body('rotulo').isString().trim().notEmpty().withMessage('rotulo é obrigatório.'),
    body('ordem_exibicao').isInt({ min: 1 }).withMessage('ordem_exibicao deve ser um inteiro maior ou igual a 1.'),
    validarResultado,
];

const validarAlteracao = [
    validarUuidParam('id'),
    body('cena_destino_id').isUUID().withMessage('cena_destino_id deve ser um UUID válido.'),
    body('rotulo').isString().trim().notEmpty().withMessage('rotulo é obrigatório.'),
    validarResultado,
];

const validarReordenacao = [
    body('cena_origem_id').isUUID().withMessage('cena_origem_id deve ser um UUID válido.'),
    body('ordem').isArray({ min: 1 }).withMessage('ordem deve conter os botões ativos da cena.'),
    body('ordem.*.id').isUUID().withMessage('Cada botão deve possuir um id UUID válido.'),
    validarResultado,
];

const validarDesativacao = [validarUuidParam('id'), validarResultado];

module.exports = {
    validarListagem,
    validarBusca,
    validarCriacao,
    validarAlteracao,
    validarReordenacao,
    validarDesativacao,
};
