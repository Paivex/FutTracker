const mongoose = require('mongoose');

class DatabaseService {
    static async connect(uri) {
        try {
            await mongoose.connect(uri);
            console.log("✅ Conectado ao MongoDB Atlas!");
        } catch (error) {
            console.error("❌ Erro ao ligar ao MongoDB:", error);
            process.exit(1);
        }
    }

    static async disconnect() {
        await mongoose.disconnect();
        console.log("🔌 Desconectado do MongoDB");
    }
}

module.exports = DatabaseService;