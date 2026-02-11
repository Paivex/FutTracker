const express = require('express');
const router = express.Router();
const jogoController = require('../controllers/jogoController');

// Rotas para jogos
router.get('/', jogoController.getJogos);
router.get('/:id', jogoController.getJogo);
router.post('/', jogoController.criarJogo);
router.delete('/:id', jogoController.deletarJogo);

module.exports = router;