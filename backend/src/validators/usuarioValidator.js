const { error } = require('../utils/apiResponse');

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

module.exports = {
    validarCriacaoUsuario,
    validarAtualizacaoUsuario,
    validarAlteracaoSenha
}
