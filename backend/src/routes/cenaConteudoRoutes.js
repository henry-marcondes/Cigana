const express = require('express');

const router = express.Router();

const CenaConteudoController = require('../controllers/cenaConteudoController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');

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
    autenticar,
    autorizar('obra.editar'),
    validarCriacaoCenaConteudo,
    CenaConteudoController.criar
);

// Alterar ordem
router.patch(
    '/:id/ordem',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoOrdem,
    CenaConteudoController.alterarOrdem
);

// Alterar tipo de conteúdo
router.patch(
    '/:id/tipo',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoTipoConteudo,
    CenaConteudoController.alterarTipoConteudo
);

// Desativar conteúdo
router.delete(
    '/:id',
    autenticar,
    autorizar('obra.excluir'),
    validarIdCenaConteudo,
    CenaConteudoController.desativar
);

module.exports = router;
