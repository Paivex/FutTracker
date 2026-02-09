<script setup>
import { computed } from 'vue'
import { Engine } from '../utils/engine.js'
import { Utils } from '../utils/utils.js'

const props = defineProps({
  jogo: Object,
  jogadores: Array,
  isAdmin: Boolean
})

const emit = defineEmits(['close', 'delete'])

// Helpers
const getNome = (id) => {
    const j = props.jogadores.find(x => x.id === id)
    return j ? j.nome : 'Desconhecido'
}

const formatarData = (d) => Utils.formatarDataComDiaSemana(d)

const getTipoLabel = (t) => {
    const map = { 'fut5': 'Fut 5', 'fut6': 'Fut 6', 'fut7': 'Fut 7' }
    return map[t] || t
}

// Lógica de Stats do Jogo
const getStatsJogador = (id) => {
    if (!props.jogo.estatisticas) return null;
    return props.jogo.estatisticas.find(s => s.jogadorId === id);
}

const calcularRating = (stat) => {
    if (!stat) return 0;
    return Engine.calculateRating(stat);
}

const getRatingColor = (r) => {
    if (r >= 8) return 'text-green-600';
    if (r >= 7) return 'text-blue-600';
    if (r >= 6) return 'text-yellow-600';
    if (r >= 5) return 'text-orange-600';
    return 'text-red-600';
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="$emit('close')">
    <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        
        <div class="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6 rounded-t-lg flex justify-between items-start">
            <div>
                <h2 class="text-2xl font-bold">Ficha do Jogo</h2>
                <p class="text-gray-300 text-sm mt-1 tracking-wide">{{ formatarData(jogo.data) }}</p>
                <span class="inline-block mt-2 bg-white bg-opacity-20 px-3 py-1 rounded text-xs font-bold">
                    {{ getTipoLabel(jogo.tipoJogo) }}
                </span>
            </div>
            <button @click="$emit('close')" class="text-white hover:text-gray-200 text-2xl font-bold">✕</button>
        </div>

        <div class="p-6">
            <div class="flex items-center justify-center gap-6 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="text-center">
                    <div class="text-xs text-gray-500 mb-1 font-bold uppercase">Equipa A</div>
                    <div class="text-5xl font-bold text-blue-600">{{ jogo.golosA }}</div>
                </div>
                <div class="text-3xl text-gray-300 font-light">-</div>
                <div class="text-center">
                    <div class="text-xs text-gray-500 mb-1 font-bold uppercase">Equipa B</div>
                    <div class="text-5xl font-bold text-red-600">{{ jogo.golosB }}</div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="border-t-4 border-blue-500 bg-blue-50 rounded-b-lg p-4 shadow-sm">
                    <h3 class="font-bold text-blue-800 mb-4 text-center border-b border-blue-200 pb-2">Equipa Azul</h3>
                    <div class="space-y-3">
                        <div v-for="id in jogo.equipaA" :key="id" class="bg-white rounded p-3 shadow-sm border border-blue-100">
                            <div class="font-bold text-gray-800 mb-2">{{ getNome(id) }}</div>
                            
                            <div v-if="getStatsJogador(id)" class="text-xs space-y-1 text-gray-600">
                                <div class="flex justify-between"><span>⚽ Golos:</span> <span class="font-bold">{{ getStatsJogador(id).golos }}</span></div>
                                <div class="flex justify-between"><span>🎯 Assist:</span> <span class="font-bold">{{ getStatsJogador(id).assistencias }}</span></div>
                                <div class="flex justify-between"><span>😱 Falhanços:</span> <span class="font-bold">{{ getStatsJogador(id).falhancos }}</span></div>
                                <div class="flex justify-between"><span>❌ Perdas:</span> <span class="font-bold">{{ getStatsJogador(id).perdas }}</span></div>
                                <div class="flex justify-between pt-2 border-t mt-1">
                                    <span>⭐ Rating:</span>
                                    <span class="font-bold text-sm" :class="getRatingColor(calcularRating(getStatsJogador(id)))">
                                        {{ calcularRating(getStatsJogador(id)).toFixed(1) }}
                                    </span>
                                </div>
                            </div>
                            <div v-else class="text-xs text-gray-400 italic">Sem dados registados.</div>
                        </div>
                    </div>
                </div>

                <div class="border-t-4 border-red-500 bg-red-50 rounded-b-lg p-4 shadow-sm">
                    <h3 class="font-bold text-red-800 mb-4 text-center border-b border-red-200 pb-2">Equipa Vermelha</h3>
                    <div class="space-y-3">
                        <div v-for="id in jogo.equipaB" :key="id" class="bg-white rounded p-3 shadow-sm border border-red-100">
                            <div class="font-bold text-gray-800 mb-2">{{ getNome(id) }}</div>
                            
                            <div v-if="getStatsJogador(id)" class="text-xs space-y-1 text-gray-600">
                                <div class="flex justify-between"><span>⚽ Golos:</span> <span class="font-bold">{{ getStatsJogador(id).golos }}</span></div>
                                <div class="flex justify-between"><span>🎯 Assist:</span> <span class="font-bold">{{ getStatsJogador(id).assistencias }}</span></div>
                                <div class="flex justify-between"><span>😱 Falhanços:</span> <span class="font-bold">{{ getStatsJogador(id).falhancos }}</span></div>
                                <div class="flex justify-between"><span>❌ Perdas:</span> <span class="font-bold">{{ getStatsJogador(id).perdas }}</span></div>
                                <div class="flex justify-between pt-2 border-t mt-1">
                                    <span>⭐ Rating:</span>
                                    <span class="font-bold text-sm" :class="getRatingColor(calcularRating(getStatsJogador(id)))">
                                        {{ calcularRating(getStatsJogador(id)).toFixed(1) }}
                                    </span>
                                </div>
                            </div>
                            <div v-else class="text-xs text-gray-400 italic">Sem dados registados.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="isAdmin" class="mt-8 pt-4 border-t flex justify-center">
                <button @click="$emit('delete', jogo.id)" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold text-sm flex items-center gap-2">
                    🗑️ Eliminar Jogo (Irreversível)
                </button>
            </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-b-lg flex justify-end">
             <button @click="$emit('close')" class="text-gray-600 hover:text-gray-900 px-4 py-2 font-medium">Fechar</button>
        </div>
    </div>
  </div>
</template>