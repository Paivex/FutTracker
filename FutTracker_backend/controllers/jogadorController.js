const Jogador = require('../models/jogador');
const User = require('../models/user');
const Liga = require('../models/liga');

// GET todos os jogadores
exports.getJogadores = async (req, res) => {
    try {
        let jogadores;

        if (req.query.ligaId) {
            const liga = await Liga.findById(req.query.ligaId).populate('jogadores');
            if (!liga) return res.status(404).json({ error: 'Liga não encontrada' });
            jogadores = liga.jogadores;
        } else {
            jogadores = await Jogador.find().sort({ nome: 1 });
        }

        const jogadoresComImagem = jogadores.map(j => {
            let imagemBase64 = null;
            if (j.imagem) {
                imagemBase64 = `data:image/webp;base64,${j.imagem.toString('base64')}`;
            }
            return { ...j.toObject(), imagem: imagemBase64 };
        });

        res.json(jogadoresComImagem);
    } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
        res.status(500).json({ error: 'Erro ao buscar jogadores' });
    }
};

// GET jogador individual
// exports.getJogador = async (req, res) => {
//     try {
//         const jogador = await Jogador.findById(req.params.id);
        
//         if (!jogador) {
//             return res.status(404).json({ error: 'Jogador não encontrado' });
//         }
        
//         res.json(jogador);
//     } catch (error) {
//         console.error('Erro ao buscar jogador:', error);
//         res.status(500).json({ error: 'Erro ao buscar jogador' });
//     }
// };

exports.getJogador = async (req, res) => {
    try {
        const jogador = await Jogador.findById(req.params.id);

        if (!jogador) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }

        // Converter Buffer em base64
        let imagemBase64 = null;
        if (jogador.imagem) {
            imagemBase64 = `data:image/webp;base64,${jogador.imagem.toString('base64')}`;
        }

        const jogadorComImagem = {
            ...jogador.toObject(),
            imagem: imagemBase64
        };

        res.json(jogadorComImagem);
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

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        user.jogador = novoJogador._id;
        await user.save();

        res.status(201).json(novoJogador);
    } catch (error) {
        console.error('Erro ao criar jogador:', error);
        res.status(500).json({ error: 'Erro ao criar jogador' });
    }
};

// PUT atualizar jogador
// exports.atualizarJogador = async (req, res) => {
//     try {
//         const jogadorAtualizado = await Jogador.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, runValidators: true }
//         );
        
//         if (!jogadorAtualizado) {
//             return res.status(404).json({ error: 'Jogador não encontrado' });
//         }
        
//         res.json(jogadorAtualizado);
//     } catch (error) {
//         console.error('Erro ao atualizar jogador:', error);
//         res.status(500).json({ error: 'Erro ao atualizar jogador' });
//     }
// };

exports.atualizarJogador = async (req, res) => {
    try {
        const { imagem, ...resto } = req.body;
        let updateData = { ...resto };

        // Se houver imagem, converter para Buffer
        if (imagem) {
            // Remove prefixo tipo 'data:image/webp;base64,'
            const base64Data = imagem.replace(/^data:image\/\w+;base64,/, "");
            updateData.imagem = Buffer.from(base64Data, 'base64');
        }

        const jogadorAtualizado = await Jogador.findByIdAndUpdate(
            req.params.id,
            updateData,
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