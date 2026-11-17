const express = require('express');
const autenticar = require('../middleware/autenticar');
const autorizarObra = require('../middleware/autorizarObra');
const protegerLeituraObra = require('../middleware/protegerLeituraObra');
const EscopoObraService = require('../services/escopoObraService');
const LivroDocumentoController = require('../controllers/LivroDocumentoController');
const LivroDocumentoService = require('../services/livroDocumentoService');
const { validarLivro, validarIds, validarTexto, validarUpload, validarSalvar } = require('../validators/livroDocumentoValidator');
const router = express.Router();
const porLivro = autorizarObra(EscopoObraService.comParametro(EscopoObraService.porLivroParam, 'livro_id'));
const porTexto = protegerLeituraObra(async (req) => {
    const livro_id = await LivroDocumentoService.buscarLivroIdPorTexto(req.params.texto_id);
    req.livro_id = livro_id;
    return livro_id;
});

router.post('/livro/:livro_id', validarUpload, autenticar, porLivro, LivroDocumentoController.criar);
router.get('/livro/:livro_id', validarLivro, autenticar, porLivro, LivroDocumentoController.listar);
router.get('/livro/:livro_id/principal', validarLivro, protegerLeituraObra(EscopoObraService.comParametro(EscopoObraService.porLivroParam, 'livro_id')), LivroDocumentoController.principal);
router.post('/livro/:livro_id/:arquivo_id/promover', validarIds, autenticar, porLivro, LivroDocumentoController.promover);
router.delete('/livro/:livro_id/:arquivo_id', validarIds, autenticar, porLivro, LivroDocumentoController.desativar);
router.put('/livro/:livro_id/:arquivo_id/conteudo', express.raw({ type: ['text/markdown', 'text/plain'], limit: 50 * 1024 * 1024 }), validarSalvar, autenticar, porLivro, LivroDocumentoController.salvar);
router.get('/trechos/:texto_id', validarTexto, porTexto, LivroDocumentoController.lerTrecho);

module.exports = router;
