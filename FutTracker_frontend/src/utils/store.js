const API_URL = 'https://futtracker.onrender.com/api/dados';

export const Store = {
   
    async load() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Falha na API');
            return await response.json();
        } catch (error) {

            console.warn("API desligada. A tentar ler do localStorage...", error);

            return {
                jogadores: JSON.parse(localStorage.getItem('futebol7_jogadores')) || [],
                jogos: JSON.parse(localStorage.getItem('futebol7_jogos')) || []
            };
        }
    },

    async save(jogadores, jogos) {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jogadores, jogos })
            });

            if (!res.ok) {
            throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            }

            console.log("Dados guardados no Servidor!");
        } catch (error) {
            console.error("Erro ao guardar no servidor:", error);
            alert("Atenção: O servidor parece estar desligado. Os dados NÃO foram guardados.");
        }
    }
};