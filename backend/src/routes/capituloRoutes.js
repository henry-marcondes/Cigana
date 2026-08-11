const express = require('express');

const router = express.Router();

const CapituloController = require('../controllers/CapituloController');

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
    validarCriacaoCapitulo,
    CapituloController.criar
);


// Alterar informações do capítulo
router.put(
    '/:id',
    validarAlteracaoInformacoesCapitulo,
    CapituloController.alterarInformacoes
);


// Alterar capa
router.patch(
    '/:id/capa',
    validarAlteracaoCapaCapitulo,
    CapituloController.alterarCapa
);


// Desativar capítulo
router.patch(
    '/:id/desativar',
    CapituloController.desativar
);


module.exports = router;
