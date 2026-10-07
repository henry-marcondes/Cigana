const TIPOS_VALIDOS = [
    'CELULAR',
    'FIXO',
    'COMERCIAL',
    'OUTRO'
];

function validarTipo(tipo) {
    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
        return 'O tipo de telefone deve ser CELULAR, FIXO, COMERCIAL ou OUTRO.';
    }

    return null;
}

function validarNumero(numero) {
    if (!numero || typeof numero !== 'string' || !numero.trim()) {
        return 'O número do telefone é obrigatório.';
    }

    if (numero.length > 20) {
        return 'O número do telefone deve possuir no máximo 20 caracteres.';
    }

    return null;
}

function validarCodigoPais(codigoPais) {
    if (
        codigoPais !== undefined &&
        codigoPais !== null &&
        (
            typeof codigoPais !== 'string' ||
            codigoPais.length > 5
        )
    ) {
        return 'O código do país deve possuir no máximo 5 caracteres.';
    }

    return null;
}

function validarDdd(ddd) {
    if (
        ddd !== undefined &&
        ddd !== null &&
        (
            typeof ddd !== 'string' ||
            ddd.length > 3
        )
    ) {
        return 'O DDD deve possuir no máximo 3 caracteres.';
    }

    return null;
}

function validarBooleano(valor, campo) {
    if (
        valor !== undefined &&
        valor !== null &&
        typeof valor !== 'boolean'
    ) {
        return `O campo ${campo} deve ser booleano.`;
    }

    return null;
}

function validarCriacao(req, res, next) {
    const {
        tipo,
        codigo_pais,
        ddd,
        numero,
        numero_normalizado,
        principal
    } = req.body;

    const erros = [];

    const erroTipo = validarTipo(tipo);
    if (erroTipo) erros.push(erroTipo);

    const erroCodigoPais = validarCodigoPais(codigo_pais);
    if (erroCodigoPais) erros.push(erroCodigoPais);

    const erroDdd = validarDdd(ddd);
    if (erroDdd) erros.push(erroDdd);

    const erroNumero = validarNumero(numero);
    if (erroNumero) erros.push(erroNumero);

    const erroPrincipal = validarBooleano(principal, 'principal');
    if (erroPrincipal) erros.push(erroPrincipal);

    if (erros.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dados do telefone inválidos.',
            details: erros
        });
    }

    next();
}

function validarAtualizacao(req, res, next) {
    const {
        tipo,
        codigo_pais,
        ddd,
        numero,
        numero_normalizado,
        principal
    } = req.body;

    const erros = [];

    const erroTipo = validarTipo(tipo);
    if (erroTipo) erros.push(erroTipo);

    const erroCodigoPais = validarCodigoPais(codigo_pais);
    if (erroCodigoPais) erros.push(erroCodigoPais);

    const erroDdd = validarDdd(ddd);
    if (erroDdd) erros.push(erroDdd);

    const erroNumero = validarNumero(numero);
    if (erroNumero) erros.push(erroNumero);

    const erroNumeroNormalizado =
        validarNumeroNormalizado(numero_normalizado);

    if (erroNumeroNormalizado) {
        erros.push(erroNumeroNormalizado);
    }

    const erroPrincipal = validarBooleano(principal, 'principal');
    if (erroPrincipal) erros.push(erroPrincipal);

    if (erros.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dados do telefone inválidos.',
            details: erros
        });
    }

    next();
}

function validarPrincipal(req, res, next) {
    next();
}

module.exports = {
    validarCriacao,
    validarAtualizacao,
    validarPrincipal
};
