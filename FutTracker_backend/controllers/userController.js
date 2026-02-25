const jwt = require('jsonwebtoken');
const User = require('../models/user');

// POST /register
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const emailExiste = await User.findOne({ email });
        if (emailExiste) {
            return res.status(409).json({ error: 'Email já está em uso' });
        }

        const usernameExiste = await User.findOne({ username });
        if (usernameExiste) {
            return res.status(409).json({ error: 'Username já está em uso' });
        }

        const novoUser = new User({ username, email, password });
        await novoUser.save();

        const token = jwt.sign(
            { id: novoUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: novoUser._id,
                username: novoUser.username,
                email: novoUser.email
            }
        });
    } catch (error) {
        console.error('Erro ao registar utilizador:', error);
        res.status(500).json({ error: 'Erro ao registar utilizador' });
    }
};

// POST /login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e password são obrigatórios' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const passwordCorreta = await user.comparePassword(password);
        if (!passwordCorreta) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

// GET /me
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('jogador');
        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        res.json(userObj);
    } catch (error) {
        console.error('Erro ao buscar utilizador:', error);
        res.status(500).json({ error: 'Erro ao buscar utilizador' });
    }
};

// PUT /me
exports.updateUser = async (req, res) => {
    try {
        const { username, email, password, jogadorId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = password; // o pre-save hook trata do hash
        if (jogadorId !== undefined) user.jogador = jogadorId || null;
        await user.save();
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar utilizador:', error);
        res.status(500).json({ error: 'Erro ao atualizar utilizador' });
    }
};

// DELETE /me
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }
        res.json({ message: 'Conta eliminada com sucesso' });
    } catch (error) {
        console.error('Erro ao eliminar utilizador:', error);
        res.status(500).json({ error: 'Erro ao eliminar utilizador' });
    }
};