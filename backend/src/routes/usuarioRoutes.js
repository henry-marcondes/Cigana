const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const {validarCriacaoUsuario, 
       validarAlteracaoSenha,
       validarAtualizacaoUsuario
      } = require('../validators/usuarioValidator');

const router = express.Router();

router.get('/', UsuarioController.listar);
router.get('/:id', UsuarioController.buscarPorId);
router.post('/',validarCriacaoUsuario,UsuarioController.criar);
router.put('/:id',validarAtualizacaoUsuario, UsuarioController.atualizar);
router.delete('/:id', UsuarioController.desativar);

router.patch('/:id/senha', validarAlteracaoSenha, UsuarioController.alterarSenha);
//router.patch('/:id/senha', validarAlteracaoSenha,(req, res) => { res.json({ validator: 'OK', body: req.bod });});

module.exports = router;
