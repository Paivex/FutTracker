const mongoose = require('mongoose');

const JogadorSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    nome: { type: String, required: true },
    dataNascimento: Date,
    carta: String,
    estatisticas: {
        n_jogos: { type: Number, default: 0 },
        golos: { type: Number, default: 0 },
        assistencias: { type: Number, default: 0 },
        perdas: { type: Number, default: 0 },
        falhancos: { type: Number, default: 0 }
    },
    premios: [{
        id_jogo: String,
        tipo: String,
        descricao: String,
        data: Date
    }]
}, { timestamps: true });

module.exports = mongoose.model('Jogador', JogadorSchema);