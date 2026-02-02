export const Engine = {
    calculateRating(stats) {
        
        const rating = 6.0 + 
                       ((stats.golos || 0) * 0.5) + 
                       ((stats.assistencias || 0) * 0.4) - 
                       ((stats.perdas || 0) * 0.3) - 
                       ((stats.falhancos || 0) * 0.4);
        return Math.max(0, Math.min(10, rating));
    },

    calcularStatsJogador(jogadorId, listaJogos) {
        let stats = {
            golos: 0, assistencias: 0, perdas: 0, falhancos: 0,
            jogos: 0, vitorias: 0, derrotas: 0, empates: 0,
            somaRatings: 0, pontos: 0
        };

        listaJogos.forEach(jogo => {
            const naEquipaA = jogo.equipaA.includes(jogadorId);
            const naEquipaB = jogo.equipaB.includes(jogadorId);
            
            if (naEquipaA || naEquipaB) {
                stats.jogos++;
                
                let multiplicador = 1; 
                let golosMinhaEquipa = naEquipaA ? jogo.golosA : jogo.golosB;
                let golosAdversario = naEquipaA ? jogo.golosB : jogo.golosA;

                if (golosMinhaEquipa > golosAdversario) {
                    stats.vitorias++;
                    multiplicador = 1.5;
                } else if (golosMinhaEquipa < golosAdversario) {
                    stats.derrotas++;
                    multiplicador = 0.75; 
                } else {
                    stats.empates++;
                }

                let ratingJogo = 6.0;
                if (jogo.estatisticas && jogo.estatisticas.length > 0) {
                    const s = jogo.estatisticas.find(x => x.jogadorId === jogadorId);
                    if (s) {
                        stats.golos += (s.golos || 0);
                        stats.assistencias += (s.assistencias || 0);
                        stats.perdas += (s.perdas || 0);
                        stats.falhancos += (s.falhancos || 0);
                        
                        ratingJogo = this.calculateRating(s);
                    }
                }
                
                stats.somaRatings += ratingJogo;
                stats.pontos += (ratingJogo * multiplicador);
            }
        });

        stats.ratingMedio = stats.jogos > 0 ? stats.somaRatings / stats.jogos : 6.0;
        return stats;
    }
};