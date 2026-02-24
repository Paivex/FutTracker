const express = require('express');
const router = express.Router();
const jogoController = require('../controllers/jogoController');
const { jwtMiddleware } = require('../middleware/auth');

// Todas as rotas requerem JWT (autenticação obrigatória)
router.get('/', jwtMiddleware, jogoController.getJogos);
router.get('/:id', jwtMiddleware, jogoController.getJogo);
router.post('/', jwtMiddleware, jogoController.criarJogo);
router.delete('/:id', jwtMiddleware, jogoController.deletarJogo);

module.exports = router;