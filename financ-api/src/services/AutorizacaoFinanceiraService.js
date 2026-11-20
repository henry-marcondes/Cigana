const PermissaoFinanceira = require('../models/PermissaoFinanceira');

async function listarPermissoesEfetivas(usuarioFinanceiroId) {
    return PermissaoFinanceira.listarCodigosEfetivosPorUsuario(usuarioFinanceiroId);
}

module.exports = { listarPermissoesEfetivas };
