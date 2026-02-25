const mongoose = require('mongoose');

const LigaSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    nome: { type: String, required: true },

    jogadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jogador'
    }],

    jogos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jogo'
    }]

}, { timestamps: true });

module.exports = mongoose.model('Liga', LigaSchema);