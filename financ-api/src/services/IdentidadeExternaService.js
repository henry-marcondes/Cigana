const IdentidadeExterna = require('../models/IdentidadeExterna');

async function resolverIdentidade(issuer, usuarioIdExterno) {
    const identidade = await IdentidadeExterna.buscarIdentidadeAtiva(
        issuer,
        usuarioIdExterno
    );

    if (!identidade) return null;

    return {
        usuarioFinanceiroId: identidade.usuario_financeiro_id,
        plataformaCodigo: identidade.plataforma_codigo
    };
}

module.exports = { resolverIdentidade };
