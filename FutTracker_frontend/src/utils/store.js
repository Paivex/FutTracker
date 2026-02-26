// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://futtracker-kl7r.onrender.com/api';
//const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper para fazer requests autenticados
const fetchAPI = async (endpoint, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    // Adicionar API Key se não for GET request
    //if (options.method && options.method !== 'GET' && API_KEY) {
    //    defaultHeaders['x-api-key'] = API_KEY;
    //}

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

// Helper para fazer requests com JWT
const fetchWithToken = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
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
    // AUTENTICAÇÃO
    // ========================================

    async register(username, email, password) {
        try {
            const data = await fetchAPI('/users/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
            }

            return data;
        } catch (error) {
            console.error('Erro ao registar:', error);
            throw error;
        }
    },

    async login(email, password) {
        try {
            const data = await fetchAPI('/users/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
            }

            return data;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            throw error;
        }
    },

    async verificarToken() {
        try {
            return await fetchWithToken('/users/me');
        } catch (error) {
            console.error('Token inválido:', error);
            this.logout();
            throw error;
        }
    },

    async getMe() {
        try {
            return await fetchWithToken('/users/me');
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
    },

    estaAutenticado() {
        return localStorage.getItem('token') !== null;
    },

    obterUsername() {
        return localStorage.getItem('username') || '';
    },

    obterUserId() {
        return localStorage.getItem('userId') || '';
    },

    // ========================================
    // JOGADORES
    // ========================================

    async getJogadores() {
        try {
            const liga = JSON.parse(localStorage.getItem('ligaSelecionada') || 'null')
            const query = liga ? `?ligaId=${liga._id}` : ''
            return await fetchWithToken(`/jogadores${query}`)
        } catch (error) {
            console.warn('Erro ao carregar jogadores:', error)
            throw error
        }
    },

    async getJogador(id) {
        if (!id || id === 'undefined') {
            console.warn('⚠️ getJogador chamado com ID inválido:', id);
            throw new Error('ID de jogador inválido');
        }
        try {
            return await fetchWithToken(`/jogadores/${id}`);
        } catch (error) {
            console.error('Erro ao carregar jogador:', error);
            throw error;
        }
    },

    async criarJogador(jogador) {
        try {
            const novoJogador = await fetchWithToken('/jogadores', {
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
            const jogadorAtualizado = await fetchWithToken(`/jogadores/${id}`, {
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
            await fetchWithToken(`/jogadores/${id}`, {
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
            return await fetchWithToken(`/jogadores/${id}/premios`);
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
            const liga = JSON.parse(localStorage.getItem('ligaSelecionada') || 'null')
            const query = liga ? `?ligaId=${liga._id}` : ''
            return await fetchWithToken(`/jogos${query}`)
        } catch (error) {
            console.warn('Erro ao carregar jogos:', error)
            throw error
        }
    },

    async getJogo(id) {
        try {
            return await fetchWithToken(`/jogos/${id}`);
        } catch (error) {
            console.error('Erro ao carregar jogo:', error);
            throw error;
        }
    },

    async criarJogo(jogo) {
        try {
            const novoJogo = await fetchWithToken('/jogos', {
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
            await fetchWithToken(`/jogos/${id}`, {
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
            return await fetchWithToken('/premios');
        } catch (error) {
            console.error('Erro ao carregar prémios:', error);
            return [];
        }
    },

    // ========================================
    // LIGAS
    // ========================================

    async getLigas() {
        try {
            return await fetchWithToken('/ligas');
        } catch (error) {
            console.warn('Erro ao carregar ligas:', error);
            throw error;
        }
    },

    async getLiga(id) {
        if (!id || id === 'undefined') {
            console.warn('⚠️ getLiga chamado com ID inválido:', id);
            throw new Error('ID de liga inválido');
        }

        try {
            return await fetchWithToken(`/ligas/${id}`);
        } catch (error) {
            console.error('Erro ao carregar liga:', error);
            throw error;
        }
    },

    async getLigasDoUser() {
        try {
            const userId = this.obterUserId();

            if (!userId) {
                throw new Error('User não autenticado');
            }

            return await fetchWithToken(`/ligas/user/${userId}`);
        } catch (error) {
            console.error('Erro ao carregar ligas do user:', error);
            throw error;
        }
    },

    async criarLiga(liga) {
        try {
            const novaLiga = await fetchWithToken('/ligas', {
                method: 'POST',
                body: JSON.stringify(liga),
            });

            console.log('✅ Liga criada com sucesso!');
            return novaLiga;
        } catch (error) {
            console.error('Erro ao criar liga:', error);
            alert('Erro ao criar liga. Verifica a consola.');
            throw error;
        }
    },

    async atualizarLiga(id, dados) {
        try {
            const ligaAtualizada = await fetchWithToken(`/ligas/${id}`, {
                method: 'PUT',
                body: JSON.stringify(dados),
            });

            console.log('✅ Liga atualizada com sucesso!');
            return ligaAtualizada;
        } catch (error) {
            console.error('Erro ao atualizar liga:', error);
            alert('Erro ao atualizar liga. Verifica a consola.');
            throw error;
        }
    },

    async deletarLiga(id) {
        try {
            await fetchWithToken(`/ligas/${id}`, {
                method: 'DELETE',
            });

            console.log('✅ Liga eliminada com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar liga:', error);
            alert('Erro ao eliminar liga. Verifica a consola.');
            throw error;
        }
    },

    // Entrar numa liga com password
    async entrarLiga(id, password) {
        try {
            const body = password ? { password } : {};
            return await fetchWithToken(`/ligas/${id}/entrar`, {
                method: 'POST',
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error('Erro ao entrar na liga:', error);
            alert('Password incorreta ou erro ao entrar na liga.');
            throw error;
        }
    },

    // Adicionar outro administrador (só se fores admin)
    async adicionarAdministrador(ligaId, userIdToAdd) {
        try {
            return await fetchWithToken(`/ligas/${ligaId}/adicionarAdministrador`, {
                method: 'POST',
                body: JSON.stringify({ userIdToAdd }),
            });
        } catch (error) {
            console.error('Erro ao adicionar administrador:', error);
            alert('Não foi possível adicionar administrador.');
            throw error;
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