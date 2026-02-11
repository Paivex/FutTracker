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

module.exports = authMiddleware;