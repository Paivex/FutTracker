// middleware/auth.js

/**
 * Middleware de autenticação simples com API Key
 * Protege todas as rotas que modificam dados (POST, PUT, DELETE)
 */

const authMiddleware = (req, res, next) => {
    // Permitir GET requests sem autenticação (leitura pública)
    if (req.method === 'GET') {
        return next();
    }

    // Para POST, PUT, DELETE - exigir API Key
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(401).json({ 
            error: 'API Key obrigatória',
            message: 'Adiciona o header x-api-key ao request' 
        });
    }

    if (apiKey !== validApiKey) {
        return res.status(403).json({ 
            error: 'API Key inválida',
            message: 'A API Key fornecida não é válida' 
        });
    }

    // API Key válida, continuar
    next();
};

/**
 * Middleware de autenticação por JWT
 * Protege rotas que requerem um utilizador autenticado
 * Uso: adicionar jwtMiddleware como argumento na rota pretendida
 *   ex: router.get('/me', jwtMiddleware, userController.getMe)
 */

const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({
            error: 'Token obrigatório',
            message: 'Faz login para obteres um token de acesso'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username } disponíveis nas rotas seguintes
        next();
    } catch (err) {
        return res.status(403).json({
            error: 'Token inválido ou expirado',
            message: 'Faz login novamente'
        });
    }
};

module.exports = { authMiddleware, jwtMiddleware };