const PerfilUsuario = require('../models/PerfilUsuario');
const Usuario = require('../models/Usuario');


class PerfilUsuarioService {


    async listarPerfis() {
        return await PerfilUsuario.listar();
    }


    async buscarPerfilPorId(id) {

        const perfil = await PerfilUsuario.buscarPorId(id);

        if (!perfil) {
            throw new Error('Perfil de usuário não encontrado');
        }

        return perfil;
    }


    async buscarPerfilPorUsuario(usuario_id) {

        const perfil = await PerfilUsuario.buscarPorUsuarioId(usuario_id);

        if (!perfil) {
            throw new Error('Perfil do usuário não encontrado');
        }

        return perfil;
    }


    async criarPerfil(dados) {

        const usuario = await Usuario.buscarPorId(dados.usuario_id);

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }


        const perfilExistente =
            await PerfilUsuario.buscarPorUsuarioId(dados.usuario_id);


        if (perfilExistente) {
            throw new Error('Usuário já possui perfil cadastrado');
        }


        const nomeExistente =
            await PerfilUsuario.buscarPorNomeUsuario(dados.nome_usuario);


        if (nomeExistente) {
            throw new Error('Nome de usuário já utilizado');
        }


        return await PerfilUsuario.criar(dados);
    }


    async alterarDadosPessoais(id, dados) {

        const perfil = await this.buscarPerfilPorId(id);

        return await PerfilUsuario.alterarDadosPessoais(
            perfil.id,
            dados
        );
    }


    async alterarNomeUsuario(id, nome_usuario) {

        const existente =
            await PerfilUsuario.buscarPorNomeUsuario(nome_usuario);


        if (existente && existente.id !== id) {
            throw new Error('Nome de usuário já utilizado');
        }


        return await PerfilUsuario.alterarNomeUsuario(
            id,
            nome_usuario
        );
    }


    async alterarAvatar(id, avatar_url) {

        await this.buscarPerfilPorId(id);

        return await PerfilUsuario.alterarAvatar(
            id,
            avatar_url
        );
    }


    async alterarBiografia(id, biografia) {

        await this.buscarPerfilPorId(id);

        return await PerfilUsuario.alterarBiografia(
            id,
            biografia
        );
    }


    async alterarIdioma(id, idioma_id) {

        await this.buscarPerfilPorId(id);

        return await PerfilUsuario.alterarIdioma(
            id,
            idioma_id
        );
    }


    async excluirPerfil(id) {

        await this.buscarPerfilPorId(id);

        return await PerfilUsuario.desativar(id);
    }

}


module.exports = new PerfilUsuarioService();
