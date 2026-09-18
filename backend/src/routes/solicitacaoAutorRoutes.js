const express = require('express');

const SolicitacaoAutorController = require('../controllers/SolicitacaoAutorController');
const SolicitacaoAutorValidator = require('../validators/solicitacaoAutorValidator');

const autenticar = require('../middleware/autenticar');

const router = express.Router();

// =====================================================
// USUÁRIO
// =====================================================

// Criar solicitação para atuar como Autor
router.post(
    '/',
    autenticar,
    SolicitacaoAutorValidator.validarCriacao,
    SolicitacaoAutorController.criar
);

// Listar minhas solicitações
router.get(
    '/minhas',
    autenticar,
    SolicitacaoAutorController.listarPorUsuario
);

// Buscar uma das minhas solicitações
router.get(
    '/minhas/:id',
    autenticar,
    SolicitacaoAutorValidator.validarId,
    SolicitacaoAutorController.buscarMinhaPorId
);

// =====================================================
// GESTÃO DA PLATAFORMA
// =====================================================

// Listar solicitações para avaliação
router.get(
    '/gestao',
    autenticar,
    SolicitacaoAutorController.listarPorAvaliacao
);

// Listar solicitações pendentes
router.get(
    '/gestao/pendentes',
    autenticar,
    SolicitacaoAutorController.listarPendentes
);

// Buscar solicitação para avaliação
router.get(
    '/gestao/:id',
    autenticar,
    SolicitacaoAutorValidator.validarId,
    SolicitacaoAutorController.buscarParaAvaliacao
);

// Aprovar solicitação
router.patch(
    '/gestao/:id/aprovar',
    autenticar,
    SolicitacaoAutorValidator.validarId,
    SolicitacaoAutorController.aprovar
);

// Recusar solicitação
router.patch(
    '/gestao/:id/recusar',
    autenticar,
    SolicitacaoAutorValidator.validarId,
    SolicitacaoAutorValidator.validarRecusa,
    SolicitacaoAutorController.recusar
);

module.exports = router;
