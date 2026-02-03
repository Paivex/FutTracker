export const Engine = {

    // Continua a existir (apenas para visual / ranking de rating)
    calculateRating(stats) {
        const rating = 6.0 + 
            ((stats.golos || 0) * 0.5) + 
            ((stats.assistencias || 0) * 0.25) - 
            ((stats.perdas || 0) * 0.25) - 
            ((stats.falhancos || 0) * 0.25);

        return Math.max(0, Math.min(10, rating));
    },

    calcularStatsJogador(jogadorId, listaJogos) {
        let stats = {
            golos: 0,
            assistencias: 0,
            perdas: 0,
            falhancos: 0,

            jogos: 0,
            vitorias: 0,
            empates: 0,
            derrotas: 0,

            somaRatings: 0,
            ratingMedio: 6.0,

            pontos: 0
        };

        listaJogos.forEach(jogo => {
            const naEquipaA = jogo.equipaA.includes(jogadorId);
            const naEquipaB = jogo.equipaB.includes(jogadorId);

            if (!naEquipaA && !naEquipaB) return;

            stats.jogos++;

            const golosMinhaEquipa = naEquipaA ? jogo.golosA : jogo.golosB;
            const golosAdversario = naEquipaA ? jogo.golosB : jogo.golosA;

            // 🎯 PONTOS POR RESULTADO
            if (golosMinhaEquipa > golosAdversario) {
                stats.vitorias++;
                stats.pontos += 3;
            } else if (golosMinhaEquipa === golosAdversario) {
                stats.empates++;
                stats.pontos += 1;
            } else {
                stats.derrotas++;
                // 0 pontos
            }

            let ratingJogo = 6.0;

            // 📊 ESTATÍSTICAS INDIVIDUAIS
            if (jogo.estatisticas && jogo.estatisticas.length > 0) {
                const s = jogo.estatisticas.find(x => x.jogadorId === jogadorId);
                if (s) {
                    const golos = s.golos || 0;
                    const assistencias = s.assistencias || 0;

                    stats.golos += golos;
                    stats.assistencias += assistencias;
                    stats.perdas += (s.perdas || 0);
                    stats.falhancos += (s.falhancos || 0);

                    // 🎯 PONTOS POR DESEMPENHO
                    stats.pontos += (golos * 2);
                    stats.pontos += (assistencias * 1);

                    ratingJogo = this.calculateRating(s);
                }
            }

            stats.somaRatings += ratingJogo;
        });

        stats.ratingMedio =
            stats.jogos > 0 ? stats.somaRatings / stats.jogos : 6.0;

        return stats;
    }
};
