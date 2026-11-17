const { body, param } = require('express-validator');

const validarUUID = (campo) =>
    param(campo)
        .isUUID()
        .withMessage(`${campo} inválido.`);

const validarTipoConteudo = body('tipo_conteudo')
    .trim()
    .notEmpty()
    .withMessage('Tipo de conteúdo é obrigatório.')
    .isIn([
        'TEXTO',
        'IMAGEM',
        'AUDIO',
        'VIDEO'
    ])
    .withMessage(
        'Tipo de conteúdo deve ser TEXTO, IMAGEM, AUDIO ou VIDEO.'
    );

const validarCriacaoCenaConteudo = [
    body('cena_id')
        .notEmpty()
        .withMessage('ID da cena é obrigatório.')
        .isUUID()
        .withMessage('ID da cena inválido.'),

    validarTipoConteudo,

    body().custom((dados) => {
        const possuiConteudo = Boolean(dados.conteudo_id);
        const possuiArquivo = Boolean(dados.arquivo_id);
        if (possuiConteudo === possuiArquivo) {
            throw new Error('Informe somente conteudo_id ou arquivo_id.');
        }
        if (possuiArquivo && !['IMAGEM', 'AUDIO', 'VIDEO'].includes(dados.tipo_conteudo)) {
            throw new Error('Arquivo do Storage deve ser associado como IMAGEM, AUDIO ou VIDEO.');
        }
        return true;
    }),

    body('conteudo_id').if(body('arquivo_id').not().exists())
        .notEmpty().withMessage('ID do conteúdo é obrigatório.')
        .isUUID().withMessage('ID do conteúdo inválido.'),

    body('arquivo_id').if(body('conteudo_id').not().exists())
        .notEmpty().withMessage('ID do arquivo é obrigatório.')
        .isUUID().withMessage('ID do arquivo inválido.'),

    body('ordem_exibicao')
        .notEmpty()
        .withMessage('Ordem de exibição é obrigatória.')
        .isInt({ min: 1 })
        .withMessage('Ordem de exibição deve ser um número inteiro maior que zero.')
];

const validarAlteracaoOrdem = [
    validarUUID('id'),

    body('ordem_exibicao')
        .notEmpty()
        .withMessage('Ordem de exibição é obrigatória.')
        .isInt({ min: 1 })
        .withMessage('Ordem de exibição deve ser um número inteiro maior que zero.')
];

const validarAlteracaoTipoConteudo = [
    validarUUID('id'),

    validarTipoConteudo
];

const validarIdCenaConteudo = [
    validarUUID('id')
];

const validarIdCena = [
    validarUUID('cena_id')
];

const validarIdLivro = [
    validarUUID('livro_id')
];

const validarReordenacao = [
    body('cena_id')
        .notEmpty()
        .withMessage('ID da cena é obrigatório.')
        .isUUID()
        .withMessage('ID da cena inválido.'),

    body('ordem')
        .isArray({ min: 1 })
        .withMessage('Ordem deve ser um array com pelo menos um conteúdo.'),

    body('ordem.*.id')
        .notEmpty()
        .withMessage('ID do conteúdo é obrigatório.')
        .isUUID()
        .withMessage('ID do conteúdo inválido.')
];

module.exports = {
    validarCriacaoCenaConteudo,
    validarAlteracaoOrdem,
    validarAlteracaoTipoConteudo,
    validarIdCenaConteudo,
    validarIdCena,
    validarIdLivro,
    validarReordenacao
};
