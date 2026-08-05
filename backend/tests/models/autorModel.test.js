const Usuario = require('../../src/models/Usuario');
const Autor = require('../../src/models/Autor');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTES MODEL: Autor');
    console.log('===================================\n');

    try {

        const timestamp = Date.now();

        console.log('1. Criar usuário');

        const usuario = await Usuario.criar({
            email: `autor${timestamp}@ciganas.com`,
            senha_hash: 'HASH_TESTE'
        });

        console.log(usuario);

        console.log('\n2. Criar autor');

        const autor = await Autor.criar({
            usuario_id: usuario.id,
            nome_publico: 'Autor Teste',
            biografia: 'Biografia inicial.',
            foto_url: null
        });

        console.log(autor);

        console.log('\n3. Listar autores');

        const autores = await Autor.listar();
        console.log(autores);

        console.log('\n4. Buscar por ID');

        const porId = await Autor.buscarPorId(autor.id);
        console.log(porId);

        console.log('\n5. Buscar por usuário');

        const porUsuario = await Autor.buscarPorUsuarioId(usuario.id);
        console.log(porUsuario);

        console.log('\n6. Alterar nome público');

        const nome = await Autor.alterarNomePublico(
            autor.id,
            'Autor Oficial'
        );

        console.log(nome);

        console.log('\n7. Alterar biografia');

        const bio = await Autor.alterarBiografia(
            autor.id,
            'Biografia atualizada.'
        );

        console.log(bio);

        console.log('\n8. Alterar foto');

        const foto = await Autor.alterarFoto(
            autor.id,
            'https://ciganas.com/fotos/autor.jpg'
        );

        console.log(foto);

        console.log('\n9. Desativar');

        const desativado = await Autor.desativar(autor.id);
        console.log(desativado);

        console.log('\n10. Buscar autor desativado');

        const inexistente = await Autor.buscarPorId(autor.id);
        console.log(inexistente);


        console.log('\n===================================');
        console.log('TESTES FINALIZADOS');
        console.log('===================================\n');

    } catch (erro) {

        console.error('\nERRO NOS TESTES\n');
        console.error(erro);

    }

}

executarTestes();
