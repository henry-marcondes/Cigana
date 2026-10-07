import { apiFetch } from './api';

const pessoaService = {

    async buscarMinhaPessoa() {
        return apiFetch('/api/pessoas/minha');
    },

    async criar(dados) {
        return apiFetch('/api/pessoas', {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    },

    async atualizar(dados) {
        return apiFetch('/api/pessoas/minha', {
            method: 'PUT',
            body: JSON.stringify(dados),
        });
    },
};

export default pessoaService;
