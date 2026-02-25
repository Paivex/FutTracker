const express = require('express');
const router = express.Router();
const ligaController = require('../controllers/ligaController');
const { jwtMiddleware } = require('../middleware/auth');

// Todas as rotas requerem JWT (autenticação obrigatória)
router.get('/', jwtMiddleware, ligaController.getLigas);
router.get('/user/:userId', jwtMiddleware, ligaController.getLigasByUser);
router.get('/:id', jwtMiddleware, ligaController.getLiga);
router.post('/', jwtMiddleware, ligaController.criarLiga);
router.put('/:id', jwtMiddleware, ligaController.atualizarLiga);
router.delete('/:id', jwtMiddleware, ligaController.deletarLiga);

module.exports = router;