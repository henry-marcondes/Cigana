import { apiFetch } from './api';

// =====================================================
// CONTRATOS
// =====================================================

export async function listarContratos(filtros = {}) {
    const params = new URLSearchParams();

    if (filtros.ativo !== undefined && filtros.ativo !== null) {
        params.append('ativo', filtros.ativo);
    }

    if (filtros.tipo) {
        params.append('tipo', filtros.tipo);
    }

    const query = params.toString();

    return apiFetch(
        `/api/contratos${query ? `?${query}` : ''}`
    );
}

export async function buscarContratoPorId(id) {
    return apiFetch(`/api/contratos/${id}`);
}

export async function buscarContratoPorCodigo(codigo) {
    return apiFetch(`/api/contratos/codigo/${codigo}`);
}

export async function criarContrato(dados) {
    return apiFetch('/api/contratos', {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

export async function atualizarContrato(id, dados) {
    return apiFetch(`/api/contratos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
    });
}

export async function ativarContrato(id) {
    return apiFetch(`/api/contratos/${id}/ativar`, {
        method: 'PATCH',
    });
}

export async function desativarContrato(id) {
    return apiFetch(`/api/contratos/${id}/desativar`, {
        method: 'PATCH',
    });
}

// =====================================================
// VERSÕES
// =====================================================

export async function listarVersoesContrato(contratoId) {
    return apiFetch(`/api/contratos/${contratoId}/versoes`);
}

export async function buscarVersaoAtiva(contratoId) {
    return apiFetch(`/api/contratos/${contratoId}/versao-ativa`);
}

export async function buscarVersaoPorId(id) {
    return apiFetch(`/api/contratos/versoes/${id}`);
}

export async function criarVersaoContrato(contratoId, dados) {
    return apiFetch(`/api/contratos/${contratoId}/versoes`, {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

export async function atualizarVersaoContrato(id, dados) {
    return apiFetch(`/api/contratos/versoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
    });
}

export async function publicarVersaoContrato(id) {
    return apiFetch(`/api/contratos/versoes/${id}/publicar`, {
        method: 'PATCH',
    });
}

export async function encerrarVersaoContrato(id) {
    return apiFetch(`/api/contratos/versoes/${id}/encerrar`, {
        method: 'PATCH',
    });
}

// =====================================================
// VÍNCULO COM OBRAS
// =====================================================

export async function listarObrasPorContrato(contratoId) {
    return apiFetch(`/api/contratos/${contratoId}/obras`);
}

export async function vincularContratoObra(contratoId, livroId) {
    return apiFetch(`/api/contratos/${contratoId}/obras`, {
        method: 'POST',
        body: JSON.stringify({
            livro_id: livroId,
        }),
    });
}

export async function listarContratosPorObra(livroId) {
    return apiFetch(`/api/contratos/obras/${livroId}`);
}

export async function buscarContratoObraPorId(id) {
    return apiFetch(`/api/contratos/obras/vinculos/${id}`);
}

export async function desvincularContratoObra(id) {
    return apiFetch(`/api/contratos/obras/vinculos/${id}`, {
        method: 'DELETE',
    });
}

// =====================================================
// ACEITES
// =====================================================

export async function listarAceitesPorUsuario(usuarioId) {
    return apiFetch(`/api/contratos/aceites/usuario/${usuarioId}`);
}

export async function listarAceitesPorVersao(contratoVersaoId) {
    return apiFetch(
        `/api/contratos/aceites/versao/${contratoVersaoId}`
    );
}

export async function buscarAceitePorId(id) {
    return apiFetch(`/api/contratos/aceites/${id}`);
}

export async function verificarAceite(
    usuarioId,
    contratoVersaoId
) {
    return apiFetch(
        `/api/contratos/aceites/usuario/${usuarioId}/versao/${contratoVersaoId}`
    );
}

export async function aceitarContrato(contratoVersaoId, dados = {}) {
    return apiFetch(
        `/api/contratos/versoes/${contratoVersaoId}/aceite`,
        {
            method: 'POST',
            body: JSON.stringify(dados),
        }
    );
}
