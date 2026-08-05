const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');

const router = express.Router();

router.get('/', UsuarioController.listar);

module.exports = router;
