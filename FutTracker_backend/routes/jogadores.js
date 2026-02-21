const express = require('express');
const router = express.Router();
const jogadorController = require('../controllers/jogadorController');
const { jwtMiddleware } = require('../middleware/auth');

// Rotas para jogadores
router.get('/', jwtMiddleware, jogadorController.getJogadores);
router.get('/:id', jwtMiddleware, jogadorController.getJogador);
router.post('/', jwtMiddleware, jogadorController.criarJogador);
router.put('/:id', jwtMiddleware, jogadorController.atualizarJogador);
router.delete('/:id', jwtMiddleware, jogadorController.deletarJogador);

// Rota para prémios de um jogador específico
router.get('/:id/premios', jwtMiddleware, jogadorController.getPremiosJogador);

module.exports = router;