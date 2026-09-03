const express = require('express');

const LivroAutorController = require('../controllers/LivroAutorController');

const {
    validarCriacaoLivroAutor,
    validarAlteracaoOrdemExibicao
} = require('../validators/livroAutorValidator');

const router = express.Router();


// Listar autores de um livro
router.get(
    '/livro/:livro_id',
    LivroAutorController.listarPorLivro
);


// Listar livros de um autor
router.get(
    '/autor/:autor_id',
    LivroAutorController.listarPorAutor
);


// Associar autor a livro
router.post(
    '/',
    validarCriacaoLivroAutor,
    LivroAutorController.criar
);


// Alterar ordem de exibição
router.patch(
    '/:id/ordem',
    validarAlteracaoOrdemExibicao,
    LivroAutorController.alterarOrdemExibicao
);


// Desativar associação
router.delete(
    '/:id',
    LivroAutorController.desativar
);


module.exports = router;
