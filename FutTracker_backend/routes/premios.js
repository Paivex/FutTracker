const express = require('express');
const router = express.Router();
const premioController = require('../controllers/premioController');
const { jwtMiddleware } = require('../middleware/auth');

// Rota para todos os prémios
router.get('/', jwtMiddleware, premioController.getTodosPremios);

module.exports = router;