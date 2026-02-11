const mongoose = require('mongoose');

// Schema para estatísticas de jogador
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
    
    // Equipa A
    equipaA: {
        jogadores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' }],
        golos: { type: Number, default: 0 }
    },
    
    // Equipa B
    equipaB: {
        jogadores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' }],
        golos: { type: Number, default: 0 }
    },
    
    // Estatísticas individuais de todos os jogadores
    estatisticas: [EstatisticaJogadorSchema],
    
    // Jogador Defensivo do Jogo (opcional)
    jdj: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Jogador',
        default: null 
    }
}, { timestamps: true });

// Método virtual para calcular o resultado
JogoSchema.virtual('resultado').get(function() {
    if (this.equipaA.golos > this.equipaB.golos) return 'Vitória A';
    if (this.equipaA.golos < this.equipaB.golos) return 'Vitória B';
    return 'Empate';
});

// Método virtual para total de jogadores
JogoSchema.virtual('totalJogadores').get(function() {
    return this.equipaA.jogadores.length + this.equipaB.jogadores.length;
});

module.exports = mongoose.model('Jogo', JogoSchema);