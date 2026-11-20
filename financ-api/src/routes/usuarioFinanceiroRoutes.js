const express = require('express');
const autenticar = require('../middleware/autenticar');
const exigirPermissao = require('../middleware/exigirPermissao');
const UsuarioFinanceiroController = require('../controllers/UsuarioFinanceiroController');
const { validarUsuarioAutenticado } = require('../validators/usuarioFinanceiroValidator');

const router = express.Router();
const PERMISSAO_CONSULTAR_RBAC = 'financeiro.rbac.consultar';

router.get(
    '/usuario-autenticado',
    autenticar,
    validarUsuarioAutenticado,
    exigirPermissao(PERMISSAO_CONSULTAR_RBAC),
    UsuarioFinanceiroController.consultarUsuarioAutenticado
);

module.exports = router;
