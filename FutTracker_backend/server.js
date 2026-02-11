const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const fs = require('fs');

const DatabaseService = require('./services/database');
const authMiddleware = require('./middleware/auth');

// Importar rotas
const jogadoresRoutes = require('./routes/jogadores');
const jogosRoutes = require('./routes/jogos');
const premiosRoutes = require('./routes/premios');

const app = express();

// Carregar variáveis de ambiente
const envPath = '/etc/secrets/env';
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Verificar se API_KEY está configurada
if (!process.env.API_KEY) {
    console.warn('⚠️  AVISO: API_KEY não configurada! As rotas não estão protegidas.');
}

// Conectar à base de dados
DatabaseService.connect(MONGO_URI);

// Middlewares globais
app.use(cors({
    origin: [
        FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3000',
        /\.onrender\.com$/
    ],
    credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));

// Health check (público, sem autenticação)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Aplicar autenticação em TODAS as rotas da API
app.use('/api', authMiddleware);

// API Routes (protegidas pelo middleware acima)
app.use('/api/jogadores', jogadoresRoutes);
app.use('/api/jogos', jogosRoutes);
app.use('/api/premios', premiosRoutes);

// Rota 404
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor a rodar em http://localhost:${PORT}`);
    console.log(`📡 CORS ativado para: ${FRONTEND_URL}`);
    console.log(`🔐 Autenticação: ${process.env.API_KEY ? 'ATIVADA ✅' : 'DESATIVADA ⚠️'}`);
});

// Encerrar graciosamente
process.on('SIGINT', async () => {
    console.log('\n🛑 A encerrar servidor...');
    await DatabaseService.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 A encerrar servidor...');
    await DatabaseService.disconnect();
    process.exit(0);
});