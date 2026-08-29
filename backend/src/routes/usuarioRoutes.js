const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const autenticar = require('../middleware/autenticar');

const {
    validarCriacaoUsuario,
    validarAlteracaoSenha,
    validarAtualizacaoUsuario,
    validarSolicitacaoVerificacaoEmail,
    validarConfirmacaoVerificacaoEmail,
    validarSolicitacaoAlteracaoSenha,
    validarConfirmacaoAlteracaoSenha,
    validarSolicitacaoRecuperacaoSenha,
    validarConfirmacaoRecuperacaoSenha,
    validarLogin
} = require('../validators/usuarioValidator');

const router = express.Router();

// Login
router.post(
    '/login',
    validarLogin,
    UsuarioController.autenticar
);

// CRUD
router.get('/', autenticar, UsuarioController.listar);

router.get('/:id', autenticar, UsuarioController.buscarPorId);

router.post(
    '/',
    validarCriacaoUsuario,
    UsuarioController.criar
);

router.put(
    '/:id',
    autenticar,
    validarAtualizacaoUsuario,
    UsuarioController.atualizar
);

router.delete(
    '/:id', autenticar,
    UsuarioController.desativar
);

// Alteração direta de senha
router.patch(
    '/:id/senha',
    autenticar,
    validarAlteracaoSenha,
    UsuarioController.alterarSenha
);

// Alteração de senha com verificação por e-mail
router.post(
    '/:id/alteracao-senha',
    autenticar,
    validarSolicitacaoAlteracaoSenha,
    UsuarioController.solicitarAlteracaoSenha
);

router.post(
    '/:id/alteracao-senha/confirmar',
    autenticar,
    validarConfirmacaoAlteracaoSenha,
    UsuarioController.alterarSenhaComToken
);

// Verificação de e-mail
router.post(
    '/:id/verificacao-email',
    validarSolicitacaoVerificacaoEmail,
    UsuarioController.solicitarVerificacaoEmail
);

router.post(
    '/:id/verificacao-email/confirmar',
    validarConfirmacaoVerificacaoEmail,
    UsuarioController.verificarEmail
);

// Recuperação de senha
router.post(
    '/recuperacao-senha',
    validarSolicitacaoRecuperacaoSenha,
    UsuarioController.solicitarRecuperacaoSenha
);

router.post(
    '/recuperacao-senha/confirmar',
    validarConfirmacaoRecuperacaoSenha,
    UsuarioController.recuperarSenhaComToken
);

module.exports = router;
