const Liga = require('../models/liga');
const User = require('../models/user');

// GET todas as ligas
exports.getLigas = async (req, res) => {
    try {
        const ligas = await Liga.find()
            .populate('jogadores')
            .populate('jogos')
            .populate('administradores', 'username email')
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
            .populate('jogos')
            .populate('administradores', 'username email');

        if (!liga) return res.status(404).json({ error: 'Liga não encontrada' });

        res.json(liga);
    } catch (error) {
        console.error('Erro ao buscar liga:', error);
        res.status(500).json({ error: 'Erro ao buscar liga' });
    }
};

// GET ligas de um user
exports.getLigasByUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) return res.status(404).json({ error: 'User não encontrado' });
        if (!user.jogador) return res.status(400).json({ error: 'User não tem jogador associado' });

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

// POST criar liga
exports.criarLiga = async (req, res) => {
    try {
        const userId = req.user.id; // do JWT
        const user = await User.findById(userId);
        if (!user || !user.jogador) return res.status(400).json({ error: 'User não tem jogador associado' });

        const ligaData = { 
            ...req.body, 
            administradores: [userId], // quem cria é admin inicial
            jogadores: [user.jogador] // adiciona o jogador do criador automaticamente
        };

        const novaLiga = new Liga(ligaData);
        await novaLiga.save();

        res.status(201).json(novaLiga);
    } catch (error) {
        console.error('Erro ao criar liga:', error);
        res.status(500).json({ error: 'Erro ao criar liga' });
    }
};

// Helper partilhado: valida password e adiciona jogador à liga
const _processarEntrada = async (liga, password, user, res) => {
    const senhaValida = await liga.verificarPassword(password);
    if (!senhaValida) return res.status(403).json({ error: 'Password da liga incorreta' });

    if (!liga.jogadores.map(j => j.toString()).includes(user.jogador.toString())) {
        liga.jogadores.push(user.jogador);
        await liga.save();
    }
    res.json({ message: 'Entrou na liga com sucesso', liga });
};

// POST entrar numa liga por nome e password
exports.entrarLigaPorNome = async (req, res) => {
    try {
        const { nome, password } = req.body;
        if (!nome || !password) return res.status(400).json({ error: 'Nome e password são obrigatórios' });

        const user = await User.findById(req.user.id);
        if (!user || !user.jogador) return res.status(400).json({ error: 'User não tem jogador associado' });

        const liga = await Liga.findOne({ nome: nome.trim() });
        if (!liga) return res.status(404).json({ error: 'Liga não encontrada' });

        await _processarEntrada(liga, password, user, res);
    } catch (error) {
        console.error('Erro ao entrar na liga por nome:', error);
        res.status(500).json({ error: 'Erro ao entrar na liga' });
    }
};

// POST entrar numa liga por ID
exports.entrarLiga = async (req, res) => {
    try {
        const { password } = req.body;

        const user = await User.findById(req.user.id);
        if (!user || !user.jogador) return res.status(400).json({ error: 'User não tem jogador associado' });

        const liga = await Liga.findById(req.params.id);
        if (!liga) return res.status(404).json({ error: 'Liga não encontrada' });

        await _processarEntrada(liga, password, user, res);
    } catch (error) {
        console.error('Erro ao entrar na liga:', error);
        res.status(500).json({ error: 'Erro ao entrar na liga' });
    }
};

// POST adicionar administrador (só admins podem)
exports.adicionarAdministrador = async (req, res) => {
    try {
        const { userIdToAdd } = req.body;
        const userId = req.user.id;

        const liga = await Liga.findById(req.params.id);
        if (!liga) return res.status(404).json({ error: 'Liga não encontrada' });

        if (!liga.ehAdministrador(userId)) {
            return res.status(403).json({ error: 'Não tem permissão para adicionar administradores' });
        }

        // só users que já estão na liga podem ser admins
        if (!liga.jogadores.some(j => j.equals(userIdToAdd))) {
            return res.status(400).json({ error: 'User precisa estar na liga para virar administrador' });
        }

        if (!liga.administradores.includes(userIdToAdd)) {
            liga.administradores.push(userIdToAdd);
            await liga.save();
        }

        res.json({ message: 'Administrador adicionado com sucesso', liga });
    } catch (error) {
        console.error('Erro ao adicionar administrador:', error);
        res.status(500).json({ error: 'Erro ao adicionar administrador' });
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

        if (!ligaAtualizada) return res.status(404).json({ error: 'Liga não encontrada' });

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

        if (!liga) return res.status(404).json({ error: 'Liga não encontrada' });

        res.json({ message: 'Liga eliminada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar liga:', error);
        res.status(500).json({ error: 'Erro ao deletar liga' });
    }
};