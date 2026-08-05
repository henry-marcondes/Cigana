const Usuario = require('../../src/models/Usuario');
const PerfilUsuario = require('../../src/models/PerfilUsuario');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: PerfilUsuario');
    console.log('===================================\n');

    try {

        console.log('1. Criar usuário');

        const timestamp = Date.now();

        const usuario = await Usuario.criar({
            email: `perfil${timestamp}@ciganas.com`,
            senha_hash: 'HASH_TESTE'
        });

        console.log(usuario);

        console.log('\n2. Criar perfil');

        const perfil = await PerfilUsuario.criar({
            usuario_id: usuario.id,
            nome: 'Henry',
            sobrenome: 'Fernando Espindola Marcondes',
            nome_usuario: `henry_${timestamp}`,
            avatar_url: null,
            biografia: 'Perfil criado para teste.',
            idioma_id: null
        });

        console.log(perfil);

        console.log('\n3. Listar perfis');

        const perfis = await PerfilUsuario.listar();
        console.log(perfis);

        console.log('\n4. Buscar por ID');

        const porId = await PerfilUsuario.buscarPorId(perfil.id);
        console.log(porId);

        console.log('\n5. Buscar por usuário');

        const porUsuario = await PerfilUsuario.buscarPorUsuarioId(usuario.id);
        console.log(porUsuario);

        console.log('\n6. Buscar por nome de usuário');

        const porNomeUsuario = await PerfilUsuario.buscarPorNomeUsuario(perfil.nome_usuario);
        console.log(porNomeUsuario);

        console.log('\n7. Alterar dados pessoais');

        const dadosPessoais = await PerfilUsuario.alterarDadosPessoais(
        perfil.id,
        {
            nome: 'Henrique',
            sobrenome: 'Espindola'
        }
    );

    console.log(dadosPessoais);

    console.log('\n8. Alterar nome de usuário');

    const nomeUsuario = await PerfilUsuario.alterarNomeUsuario(
        perfil.id,
        `henrique_${timestamp}`
    );

    console.log(nomeUsuario);

    console.log('\n9. Alterar avatar');

    const avatar = await PerfilUsuario.alterarAvatar(
        perfil.id,
        'https://ciganas.com/avatar.jpg'
    );

    console.log(avatar);

    console.log('\n10. Alterar biografia');

    const biografia = await PerfilUsuario.alterarBiografia(
        perfil.id,
        'Biografia atualizada para teste.'
    );

    console.log(biografia);

    console.log('\n11. Alterar idioma');

    const idioma = await PerfilUsuario.alterarIdioma(
        perfil.id,
        null
    );

    console.log(idioma);

    console.log('\n12. Desativar perfil');

    const perfilDesativado = await PerfilUsuario.desativar(
        perfil.id
    );

    console.log(perfilDesativado);

    console.log('\n13. Buscar perfil desativado');

    const perfilInativo = await PerfilUsuario.buscarPorId(
        perfil.id
    );

    console.log(perfilInativo);



        console.log('\n===================================');
        console.log('TESTES FINALIZADOS');
        console.log('===================================\n');

    } catch (erro) {

        console.error('\nERRO NOS TESTES\n');
        console.error(erro);

    }

}

executarTestes();
