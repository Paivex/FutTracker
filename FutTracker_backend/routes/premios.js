const express = require('express');
const router = express.Router();
const premioController = require('../controllers/premioController');

// Rota para todos os prémios
router.get('/', premioController.getTodosPremios);

module.exports = router;