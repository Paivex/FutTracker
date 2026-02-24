const express = require('express');
const router = express.Router();
const jogadorController = require('../controllers/jogadorController');
const { jwtMiddleware } = require('../middleware/auth');

// Rotas públicas (GET - leitura livre)
router.get('/', jogadorController.getJogadores);
router.get('/:id', jogadorController.getJogador);
router.get('/:id/premios', jogadorController.getPremiosJogador);

// Rotas protegidas (POST/PUT/DELETE - requerem JWT)
router.post('/', jwtMiddleware, jogadorController.criarJogador);
router.put('/:id', jwtMiddleware, jogadorController.atualizarJogador);
router.delete('/:id', jwtMiddleware, jogadorController.deletarJogador);

module.exports = router;