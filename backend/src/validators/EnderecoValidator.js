const TIPOS_VALIDOS = [
    'RESIDENCIAL',
    'COBRANCA',
    'ENTREGA',
    'FISCAL',
    'COMERCIAL',
    'OUTRO'
];

function validarTipo(tipo) {
    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
        return (
            'O tipo de endereço deve ser RESIDENCIAL, COBRANCA, ' +
            'ENTREGA, FISCAL, COMERCIAL ou OUTRO.'
        );
    }

    return null;
}

function validarTextoObrigatorio(valor, campo, tamanho) {
    if (
        !valor ||
        typeof valor !== 'string' ||
        !valor.trim()
    ) {
        return `O campo ${campo} é obrigatório.`;
    }

    if (valor.length > tamanho) {
        return `O campo ${campo} deve possuir no máximo ${tamanho} caracteres.`;
    }

    return null;
}

function validarTextoOpcional(valor, campo, tamanho) {
    if (
        valor !== undefined &&
        valor !== null
    ) {
        if (typeof valor !== 'string') {
            return `O campo ${campo} deve ser texto.`;
        }

        if (valor.length > tamanho) {
            return `O campo ${campo} deve possuir no máximo ${tamanho} caracteres.`;
        }
    }

    return null;
}

function validarCep(cep) {
    if (
        !cep ||
        typeof cep !== 'string' ||
        !cep.trim()
    ) {
        return 'O CEP é obrigatório.';
    }

    if (cep.length > 8) {
        return 'O CEP deve possuir no máximo 8 caracteres.';
    }

    return null;
}

function validarUf(uf) {
    if (
        !uf ||
        typeof uf !== 'string' ||
        !uf.trim()
    ) {
        return 'A UF é obrigatória.';
    }

    if (uf.length > 2) {
        return 'A UF deve possuir no máximo 2 caracteres.';
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

function validarDados(req, res, next) {
    const {
        tipo,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        pais,
        principal
    } = req.body;

    const erros = [];

    const erroTipo = validarTipo(tipo);
    if (erroTipo) erros.push(erroTipo);

    const erroCep = validarCep(cep);
    if (erroCep) erros.push(erroCep);

    const erroLogradouro = validarTextoObrigatorio(
        logradouro,
        'logradouro',
        200
    );
    if (erroLogradouro) erros.push(erroLogradouro);

    const erroNumero = validarTextoObrigatorio(
        numero,
        'numero',
        20
    );
    if (erroNumero) erros.push(erroNumero);

    const erroComplemento = validarTextoOpcional(
        complemento,
        'complemento',
        100
    );
    if (erroComplemento) erros.push(erroComplemento);

    const erroBairro = validarTextoObrigatorio(
        bairro,
        'bairro',
        100
    );
    if (erroBairro) erros.push(erroBairro);

    const erroCidade = validarTextoObrigatorio(
        cidade,
        'cidade',
        100
    );
    if (erroCidade) erros.push(erroCidade);

    const erroUf = validarUf(uf);
    if (erroUf) erros.push(erroUf);

    const erroPais = validarTextoObrigatorio(
        pais || 'Brasil',
        'pais',
        100
    );
    if (erroPais) erros.push(erroPais);

    const erroPrincipal = validarBooleano(
        principal,
        'principal'
    );
    if (erroPrincipal) erros.push(erroPrincipal);

    if (erros.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dados do endereço inválidos.',
            details: erros
        });
    }

    next();
}

function validarCriacao(req, res, next) {
    return validarDados(req, res, next);
}

function validarAtualizacao(req, res, next) {
    return validarDados(req, res, next);
}

function validarPrincipal(req, res, next) {
    next();
}

module.exports = {
    validarCriacao,
    validarAtualizacao,
    validarPrincipal
};
