const express = require('express');

const StatusLivroController = require('../controllers/StatusLivroController');

const router = express.Router();

router.get(
    '/',
    StatusLivroController.listar
);

module.exports = router;
