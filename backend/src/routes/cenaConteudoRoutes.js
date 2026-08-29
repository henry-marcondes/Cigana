const express = require('express');

const router = express.Router();

const CenaConteudoController = require('../controllers/cenaConteudoController');

const {
    validarCriacaoCenaConteudo,
    validarAlteracaoOrdem,
    validarAlteracaoTipoConteudo,
    validarIdCenaConteudo,
    validarIdCena
} = require('../validators/cenaConteudoValidator');

// Listar conteúdos de uma cena
router.get(
    '/cena/:cena_id',
    validarIdCena,
    CenaConteudoController.listarPorCena
);

// Buscar conteúdo por ID
router.get(
    '/:id',
    validarIdCenaConteudo,
    CenaConteudoController.buscarPorId
);

// Criar conteúdo na cena
router.post(
    '/',
    validarCriacaoCenaConteudo,
    CenaConteudoController.criar
);

// Alterar ordem
router.patch(
    '/:id/ordem',
    validarAlteracaoOrdem,
    CenaConteudoController.alterarOrdem
);

// Alterar tipo de conteúdo
router.patch(
    '/:id/tipo',
    validarAlteracaoTipoConteudo,
    CenaConteudoController.alterarTipoConteudo
);

// Desativar conteúdo
router.delete(
    '/:id',
    validarIdCenaConteudo,
    CenaConteudoController.desativar
);

module.exports = router;
