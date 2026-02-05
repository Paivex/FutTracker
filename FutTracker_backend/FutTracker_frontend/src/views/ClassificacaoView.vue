<script setup>
import { ref, computed, onMounted } from 'vue'
import { Store } from '../utils/store.js'
import SkeletonTable from '../components/SkeletonTable.vue'
import { Engine } from '../utils/engine.js'
import { Config } from '../utils/config.js'
import { Utils } from '../utils/utils.js'

const jogadores = ref([])
const jogos = ref([])
const filtroTempo = ref('')
const ordenacao = ref({ chave: 'pontos', ordem: 'desc' })

onMounted(async () => {
    const dados = await Store.load()
    jogadores.value = dados.jogadores || []
    jogos.value = dados.jogos || []
    
    const hoje = new Date();
    filtroTempo.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
})

const getRatingColor = (r) => {
    if (r >= 8) return 'text-green-600';
    if (r >= 7) return 'text-blue-600';
    if (r >= 6) return 'text-yellow-600';
    if (r >= 5) return 'text-orange-600';
    return 'text-red-600';
}

const opcoesTempo = computed(() => {
    const opcoes = [];
    const mesesComJogos = new Set();
    jogos.value.forEach(j => {
        const d = new Date(j.data);
        if(!isNaN(d)) mesesComJogos.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    });
    opcoes.push({ label: '♾️ Desde Sempre', valor: 'sempre' });
    Array.from(mesesComJogos).sort().reverse().forEach(chave => {
        const [ano, mes] = chave.split('-').map(Number);
        opcoes.push({ label: `📅 ${Utils.getNomeMes(mes - 1)} ${ano}`, valor: chave });
    });
    return opcoes;
})

const tabelaStats = computed(() => {
  
    let jogosFiltrados = jogos.value;
    if (filtroTempo.value && filtroTempo.value !== 'sempre') {
        const [ano, mes] = filtroTempo.value.split('-').map(Number);
        jogosFiltrados = jogos.value.filter(j => {
            const d = new Date(j.data);
            return d.getFullYear() === ano && (d.getMonth() + 1) === mes;
        });
    }

    let lista = jogadores.value.map(jogador => {
        const stats = Engine.calcularStatsJogador(jogador.id, jogosFiltrados);
        
        const contribuicoes = stats.golos + stats.assistencias;
        const winRate = stats.jogos > 0 ? (stats.vitorias / stats.jogos) * 100 : 0;
        

        const golosPorJogo = stats.jogos > 0 ? stats.golos / stats.jogos : 0;
        const assistenciasPorJogo = stats.jogos > 0 ? stats.assistencias / stats.jogos : 0;
        const contribuicoesPorJogo = stats.jogos > 0 ? contribuicoes / stats.jogos : 0;
        const perdasPorJogo = stats.jogos > 0 ? stats.perdas / stats.jogos : 0;
        const falhancosPorJogo = stats.jogos > 0 ? stats.falhancos / stats.jogos : 0;

        return { 
            ...jogador, ...stats, 
            contribuicoes, winRate, 
            golosPorJogo, assistenciasPorJogo, contribuicoesPorJogo, perdasPorJogo, falhancosPorJogo
        };
    }).filter(j => j.jogos > 0); 

    const { chave, ordem } = ordenacao.value;
    return lista.sort((a, b) => {
        let valA = a[chave];
        let valB = b[chave];
        if (ordem === 'asc') return valA - valB;
        return valB - valA;
    });
})

const podium = computed(() => {

    const lista = [...tabelaStats.value].sort((a, b) => b.pontos - a.pontos);
    return lista.slice(0, 3);
})

const mudarOrdenacao = (chave) => {
    if (chave === 'index' || chave === 'nome') return;
    
    if (ordenacao.value.chave === chave) {
        ordenacao.value.ordem = ordenacao.value.ordem === 'desc' ? 'asc' : 'desc';
    } else {
        ordenacao.value.chave = chave;
        ordenacao.value.ordem = 'desc';
    }
}
</script>

<template>
    <div class="p-6">
    <div v-if="loading">
       <SkeletonTable />
    </div>

    <div v-else>
       </div>
  </div>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">🥇 Classificação da Liga</h2>
            <p class="text-sm text-gray-500">Vit - 3p | Emp - 1p | Der - 0p | Golo - 2p | Ast - 1p</p>
        </div>
        <select v-model="filtroTempo" class="bg-gray-100 border-none text-sm font-medium text-gray-700 py-2 pl-3 pr-8 rounded-lg cursor-pointer">
            <option v-for="opt in opcoesTempo" :key="opt.valor" :value="opt.valor">{{ opt.label }}</option>
        </select>
    </div>

    <div v-if="podium.length > 0" class="bg-white rounded-lg shadow p-8 mb-6">
        <div class="flex justify-center items-end gap-3 md:gap-10 max-w-4xl mx-auto">
            
            <div v-if="podium[1]" class="flex flex-col items-center w-1/3 max-w-[160px] relative group">
                <div class="relative mb-3 w-full transition transform group-hover:scale-105">
                        <img v-if="podium[1].imagem" :src="podium[1].imagem" class="w-full h-full object-cover">
                        <div v-else class="w-full h-full flex items-center justify-center text-4xl bg-gray-50">👤</div>
                    <div class="absolute -top-3 -left-3 bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow border-2 border-white">2</div>
                </div>
                <div class="text-center font-bold text-gray-800 text-lg">{{ podium[1].pontos }} P</div>
                <div class="text-sm text-gray-500 font-medium truncate w-full text-center">{{ podium[1].nome }}</div>
            </div>

            <div v-if="podium[0]" class="flex flex-col items-center w-1/3 max-w-[200px] z-10 mb-6 relative group">
                <div class="relative mb-3 w-full transition transform group-hover:scale-105">
                    <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 text-5xl animate-bounce z-20">👑</div>
                        <img v-if="podium[0].imagem" :src="podium[0].imagem" class="w-full h-full object-cover">
                        <div v-else class="w-full h-full flex items-center justify-center text-5xl bg-gray-50">👤</div>
                    
                    <div class="absolute -top-4 -left-4 bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow border-2 border-white">1</div>
                </div>
                <div class="text-center font-extrabold text-gray-900 text-2xl">{{ podium[0].pontos }} P</div>
                <div class="text-base text-gray-600 font-bold truncate w-full text-center">{{ podium[0].nome }}</div>
            </div>

            <div v-if="podium[2]" class="flex flex-col items-center w-1/3 max-w-[160px] relative group">
                <div class="relative mb-3 w-full transition transform group-hover:scale-105">
                        <img v-if="podium[2].imagem" :src="podium[2].imagem" class="w-full h-full object-cover">
                        <div v-else class="w-full h-full flex items-center justify-center text-4xl bg-gray-50">👤</div>
                    <div class="absolute -top-3 -left-3 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow border-2 border-white">3</div>
                </div>
                <div class="text-center font-bold text-gray-800 text-lg">{{ podium[2].pontos }} P</div>
                <div class="text-sm text-gray-500 font-medium truncate w-full text-center">{{ podium[2].nome }}</div>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
                <thead class="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                    <tr>
                        <th v-for="col in Config.colunasClassificacao" :key="col.chave"
                            @click="mudarOrdenacao(col.chave)"
                            class="p-3 border-b cursor-pointer hover:bg-gray-100 transition select-none whitespace-nowrap"
                            :class="{'text-blue-600 font-bold bg-blue-50': ordenacao.chave === col.chave, 'text-right': col.chave !== 'nome' && col.chave !== 'index', 'text-center': col.chave === 'index'}">
                            {{ col.label }} <span v-if="ordenacao.chave === col.chave">{{ ordenacao.ordem === 'desc' ? '↓' : '↑' }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="text-sm divide-y divide-gray-100">
                    <tr v-for="(jogador, idx) in tabelaStats" :key="jogador.id" class="hover:bg-gray-50 transition">
                        <td class="p-3 text-center font-medium text-gray-500">{{ idx + 1 }}</td>
                        <td class="p-3 font-medium text-gray-900 flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200">
                                <img v-if="jogador.imagem" :src="jogador.imagem" class="w-full h-full object-cover">
                            </div>
                            {{ jogador.nome }}
                        </td>
                        <td class="p-3 text-right font-bold text-blue-600 bg-blue-50/30">{{ jogador.pontos }}</td>
                        <td class="p-3 text-right text-gray-600">{{ jogador.jogos }}</td>
                        <td class="p-3 text-right font-semibold" :class="getRatingColor(jogador.ratingMedio)">{{ jogador.ratingMedio.toFixed(2) }}</td>
                        <td class="p-3 text-right text-gray-600">{{ jogador.winRate.toFixed(1) }}%</td>
                        <td class="p-3 text-right text-gray-600">{{ jogador.golos }}</td>
                        <td class="p-3 text-right text-gray-600">{{ jogador.assistencias }}</td>
                        <td class="p-3 text-right text-purple-600 font-medium">{{ jogador.contribuicoes }}</td>
                        <td class="p-3 text-right text-red-500">{{ jogador.perdas }}</td>
                        <td class="p-3 text-right text-orange-500">{{ jogador.falhancos }}</td>
                        <td class="p-3 text-right text-gray-400">{{ jogador.golosPorJogo.toFixed(2) }}</td>
                        <td class="p-3 text-right text-gray-400">{{ jogador.assistenciasPorJogo.toFixed(2) }}</td>
                        <td class="p-3 text-right text-gray-400">{{ jogador.contribuicoesPorJogo.toFixed(2) }}</td>
                        <td class="p-3 text-right text-gray-400">{{ jogador.perdasPorJogo.toFixed(2) }}</td>
                        <td class="p-3 text-right text-gray-400">{{ jogador.falhancosPorJogo.toFixed(2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  </div>
</template>