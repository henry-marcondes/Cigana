const express = require('express');

const LivroController = require('../controllers/LivroController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const autorizarObra = require('../middleware/autorizarObra');
const autorizarLeituraEditorial = require('../middleware/autorizarLeituraEditorial');
const protegerLeituraObra = require('../middleware/protegerLeituraObra');
const EscopoObraService = require('../services/escopoObraService');

const {
    validarCriacaoLivro,
    validarAlteracaoInformacoesLivro,
    validarAlteracaoStatusLivro,
    validarAlteracaoVisibilidadeLivro,
    validarAlteracaoCapaLivro,
    validarCriacaoLivroParaAutor,
    validarDecisaoEditorial
} = require('../validators/livroValidator');

const router = express.Router();

router.get(
    '/',
    LivroController.listar
);

router.get(
    '/gestao/editorial',
    autenticar,
    autorizar('moderacao.visualizar'),
    LivroController.listarParaDecisaoEditorial
);

router.get(
    '/slug/:slug',
    LivroController.buscarPorSlug
);

router.post(
    '/autor',
    autenticar,
    autorizar('obra.criar'),
    validarCriacaoLivroParaAutor,
    LivroController.criarParaAutor
);

router.get(
    '/:id',
    protegerLeituraObra(EscopoObraService.porLivroParam),
    LivroController.buscarPorId
);

router.post(
    '/',
    autenticar,
    autorizar('obra.criar'),
    validarCriacaoLivro,
    LivroController.criar
);

router.put(
    '/:id',
    autenticar,
    autorizarObra(EscopoObraService.porLivroParam,'obra.editar'),
    validarAlteracaoInformacoesLivro,
    LivroController.alterarInformacoes
);

router.patch(
    '/:id/status',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoStatusLivro,
    LivroController.alterarStatus
);

router.post(
    '/:id/enviar-revisao',
    autenticar,
    autorizarObra(EscopoObraService.porLivroParam, 'obra.editar'),
    LivroController.enviarParaRevisao
);

router.get(
    '/:id/decisao-editorial',
    autenticar,
    autorizarLeituraEditorial,
    LivroController.buscarDecisaoEditorial
);

router.patch(
    '/:id/decisao-editorial',
    autenticar,
    autorizarObra(
        async (req) => req.params.id,
        'obra.aprovar'
    ),
    validarDecisaoEditorial,
    LivroController.decidirEditorial
);

router.post(
    '/:id/publicar',
    autenticar,
    autorizarObra(
        async (req) => req.params.id,
        'obra.publicar'
    ),
    LivroController.publicar
);

router.patch(
    '/:id/visibilidade',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoVisibilidadeLivro,
    LivroController.alterarVisibilidade
);

router.patch(
    '/:id/capa',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoCapaLivro,
    LivroController.alterarCapa
);

router.delete(
    '/:id',
    autenticar,
    autorizar('obra.excluir'),
    LivroController.desativar
);
module.exports = router;
