const express = require('express');
const router = express.Router();
const jogoController = require('../controllers/jogoController');
const { jwtMiddleware } = require('../middleware/auth');

// Rotas públicas (GET - leitura livre)
router.get('/', jogoController.getJogos);
router.get('/:id', jogoController.getJogo);

// Rotas protegidas (POST/DELETE - requerem JWT)
router.post('/', jwtMiddleware, jogoController.criarJogo);
router.delete('/:id', jwtMiddleware, jogoController.deletarJogo);

module.exports = router;