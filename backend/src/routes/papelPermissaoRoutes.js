const express = require('express');

const router = express.Router();

const PapelPermissaoController =
    require('../controllers/PapelPermissaoController');

const {
    validarCriacaoPapelPermissao
} = require('../validators/papelPermissaoValidator');

// Listar permissões de um papel
router.get(
    '/papel/:papelId',
    PapelPermissaoController.listarPorPapel
);

// Listar papéis de uma permissão
router.get(
    '/permissao/:permissaoId',
    PapelPermissaoController.listarPorPermissao
);

// Buscar vínculo por papel e permissão
router.get(
    '/papel/:papelId/permissao/:permissaoId',
    PapelPermissaoController.buscarPorPapelEPermissao
);

// Buscar vínculo por ID
router.get(
    '/:id',
    PapelPermissaoController.buscarPorId
);

// Criar vínculo
router.post(
    '/',
    validarCriacaoPapelPermissao,
    PapelPermissaoController.criar
);

// Desativar vínculo
router.delete(
    '/:id',
    PapelPermissaoController.desativar
);

module.exports = router;
