// const API_URL = 'https://futtracker.onrender.com/api/dados';
//const API_URL = 'https://futtracker-kl7r.onrender.com/api/dados';


// Configuração da API
const API_BASE_URL =  import.meta.env.VITE_API_URL ;
const API_KEY = import.meta.env.VITE_API_KEY;

// Helper para fazer requests autenticados
const fetchAPI = async (endpoint, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    // Adicionar API Key se não for GET request
    if (options.method && options.method !== 'GET' && API_KEY) {
        defaultHeaders['x-api-key'] = API_KEY;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
};

export const Store = {
    // ========================================
    // JOGADORES
    // ========================================

    async getJogadores() {
        try {
            return await fetchAPI('/jogadores');
        } catch (error) {
            console.warn('Erro ao carregar jogadores:', error);
            throw error;
        }
    },

    async getJogador(id) {
        try {
            return await fetchAPI(`/jogadores/${id}`);
        } catch (error) {
            console.error('Erro ao carregar jogador:', error);
            throw error;
        }
    },

    async criarJogador(jogador) {
        try {
            const novoJogador = await fetchAPI('/jogadores', {
                method: 'POST',
                body: JSON.stringify(jogador),
            });
            console.log('✅ Jogador criado com sucesso!');
            return novoJogador;
        } catch (error) {
            console.error('Erro ao criar jogador:', error);
            alert('Erro ao criar jogador. Verifica a consola.');
            throw error;
        }
    },

    async atualizarJogador(id, dados) {
        try {
            const jogadorAtualizado = await fetchAPI(`/jogadores/${id}`, {
                method: 'PUT',
                body: JSON.stringify(dados),
            });
            console.log('✅ Jogador atualizado com sucesso!');
            return jogadorAtualizado;
        } catch (error) {
            console.error('Erro ao atualizar jogador:', error);
            alert('Erro ao atualizar jogador. Verifica a consola.');
            throw error;
        }
    },

    async deletarJogador(id) {
        try {
            await fetchAPI(`/jogadores/${id}`, {
                method: 'DELETE',
            });
            console.log('✅ Jogador eliminado com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar jogador:', error);
            alert('Erro ao eliminar jogador. Verifica a consola.');
            throw error;
        }
    },

    async getPremiosJogador(id) {
        try {
            return await fetchAPI(`/jogadores/${id}/premios`);
        } catch (error) {
            console.error('Erro ao carregar prémios do jogador:', error);
            return { jogador: '', premios: [] };
        }
    },

    // ========================================
    // JOGOS
    // ========================================

    async getJogos() {
        try {
            return await fetchAPI('/jogos');
        } catch (error) {
            console.warn('Erro ao carregar jogos:', error);
            throw error;
        }
    },

    async getJogo(id) {
        try {
            return await fetchAPI(`/jogos/${id}`);
        } catch (error) {
            console.error('Erro ao carregar jogo:', error);
            throw error;
        }
    },

    async criarJogo(jogo) {
        try {
            const novoJogo = await fetchAPI('/jogos', {
                method: 'POST',
                body: JSON.stringify(jogo),
            });
            console.log('✅ Jogo criado com sucesso! Estatísticas atualizadas.');
            return novoJogo;
        } catch (error) {
            console.error('Erro ao criar jogo:', error);
            alert('Erro ao criar jogo. Verifica a consola.');
            throw error;
        }
    },

    async deletarJogo(id) {
        try {
            await fetchAPI(`/jogos/${id}`, {
                method: 'DELETE',
            });
            console.log('✅ Jogo eliminado com sucesso! Estatísticas revertidas.');
        } catch (error) {
            console.error('Erro ao deletar jogo:', error);
            alert('Erro ao eliminar jogo. Verifica a consola.');
            throw error;
        }
    },

    // ========================================
    // PRÉMIOS
    // ========================================

    async getTodosPremios() {
        try {
            return await fetchAPI('/premios');
        } catch (error) {
            console.error('Erro ao carregar prémios:', error);
            return [];
        }
    },

    // ========================================
    // MIGRAÇÃO (manter compatibilidade com código antigo)
    // ========================================

    // async load() {
    //     try {
    //         const [jogadores, jogos] = await Promise.all([
    //             this.getJogadores(),
    //             this.getJogos(),
    //         ]);
    //         return { jogadores, jogos };
    //     } catch (error) {
    //         console.warn('Erro ao carregar dados da API:', error);
    //         // Fallback para localStorage
    //         return {
    //             jogadores: JSON.parse(localStorage.getItem('futebol7_jogadores')) || [],
    //             jogos: JSON.parse(localStorage.getItem('futebol7_jogos')) || [],
    //         };
    //     }
    // },

    // // Método save() depreciado - usar métodos específicos
    // async save(jogadores, jogos) {
    //     console.warn('⚠️ Método save() depreciado. Use criarJogador/criarJogo individualmente.');
    //     // Para manter compatibilidade, salvar no localStorage
    //     localStorage.setItem('futebol7_jogadores', JSON.stringify(jogadores));
    //     localStorage.setItem('futebol7_jogos', JSON.stringify(jogos));
    // },
};