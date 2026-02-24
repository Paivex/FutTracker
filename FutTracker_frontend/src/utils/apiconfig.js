// api.config.js

// ============================================
// CONFIGURAÇÃO DA API
// ============================================
// Este ficheiro contém as configurações de conexão à API.
// Adiciona este ficheiro ao .gitignore para não commitar 
// as tuas configurações locais.
// ============================================

const config = {
    // Para DESENVOLVIMENTO LOCAL
    development: {
        API_BASE_URL: 'http://localhost:3000/api',
        API_KEY: 'sua-chave-local-aqui'
    },
    
    // Para PRODUÇÃO (Render/Deploy)
    production: {
        API_BASE_URL: import.meta.env.VITE_API_URL || 'https://futtracker.onrender.com/api',
        API_KEY: import.meta.env.VITE_API_KEY || ''
    }
};

// ============================================
// ALTERAR AQUI PARA MUDAR ENTRE LOCAL/PRODUÇÃO
// ============================================
const AMBIENTE = 'production'; // 'development' ou 'production'

// Exportar configuração ativa
export const API_BASE_URL = config[AMBIENTE].API_BASE_URL;
export const API_KEY = config[AMBIENTE].API_KEY;

// Log para debug (remover em produção final)
console.log(`🔌 API Config: Usando ambiente "${AMBIENTE}"`);
console.log(`🌐 Base URL: ${API_BASE_URL}`);