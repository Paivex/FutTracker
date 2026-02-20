const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { jwtMiddleware } = require('../middleware/auth');

// Rotas públicas (não requerem autenticação)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rotas protegidas (requerem JWT)
router.get('/me', jwtMiddleware, userController.getUser);
router.put('/me', jwtMiddleware, userController.updateUser);
router.delete('/me', jwtMiddleware, userController.deleteUser);

module.exports = router;