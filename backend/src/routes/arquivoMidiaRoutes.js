const express = require('express');

const ArquivoMidiaController = require('../controllers/ArquivoMidiaController');
const ArquivoMidiaService = require('../services/arquivoMidiaService');
const autenticar = require('../middleware/autenticar');
const autorizarObra = require('../middleware/autorizarObra');
const EscopoObraService = require('../services/escopoObraService');
const protegerLeituraObra = require('../middleware/protegerLeituraObra');

const {
    validarLivroId,
    validarArquivoId,
    validarPastaOpcional,
    validarUpload,
    validarRenomeacao,
    validarMovimentacao
} = require('../validators/arquivoMidiaValidator');

const router = express.Router();

const autorizarPorLivro = autorizarObra(
    EscopoObraService.comParametro(
        EscopoObraService.porLivroParam,
        'livro_id'
    )
);
const autorizarPorArquivo = autorizarObra(
    (req) => ArquivoMidiaService.buscarLivroIdPorId(req.params.id)
);

router.get(
    '/:id/conteudo',
    validarArquivoId,
    ArquivoMidiaController.entregar
);

router.get(
    '/:id/url',
    validarArquivoId,
    protegerLeituraObra(
        (req) => ArquivoMidiaService.buscarLivroIdPorId(req.params.id)
    ),
    ArquivoMidiaController.emitirUrl
);

router.post(
    '/livro/:livro_id',
    validarLivroId,
    validarPastaOpcional,
    autenticar,
    autorizarPorLivro,
    validarUpload,
    ArquivoMidiaController.criar
);

router.get(
    '/livro/:livro_id',
    validarLivroId,
    autenticar,
    autorizarPorLivro,
    ArquivoMidiaController.listar
);

router.patch(
    '/:id/nome',
    validarArquivoId,
    autenticar,
    autorizarPorArquivo,
    validarRenomeacao,
    ArquivoMidiaController.renomear
);

router.patch(
    '/:id/pasta',
    validarArquivoId,
    autenticar,
    autorizarPorArquivo,
    validarMovimentacao,
    ArquivoMidiaController.mover
);

router.put(
    '/:id/conteudo',
    validarArquivoId,
    autenticar,
    autorizarPorArquivo,
    ArquivoMidiaController.substituirConteudo
);

router.delete(
    '/:id',
    validarArquivoId,
    autenticar,
    autorizarPorArquivo,
    ArquivoMidiaController.desativar
);

module.exports = router;
