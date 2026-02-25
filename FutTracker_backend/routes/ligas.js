const express = require('express');
const router = express.Router();
const ligaController = require('../controllers/ligaController');
const { jwtMiddleware } = require('../middleware/auth');

router.get('/', jwtMiddleware, ligaController.getLigas);
router.get('/user/:userId', jwtMiddleware, ligaController.getLigasByUser);
router.get('/:id', jwtMiddleware, ligaController.getLiga);

router.post('/', jwtMiddleware, ligaController.criarLiga);            // criar liga
router.post('/:id/entrar', jwtMiddleware, ligaController.entrarLiga); // entrar na liga
router.post('/:id/adicionarAdministrador', jwtMiddleware, ligaController.adicionarAdministrador); // só admins

router.put('/:id', jwtMiddleware, ligaController.atualizarLiga);
router.delete('/:id', jwtMiddleware, ligaController.deletarLiga);

module.exports = router;