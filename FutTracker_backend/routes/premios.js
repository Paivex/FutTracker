const express = require('express');
const router = express.Router();
const premioController = require('../controllers/premioController');

// Rota pública (GET - leitura livre)
router.get('/', premioController.getTodosPremios);

module.exports = router;