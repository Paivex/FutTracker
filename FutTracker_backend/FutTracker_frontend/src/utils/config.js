export const Config = {
    tabs: [
        { id: 'dashboard', nome: '📊 Dashboard' },
        { id: 'jogadores', nome: '👥 Jogadores' },
        { id: 'jogos', nome: '📋 Jogos' },
        { id: 'classificacao', nome: '🥇 Classificação' },
        { id: 'tops', nome: '🏆 Tops' },
        { id: 'premios', nome: '🎖️ Prémios' }
    ],

    colunasClassificacao: [
        { label: 'Pos', chave: 'index', tooltip: 'Posição' },
        { label: 'Jogador', chave: 'nome', tooltip: 'Nome' },
        { label: 'P', chave: 'pontos', tooltip: 'Pontos Totais (Rating x Resultado)', highlight: true },
        { label: 'J', chave: 'jogos', tooltip: 'Jogos' },
        { label: 'R', chave: 'ratingMedio', tooltip: 'Rating Médio' },
        { label: 'W%', chave: 'winRate', tooltip: 'Win Rate' },
        { label: 'G', chave: 'golos', tooltip: 'Golos' },
        { label: 'A', chave: 'assistencias', tooltip: 'Assistências' },
        { label: 'G+A', chave: 'contribuicoes', tooltip: 'Contribuições' },
        { label: 'PB', chave: 'perdas', tooltip: 'Perdas de Bola' },
        { label: 'F', chave: 'falhancos', tooltip: 'Falhanços' },
        { label: 'GPJ', chave: 'golosPorJogo', tooltip: 'Golos por Jogo' },
        { label: 'APJ', chave: 'assistenciasPorJogo', tooltip: 'Assistências por Jogo' },
        { label: 'GAPJ', chave: 'contribuicoesPorJogo', tooltip: 'Contribuições por Jogo' },
        { label: 'PBPJ', chave: 'perdasPorJogo', tooltip: 'Perdas por Jogo' },
        { label: 'FPJ', chave: 'falhancosPorJogo', tooltip: 'Falhanços por Jogo' },
    ],

    categoriasTops: [
        { titulo: '🎮 Jogos (J)', chave: 'jogos', sulfixo: '', decimals: 0, cor: 'gray' },
        { titulo: '⭐ Rating (R)', chave: 'ratingMedio', sulfixo: '', decimals: 2, cor: 'yellow' },
        { titulo: '⚽ Golos (G)', chave: 'golos', sulfixo: '', decimals: 0, cor: 'blue' },
        { titulo: '🎯 Assistências (A)', chave: 'assistencias', sulfixo: '', decimals: 0, cor: 'green' },
        { titulo: '🤝 Contribuições (G+A)', chave: 'contribuicoes', sulfixo: '', decimals: 0, cor: 'purple' },
        { titulo: '❌ Perdas de Bola (PB)', chave: 'perdas', sulfixo: '', decimals: 0, cor: 'red' },
        { titulo: '😱 Falhanços (F)', chave: 'falhancos', sulfixo: '', decimals: 0, cor: 'orange' },
        { titulo: '📈 Win Rate (W%)', chave: 'winRate', sulfixo: '%', decimals: 1, cor: 'indigo' },
        { titulo: '⚽ Média Golos (GPJ)', chave: 'golosPorJogo', sulfixo: '', decimals: 2, cor: 'blue' },
        { titulo: '🎯 Média Assistências (APJ)', chave: 'assistenciasPorJogo', sulfixo: '', decimals: 2, cor: 'green' },
    ]
};