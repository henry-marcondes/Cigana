const { body } = require('express-validator');

const TIPOS_PESSOA = ['FISICA', 'JURIDICA'];

const validarTipoPessoa = body('tipo_pessoa')
    .trim()
    .notEmpty()
    .withMessage('Tipo de pessoa é obrigatório.')
    .isIn(TIPOS_PESSOA)
    .withMessage('Tipo de pessoa deve ser FISICA ou JURIDICA.');

const validarPessoaFisica = [
    body('pessoa_fisica')
        .if(body('tipo_pessoa').equals('FISICA'))
        .notEmpty()
        .withMessage('Dados de pessoa física são obrigatórios.'),

    body('pessoa_fisica.nome')
        .if(body('tipo_pessoa').equals('FISICA'))
        .trim()
        .notEmpty()
        .withMessage('Nome é obrigatório.')
        .isLength({ max: 100 })
        .withMessage('Nome deve ter no máximo 100 caracteres.'),

    body('pessoa_fisica.sobrenome')
        .if(body('tipo_pessoa').equals('FISICA'))
        .trim()
        .notEmpty()
        .withMessage('Sobrenome é obrigatório.')
        .isLength({ max: 100 })
        .withMessage('Sobrenome deve ter no máximo 100 caracteres.'),

    body('pessoa_fisica.data_nascimento')
        .if(body('tipo_pessoa').equals('FISICA'))
        .optional({ values: 'null' })
        .isISO8601()
        .withMessage('Data de nascimento inválida.'),

    body('pessoa_fisica.cpf')
        .if(body('tipo_pessoa').equals('FISICA'))
        .optional({ values: 'null' })
        .trim()
        .matches(/^\d{11}$/)
        .withMessage('CPF deve conter 11 dígitos.'),

    body('pessoa_fisica.rg')
        .if(body('tipo_pessoa').equals('FISICA'))
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 30 })
        .withMessage('RG deve ter no máximo 30 caracteres.'),

    body('pessoa_fisica.orgao_expedidor_rg')
        .if(body('tipo_pessoa').equals('FISICA'))
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Órgão expedidor do RG deve ter no máximo 100 caracteres.'),

    body('pessoa_fisica.uf_expedidor_rg')
        .if(body('tipo_pessoa').equals('FISICA'))
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 2 })
        .withMessage('UF expedidora deve ter no máximo 2 caracteres.')
];

const validarPessoaJuridica = [
    body('pessoa_juridica')
        .if(body('tipo_pessoa').equals('JURIDICA'))
        .notEmpty()
        .withMessage('Dados de pessoa jurídica são obrigatórios.'),

    body('pessoa_juridica.razao_social')
        .if(body('tipo_pessoa').equals('JURIDICA'))
        .trim()
        .notEmpty()
        .withMessage('Razão social é obrigatória.')
        .isLength({ max: 150 })
        .withMessage('Razão social deve ter no máximo 150 caracteres.'),

    body('pessoa_juridica.nome_fantasia')
        .if(body('tipo_pessoa').equals('JURIDICA'))
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 150 })
        .withMessage('Nome fantasia deve ter no máximo 150 caracteres.'),

    body('pessoa_juridica.cnpj')
        .if(body('tipo_pessoa').equals('JURIDICA'))
        .optional({ values: 'null' })
        .trim()
        .matches(/^\d{14}$/)
        .withMessage('CNPJ deve conter 14 dígitos.'),

    body('pessoa_juridica.inscricao_estadual')
        .if(body('tipo_pessoa').equals('JURIDICA'))
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 30 })
        .withMessage('Inscrição estadual deve ter no máximo 30 caracteres.'),

    body('pessoa_juridica.inscricao_municipal')
        .if(body('tipo_pessoa').equals('JURIDICA'))
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 30 })
        .withMessage('Inscrição municipal deve ter no máximo 30 caracteres.')
];

const validarPessoa = [
    validarTipoPessoa,
    ...validarPessoaFisica,
    ...validarPessoaJuridica
];

module.exports = {
    validarPessoa,
    validarTipoPessoa,
    validarPessoaFisica,
    validarPessoaJuridica
};
