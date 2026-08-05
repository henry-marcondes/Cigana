const Usuario = require('../../src/models/Usuario');

async function executarTestes() {

    console.log('\n===================================');
    console.log('TESTE DO MODEL USUARIO');
    console.log('===================================\n');

    try {

        // ===============================
        // TESTE 1 - Criar usuário
        // ===============================

        console.log('1. Criando usuário...');

        const usuario = await Usuario.criar({
            email: 'teste@ciganas2.com',
            senha_hash: 'HASH_TESTE_123'
        });

        console.log(usuario);

        const usuarioId = usuario.id;

        // ===============================
        // TESTE 2 - Buscar por ID
        // ===============================

        console.log('\n2. Buscar por ID');

        console.log(
            await Usuario.buscarPorId(usuarioId)
        );

        // ===============================
        // TESTE 3 - Buscar por Email
        // ===============================

        console.log('\n3. Buscar por Email');

        console.log(
            await Usuario.buscarPorEmail('teste@ciganas2.com')
        );

        // ===============================
        // TESTE 4 - Listar
        // ===============================

        console.log('\n4. Listar');

        console.log(
            await Usuario.listar()
        );

        // ===============================
        // TESTE 5 - Atualizar Email
        // ===============================

        console.log('\n5. Atualizar Email');

        console.log(
            await Usuario.atualizar(
                usuarioId,
                {
                    email: 'novo@ciganas2.com'
                }
            )
        );

        // ===============================
        // TESTE 6 - Alterar Senha
        // ===============================

        console.log('\n6. Alterar Senha');

        console.log(
            await Usuario.alterarSenha(
                usuarioId,
                'NOVO_HASH_426'
            )
        );

        // ===============================
        // TESTE 7 - Registrar Login
        // ===============================

        console.log('\n7. Registrar Login');

        console.log(
            await Usuario.registrarLogin(usuarioId)
        );

        // ===============================
        // TESTE 8 - Verificar Email
        // ===============================

        console.log('\n8. Verificar Email');

        console.log(
            await Usuario.verificarEmail(usuarioId)
        );

        // ===============================
        // TESTE 9 - Desativar
        // ===============================

        console.log('\n9. Desativar');

        console.log(
            await Usuario.desativar(usuarioId)
        );

        // ===============================
        // TESTE 10 - Buscar novamente
        // ===============================

        console.log('\n10. Buscar usuário desativado');

        console.log(
            await Usuario.buscarPorId(usuarioId)
        );

        console.log('\n===================================');
        console.log('TESTES FINALIZADOS');
        console.log('===================================\n');

    } catch (erro) {

        console.error('\nERRO DURANTE OS TESTES:\n');
        console.error(erro);

    }

}

executarTestes();
