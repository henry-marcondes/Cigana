/*
============================================================

Projeto Ciganas
Popular Dados de Desenvolvimento

Contas criadas:

Administrador
Email : admin@ciganas.com
Senha : Ciganas@2026

Autor
Email : autor@ciganas.com
Senha : Ciganas@2026

Moderador
Email : moderador@ciganas.com
Senha : Ciganas@2026

Leitor
Email : leitor@ciganas.com
Senha : Ciganas@2026

============================================================
*/

require('dotenv').config();

const bcrypt = require('bcrypt');
const Usuario = require('../src/models/Usuario');

async function criarUsuario(email) {

    const existente = await Usuario.buscarPorEmail(email);

    if (existente) {
        console.log(`✓ ${email} já existe.`);
        return;
    }

    const senha_hash = await bcrypt.hash('Ciganas@2026', 10);

    await Usuario.criar({
        email,
        senha_hash
    });

    console.log(`✓ ${email} criado.`);
}

async function executar() {

    console.log('\nPopulando banco...\n');

    await criarUsuario('admin@ciganas.com');
    await criarUsuario('autor@ciganas.com');
    await criarUsuario('moderador@ciganas.com');
    await criarUsuario('leitor@ciganas.com');

    console.log('\nConcluído.\n');
}

executar()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
