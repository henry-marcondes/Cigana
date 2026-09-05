const express = require('express');

const router = express.Router();

const PermissaoController = require('../controllers/PermissaoController');

const {
    validarCriacaoPermissao,
    validarNome,
    validarCodigo,
    validarDescricao
} = require('../validators/permissaoValidator');


// Listar permissões
router.get(
    '/',
    PermissaoController.listar
);


// Buscar permissão por ID
router.get(
    '/:id',
    PermissaoController.buscarPorId
);


// Buscar permissão por código
router.get(
    '/codigo/:codigo',
    PermissaoController.buscarPorCodigo
);


// Criar permissão
router.post(
    '/',
    validarCriacaoPermissao,
    PermissaoController.criar
);


// Alterar nome
router.patch(
    '/:id/nome',
    validarNome,
    PermissaoController.alterarNome
);


// Alterar código
router.patch(
    '/:id/codigo',
    validarCodigo,
    PermissaoController.alterarCodigo
);


// Alterar descrição
router.patch(
    '/:id/descricao',
    validarDescricao,
    PermissaoController.alterarDescricao
);


// Desativar permissão
router.delete(
    '/:id',
    PermissaoController.desativar
);


module.exports = router;
