const express = require('express');

const router = express.Router();

const PapelController = require('../controllers/PapelController');

const {
    validarCriacaoPapel,
    validarNome,
    validarCodigo,
    validarDescricao
} = require('../validators/papelValidator');

// Listar papéis
router.get(
    '/',
    PapelController.listar
);

// Buscar papel por ID
router.get(
    '/:id',
    PapelController.buscarPorId
);

// Buscar papel por código
router.get(
    '/codigo/:codigo',
    PapelController.buscarPorCodigo
);

// Criar papel
router.post(
    '/',
    validarCriacaoPapel,
    PapelController.criar
);

// Alterar nome
router.patch(
    '/:id/nome',
    validarNome,
    PapelController.alterarNome
);

// Alterar código
router.patch(
    '/:id/codigo',
    validarCodigo,
    PapelController.alterarCodigo
);

// Alterar descrição
router.patch(
    '/:id/descricao',
    validarDescricao,
    PapelController.alterarDescricao
);

// Desativar
router.delete(
    '/:id',
    PapelController.desativar
);

module.exports = router;
