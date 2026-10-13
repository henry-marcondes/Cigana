const { body, validationResult } = require('express-validator');

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

const TIPOS_PESSOA = ['FISICA', 'JURIDICA'];

function todosDigitosIguais(documento) {
    return /^([0-9])\1+$/.test(documento);
}

function calcularDigitoVerificador(documento, pesos) {
    const soma = documento
        .split('')
        .reduce((total, digito, indice) => (
            total + Number(digito) * pesos[indice]
        ), 0);
    const resto = soma % 11;

    return resto < 2 ? 0 : 11 - resto;
}

function validarCpf(cpf) {
    if (typeof cpf !== 'string' || !/^\d{11}$/.test(cpf) ||
        todosDigitosIguais(cpf)) {
        return false;
    }

    const primeiroDigito = calcularDigitoVerificador(
        cpf.slice(0, 9),
        [10, 9, 8, 7, 6, 5, 4, 3, 2]
    );
    const segundoDigito = calcularDigitoVerificador(
        cpf.slice(0, 10),
        [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
    );

    return cpf[9] === String(primeiroDigito) &&
        cpf[10] === String(segundoDigito);
}

function validarCnpj(cnpj) {
    if (typeof cnpj !== 'string' || !/^\d{14}$/.test(cnpj) ||
        todosDigitosIguais(cnpj)) {
        return false;
    }

    const primeiroDigito = calcularDigitoVerificador(
        cnpj.slice(0, 12),
        [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    );
    const segundoDigito = calcularDigitoVerificador(
        cnpj.slice(0, 13),
        [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    );

    return cnpj[12] === String(primeiroDigito) &&
        cnpj[13] === String(segundoDigito);
}

const validarTipoPessoa = body('tipo_pessoa')
    .trim()
    .notEmpty()
    .withMessage('Tipo de pessoa é obrigatório.')
    .isIn(TIPOS_PESSOA)
    .withMessage('Tipo de pessoa deve ser FISICA ou JURIDICA.');

const validarCamposPessoaFisica = (condicao) => [
    body('pessoa_fisica')
        .if(condicao)
        .notEmpty()
        .withMessage('Dados de pessoa física são obrigatórios.'),

    body('pessoa_fisica.nome')
        .if(condicao)
        .trim()
        .notEmpty()
        .withMessage('Nome é obrigatório.')
        .isLength({ max: 100 })
        .withMessage('Nome deve ter no máximo 100 caracteres.'),

    body('pessoa_fisica.sobrenome')
        .if(condicao)
        .trim()
        .notEmpty()
        .withMessage('Sobrenome é obrigatório.')
        .isLength({ max: 100 })
        .withMessage('Sobrenome deve ter no máximo 100 caracteres.'),

    body('pessoa_fisica.data_nascimento')
        .if(condicao)
        .optional({ values: 'null' })
        .isISO8601()
        .withMessage('Data de nascimento inválida.'),

    body('pessoa_fisica.cpf')
        .if(condicao)
        .optional({ values: 'null' })
        .trim()
        .matches(/^\d{11}$/)
        .withMessage('CPF deve conter 11 dígitos.')
        .bail()
        .custom(validarCpf)
        .withMessage('CPF inválido.'),

    body('pessoa_fisica.rg')
        .if(condicao)
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 30 })
        .withMessage('RG deve ter no máximo 30 caracteres.'),

    body('pessoa_fisica.orgao_expedidor_rg')
        .if(condicao)
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Órgão expedidor do RG deve ter no máximo 100 caracteres.'),

    body('pessoa_fisica.uf_expedidor_rg')
        .if(condicao)
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 2 })
        .withMessage('UF expedidora deve ter no máximo 2 caracteres.')
];

const validarCamposPessoaJuridica = (condicao) => [
    body('pessoa_juridica')
        .if(condicao)
        .notEmpty()
        .withMessage('Dados de pessoa jurídica são obrigatórios.'),

    body('pessoa_juridica.razao_social')
        .if(condicao)
        .trim()
        .notEmpty()
        .withMessage('Razão social é obrigatória.')
        .isLength({ max: 150 })
        .withMessage('Razão social deve ter no máximo 150 caracteres.'),

    body('pessoa_juridica.nome_fantasia')
        .if(condicao)
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 150 })
        .withMessage('Nome fantasia deve ter no máximo 150 caracteres.'),

    body('pessoa_juridica.cnpj')
        .if(condicao)
        .optional({ values: 'null' })
        .trim()
        .matches(/^\d{14}$/)
        .withMessage('CNPJ deve conter 14 dígitos.')
        .bail()
        .custom(validarCnpj)
        .withMessage('CNPJ inválido.'),

    body('pessoa_juridica.inscricao_estadual')
        .if(condicao)
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 30 })
        .withMessage('Inscrição estadual deve ter no máximo 30 caracteres.'),

    body('pessoa_juridica.inscricao_municipal')
        .if(condicao)
        .optional({ values: 'null' })
        .trim()
        .isLength({ max: 30 })
        .withMessage('Inscrição municipal deve ter no máximo 30 caracteres.')
];

const validarPessoaFisica = validarCamposPessoaFisica(
    (value, { req }) => req.body.tipo_pessoa === 'FISICA'
);

const validarPessoaJuridica = validarCamposPessoaJuridica(
    (value, { req }) => req.body.tipo_pessoa === 'JURIDICA'
);

const validarCriacaoPessoa = [
    validarTipoPessoa,
    ...validarPessoaFisica,
    ...validarPessoaJuridica,
    validarResultado
];

const validarAtualizacaoPessoa = [
    body().custom((_, { req }) => {
        const possuiPessoaFisica = req.body.pessoa_fisica !== undefined &&
            req.body.pessoa_fisica !== null;
        const possuiPessoaJuridica = req.body.pessoa_juridica !== undefined &&
            req.body.pessoa_juridica !== null;

        if (!possuiPessoaFisica && !possuiPessoaJuridica) {
            throw new Error('Informe os dados de pessoa física ou jurídica.');
        }

        return true;
    }),
    ...validarCamposPessoaFisica(
        (value, { req }) => req.body.pessoa_fisica !== undefined &&
            req.body.pessoa_fisica !== null
    ),
    ...validarCamposPessoaJuridica(
        (value, { req }) => req.body.pessoa_juridica !== undefined &&
            req.body.pessoa_juridica !== null
    ),
    validarResultado
];

module.exports = {
    validarCriacaoPessoa,
    validarAtualizacaoPessoa,
    validarTipoPessoa,
    validarPessoaFisica,
    validarPessoaJuridica,
    validarCpf,
    validarCnpj
};
