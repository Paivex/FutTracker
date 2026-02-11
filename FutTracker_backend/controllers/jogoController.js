const Jogo = require('../models/jogo');
const Jogador = require('../models/jogador');

// GET todos os jogos
exports.getJogos = async (req, res) => {
    try {
        const jogos = await Jogo.find()
            .populate('equipaA.jogadores.jogadorId', 'nome posicao')
            .populate('equipaB.jogadores.jogadorId', 'nome posicao')
            .sort({ data: -1 });
        
        res.json(jogos);
    } catch (error) {
        console.error('Erro ao buscar jogos:', error);
        res.status(500).json({ error: 'Erro ao buscar jogos' });
    }
};

// GET jogo individual
exports.getJogo = async (req, res) => {
    try {
        const jogo = await Jogo.findById(req.params.id)
            .populate('equipaA.jogadores.jogadorId', 'nome posicao foto')
            .populate('equipaB.jogadores.jogadorId', 'nome posicao foto');
        
        if (!jogo) {
            return res.status(404).json({ error: 'Jogo não encontrado' });
        }
        
        res.json(jogo);
    } catch (error) {
        console.error('Erro ao buscar jogo:', error);
        res.status(500).json({ error: 'Erro ao buscar jogo' });
    }
};

// POST criar jogo
exports.criarJogo = async (req, res) => {
    try {
        const novoJogo = new Jogo(req.body);
        await novoJogo.save();
        
        // Atualizar estatísticas apenas dos jogadores da equipaA (tua equipa)
        await atualizarEstatisticasJogadores(novoJogo.equipaA.jogadores);
        
        res.status(201).json(novoJogo);
    } catch (error) {
        console.error('Erro ao criar jogo:', error);
        res.status(500).json({ error: 'Erro ao criar jogo' });
    }
};

// DELETE jogo
exports.deletarJogo = async (req, res) => {
    try {
        const jogo = await Jogo.findById(req.params.id);
        
        if (!jogo) {
            return res.status(404).json({ error: 'Jogo não encontrado' });
        }
        
        // Reverter estatísticas apenas dos jogadores da equipaA
        await reverterEstatisticasJogadores(jogo.equipaA.jogadores);
        
        await Jogo.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Jogo eliminado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar jogo:', error);
        res.status(500).json({ error: 'Erro ao deletar jogo' });
    }
};

// Função auxiliar para atualizar estatísticas
async function atualizarEstatisticasJogadores(jogadores) {
    for (const jogadorJogo of jogadores) {
        if (!jogadorJogo.jogadorId) continue;
        
        await Jogador.findByIdAndUpdate(jogadorJogo.jogadorId, {
            $inc: {
                'estatisticas.jogos': 1,
                'estatisticas.golos': jogadorJogo.golos,
                'estatisticas.assistencias': jogadorJogo.assistencias,
                'estatisticas.cartoes.amarelos': jogadorJogo.cartaoAmarelo ? 1 : 0,
                'estatisticas.cartoes.vermelhos': jogadorJogo.cartaoVermelho ? 1 : 0
            }
        });
    }
}

// Função auxiliar para reverter estatísticas
async function reverterEstatisticasJogadores(jogadores) {
    for (const jogadorJogo of jogadores) {
        if (!jogadorJogo.jogadorId) continue;
        
        await Jogador.findByIdAndUpdate(jogadorJogo.jogadorId, {
            $inc: {
                'estatisticas.jogos': -1,
                'estatisticas.golos': -jogadorJogo.golos,
                'estatisticas.assistencias': -jogadorJogo.assistencias,
                'estatisticas.cartoes.amarelos': jogadorJogo.cartaoAmarelo ? -1 : 0,
                'estatisticas.cartoes.vermelhos': jogadorJogo.cartaoVermelho ? -1 : 0
            }
        });
    }
}