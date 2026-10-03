const express = require('express');

const UsuarioPreferenciaController =
    require('../controllers/UsuarioPreferenciaController');

const autenticar = require('../middleware/autenticar');

const {
    validarBuscaPorId,
    validarAdicao,
    validarRemocao
} = require('../validators/usuarioPreferenciaValidator');

const router = express.Router();

// Listar preferências de um usuário
router.get(
    '/',
    autenticar,
    UsuarioPreferenciaController.listarPorUsuario
);

// Buscar preferência do usuário por ID
router.get(
    '/:id',
    autenticar,
    validarBuscaPorId,
    UsuarioPreferenciaController.buscarPorId
);

// Adicionar preferência ao usuário
router.post(
    '/',
    autenticar,
    validarAdicao,
    UsuarioPreferenciaController.adicionar
);

// Remover preferência do usuário
router.delete(
    '/:id',
    autenticar,
    validarRemocao,
    UsuarioPreferenciaController.remover
);

module.exports = router;
