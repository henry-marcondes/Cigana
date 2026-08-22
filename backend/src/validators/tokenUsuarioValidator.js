const { body } = require('express-validator');

const finalidadesValidas = [
    'VERIFICACAO_EMAIL',
    'ALTERACAO_SENHA',
    'RECUPERACAO_SENHA'
];

const validarFinalidade = body('finalidade')
    .notEmpty()
    .withMessage('Finalidade é obrigatória.')
    .isIn(finalidadesValidas)
    .withMessage(
        'Finalidade deve ser VERIFICACAO_EMAIL, ALTERACAO_SENHA ou RECUPERACAO_SENHA.'
    );

const validarUsuarioId = body('usuario_id')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório.')
    .isUUID()
    .withMessage('ID do usuário inválido.');

const validarToken = body('token')
    .notEmpty()
    .withMessage('Token é obrigatório.')
    .matches(/^\d{6}$/)
    .withMessage('Token deve conter exatamente 6 dígitos.');

const validarCriacaoToken = [
    validarUsuarioId,
    validarFinalidade
];

const validarValidacaoToken = [
    validarUsuarioId,
    validarFinalidade,
    validarToken
];

const validarInvalidacaoToken = [
    validarUsuarioId,
    validarFinalidade
];

module.exports = {
    validarCriacaoToken,
    validarValidacaoToken,
    validarInvalidacaoToken
};
