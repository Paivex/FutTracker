const express = require('express');
const router = express.Router();
const premioController = require('../controllers/premioController');
const { jwtMiddleware } = require('../middleware/auth');

// Todas as rotas requerem JWT (autenticação obrigatória)
router.get('/', jwtMiddleware, premioController.getTodosPremios);

module.exports = router;