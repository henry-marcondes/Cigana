import { apiFetch } from './api';

export async function listarMeusEnderecos() {
    return apiFetch('/api/enderecos/minha');
}

export async function buscarMeuEndereco(id) {
    return apiFetch(`/api/enderecos/${id}`);
}

export async function criarEndereco(dados) {
    return apiFetch('/api/enderecos', {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

export async function atualizarEndereco(id, dados) {
    return apiFetch(`/api/enderecos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
    });
}

export async function definirEnderecoPrincipal(id) {
    return apiFetch(`/api/enderecos/${id}/principal`, {
        method: 'PATCH',
    });
}

export async function desativarEndereco(id) {
    return apiFetch(`/api/enderecos/${id}`, {
        method: 'DELETE',
    });
}
