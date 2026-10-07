import { apiFetch } from './api';

export async function listarMeusTelefones() {
    return apiFetch('/api/telefones/minha');
}

export async function buscarMeuTelefone(id) {
    return apiFetch(`/api/telefones/${id}`);
}

export async function criarTelefone(dados) {
    return apiFetch('/api/telefones', {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

export async function atualizarTelefone(id, dados) {
    return apiFetch(`/api/telefones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
    });
}

export async function definirTelefonePrincipal(id) {
    return apiFetch(`/api/telefones/${id}/principal`, {
        method: 'PATCH',
    });
}

export async function desativarTelefone(id) {
    return apiFetch(`/api/telefones/${id}`, {
        method: 'DELETE',
    });
}
