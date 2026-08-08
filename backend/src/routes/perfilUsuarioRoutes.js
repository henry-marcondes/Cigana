const express = require('express');

const router = express.Router();

const PerfilUsuarioController = require('../controllers/PerfilUsuarioController');

const {
    validarBuscaPorId,
    validarCriacaoPerfil,
    validarAlteracaoDadosPessoais,
    validarAlteracaoNomeUsuario,
    validarAlteracaoAvatar,
    validarAlteracaoBiografia,
    validarAlteracaoIdioma
} = require('../validators/perfilUsuarioValidator');

router.get(
    '/',
    PerfilUsuarioController.listar
);

router.post(
    '/',
    validarCriacaoPerfil,
    PerfilUsuarioController.criar
);

router.get(
    '/usuario/:usuario_id',
    PerfilUsuarioController.buscarPorUsuario
);

router.get(
    '/:id',
    validarBuscaPorId,
    PerfilUsuarioController.buscarPorId
);

router.patch(
    '/:id/dados-pessoais',
    validarAlteracaoDadosPessoais,
    PerfilUsuarioController.alterarDadosPessoais
);

router.patch(
    '/:id/nome-usuario',
    validarAlteracaoNomeUsuario,
    PerfilUsuarioController.alterarNomeUsuario
);

router.patch(
    '/:id/avatar',
    validarAlteracaoAvatar,
    PerfilUsuarioController.alterarAvatar
);

router.patch(
    '/:id/biografia',
    validarAlteracaoBiografia,
    PerfilUsuarioController.alterarBiografia
);

router.patch(
    '/:id/idioma',
    validarAlteracaoIdioma,
    PerfilUsuarioController.alterarIdioma
);

router.delete(
    '/:id',
    PerfilUsuarioController.excluir
);

module.exports = router;
