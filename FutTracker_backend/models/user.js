const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }
}, { timestamps: true });

// Hash da password antes de guardar
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Método para comparar passwords no login
UserSchema.methods.comparePassword = async function (passwordIntroduzida) {
    return bcrypt.compare(passwordIntroduzida, this.password);
};

module.exports = mongoose.model('User', UserSchema);