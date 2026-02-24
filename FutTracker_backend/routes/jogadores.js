const express = require('express');
const router = express.Router();
const jogadorController = require('../controllers/jogadorController');
const { jwtMiddleware } = require('../middleware/auth');

// Todas as rotas requerem JWT (autenticação obrigatória)
router.get('/', jwtMiddleware, jogadorController.getJogadores);
router.get('/:id', jwtMiddleware, jogadorController.getJogador);
router.get('/:id/premios', jwtMiddleware, jogadorController.getPremiosJogador);
router.post('/', jwtMiddleware, jogadorController.criarJogador);
router.put('/:id', jwtMiddleware, jogadorController.atualizarJogador);
router.delete('/:id', jwtMiddleware, jogadorController.deletarJogador);

module.exports = router;