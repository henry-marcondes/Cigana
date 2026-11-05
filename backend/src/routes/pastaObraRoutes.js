const express = require('express');

const PastaObraController = require('../controllers/PastaObraController');
const PastaObraService = require('../services/pastaObraService');
const autenticar = require('../middleware/autenticar');
const autorizarObra = require('../middleware/autorizarObra');
const EscopoObraService = require('../services/escopoObraService');

const {
    validarLivroId,
    validarPastaId,
    validarCriacaoPasta,
    validarRenomeacaoPasta,
    validarMovimentacaoPasta
} = require('../validators/pastaObraValidator');

const router = express.Router();

const autorizarPorLivro = autorizarObra(
    EscopoObraService.comParametro(
        EscopoObraService.porLivroParam,
        'livro_id'
    )
);
const autorizarPorPasta = autorizarObra(
    (req) => PastaObraService.buscarLivroIdPorId(req.params.id)
);

router.post(
    '/livro/:livro_id',
    validarLivroId,
    autenticar,
    autorizarPorLivro,
    validarCriacaoPasta,
    PastaObraController.criar
);

router.get(
    '/livro/:livro_id',
    validarLivroId,
    autenticar,
    autorizarPorLivro,
    PastaObraController.listar
);

router.patch(
    '/:id',
    validarPastaId,
    autenticar,
    autorizarPorPasta,
    validarRenomeacaoPasta,
    PastaObraController.renomear
);

router.patch(
    '/:id/mover',
    validarPastaId,
    autenticar,
    autorizarPorPasta,
    validarMovimentacaoPasta,
    PastaObraController.mover
);

router.delete(
    '/:id',
    validarPastaId,
    autenticar,
    autorizarPorPasta,
    PastaObraController.excluir
);

module.exports = router;
