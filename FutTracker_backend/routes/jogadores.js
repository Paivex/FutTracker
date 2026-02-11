const express = require('express');
const router = express.Router();
const jogadorController = require('../controllers/jogadorController');

// Rotas para jogadores
router.get('/', jogadorController.getJogadores);
router.get('/:id', jogadorController.getJogador);
router.post('/', jogadorController.criarJogador);
router.put('/:id', jogadorController.atualizarJogador);
router.delete('/:id', jogadorController.deletarJogador);

// Rota para prémios de um jogador específico
router.get('/:id/premios', jogadorController.getPremiosJogador);

module.exports = router;