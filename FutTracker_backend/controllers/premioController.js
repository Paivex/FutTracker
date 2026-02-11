const Jogador = require('../models/jogador');

// GET todos os prémios (de todos os jogadores)
exports.getTodosPremios = async (req, res) => {
    try {
        const jogadores = await Jogador.find({ 'premios.0': { $exists: true } })
            .select('nome carta premios')
            .sort({ nome: 1 });
        
        // Formatar resposta
        const premios = jogadores.flatMap(jogador => 
            jogador.premios.map(premio => ({
                ...premio.toObject(),
                jogador: {
                    id: jogador._id,
                    nome: jogador.nome,
                    carta: jogador.carta
                }
            }))
        );
        
        // Ordenar por data (mais recente primeiro)
        premios.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        res.json(premios);
    } catch (error) {
        console.error('Erro ao buscar prémios:', error);
        res.status(500).json({ error: 'Erro ao buscar prémios' });
    }
};