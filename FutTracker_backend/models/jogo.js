const mongoose = require('mongoose');

// Schema para jogador numa equipa
const JogadorEquipaSchema = new mongoose.Schema({
    jogadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' },
    golos: { type: Number, default: 0 },
    assistencias: { type: Number, default: 0 },
    perdas: { type: Number, default: 0 },
    falhancos: { type: Number, default: 0 }
}, { _id: false });

const JogoSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    data: { type: Date, required: true },
    tipo: { type: String, required: true },
    
    // Equipa A 
    equipaA: {
        nome: { type: String, required: true },
        golos: { type: Number, default: 0 },
        jogadores: [JogadorEquipaSchema]
    },
    
    // Equipa B 
    equipaB: {
        nome: { type: String, required: true },
        golos: { type: Number, default: 0 },
        jogadores: [JogadorEquipaSchema]
    }
}, { timestamps: true });

module.exports = mongoose.model('Jogo', JogoSchema);