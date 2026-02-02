import { Config } from './config.js';
import { Utils } from './utils.js';
import { Engine } from './engine.js';
import { Store } from './store.js';

const { createApp } = Vue;

function getInitialNovoJogo() {
    return {
        data: new Date().toISOString().split('T')[0],
        tipoJogo: 'fut7',
        equipaA: [],
        equipaB: [],
        golosA: 0,
        golosB: 0,
        estatisticas: {}
    };
}

createApp({
    data() {
        return {
            tabs: Config.tabs,
            colunasClassificacao: Config.colunasClassificacao,
            categoriasTops: Config.categoriasTops,
            
            // --- NOVO: Variável de Admin ---
            isAdmin: false,
            // -------------------------------

            activeTab: 'dashboard',
            pesquisaJogador: '',
            jogadores: [],
            jogos: [],
            
            mostrarNovoJogo: false,
            mostrarGestaoJogadores: false,
            mostrarDetalhes: false,
            mostrarDetalhesJogo: false,
            mostrarRankingCompleto: false,
            
            novoJogador: { nome: '' },
            novoJogo: getInitialNovoJogo(),
            filtroTempo: '',
            ordenacaoClassificacao: { chave: 'pontos', ordem: 'desc' },
            jogadorSelecionado: null,
            jogoSelecionado: null,
            categoriaSelecionada: null,
    
            draggedPlayer: null,
            draggedFrom: null,
            dragOverZone: null,
            jogadoresSelecionadosJogo: [],
        }
    },
    computed: {

        jogadoresDisponiveis() {
            return this.jogadores.filter(j => 
                !this.novoJogo.equipaA.includes(j.id) && 
                !this.novoJogo.equipaB.includes(j.id)
            ).sort((a, b) => a.nome.localeCompare(b.nome));
        },
        maxJogadoresPorEquipa() {
            const limites = { 'fut5': 5, 'fut6': 6, 'fut7': 7 };
            return limites[this.novoJogo.tipoJogo] || 7;
        },
        
        jogosFiltradosTempo() {
            if (this.filtroTempo === 'sempre') return this.jogos;
            if (!this.filtroTempo) return this.jogos;
            
            const [ano, mes] = this.filtroTempo.split('-').map(Number);
            return this.jogos.filter(jogo => {
                const d = new Date(jogo.data + 'T00:00:00');
                return d.getFullYear() === ano && (d.getMonth() + 1) === mes;
            });
        },
        
        jogadoresComStats() {
            let lista = this.jogadores.map(jogador => {
                const stats = Engine.calcularStatsJogador(jogador.id, this.jogos);
                
                const contribuicoes = stats.golos + stats.assistencias;
                const winRate = stats.jogos > 0 ? (stats.vitorias / stats.jogos) * 100 : 0;
                
                return { ...jogador, ...stats, contribuicoes, winRate };
            });

            if (this.pesquisaJogador) {
                 const termo = this.pesquisaJogador.toLowerCase();
                 lista = lista.filter(j => j.nome.toLowerCase().includes(termo));
            }
            return lista.sort((a, b) => a.nome.localeCompare(b.nome));
        },

        jogadoresClassificacao() {
            let lista = this.jogadores.map(jogador => {
                const stats = Engine.calcularStatsJogador(jogador.id, this.jogosFiltradosTempo);
                
                const contribuicoes = stats.golos + stats.assistencias;
                const winRate = stats.jogos > 0 ? (stats.vitorias / stats.jogos) * 100 : 0;
                
                const golosPorJogo = stats.jogos > 0 ? stats.golos / stats.jogos : 0;
                const assistenciasPorJogo = stats.jogos > 0 ? stats.assistencias / stats.jogos : 0;
                const contribuicoesPorJogo = stats.jogos > 0 ? contribuicoes / stats.jogos : 0;
                const perdasPorJogo = stats.jogos > 0 ? stats.perdas / stats.jogos : 0;
                const falhancosPorJogo = stats.jogos > 0 ? stats.falhancos / stats.jogos : 0;
                
                return { 
                    ...jogador, 
                    ...stats, 
                    contribuicoes, 
                    winRate, 
                    golosPorJogo, 
                    assistenciasPorJogo,
                    contribuicoesPorJogo, 
                    perdasPorJogo,        
                    falhancosPorJogo      
                };
            }).filter(j => j.jogos > 0);

            const { chave, ordem } = this.ordenacaoClassificacao;
            lista.sort((a, b) => {
                let valA = a[chave];
                let valB = b[chave];
                if (ordem === 'asc') return valA - valB;
                return valB - valA;
            });
            
            return lista;
        },
        
        podiumJogadores() {
             let lista = this.jogadores.map(j => ({
                 ...j, 
                 ...Engine.calcularStatsJogador(j.id, this.jogosFiltradosTempo)
             })).filter(j => j.jogos > 0);
             return lista.sort((a, b) => b.pontos - a.pontos).slice(0, 3);
        },
        
        opcoesTempo() {
            const hoje = new Date();
            const mesAtual = hoje.getMonth();
            const anoAtual = hoje.getFullYear();

            const mesAtualChave = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}`;
            
            const opcoes = [];
            

            opcoes.push({
                label: `📅 ${Utils.getNomeMes(mesAtual)} ${anoAtual} (atual)`,
                valor: mesAtualChave
            });
            
        
            const mesesComJogos = new Set();
            this.jogos.forEach(jogo => {

                const dataJogo = new Date(jogo.data + 'T00:00:00');
                if (!isNaN(dataJogo)) {
                    const ano = dataJogo.getFullYear();
                    const mes = dataJogo.getMonth() + 1;
                    const chave = `${ano}-${String(mes).padStart(2, '0')}`;
                    
                    if (chave !== mesAtualChave) {
                        mesesComJogos.add(chave);
                    }
                }
            });
            
            const mesesOrdenados = Array.from(mesesComJogos).sort().reverse();
            mesesOrdenados.forEach(mesChave => {
                const [ano, mes] = mesChave.split('-').map(Number);
                opcoes.push({
                    label: `🗓️ ${Utils.getNomeMes(mes - 1)} ${ano}`,
                    valor: mesChave
                });
            });
        
            if (this.jogos.length > 0) {
                opcoes.push({ label: '♾️ Desde Sempre', valor: 'sempre' });
            }
            
            return opcoes;
        },

        totalGolosEquipaA() {

            if (this.novoJogo.equipaA.length === 0) return 0;
            return this.novoJogo.equipaA.reduce((total, id) => total + (this.novoJogo.estatisticas[id]?.golos || 0), 0);
        },

        totalGolosEquipaB() {

            if (this.novoJogo.equipaB.length === 0) return 0;
            return this.novoJogo.equipaB.reduce((total, id) => total + (this.novoJogo.estatisticas[id]?.golos || 0), 0);
        },

        jogoValido() {
            return this.novoJogo.equipaA.length > 0 &&
                   this.novoJogo.equipaB.length > 0 &&
                   this.novoJogo.data &&
                   this.golosValidosEquipaA &&
                   this.golosValidosEquipaB &&
                   this.assistenciasValidasEquipaA &&
                   this.assistenciasValidasEquipaB;
        },

        totalGolos() {
            return this.jogos.reduce((total, jogo) => total + jogo.golosA + jogo.golosB, 0);
        },

        // Usado para calcular os Tops (filtra pelo tempo)
        jogadoresTops() {
            return this.jogadores.map(jogador => {
                const stats = Engine.calcularStatsJogador(jogador.id, this.jogosFiltradosTempo);
                const contribuicoes = stats.golos + stats.assistencias;
                const winRate = stats.jogos > 0 ? (stats.vitorias / stats.jogos) * 100 : 0;
                
                // Médias
                const golosPorJogo = stats.jogos > 0 ? stats.golos / stats.jogos : 0;
                const assistenciasPorJogo = stats.jogos > 0 ? stats.assistencias / stats.jogos : 0;
                const contribuicoesPorJogo = stats.jogos > 0 ? contribuicoes / stats.jogos : 0;
                const perdasPorJogo = stats.jogos > 0 ? stats.perdas / stats.jogos : 0;
                const falhancosPorJogo = stats.jogos > 0 ? stats.falhancos / stats.jogos : 0;

                return {
                    ...jogador, ...stats, contribuicoes, winRate,
                    golosPorJogo, assistenciasPorJogo, contribuicoesPorJogo,
                    perdasPorJogo, falhancosPorJogo
                };
            });
        },

        topMarcadores() {
            return this.jogadoresTops
                .filter(j => j.jogos > 0)
                .sort((a, b) => b.golos - a.golos)
                .slice(0, 20);
        },

        topMarcadoresMostrar() {
            return this.expandidoMarcadores ? this.topMarcadores : this.topMarcadores.slice(0, 3);
        },

        topAssistencias() {
            return this.jogadoresTops
                .filter(j => j.jogos > 0)
                .sort((a, b) => b.assistencias - a.assistencias)
                .slice(0, 20);
        },

        topAssistenciasMostrar() {
            return this.expandidoAssistencias ? this.topAssistencias : this.topAssistencias.slice(0, 3);
        },

        topRatings() {
            return this.jogadoresTops
                .filter(j => j.jogos > 0)
                .sort((a, b) => b.ratingMedio - a.ratingMedio)
                .slice(0, 20);
        },

        topRatingsMostrar() {
            return this.expandidoRatings ? this.topRatings : this.topRatings.slice(0, 3);
        },

        jogosOrdenados() {
            return [...this.jogosFiltradosTempo].sort((a, b) => new Date(b.data) - new Date(a.data));
        },
        
        jogoDetalhes() {
            if (!this.jogoSelecionado) return null;
            return this.jogos.find(j => j.id === this.jogoSelecionado);
        },
        jogadorDetalhes() {
            if (!this.jogadorSelecionado) return null;
            const jogador = this.jogadores.find(j => j.id === this.jogadorSelecionado);
            if (!jogador) return null;
            
            const stats = Engine.calcularStatsJogador(jogador.id, this.jogos);
            
            const jogosDoJogador = this.jogos.filter(jogo => 
                jogo.equipaA.includes(jogador.id) || jogo.equipaB.includes(jogador.id)
            ).sort((a, b) => new Date(b.data) - new Date(a.data));
            
            return {
                ...jogador,
                ...stats,
                historicoJogos: jogosDoJogador
            };
        },

        maxJogadoresSelecionaveis() {
            return this.maxJogadoresPorEquipa * 2;
        },

        todosJogadoresJogo() {
            return [...this.novoJogo.equipaA, ...this.novoJogo.equipaB];
        },

        totalAssistenciasEquipaA() {
             if (this.novoJogo.equipaA.length === 0) return 0;
             return this.novoJogo.equipaA.reduce((total, id) => total + (this.novoJogo.estatisticas[id]?.assistencias || 0), 0);
        },
        totalAssistenciasEquipaB() {
             if (this.novoJogo.equipaB.length === 0) return 0;
             return this.novoJogo.equipaB.reduce((total, id) => total + (this.novoJogo.estatisticas[id]?.assistencias || 0), 0);
        },

        golosValidosEquipaA() {
            if (this.novoJogo.equipaA.length === 0) return true;
            return this.totalGolosEquipaA === (this.novoJogo.golosA || 0);
        },
        golosValidosEquipaB() {
            if (this.novoJogo.equipaB.length === 0) return true;
            return this.totalGolosEquipaB === (this.novoJogo.golosB || 0);
        },
        assistenciasValidasEquipaA() {
            if (this.novoJogo.equipaA.length === 0) return true;
            return this.totalAssistenciasEquipaA <= (this.novoJogo.golosA || 0);
        },
        assistenciasValidasEquipaB() {
            if (this.novoJogo.equipaB.length === 0) return true;
            return this.totalAssistenciasEquipaB <= (this.novoJogo.golosB || 0);
        },
    },
     methods: {
                
                alternarAdmin() {
                    if (this.isAdmin) {
                        this.isAdmin = false;
                        localStorage.removeItem('modoAdmin');
                        alert("Modo Admin: DESATIVADO 🔒");
                    } else {
                        const pass = prompt("Insira a password de Admin:");
                        if (pass === "fut123") {
                            this.isAdmin = true;
                            localStorage.setItem('modoAdmin', 'true');
                            alert("Modo Admin: ATIVADO 🔓");
                        } else if (pass !== null) {
                            alert("Password errada!");
                        }
                    }
                },

                onDragStart(event, jogadorId, from) {
                    this.draggedPlayer = jogadorId;
                    this.draggedFrom = from;
                    event.target.classList.add('dragging');
                },
                onDragEnd(event) {
                    event.target.classList.remove('dragging');
                    this.draggedPlayer = null;
                    this.draggedFrom = null;
                    this.dragOverZone = null;
                },
                onDragOver(event, zone) {
                    event.preventDefault();
                    this.dragOverZone = zone;
                },
                onDragLeave(event, zone) {
                    if (event.target.classList.contains('drop-zone')) {
                        this.dragOverZone = null;
                    }
                },
                onDrop(event, equipa) {
                    event.preventDefault();
                    this.dragOverZone = null;

                    if (!this.draggedPlayer) return;

                    if (equipa === 'A' && this.novoJogo.equipaA.length >= this.maxJogadoresPorEquipa && this.draggedFrom !== 'A') {
                        alert(`A Equipa A já tem ${this.maxJogadoresPorEquipa} jogadores!`);
                        return;
                    }
                    if (equipa === 'B' && this.novoJogo.equipaB.length >= this.maxJogadoresPorEquipa && this.draggedFrom !== 'B') {
                        alert(`A Equipa B já tem ${this.maxJogadoresPorEquipa} jogadores!`);
                        return;
                    }

                    
                    if (this.draggedFrom === 'A') {
                        this.novoJogo.equipaA = this.novoJogo.equipaA.filter(id => id !== this.draggedPlayer);
                    } else if (this.draggedFrom === 'B') {
                        this.novoJogo.equipaB = this.novoJogo.equipaB.filter(id => id !== this.draggedPlayer);
                    }

                    
                    if (equipa === 'A' && !this.novoJogo.equipaA.includes(this.draggedPlayer)) {
                        this.novoJogo.equipaA.push(this.draggedPlayer);
                    } else if (equipa === 'B' && !this.novoJogo.equipaB.includes(this.draggedPlayer)) {
                        this.novoJogo.equipaB.push(this.draggedPlayer);
                    }
                },
                removerJogadorEquipa(jogadorId, equipa) {
                    if (equipa === 'A') {
                        this.novoJogo.equipaA = this.novoJogo.equipaA.filter(id => id !== jogadorId);
                    } else if (equipa === 'B') {
                        this.novoJogo.equipaB = this.novoJogo.equipaB.filter(id => id !== jogadorId);
                    }
                    
                    if (this.novoJogo.estatisticas[jogadorId]) {
                        delete this.novoJogo.estatisticas[jogadorId];
                    }
                },
                getTipoJogoLabel(tipoJogo) {
                    const labels = {
                        'fut5': 'Fut 5',
                        'fut6': 'Fut 6',
                        'fut7': 'Fut 7'
                    };
                    return labels[tipoJogo] || tipoJogo;
                },
                adicionarJogador() {
                    if (!this.novoJogador.nome.trim()) return;
                    
                    const jogador = {
                        id: Date.now().toString(),
                        nome: this.novoJogador.nome.trim(),
                        imagem: null
                    };
                    
                    this.jogadores.push(jogador);
                    this.novoJogador.nome = '';
                    this.guardarDados();
                },

                toggleSelecionado(jogadorId) {
                    const jaSelecionado = this.jogadoresSelecionadosJogo.includes(jogadorId);

                    
                    if (jaSelecionado) {
                        this.jogadoresSelecionadosJogo = 
                            this.jogadoresSelecionadosJogo.filter(id => id !== jogadorId);
                        return;
                    }

                    if (this.jogadoresSelecionadosJogo.length >= this.maxJogadoresSelecionaveis) {
                        return; 
                    }

                    this.jogadoresSelecionadosJogo.push(jogadorId);
                },

                verDetalhesJogador(jogadorId) {
                    this.jogadorSelecionado = jogadorId;
                    this.mostrarDetalhes = true;
                },

                fecharDetalhes() {
                    this.mostrarDetalhes = false;
                    this.jogadorSelecionado = null;
                },

                atualizarImagemJogador(jogadorId, event) {
                    const file = event.target.files[0];
                    if (!file) return;
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            const targetWidth = 644;
                            const targetHeight = 900;
                            
                            canvas.width = targetWidth;
                            canvas.height = targetHeight;
                            
                            const imgRatio = img.width / img.height;
                            const targetRatio = targetWidth / targetHeight;
                            
                            let sx, sy, sWidth, sHeight;
                            
                            if (imgRatio > targetRatio) {
                                sHeight = img.height;
                                sWidth = img.height * targetRatio;
                                sx = (img.width - sWidth) / 2;
                                sy = 0;
                            } else {
                                sWidth = img.width;
                                sHeight = img.width / targetRatio;
                                sx = 0;
                                sy = (img.height - sHeight) / 2;
                            }
                            
                            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
                            
                            
                            const resizedImage = canvas.toDataURL('image/png');
                            
                            const jogador = this.jogadores.find(j => j.id === jogadorId);
                            if (jogador) {
                                jogador.imagem = resizedImage;
                                this.guardarDados();
                            }
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                },
                removerImagemJogador(jogadorId) {
                    const jogador = this.jogadores.find(j => j.id === jogadorId);
                    if (jogador) {
                        jogador.imagem = null;
                        this.guardarDados();
                    }
                },
                removerJogador(id) {
                    if (confirm('Tem a certeza que quer remover este jogador?')) {
                        this.jogadores = this.jogadores.filter(j => j.id !== id);
                        this.guardarDados();
                    }
                },
                getNomeJogador(id) {
                    const jogador = this.jogadores.find(j => j.id === id);
                    return jogador ? jogador.nome : 'Desconhecido';
                },
                getStats(jogadorId) {
                    if (!this.novoJogo.estatisticas[jogadorId]) {
                        this.novoJogo.estatisticas[jogadorId] = {
                            jogadorId,
                            golos: 0,
                            assistencias: 0,
                            perdas: 0,
                            falhancos: 0,
                        };
                    }
                    return this.novoJogo.estatisticas[jogadorId];
                },
                calcularRatingJogo(jogadorId) {
                    const stats = this.getStats(jogadorId);
                    const rating = 6.0 + 
                                   (stats.golos * 0.5) + 
                                   (stats.assistencias * 0.4) - 
                                   (stats.perdas * 0.3)-
                                   (stats.falhancos * 0.4);
                    return Math.max(0, Math.min(10, rating));
                },
                getRatingColor(rating) {
                    if (rating >= 8.0) return 'text-green-600';
                    if (rating >= 7.0) return 'text-blue-600';
                    if (rating >= 6.0) return 'text-yellow-600';
                    if (rating >= 5.0) return 'text-orange-600';
                    return 'text-red-600';
                },
                abrirDetalhesJogo(jogoId) {
                    this.jogoSelecionado = jogoId;
                    this.mostrarDetalhesJogo = true;
                },
                fecharDetalhesJogo() {
                    this.mostrarDetalhesJogo = false;
                    this.jogoSelecionado = null;
                },
                calcularRatingDoJogo(stat) {
                    const rating = 6.0 + 
                                   ((stat.golos || 0) * 0.5) + 
                                   ((stat.assistencias || 0) * 0.4) - 
                                   ((stat.perdas || 0) * 0.3) - 
                                   ((stat.falhancos || 0) * 0.4);
                    return Math.max(0, Math.min(10, rating));
                },
                removerJogoModal(jogoId) {
                    if (confirm('Tem a certeza que quer eliminar este jogo?')) {
                        this.jogos = this.jogos.filter(j => j.id !== jogoId);
                        this.guardarDados();
                        this.fecharDetalhesJogo();
                    }
                },
                guardarJogo() {
                    const jogo = {
                        id: Date.now().toString(),
                        data: this.novoJogo.data,
                        tipoJogo: this.novoJogo.tipoJogo,
                        equipaA: [...this.novoJogo.equipaA],
                        equipaB: [...this.novoJogo.equipaB],
                        golosA: this.novoJogo.golosA,
                        golosB: this.novoJogo.golosB,
                        estatisticas: Object.values(this.novoJogo.estatisticas)
                    };
                    
                    this.jogos.push(jogo);
                    this.guardarDados();

                    if (this.novoJogo.data) {
                        const d = new Date(this.novoJogo.data);
                        const ano = d.getFullYear();
                        const mes = String(d.getMonth() + 1).padStart(2, '0');
                        this.filtroTempo = `${ano}-${mes}`;
                    }

                    this.limparNovoJogo();
                    this.fecharNovoJogo(); 
                    alert('Jogo guardado com sucesso!');
                },
                limparNovoJogo() {

                    this.novoJogo = getInitialNovoJogo();
                    this.jogadoresSelecionadosJogo = [];
                },
                equipasAleatorias() {
                    const maxPorEquipa = this.maxJogadoresPorEquipa;
                    const totalNecessario = maxPorEquipa * 2;

                    if (this.jogadoresSelecionadosJogo.length < totalNecessario) {
                        alert(`Seleciona pelo menos ${totalNecessario} jogadores para este jogo.`);
                        return;
                    }

                    const base = this.jogadores
                        .filter(j => this.jogadoresSelecionadosJogo.includes(j.id))
                        .sort(() => Math.random() - 0.5)
                        .slice(0, totalNecessario);

                    this.novoJogo.equipaA = [];
                    this.novoJogo.equipaB = [];
                    this.novoJogo.estatisticas = {};

                    base.forEach((jogador, index) => {
                        if (index < maxPorEquipa) {
                            this.novoJogo.equipaA.push(jogador.id);
                        } else {
                            this.novoJogo.equipaB.push(jogador.id);
                        }
                    });
                },
                
                removerJogo(id) {
                    if (confirm('Tem a certeza que quer eliminar este jogo?')) {
                        this.jogos = this.jogos.filter(j => j.id !== id);
                        this.guardarDados();
                    }
                },
               
                mudarOrdenacao(chave) {
                    if (this.ordenacaoClassificacao.chave === chave) {
                        
                        this.ordenacaoClassificacao.ordem = this.ordenacaoClassificacao.ordem === 'desc' ? 'asc' : 'desc';
                    } else {
                        
                        this.ordenacaoClassificacao.chave = chave;
                        this.ordenacaoClassificacao.ordem = 'desc';
                    }
                },
        
                getTopOrdenado(chave) {
                    return this.jogadoresTops
                        .filter(j => j.jogos > 0) 
                        .sort((a, b) => b[chave] - a[chave])
                        .slice(0, 5); 
                },
                abrirRankingCompleto(categoria) {
                    this.categoriaSelecionada = categoria;
                    this.mostrarRankingCompleto = true;
                },
                fecharRankingCompleto() {
                    this.mostrarRankingCompleto = false;
                    this.categoriaSelecionada = null;
                },
                
                getRankingTotal(chave) {
                    return this.jogadoresTops
                        .filter(j => j.jogos > 0)
                        .sort((a, b) => b[chave] - a[chave]);
                },
                formatarData(data) {

                    return Utils.formatarData(data);
                },
                
                formatarDataCompleta(data) {
                    const d = new Date(data + 'T00:00:00');
                    const diaMesAno = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const diaSemana = d.toLocaleDateString('pt-PT', { weekday: 'long' });
                    return `${diaMesAno} - ${diaSemana}`;
                },
                
                getNomeMes(numeroMes) {
                    const meses = [
                        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                    ];
                    return meses[numeroMes];
                },

                getResultadoInfo(jogo, jogadorId) {
                    const naEquipaA = jogo.equipaA.includes(jogadorId);
                    
                    let resultado = 'D'; 
                    let isVitoria = false;
                    let isDerrota = false;

                    if (jogo.golosA > jogo.golosB) {
                        if (naEquipaA) isVitoria = true;
                        else isDerrota = true;
                    } else if (jogo.golosB > jogo.golosA) {
                        if (!naEquipaA) isVitoria = true;
                        else isDerrota = true;
                    }

                    if (isVitoria) return { texto: 'W', classe: 'text-green-600 bg-green-100 border-green-200' };
                    if (isDerrota) return { texto: 'L', classe: 'text-red-600 bg-red-100 border-red-200' };
                    return { texto: 'D', classe: 'text-gray-600 bg-gray-100 border-gray-200' };
                },

                abrirNovoJogo() {
                    this.limparNovoJogo();
                    this.mostrarNovoJogo = true;
                },

                fecharNovoJogo() {
                    this.mostrarNovoJogo = false;
                },

                async guardarDados() {
                    await Store.save(this.jogadores, this.jogos);
                },

                async carregarDados() {
                    const dados = await Store.load();
                    this.jogadores = dados.jogadores || [];
                    this.jogos = dados.jogos || [];
                }              
            },
            mounted() {
                this.carregarDados();
                
                
                const hoje = new Date();
                const mesAtual = hoje.getMonth() + 1; 
                const anoAtual = hoje.getFullYear();
                this.filtroTempo = `${anoAtual}-${String(mesAtual).padStart(2, '0')}`;

                if (localStorage.getItem('modoAdmin') === 'true') {
                    this.isAdmin = true;
                }
            }
        }).mount('#app');