const mongoose = require('mongoose');

const EstatisticaJogadorSchema = new mongoose.Schema({
    jogadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jogador', required: true },
    golos: { type: Number, default: 0 },
    assistencias: { type: Number, default: 0 },
    perdas: { type: Number, default: 0 },
    falhancos: { type: Number, default: 0 }
}, { _id: false });

const JogoSchema = new mongoose.Schema({
    data: { type: Date, required: true },
    tipoJogo: { 
        type: String, 
        required: true,
        enum: ['fut5', 'fut6', 'fut7']
    },
    equipaA: {
        jogadores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' }],
        golos: { type: Number, default: 0 }
    },
    equipaB: {
        jogadores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' }],
        golos: { type: Number, default: 0 }
    },
    estatisticas: [EstatisticaJogadorSchema],
    jdj: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Jogador',
        default: null 
    },
    // Seed para posições fixas no campo
    seed: {
        type: Number,
        default: () => Math.floor(Math.random() * 1_000_000)
    }
}, { timestamps: true });

JogoSchema.virtual('resultado').get(function() {
    if (this.equipaA.golos > this.equipaB.golos) return 'Vitória A';
    if (this.equipaA.golos < this.equipaB.golos) return 'Vitória B';
    return 'Empate';
});

JogoSchema.virtual('totalJogadores').get(function() {
    return this.equipaA.jogadores.length + this.equipaB.jogadores.length;
});

module.exports = mongoose.model('Jogo', JogoSchema);