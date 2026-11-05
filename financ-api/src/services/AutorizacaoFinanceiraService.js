const PermissaoFinanceira = require('../models/PermissaoFinanceira');

async function listarPermissoesEfetivas(usuarioIdExterno) {
    return PermissaoFinanceira.listarCodigosEfetivosPorUsuario(usuarioIdExterno);
}

module.exports = { listarPermissoesEfetivas };
