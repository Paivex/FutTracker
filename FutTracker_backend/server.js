const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DB_FILE = './database.json';

app.use(cors()); 
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../FutTracker_frontend'))); 

function lerDados() {
    if (!fs.existsSync(DB_FILE)) {
        
        const defaultData = { jogadores: [], jogos: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData));
        return defaultData;
    }
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
}

app.get('/api/dados', (req, res) => {
    const dados = lerDados();
    res.json(dados);
});

app.post('/api/dados', (req, res) => {
    const { jogadores, jogos } = req.body;
    fs.writeFileSync(DB_FILE, JSON.stringify({ jogadores, jogos }, null, 2));
    res.json({ message: 'Guardado com sucesso!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor a rodar na porta ${PORT}`);
});