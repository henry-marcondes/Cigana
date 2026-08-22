const { error } = require('../utils/apiResponse');

function validarSolicitacaoVerificacaoEmail(req, res, next) {

    const { id } = req.params;

    if (!id) {
        return error(res, 'ID do usuário é obrigatório.', 400);
    }

    const uuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuid.test(id)) {
        return error(res, 'ID do usuário inválido.', 400);
    }

    next();
}

function validarConfirmacaoVerificacaoEmail(req, res, next) {

    const { id } = req.params;
    const { token } = req.body;

    const uuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!id) {
        return error(res, 'ID do usuário é obrigatório.', 400);
    }

    if (!uuid.test(id)) {
        return error(res, 'ID do usuário inválido.', 400);
    }

    if (!token) {
        return error(res, 'Token é obrigatório.', 400);
    }

    if (typeof token !== 'string') {
        return error(res, 'Token deve ser um texto.', 400);
    }

    if (!/^\d{6}$/.test(token)) {
        return error(
            res,
            'Token deve conter exatamente 6 dígitos.',
            400
        );
    }

    req.body = {
        token: token.trim()
    };

    next();
}

function validarCriacaoUsuario(req, res, next) {

    let { email, senha } = req.body;
    if (!email) {
        return error(res,'E-mail é obrigatório.', 400);
    }
    if (!senha) {
        return error(res, 'Senha é obrigatória', 400);
    }
    // Sanitização
    email = String(email).trim().toLowerCase();
    senha = String(senha);
    // Atualiza o body com dados sanitizados
    req.body = {email, senha};
    next();
}

function validarAtualizacaoUsuario(req, res, next) {

    let { email } = req.body;
    if (!email) {
        return error(res, 'E-mail é obrigatório.', 400);
    }
    email = String(email).trim().toLowerCase();
    req.body = {email};
    next();
}

function validarAlteracaoSenha(req, res, next){

    const { senha } = req.body;
    if(!senha){ return error(res,'Senha é obrigatória',400);} 

    if(typeof senha !== 'string'){
    return error(res,'Senha deve ser um texto.');
    }
    if(senha.length < 8){
        return error(res,'Senha deve possuir no mínimo 8 caracteres.',400);
    }

    req.body = {senha: senha.trim()
    };

    next();
}

function validarSolicitacaoAlteracaoSenha(req, res, next) {

    const { id } = req.params;

    const uuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!id) {
        return error(res, 'ID do usuário é obrigatório.', 400);
    }

    if (!uuid.test(id)) {
        return error(res, 'ID do usuário inválido.', 400);
    }

    next();
}

function validarConfirmacaoAlteracaoSenha(req, res, next) {

    const { id } = req.params;
    const { token, senha } = req.body;

    const uuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!id) {
        return error(res, 'ID do usuário é obrigatório.', 400);
    }

    if (!uuid.test(id)) {
        return error(res, 'ID do usuário inválido.', 400);
    }

    if (!token) {
        return error(res, 'Token é obrigatório.', 400);
    }

    if (typeof token !== 'string') {
        return error(res, 'Token deve ser um texto.', 400);
    }

    if (!/^\d{6}$/.test(token)) {
        return error(
            res,
            'Token deve conter exatamente 6 dígitos.',
            400
        );
    }

    if (!senha) {
        return error(res, 'Senha é obrigatória.', 400);
    }

    if (typeof senha !== 'string') {
        return error(res, 'Senha deve ser um texto.', 400);
    }

    if (senha.length < 8) {
        return error(
            res,
            'Senha deve possuir no mínimo 8 caracteres.',
            400
        );
    }

    req.body = {
        token: token.trim(),
        senha: senha.trim()
    };

    next();
}

function validarSolicitacaoRecuperacaoSenha(req, res, next) {

    let { email } = req.body;

    if (!email) {
        return error(res, 'E-mail é obrigatório.', 400);
    }

    email = String(email).trim().toLowerCase();

    req.body = { email };

    next();
}

function validarConfirmacaoRecuperacaoSenha(req, res, next) {

    let { email, token, senha } = req.body;

    if (!email) {
        return error(res, 'E-mail é obrigatório.', 400);
    }

    if (!token) {
        return error(res, 'Token é obrigatório.', 400);
    }

    if (typeof token !== 'string') {
        return error(res, 'Token deve ser um texto.', 400);
    }

    if (!/^\d{6}$/.test(token)) {
        return error(
            res,
            'Token deve conter exatamente 6 dígitos.',
            400
        );
    }

    if (!senha) {
        return error(res, 'Senha é obrigatória.', 400);
    }

    if (typeof senha !== 'string') {
        return error(res, 'Senha deve ser um texto.', 400);
    }

    if (senha.length < 8) {
        return error(
            res,
            'Senha deve possuir no mínimo 8 caracteres.',
            400
        );
    }

    email = String(email).trim().toLowerCase();
    token = token.trim();
    senha = senha.trim();

    req.body = {
        email,
        token,
        senha
    };

    next();
}

module.exports = {
    validarCriacaoUsuario,
    validarAtualizacaoUsuario,
    validarAlteracaoSenha,
    validarSolicitacaoVerificacaoEmail,
    validarConfirmacaoVerificacaoEmail,
    validarSolicitacaoAlteracaoSenha,
    validarConfirmacaoAlteracaoSenha,
    validarSolicitacaoRecuperacaoSenha,
    validarConfirmacaoRecuperacaoSenha
}
