const { query, validationResult } = require('express-validator');

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

function dataCalendarioValida(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return false;
    }

    const [ano] = valor.split('-').map(Number);
    if (ano < 1) return false;

    const data = new Date(`${valor}T00:00:00.000Z`);

    return Number.isFinite(data.getTime())
        && data.toISOString().slice(0, 10) === valor;
}

const validarConsultaAvaliacoesComentarios = [
    query('data_inicial')
        .notEmpty()
        .withMessage('data_inicial é obrigatória.')
        .bail()
        .custom(dataCalendarioValida)
        .withMessage('data_inicial deve ser uma data válida no formato YYYY-MM-DD.'),

    query('data_final')
        .notEmpty()
        .withMessage('data_final é obrigatória.')
        .bail()
        .custom(dataCalendarioValida)
        .withMessage('data_final deve ser uma data válida no formato YYYY-MM-DD.'),

    query('agrupamento')
        .isIn(['dia', 'mes', 'ano'])
        .withMessage('agrupamento deve ser dia, mes ou ano.'),

    query('data_final').custom((dataFinal, { req }) => {
        const dataInicial = req.query.data_inicial;

        if (!dataCalendarioValida(dataInicial) || !dataCalendarioValida(dataFinal)) {
            return true;
        }

        const inicio = Date.parse(`${dataInicial}T00:00:00.000Z`);
        const fim = Date.parse(`${dataFinal}T00:00:00.000Z`);
        const diferencaDias = (fim - inicio) / 86400000;

        if (diferencaDias < 0) {
            throw new Error('data_inicial não pode ser posterior a data_final.');
        }

        if (diferencaDias > 365) {
            throw new Error('O intervalo máximo permitido é de 365 dias.');
        }

        return true;
    }),

    validarResultado
];

module.exports = {
    validarConsultaAvaliacoesComentarios,
    dataCalendarioValida
};
