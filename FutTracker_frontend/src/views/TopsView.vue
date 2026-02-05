<script setup>
import { ref, computed, onMounted } from 'vue'
import { Store } from '../utils/store.js'
import { Engine } from '../utils/engine.js'
import { Config } from '../utils/config.js'
import { Utils } from '../utils/utils.js'
import TopModal from '../components/TopsModal.vue' 

const jogadores = ref([])
const jogos = ref([])
const filtroTempo = ref('')

const modalAberto = ref(false)
const dadosModal = ref({ titulo: '', lista: [], cor: 'blue' })

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

const jogadoresCalculados = computed(() => {
    let jogosFiltrados = jogos.value;
    if (filtroTempo.value && filtroTempo.value !== 'sempre') {
        const [ano, mes] = filtroTempo.value.split('-').map(Number);
        jogosFiltrados = jogos.value.filter(j => {
            const d = new Date(j.data);
            return d.getFullYear() === ano && (d.getMonth() + 1) === mes;
        });
    }

    return jogadores.value.map(jogador => {
        const stats = Engine.calcularStatsJogador(jogador.id, jogosFiltrados);
        const contribuicoes = stats.golos + stats.assistencias;
        const winRate = stats.jogos > 0 ? (stats.vitorias / stats.jogos) * 100 : 0;
        const golosPorJogo = stats.jogos > 0 ? stats.golos / stats.jogos : 0;
        const assistenciasPorJogo = stats.jogos > 0 ? stats.assistencias / stats.jogos : 0;

        return { ...jogador, ...stats, contribuicoes, winRate, golosPorJogo, assistenciasPorJogo };
    }).filter(j => j.jogos > 0);
})

const getListaOrdenada = (chave) => {
    return [...jogadoresCalculados.value].sort((a, b) => b[chave] - a[chave]);
}

const abrirTopCompleto = (categoria) => {
    const listaCompleta = getListaOrdenada(categoria.chave).map(j => ({
        ...j,
        valorFormatado: j[categoria.chave].toFixed(categoria.decimals) + categoria.sulfixo
    }));

    dadosModal.value = {
        titulo: categoria.titulo,
        lista: listaCompleta,
        cor: categoria.cor
    };
    modalAberto.value = true;
}

</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-800">Tabelas de Estatísticas</h2>
        <select v-model="filtroTempo" class="bg-gray-100 border-none text-sm font-medium text-gray-700 py-2 pl-3 pr-8 rounded-lg cursor-pointer">
            <option v-for="opt in opcoesTempo" :key="opt.valor" :value="opt.valor">{{ opt.label }}</option>
        </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="cat in Config.categoriasTops" :key="cat.chave" 
             class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white flex flex-col">
            
            <div :class="`bg-${cat.cor}-50 border-b border-${cat.cor}-100 p-3`">
                <h3 :class="`font-bold text-${cat.cor}-800 text-center flex items-center justify-center gap-2`">
                    {{ cat.titulo }}
                </h3>
            </div>

            <div class="divide-y divide-gray-100 flex-1">
                <div v-for="(jogador, idx) in getListaOrdenada(cat.chave).slice(0, 5)" :key="jogador.id"
                     class="flex items-center justify-between p-3 hover:bg-gray-50 text-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-6 font-bold text-center" 
                             :class="idx === 0 ? 'text-yellow-500 text-lg' : (idx === 1 ? 'text-gray-400' : (idx === 2 ? 'text-orange-400' : 'text-gray-300'))">
                            {{ idx + 1 }}
                        </div>
                        <div class="font-medium text-gray-800">{{ jogador.nome }}</div>
                    </div>
                    <div class="font-bold text-gray-700">
                        {{ jogador[cat.chave].toFixed(cat.decimals) }}{{ cat.sulfixo }}
                    </div>
                </div>
                <div v-if="getListaOrdenada(cat.chave).length === 0" class="p-4 text-center text-gray-400 text-xs">Sem dados</div>
            </div>

            <div class="p-2 border-t bg-gray-50">
                <button 
                    @click="abrirTopCompleto(cat)"
                    class="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition flex items-center justify-center gap-1">
                    Ver Tudo
                </button>
            </div>
        </div>
    </div>

    <TopModal 
        v-if="modalAberto" 
        :titulo="dadosModal.titulo" 
        :lista="dadosModal.lista" 
        :cor="dadosModal.cor" 
        @close="modalAberto = false" 
    />

  </div>
</template>