const express = require('express');

const ClassificacaoIndicativaController = require('../controllers/ClassificacaoIndicativaController');

const router = express.Router();

router.get(
    '/',
    ClassificacaoIndicativaController.listar
);

module.exports = router;
