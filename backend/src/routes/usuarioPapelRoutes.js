const express = require('express');

const router = express.Router();

const UsuarioPapelController =
    require('../controllers/UsuarioPapelController');

const {
    validarCriacaoUsuarioPapel
} = require('../validators/usuarioPapelValidator');

// Listar papéis de um usuário
router.get(
    '/usuario/:usuarioId',
    UsuarioPapelController.listarPorUsuario
);

// Listar usuários de um papel
router.get(
    '/papel/:papelId',
    UsuarioPapelController.listarPorPapel
);

// Buscar vínculo por usuário e papel
router.get(
    '/usuario/:usuarioId/papel/:papelId',
    UsuarioPapelController.buscarPorUsuarioEPapel
);

// Buscar vínculo por ID
router.get(
    '/:id',
    UsuarioPapelController.buscarPorId
);

// Criar vínculo
router.post(
    '/',
    validarCriacaoUsuarioPapel,
    UsuarioPapelController.criar
);

// Desativar vínculo
router.delete(
    '/:id',
    UsuarioPapelController.desativar
);

module.exports = router;
