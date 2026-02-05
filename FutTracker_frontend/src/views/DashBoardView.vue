<script setup>
import { ref, computed, onMounted } from 'vue'
import { Store } from '../utils/store.js'
import { Engine } from '../utils/engine.js'
import { Utils } from '../utils/utils.js'

const jogadores = ref([])
const jogos = ref([])
const filtroTempo = ref('')

onMounted(async () => {
    const dados = await Store.load()
    jogadores.value = dados.jogadores || []
    jogos.value = dados.jogos || []
    
    const hoje = new Date();
    filtroTempo.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
})

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

const jogosFiltrados = computed(() => {
    if (!filtroTempo.value || filtroTempo.value === 'sempre') {
        return jogos.value;
    }
    const [ano, mes] = filtroTempo.value.split('-').map(Number);
    return jogos.value.filter(j => {
        const d = new Date(j.data);
        return d.getFullYear() === ano && (d.getMonth() + 1) === mes;
    });
})

const totalGolos = computed(() => {
    return jogosFiltrados.value.reduce((acc, jogo) => acc + jogo.golosA + jogo.golosB, 0);
})

const jogadoresCalculados = computed(() => {
    return jogadores.value.map(jogador => {
        const stats = Engine.calcularStatsJogador(jogador.id, jogosFiltrados.value);
        return { ...jogador, ...stats };
    }).filter(j => j.jogos > 0);
})

const topMarcadores = computed(() => [...jogadoresCalculados.value].sort((a, b) => b.golos - a.golos).slice(0, 3));
const topAssistencias = computed(() => [...jogadoresCalculados.value].sort((a, b) => b.assistencias - a.assistencias).slice(0, 3));
const topRating = computed(() => [...jogadoresCalculados.value].sort((a, b) => b.ratingMedio - a.ratingMedio).slice(0, 3));

const getRatingColor = (r) => {
    if (r >= 8) return 'text-green-600';
    if (r >= 7) return 'text-blue-600';
    if (r >= 6) return 'text-yellow-600';
    if (r >= 5) return 'text-orange-600';
    return 'text-red-600';
}
</script>

<template>
  <div class="space-y-8">
    
    <div class="flex justify-end">
        <select v-model="filtroTempo" class="bg-white border border-gray-200 text-sm font-medium text-gray-700 py-2 pl-3 pr-8 rounded-lg cursor-pointer shadow-sm">
            <option v-for="opt in opcoesTempo" :key="opt.valor" :value="opt.valor">{{ opt.label }}</option>
        </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex flex-col justify-center h-32">
            <h3 class="text-gray-500 font-medium mb-1">Total de Jogos</h3>
            <div class="text-4xl font-bold text-blue-600">{{ jogosFiltrados.length }}</div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex flex-col justify-center h-32">
            <h3 class="text-gray-500 font-medium mb-1">Jogadores</h3>
            <div class="text-4xl font-bold text-green-500">{{ jogadores.length }}</div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex flex-col justify-center h-32">
            <h3 class="text-gray-500 font-medium mb-1">Golos Marcados</h3>
            <div class="text-4xl font-bold text-orange-500">{{ totalGolos }}</div>
        </div>
    </div>

    <div v-if="jogadoresCalculados.length === 0" class="text-center py-12 text-gray-400">
        Sem estatísticas para mostrar neste período.
    </div>

    <div v-else class="space-y-8">

        <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div class="p-4 border-b border-gray-100 flex items-center gap-2">
                <span class="text-xl">🏆</span>
                <h3 class="font-bold text-gray-800">Top Marcadores</h3>
            </div>
            <div class="divide-y divide-gray-50">
                <div v-for="(jogador, idx) in topMarcadores" :key="jogador.id" class="flex items-center p-4 hover:bg-gray-50 transition">
                    <div class="w-8 text-center text-2xl font-bold text-gray-300 mr-4">{{ idx + 1 }}</div>
                    <div class="flex-1">
                        <div class="font-bold text-gray-800">{{ jogador.nome }}</div>
                        <div class="text-xs text-gray-400">{{ jogador.jogos }} jogos</div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-blue-600 leading-none">{{ jogador.golos }}</div>
                        <div class="text-[10px] text-gray-400 mt-1">{{ jogador.assistencias }} assist.</div>
                        <div class="text-xs font-bold mt-0.5" :class="getRatingColor(jogador.ratingMedio)">⭐ {{ jogador.ratingMedio.toFixed(2) }}</div>
                    </div>
                </div>
            </div>
            <router-link to="/tops" class="block w-full text-center py-3 bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition">▼ Ver todos</router-link>
        </div>

        <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div class="p-4 border-b border-gray-100 flex items-center gap-2">
                <span class="text-xl">🎯</span>
                <h3 class="font-bold text-gray-800">Top Assistências</h3>
            </div>
            <div class="divide-y divide-gray-50">
                <div v-for="(jogador, idx) in topAssistencias" :key="jogador.id" class="flex items-center p-4 hover:bg-gray-50 transition">
                    <div class="w-8 text-center text-2xl font-bold text-gray-300 mr-4">{{ idx + 1 }}</div>
                    <div class="flex-1">
                        <div class="font-bold text-gray-800">{{ jogador.nome }}</div>
                        <div class="text-xs text-gray-400">{{ jogador.jogos }} jogos</div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-green-600 leading-none">{{ jogador.assistencias }}</div>
                        <div class="text-[10px] text-gray-400 mt-1">{{ jogador.golos }} golos</div>
                        <div class="text-xs font-bold mt-0.5" :class="getRatingColor(jogador.ratingMedio)">⭐ {{ jogador.ratingMedio.toFixed(2) }}</div>
                    </div>
                </div>
            </div>
            <router-link to="/tops" class="block w-full text-center py-3 bg-green-50 text-green-600 font-bold text-xs hover:bg-green-100 transition">▼ Ver todos</router-link>
        </div>

        <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div class="p-4 border-b border-gray-100 flex items-center gap-2">
                <span class="text-xl">⭐</span>
                <h3 class="font-bold text-gray-800">Top Rating</h3>
            </div>
            <div class="divide-y divide-gray-50">
                <div v-for="(jogador, idx) in topRating" :key="jogador.id" class="flex items-center p-4 hover:bg-gray-50 transition">
                    <div class="w-8 text-center text-2xl font-bold text-gray-300 mr-4">{{ idx + 1 }}</div>
                    <div class="flex-1">
                        <div class="font-bold text-gray-800">{{ jogador.nome }}</div>
                        <div class="text-xs text-gray-400">{{ jogador.jogos }} jogos</div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-yellow-500 leading-none">{{ jogador.ratingMedio.toFixed(2) }}</div>
                        <div class="text-[10px] text-gray-400 mt-1">G+A: {{ jogador.golos + jogador.assistencias }}</div>
                        <div class="text-xs font-bold mt-0.5 text-transparent">.</div>
                    </div>
                </div>
            </div>
            <router-link to="/tops" class="block w-full text-center py-3 bg-yellow-50 text-yellow-600 font-bold text-xs hover:bg-yellow-100 transition">▼ Ver todos</router-link>
        </div>

    </div>
  </div>
</template>