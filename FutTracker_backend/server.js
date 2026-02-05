const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const compression = require('compression');
const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = "mongodb+srv://admin:123@futtracker.bmtlp1q.mongodb.net/?appName=FutTracker";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Conectado ao MongoDB Atlas!"))
    .catch(err => console.error("❌ Erro ao ligar ao MongoDB:", err));

const DadosSchema = new mongoose.Schema({
    id_unico: { type: String, default: 'dados_futtracker' }, 
    jogadores: Array,
    jogos: Array
});
const DadosModel = mongoose.model('Dados', DadosSchema);

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'FutTracker_frontend/dist')));

app.get('/api/dados', async (req, res) => {
    try {
        let dados = await DadosModel.findOne({ id_unico: 'dados_futtracker' });
        if (!dados) {
            
            dados = await DadosModel.create({ jogadores: [], jogos: [] });
        }
        res.json(dados);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao ler da base de dados' });
    }
});

app.post('/api/dados', async (req, res) => {
    try {
        const { jogadores, jogos } = req.body;
        
        await DadosModel.findOneAndUpdate(
            { id_unico: 'dados_futtracker' },
            { jogadores, jogos },
            { upsert: true, new: true }
        );
        res.json({ message: 'Guardado na Nuvem com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao guardar' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'FutTracker_frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Site Full-Stack a rodar em http://localhost:${PORT}`);
});