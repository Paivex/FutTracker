const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    }],

    password: { type: String, required: true }, // hash da password da liga
    administradores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // quem pode gerir a liga (adicionar jogos, dar permissões)

}, { timestamps: true });

// Hash da password antes de salvar, se houver
LigaSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Verificar password para entrar
LigaSchema.methods.verificarPassword = async function(password) {
    if (!this.password) return true; // liga pública
    return bcrypt.compare(password, this.password);
};

// Checar se user é administrador
LigaSchema.methods.ehAdministrador = function(userId) {
    return this.administradores.includes(userId);
};

module.exports = mongoose.model('Liga', LigaSchema);