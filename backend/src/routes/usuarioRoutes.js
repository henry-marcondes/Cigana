const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');

const {
    validarCriacaoUsuario,
    validarAlteracaoSenha,
    validarAtualizacaoUsuario,
    validarSolicitacaoVerificacaoEmail,
    validarConfirmacaoVerificacaoEmail,
    validarSolicitacaoAlteracaoSenha,
    validarConfirmacaoAlteracaoSenha,
    validarSolicitacaoRecuperacaoSenha,
    validarConfirmacaoRecuperacaoSenha
} = require('../validators/usuarioValidator');

const router = express.Router();

// CRUD
router.get('/', UsuarioController.listar);

router.get('/:id', UsuarioController.buscarPorId);

router.post(
    '/',
    validarCriacaoUsuario,
    UsuarioController.criar
);

router.put(
    '/:id',
    validarAtualizacaoUsuario,
    UsuarioController.atualizar
);

router.delete(
    '/:id',
    UsuarioController.desativar
);

// Alteração direta de senha
router.patch(
    '/:id/senha',
    validarAlteracaoSenha,
    UsuarioController.alterarSenha
);

// Alteração de senha com verificação por e-mail
router.post(
    '/:id/alteracao-senha',
    validarSolicitacaoAlteracaoSenha,
    UsuarioController.solicitarAlteracaoSenha
);

router.post(
    '/:id/alteracao-senha/confirmar',
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
