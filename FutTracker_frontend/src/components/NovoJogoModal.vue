<script setup>
import { ref, computed, onMounted } from 'vue'
import { Engine } from '../utils/engine.js'

const props = defineProps({
  jogadores: Array
})

const emit = defineEmits(['close', 'save'])

const novoJogo = ref({
    data: new Date().toISOString().split('T')[0],
    tipoJogo: 'fut7',
    equipaA: [],
    equipaB: [],
    golosA: 0,
    golosB: 0,
    estatisticas: {},
    jdj: null
})

const jogadoresSelecionadosJogo = ref([]) 
const dragOverZone = ref(null)
const draggedPlayer = ref(null)
const draggedFrom = ref(null)

const maxJogadoresPorEquipa = computed(() => {
    const limites = { 'fut5': 5, 'fut6': 6, 'fut7': 7 };
    return limites[novoJogo.value.tipoJogo] || 7;
})

const jogadoresDisponiveis = computed(() => {
    return props.jogadores.filter(j => 
        !novoJogo.value.equipaA.includes(j.id) && 
        !novoJogo.value.equipaB.includes(j.id)
    ).sort((a, b) => a.nome.localeCompare(b.nome));
})

const todosJogadoresJogo = computed(() => {
    return [...novoJogo.value.equipaA, ...novoJogo.value.equipaB];
})

const totalGolosEquipaA = computed(() => {
    return novoJogo.value.equipaA.reduce((total, id) => total + (getStats(id).golos || 0), 0);
})
const totalGolosEquipaB = computed(() => {
    return novoJogo.value.equipaB.reduce((total, id) => total + (getStats(id).golos || 0), 0);
})
const totalAssistenciasEquipaA = computed(() => {
    return novoJogo.value.equipaA.reduce((total, id) => total + (getStats(id).assistencias || 0), 0);
})
const totalAssistenciasEquipaB = computed(() => {
    return novoJogo.value.equipaB.reduce((total, id) => total + (getStats(id).assistencias || 0), 0);
})

const golosValidosA = computed(() => novoJogo.value.equipaA.length === 0 || totalGolosEquipaA.value === novoJogo.value.golosA)
const golosValidosB = computed(() => novoJogo.value.equipaB.length === 0 || totalGolosEquipaB.value === novoJogo.value.golosB)
const assistValidasA = computed(() => novoJogo.value.equipaA.length === 0 || totalAssistenciasEquipaA.value <= novoJogo.value.golosA)
const assistValidasB = computed(() => novoJogo.value.equipaB.length === 0 || totalAssistenciasEquipaB.value <= novoJogo.value.golosB)

const jogoValido = computed(() => {
    return novoJogo.value.equipaA.length > 0 &&
           novoJogo.value.equipaB.length > 0 &&
           novoJogo.value.data &&
           golosValidosA.value &&
           golosValidosB.value &&
           assistValidasA.value &&
           assistValidasB.value;
})

const getNomeJogador = (id) => {
    const j = props.jogadores.find(x => x.id === id);
    return j ? j.nome : 'Desconhecido';
}

const getStats = (id) => {
    if (!novoJogo.value.estatisticas[id]) {
        novoJogo.value.estatisticas[id] = { jogadorId: id, golos: 0, assistencias: 0, perdas: 0, falhancos: 0 };
    }
    return novoJogo.value.estatisticas[id];
}

const calcularRating = (id) => {
    return Engine.calculateRating(getStats(id));
}

const getRatingColor = (r) => {
    if (r >= 8) return 'text-green-600';
    if (r >= 7) return 'text-blue-600';
    if (r >= 6) return 'text-yellow-600';
    if (r >= 5) return 'text-orange-600';
    return 'text-red-600';
}

const onDragStart = (evt, id, from) => {
    draggedPlayer.value = id;
    draggedFrom.value = from;
    evt.target.classList.add('opacity-50');
}
const onDragEnd = (evt) => {
    evt.target.classList.remove('opacity-50');
    draggedPlayer.value = null;
    draggedFrom.value = null;
    dragOverZone.value = null;
}
const onDragOver = (evt) => {
    evt.preventDefault();
}
const onDrop = (evt, equipaDestino) => {
    evt.preventDefault();
    dragOverZone.value = null;
    if (!draggedPlayer.value) return;

    if (equipaDestino === 'A' && novoJogo.value.equipaA.length >= maxJogadoresPorEquipa.value && draggedFrom.value !== 'A') return alert("Equipa A cheia!");
    if (equipaDestino === 'B' && novoJogo.value.equipaB.length >= maxJogadoresPorEquipa.value && draggedFrom.value !== 'B') return alert("Equipa B cheia!");

    if (draggedFrom.value === 'A') novoJogo.value.equipaA = novoJogo.value.equipaA.filter(id => id !== draggedPlayer.value);
    else if (draggedFrom.value === 'B') novoJogo.value.equipaB = novoJogo.value.equipaB.filter(id => id !== draggedPlayer.value);

    if (equipaDestino === 'A' && !novoJogo.value.equipaA.includes(draggedPlayer.value)) novoJogo.value.equipaA.push(draggedPlayer.value);
    else if (equipaDestino === 'B' && !novoJogo.value.equipaB.includes(draggedPlayer.value)) novoJogo.value.equipaB.push(draggedPlayer.value);
}

const removerJogadorEquipa = (id, equipa) => {
    if (equipa === 'A') novoJogo.value.equipaA = novoJogo.value.equipaA.filter(x => x !== id);
    if (equipa === 'B') novoJogo.value.equipaB = novoJogo.value.equipaB.filter(x => x !== id);
    delete novoJogo.value.estatisticas[id];
}

const toggleSelecionado = (id) => {
    if (jogadoresSelecionadosJogo.value.includes(id)) {
        jogadoresSelecionadosJogo.value = jogadoresSelecionadosJogo.value.filter(x => x !== id);
    } else {
        if (jogadoresSelecionadosJogo.value.length < maxJogadoresPorEquipa.value * 2) {
            jogadoresSelecionadosJogo.value.push(id);
        }
    }
}

const equipasAleatorias = () => {
    const totalNecessario = maxJogadoresPorEquipa.value * 2;
    if (jogadoresSelecionadosJogo.value.length < 2) return alert("Seleciona jogadores primeiro!");

    if (jogadoresSelecionadosJogo.value.length > totalNecessario) {
        if (!confirm(`Tens ${jogadoresSelecionadosJogo.value.length} jogadores selecionados, mas só são necessários ${totalNecessario}. Continuar?`)) {
            return;
        }
    }
    
    const pool = [...jogadoresSelecionadosJogo.value].sort(() => Math.random() - 0.5);
    
    novoJogo.value.equipaA = [];
    novoJogo.value.equipaB = [];
    novoJogo.estatisticas = {};

    pool.forEach((id, idx) => {
        if (idx % 2 === 0 && novoJogo.value.equipaA.length < maxJogadoresPorEquipa.value) novoJogo.value.equipaA.push(id);
        else novoJogo.value.equipaB.push(id);
    });
}

const guardar = () => {
    const jogoFinal = {
        id: Date.now().toString(),
        ...novoJogo.value,
        estatisticas: Object.values(novoJogo.value.estatisticas) 
    };
    emit('save', jogoFinal);

}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="$emit('close')">
    <div class="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        
        <div class="bg-blue-700 text-white p-6 rounded-t-lg flex justify-between items-center sticky top-0 z-10 shadow">
            <h2 class="text-2xl font-bold">Registar Novo Jogo</h2>
            <button @click="$emit('close')" class="text-blue-100 hover:text-white text-2xl font-bold">✕</button>
        </div>

        <div class="p-6">
            <div class="flex flex-col md:flex-row gap-4 border-b pb-6 mb-6">
                <div class="flex-1">
                    <label class="block text-sm font-bold text-gray-700 mb-1">Data</label>
                    <input v-model="novoJogo.data" type="date" class="w-full border rounded p-2">
                </div>
                <div class="flex-1">
                    <label class="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                    <select v-model="novoJogo.tipoJogo" class="w-full border rounded p-2 bg-white">
                        <option value="fut5">Fut 5</option>
                        <option value="fut6">Fut 6</option>
                        <option value="fut7">Fut 7</option>
                    </select>
                </div>
                <button @click="equipasAleatorias" class="px-5 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-bold self-end">
                    🎲 Gerar Equipas
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div class="space-y-2">
                    <h3 class="font-bold text-blue-800 text-center bg-blue-50 py-2 rounded">Equipa A ({{ novoJogo.equipaA.length }})</h3>
                    <div @drop="onDrop($event, 'A')" @dragover="onDragOver" @dragenter="dragOverZone = 'A'" @dragleave="dragOverZone = null"
                         class="border-2 border-blue-200 rounded-lg p-3 bg-blue-50 min-h-[300px]" :class="{'border-dashed border-blue-500': dragOverZone === 'A'}">
                        <div v-for="id in novoJogo.equipaA" :key="id" draggable="true" @dragstart="onDragStart($event, id, 'A')" @dragend="onDragEnd"
                             class="bg-white border-l-4 border-blue-500 shadow-sm rounded p-2 mb-2 flex justify-between cursor-move">
                            <span>{{ getNomeJogador(id) }}</span>
                            <button @click="removerJogadorEquipa(id, 'A')" class="text-red-400 font-bold">×</button>
                        </div>
                        <div v-if="novoJogo.equipaA.length === 0" class="text-center text-blue-300 mt-10">Arrasta para aqui</div>
                    </div>
                </div>

                <div class="space-y-2 order-last lg:order-none">
                    <h3 class="font-bold text-gray-700 text-center bg-gray-100 py-2 rounded">Disponíveis</h3>
                    <div class="border-2 border-gray-200 rounded-lg p-3 bg-white min-h-[300px] max-h-[300px] overflow-y-auto">
                        <div v-for="j in jogadoresDisponiveis" :key="j.id" draggable="true" @dragstart="onDragStart($event, j.id, 'disp')" @dragend="onDragEnd"
                             @click.stop="toggleSelecionado(j.id)"
                             class="border rounded p-2 mb-2 cursor-pointer select-none flex justify-between"
                             :class="jogadoresSelecionadosJogo.includes(j.id) ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'">
                            <span>{{ j.nome }}</span>
                            <span v-if="jogadoresSelecionadosJogo.includes(j.id)" class="text-green-600">✓</span>
                        </div>
                    </div>
                    <p class="text-xs text-center text-gray-400">Seleciona para gerar aleatório ou arrasta.</p>
                </div>

                <div class="space-y-2">
                    <h3 class="font-bold text-red-800 text-center bg-red-50 py-2 rounded">Equipa B ({{ novoJogo.equipaB.length }})</h3>
                    <div @drop="onDrop($event, 'B')" @dragover="onDragOver" @dragenter="dragOverZone = 'B'" @dragleave="dragOverZone = null"
                         class="border-2 border-red-200 rounded-lg p-3 bg-red-50 min-h-[300px]" :class="{'border-dashed border-red-500': dragOverZone === 'B'}">
                        <div v-for="id in novoJogo.equipaB" :key="id" draggable="true" @dragstart="onDragStart($event, id, 'B')" @dragend="onDragEnd"
                             class="bg-white border-l-4 border-red-500 shadow-sm rounded p-2 mb-2 flex justify-between cursor-move">
                            <span>{{ getNomeJogador(id) }}</span>
                            <button @click="removerJogadorEquipa(id, 'B')" class="text-red-400 font-bold">×</button>
                        </div>
                        <div v-if="novoJogo.equipaB.length === 0" class="text-center text-red-300 mt-10">Arrasta para aqui</div>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-center gap-6 py-4 bg-gray-50 rounded-xl border mb-6">
                <input v-model.number="novoJogo.golosA" type="number" class="w-20 text-center text-3xl font-bold p-2 border rounded text-blue-700">
                <span class="text-4xl text-gray-300">-</span>
                <input v-model.number="novoJogo.golosB" type="number" class="w-20 text-center text-3xl font-bold p-2 border rounded text-red-700">
            </div>

            <div class="space-y-2 mb-6 text-sm">
                <div v-if="!golosValidosA" class="text-red-600 bg-red-50 p-2 rounded">⚠️ Equipa A: Soma dos golos ({{ totalGolosEquipaA }}) deve ser igual ao placar ({{ novoJogo.golosA }}).</div>
                <div v-if="!golosValidosB" class="text-red-600 bg-red-50 p-2 rounded">⚠️ Equipa B: Soma dos golos ({{ totalGolosEquipaB }}) deve ser igual ao placar ({{ novoJogo.golosB }}).</div>
                <div v-if="!assistValidasA" class="text-yellow-700 bg-yellow-50 p-2 rounded">⚠️ Equipa A: Assistências a mais.</div>
                <div v-if="!assistValidasB" class="text-yellow-700 bg-yellow-50 p-2 rounded">⚠️ Equipa B: Assistências a mais.</div>
            </div>

            <div v-if="todosJogadoresJogo.length > 0">
                <h3 class="font-bold text-gray-800 mb-4">📊 Estatísticas Individuais</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="id in todosJogadoresJogo" :key="id" 
                         class="border rounded p-3" :class="novoJogo.equipaA.includes(id) ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-gray-800">{{ getNomeJogador(id) }}</span>
                            <span class="font-bold" :class="getRatingColor(calcularRating(id))">⭐ {{ calcularRating(id).toFixed(1) }}</span>
                        </div>
                        <div class="grid grid-cols-4 gap-2">
                             <div><label class="text-[10px] uppercase font-bold text-gray-500">Golos</label><input v-model.number="getStats(id).golos" type="number" class="w-full text-center border rounded"></div>
                             <div><label class="text-[10px] uppercase font-bold text-gray-500">Assist</label><input v-model.number="getStats(id).assistencias" type="number" class="w-full text-center border rounded"></div>
                             <div><label class="text-[10px] uppercase font-bold text-gray-500">Perdas</label><input v-model.number="getStats(id).perdas" type="number" class="w-full text-center border rounded"></div>
                             <div><label class="text-[10px] uppercase font-bold text-gray-500">Falha</label><input v-model.number="getStats(id).falhancos" type="number" class="w-full text-center border rounded bg-white"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div v-if="todosJogadoresJogo.length > 0" class="mt-8 p-4 border rounded-lg bg-emerald-50">
            <label class="block font-bold text-emerald-800 mb-2">
                🛡️ Jogador Defensivo do Jogo
            </label>

            <select
                v-model="novoJogo.jdj"
                class="w-full border rounded p-2 bg-white">
                <option :value="null">— Nenhum —</option>

                <option
                    v-for="id in todosJogadoresJogo"
                    :key="id"
                    :value="id">
                    {{ getNomeJogador(id) }}
                </option>
            </select>

            <p class="text-xs text-emerald-700 mt-1">
                Este jogador recebe +3 pontos na classificação.
            </p>
        </div>

        <div class="bg-gray-50 p-6 border-t flex justify-end gap-3 rounded-b-lg">
            <button @click="$emit('close')" class="px-6 py-2 border rounded hover:bg-gray-100">Cancelar</button>
            <button @click="guardar" :disabled="!jogoValido" 
                    class="px-8 py-2 rounded font-bold text-white transition shadow-sm"
                    :class="jogoValido ? 'bg-green-600 hover:bg-green-700 transform hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed'">
                💾 Guardar Jogo
            </button>
        </div>

    </div>
  </div>
</template>