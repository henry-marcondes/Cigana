const express = require('express');
const autenticar = require('../middleware/autenticar');
const protegerLeituraObra = require('../middleware/protegerLeituraObra');
const EscopoObraService = require('../services/escopoObraService');
const FinalLeituraController = require('../controllers/FinalLeituraController');
const {
    validarLivroId,
    validarRegistroFinal
} = require('../validators/finalLeituraValidator');

const router = express.Router();

router.get(
    '/livro/:livro_id',
    autenticar,
    validarLivroId,
    protegerLeituraObra(
        EscopoObraService.comParametro(
            EscopoObraService.porLivroParam,
            'livro_id'
        )
    ),
    FinalLeituraController.listarPorObra
);

router.post(
    '/',
    autenticar,
    validarRegistroFinal,
    protegerLeituraObra(EscopoObraService.porLivroBody),
    FinalLeituraController.registrar
);

module.exports = router;
