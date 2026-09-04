const express = require('express');

const VisibilidadeLivroController = require('../controllers/VisibilidadeLivroController');

const router = express.Router();

router.get(
    '/',
    VisibilidadeLivroController.listar
);

module.exports = router;
