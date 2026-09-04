const express = require('express');

const IdiomaController = require('../controllers/IdiomaController');

const router = express.Router();

router.get(
    '/',
    IdiomaController.listar
);

module.exports = router;
