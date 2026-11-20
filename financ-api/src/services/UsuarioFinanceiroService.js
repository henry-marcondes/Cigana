const UsuarioFinanceiro = require('../models/UsuarioFinanceiro');

async function buscarResumoUsuario(usuarioFinanceiroId) {
    return UsuarioFinanceiro.buscarSituacaoEPermissoes(usuarioFinanceiroId);
}

module.exports = { buscarResumoUsuario };
