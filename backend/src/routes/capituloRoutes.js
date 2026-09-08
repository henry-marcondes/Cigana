const express = require('express');

const router = express.Router();

const CapituloController = require('../controllers/CapituloController');
const autorizar = require('../middleware/autorizacao')
const autenticar = require('../middleware/autenticar')
const autorizarObra = require('../middleware/autorizarObra');
const EscopoObraService = require('../services/escopoObraService');

const {
    validarCriacaoCapitulo,
    validarAlteracaoInformacoesCapitulo,
    validarAlteracaoCapaCapitulo
} = require('../validators/capituloValidator');

// Listar capítulos de um livro
router.get(
    '/livro/:livro_id',
    CapituloController.listarPorLivro
);

// Buscar capítulo por ID
router.get(
    '/:id',
    CapituloController.buscarPorId
);

// Buscar capítulo por slug dentro do livro
router.get(
    '/livro/:livro_id/slug/:slug',
    CapituloController.buscarPorSlug
);

// Criar capítulo
router.post(
    '/',
    autenticar,
    autorizarObra(EscopoObraService.porLivroBody),
    validarCriacaoCapitulo,
    CapituloController.criar
);

// Alterar informações do capítulo
router.put(
    '/:id',
    autenticar,
    autorizarObra(EscopoObraService.porCapituloParam),
    validarAlteracaoInformacoesCapitulo,
    CapituloController.alterarInformacoes
);

// Alterar capa
router.patch(
    '/:id/capa',
    autenticar,
    autorizarObra(EscopoObraService.porCapituloParam),
    validarAlteracaoCapaCapitulo,
    CapituloController.alterarCapa
);

// Desativar capítulo
router.patch(
    '/:id/desativar',
    autenticar,
    autorizar('obra.excluir'),
    CapituloController.desativar
);

module.exports = router;
