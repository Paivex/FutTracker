const Jogador = require('../models/jogador');

// GET todos os jogadores
exports.getJogadores = async (req, res) => {
    try {
        const jogadores = await Jogador.find().sort({ nome: 1 });
        res.json(jogadores);
    } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
        res.status(500).json({ error: 'Erro ao buscar jogadores' });
    }
};

// GET jogador individual
exports.getJogador = async (req, res) => {
    try {
        const jogador = await Jogador.findById(req.params.id);
        
        if (!jogador) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }
        
        res.json(jogador);
    } catch (error) {
        console.error('Erro ao buscar jogador:', error);
        res.status(500).json({ error: 'Erro ao buscar jogador' });
    }
};

// POST criar jogador
exports.criarJogador = async (req, res) => {
    try {
        const novoJogador = new Jogador(req.body);
        await novoJogador.save();
        
        res.status(201).json(novoJogador);
    } catch (error) {
        console.error('Erro ao criar jogador:', error);
        res.status(500).json({ error: 'Erro ao criar jogador' });
    }
};

// PUT atualizar jogador
exports.atualizarJogador = async (req, res) => {
    try {
        const jogadorAtualizado = await Jogador.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!jogadorAtualizado) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }
        
        res.json(jogadorAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar jogador:', error);
        res.status(500).json({ error: 'Erro ao atualizar jogador' });
    }
};

// DELETE jogador
exports.deletarJogador = async (req, res) => {
    try {
        const jogador = await Jogador.findByIdAndDelete(req.params.id);
        
        if (!jogador) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }
        
        res.json({ message: 'Jogador eliminado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar jogador:', error);
        res.status(500).json({ error: 'Erro ao deletar jogador' });
    }
};

// GET prémios de um jogador
exports.getPremiosJogador = async (req, res) => {
    try {
        const jogador = await Jogador.findById(req.params.id).select('premios nome');
        
        if (!jogador) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }
        
        res.json({
            jogador: jogador.nome,
            premios: jogador.premios
        });
    } catch (error) {
        console.error('Erro ao buscar prémios:', error);
        res.status(500).json({ error: 'Erro ao buscar prémios' });
    }
};