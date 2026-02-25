const Liga = require('../models/liga');
const User = require('../models/user');

// GET todas as ligas
exports.getLigas = async (req, res) => {
    try {
        const ligas = await Liga.find()
            .populate('jogadores')
            .populate('jogos')
            .sort({ createdAt: -1 });

        res.json(ligas);
    } catch (error) {
        console.error('Erro ao buscar ligas:', error);
        res.status(500).json({ error: 'Erro ao buscar ligas' });
    }
};

// GET liga individual
exports.getLiga = async (req, res) => {
    try {
        const liga = await Liga.findById(req.params.id)
            .populate('jogadores')
            .populate('jogos');

        if (!liga) {
            return res.status(404).json({ error: 'Liga não encontrada' });
        }

        res.json(liga);
    } catch (error) {
        console.error('Erro ao buscar liga:', error);
        res.status(500).json({ error: 'Erro ao buscar liga' });
    }
};

// POST criar liga
exports.criarLiga = async (req, res) => {
    try {
        // Verificar se o user tem jogador ligado com perfil completo
        const user = await User.findById(req.user.id).populate('jogador');
        if (!user || !user.jogador) {
            return res.status(400).json({ error: 'Precisas de ter um jogador associado ao teu perfil para criar uma liga.' });
        }

        const j = user.jogador;
        if (!j.dataNascimento || !j.pePreferencial || !j.altura) {
            return res.status(400).json({ error: 'O teu perfil de jogador está incompleto. Preenche data de nascimento, pé preferencial e altura.' });
        }

        const novaLiga = new Liga({
            ...req.body,
            jogadores: [user.jogador._id]
        });
        await novaLiga.save();

        res.status(201).json(novaLiga);
    } catch (error) {
        console.error('Erro ao criar liga:', error);
        res.status(500).json({ error: 'Erro ao criar liga' });
    }
};

// PUT atualizar liga
exports.atualizarLiga = async (req, res) => {
    try {
        const ligaAtualizada = await Liga.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!ligaAtualizada) {
            return res.status(404).json({ error: 'Liga não encontrada' });
        }

        res.json(ligaAtualizada);
    } catch (error) {
        console.error('Erro ao atualizar liga:', error);
        res.status(500).json({ error: 'Erro ao atualizar liga' });
    }
};

// DELETE liga
exports.deletarLiga = async (req, res) => {
    try {
        const liga = await Liga.findByIdAndDelete(req.params.id);

        if (!liga) {
            return res.status(404).json({ error: 'Liga não encontrada' });
        }

        res.json({ message: 'Liga eliminada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar liga:', error);
        res.status(500).json({ error: 'Erro ao deletar liga' });
    }
};

// GET ligas de um user
exports.getLigasByUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ error: 'User não encontrado' });
        }

        if (!user.jogador) {
            return res.status(400).json({ error: 'User não está associado a nenhum jogador' });
        }

        const ligas = await Liga.find({
            jogadores: user.jogador
        })
        .populate('jogadores')
        .populate('jogos');

        res.json(ligas);

    } catch (error) {
        console.error('Erro ao buscar ligas do user:', error);
        res.status(500).json({ error: 'Erro ao buscar ligas do user' });
    }
};

