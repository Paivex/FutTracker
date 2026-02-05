<script setup>
import { computed, ref, reactive, watch } from 'vue'
import { Engine } from '../utils/engine.js'
import { Utils } from '../utils/utils.js'

const props = defineProps({
  jogador: Object,
  todosJogos: Array,
  isAdmin: Boolean 
})

const emit = defineEmits(['close', 'update'])

const emEdicao = ref(false)
const form = reactive({
    nome: '',
    pePreferencial: '',
    dataNascimento: '',
    altura: null,
    imagem: null
})

watch(() => props.jogador, (newVal) => {
    if (newVal) {
        Object.assign(form, JSON.parse(JSON.stringify(newVal)))
    }
}, { immediate: true })

const stats = computed(() => {
    if (!props.jogador || !props.todosJogos) return null;
    return Engine.calcularStatsJogador(props.jogador.id, props.todosJogos);
})

const historicoJogos = computed(() => {
    if (!props.jogador || !props.todosJogos) return [];
    return props.todosJogos
        .filter(j => j.equipaA.includes(props.jogador.id) || j.equipaB.includes(props.jogador.id))
        .sort((a, b) => new Date(b.data) - new Date(a.data));
})

const toggleEdicao = () => {
    if (emEdicao.value) {
        Object.assign(form, props.jogador)
        emEdicao.value = false
    } else {
        emEdicao.value = true
    }
}

const guardarAlteracoes = () => {
    const jogadorAtualizado = { ...props.jogador, ...form };
    emit('update', jogadorAtualizado);
    emEdicao.value = false;
}

const atualizarFoto = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const imagemRedimensionada = await Utils.resizeImage(file);
        form.imagem = imagemRedimensionada;
        if (!emEdicao.value) {
            const jogadorAtualizado = { ...props.jogador, imagem: imagemRedimensionada };
            emit('update', jogadorAtualizado);
        }
    } catch (e) {
        console.error(e);
    }
}

const removerFoto = () => {
    if(confirm("Remover a foto?")) {
        form.imagem = null;
        if (!emEdicao.value) {
             const jogadorAtualizado = { ...props.jogador, imagem: null };
             emit('update', jogadorAtualizado);
        }
    }
}


const getRatingColor = (r) => {
    if (r >= 8) return 'text-green-600';
    if (r >= 7) return 'text-blue-600';
    if (r >= 6) return 'text-yellow-600';
    if (r >= 5) return 'text-orange-600';
    return 'text-red-600';
}
const getStatsNoJogo = (jogo) => {
    if (!jogo.estatisticas) return { golos:0, assistencias:0, perdas:0, falhancos:0 };
    return jogo.estatisticas.find(s => s.jogadorId === props.jogador.id) || { golos:0, assistencias:0, perdas:0, falhancos:0 };
}

const getRatingNoJogo = (jogo) => {
    const s = getStatsNoJogo(jogo);
    return Engine.calculateRating(s);
}

const getResultadoJogo = (jogo) => {
    const naEquipaA = jogo.equipaA.includes(props.jogador.id);
    let texto = 'D';
    let classe = 'bg-gray-100 text-gray-600'; 

    if (jogo.golosA > jogo.golosB) {
        if (naEquipaA) { texto='W'; classe='bg-green-100 text-green-600'; }
        else { texto='L'; classe='bg-red-100 text-red-600'; }
    } else if (jogo.golosB > jogo.golosA) {
        if (!naEquipaA) { texto='W'; classe='bg-green-100 text-green-600'; }
        else { texto='L'; classe='bg-red-100 text-red-600'; }
    }
    return { texto, classe };
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="$emit('close')">
    <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        
        <div class="bg-blue-700 text-white p-6 rounded-t-lg flex justify-between items-start">
            <div>
                <h2 class="text-3xl font-bold">{{ jogador.nome }}</h2>
                <div class="mt-2 flex items-center space-x-4">
                    <span class="text-2xl font-bold text-yellow-400">⭐ {{ stats.ratingMedio.toFixed(2) }}</span>
                    <span class="text-blue-200">{{ stats.jogos }} jogos</span>
                </div>
            </div>
            <button @click="$emit('close')" class="text-white hover:text-gray-200 text-2xl font-bold">✕</button>
        </div>

        <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Perfil do Jogador</h3>

            <div class="flex flex-col md:flex-row gap-6 mb-8">
                <div class="w-full md:w-60 flex flex-col items-center gap-2">
                    <div class="aspect-[1288/1800] w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center relative">
                        <img v-if="form.imagem || jogador.imagem" :src="form.imagem || jogador.imagem" class="w-full h-full object-contain">
                        <div v-else class="text-5xl text-gray-300">👤</div>
                    </div>
                    <div v-if="isAdmin" class="w-full space-y-2">
                        <input type="file" accept="image/*" @change="atualizarFoto" class="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                        <button v-if="form.imagem || jogador.imagem" @click="removerFoto" class="w-full px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium">🗑️ Remover Foto</button>
                    </div>
                </div>

                <div class="flex-1 bg-white border border-gray-200 rounded-lg p-4 space-y-4 h-fit">
                    <div class="flex justify-between items-center border-b pb-2">
                        <h4 class="font-bold text-gray-700">Dados Pessoais</h4>
                        <div v-if="isAdmin">
                             <button v-if="!emEdicao" @click="toggleEdicao" class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-bold flex items-center gap-1">✏️ Editar</button>
                            <div v-else class="flex gap-2">
                                <button @click="toggleEdicao" class="text-xs px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 font-bold">Cancelar</button>
                                <button @click="guardarAlteracoes" class="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-bold">💾 Guardar</button>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div><label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome</label><input v-model="form.nome" :disabled="!emEdicao" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-600"></div>
                        <div><label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pé</label>
                            <select v-if="emEdicao" v-model="form.pePreferencial" class="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"><option value="">-</option><option value="Direito">Direito</option><option value="Esquerdo">Esquerdo</option><option value="Ambidestro">Ambidestro</option></select>
                            <input v-else :value="form.pePreferencial || '—'" disabled type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-600">
                        </div>
                        <div><label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nascimento</label><input v-model="form.dataNascimento" :disabled="!emEdicao" type="date" class="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-600"></div>
                        <div><label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Altura (cm)</label><input v-model="form.altura" :disabled="!emEdicao" type="number" class="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-600"></div>
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Estatísticas Gerais</h3>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4"> 
                    <div class="bg-purple-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-purple-600">{{ stats.jogos }}</div><div class="text-xs text-gray-600 mt-1">🥅 Jogos</div></div>
                    <div class="bg-blue-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-blue-600">{{ stats.golos }}</div><div class="text-xs text-gray-600 mt-1">⚽ Golos</div></div>
                    <div class="bg-green-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-green-600">{{ stats.assistencias }}</div><div class="text-xs text-gray-600 mt-1">🎯 Assistências</div></div>
                    <div class="bg-orange-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-orange-600">{{ stats.falhancos }}</div><div class="text-xs text-gray-600 mt-1">😱 Falhanços</div></div>   
                    <div class="bg-red-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-red-600">{{ stats.perdas }}</div><div class="text-xs text-gray-600 mt-1">❌ Perdas</div></div>                          
                </div>
            </div>

            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Balanço</h3>
                <div class="grid grid-cols-4 gap-4">
                    <div class="bg-green-50 rounded-lg p-4 text-center"><div class="text-2xl font-bold text-green-600">{{ stats.vitorias }}</div><div class="text-sm text-gray-600 mt-1">Vitórias</div></div>
                    <div class="bg-gray-50 rounded-lg p-4 text-center"><div class="text-2xl font-bold text-gray-600">{{ stats.empates }}</div><div class="text-sm text-gray-600 mt-1">Empates</div></div>
                    <div class="bg-red-50 rounded-lg p-4 text-center"><div class="text-2xl font-bold text-red-600">{{ stats.derrotas }}</div><div class="text-sm text-gray-600 mt-1">Derrotas</div></div>
                    <div class="bg-blue-50 rounded-lg p-4 text-center"><div class="text-2xl font-bold text-blue-600">{{ stats.jogos > 0 ? ((stats.vitorias / stats.jogos) * 100).toFixed(1) : '0.0' }}%</div><div class="text-sm text-gray-600 mt-1">Win Rate</div></div>
                </div>
            </div>

            <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Médias por Jogo</h3>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div class="bg-blue-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-blue-600">{{ stats.jogos > 0 ? (stats.golos/stats.jogos).toFixed(2) : '0.00' }}</div>
                        <div class="text-xs text-gray-600 mt-1">Golos/jogo</div>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-green-600">{{ stats.jogos > 0 ? (stats.assistencias/stats.jogos).toFixed(2) : '0.00' }}</div>
                        <div class="text-xs text-gray-600 mt-1">Assist./jogo</div>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-purple-600">{{ stats.jogos > 0 ? ((stats.golos + stats.assistencias)/stats.jogos).toFixed(2) : '0.00' }}</div>
                        <div class="text-xs text-gray-600 mt-1">Contrib./jogo</div>
                    </div>
                    <div class="bg-red-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-red-600">{{ stats.jogos > 0 ? (stats.perdas/stats.jogos).toFixed(2) : '0.00' }}</div>
                        <div class="text-xs text-gray-600 mt-1">Perdas/jogo</div>
                    </div>
                    <div class="bg-orange-50 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-orange-600">{{ stats.jogos > 0 ? (stats.falhancos/stats.jogos).toFixed(2) : '0.00' }}</div>
                        <div class="text-xs text-gray-600 mt-1">Falhanços/jogo</div>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Últimos Jogos</h3>
                
                <div v-if="historicoJogos.length === 0" class="text-center text-gray-400 py-4">
                    Nenhum jogo registado.
                </div>

                <div v-else class="space-y-4">
                    <div v-for="jogo in historicoJogos.slice(0, 10)" :key="jogo.id" 
                         class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        
                        <div class="text-center text-xs text-gray-400 font-bold tracking-wider mb-3 uppercase">
                            {{ Utils.formatarDataCompleta(jogo.data) }}
                        </div>

                        <div class="flex justify-center items-center gap-4 mb-4">
                            <span class="text-3xl font-bold text-blue-600">{{ jogo.golosA }}</span>
                            <span class="text-gray-300 font-light text-2xl">-</span>
                            <span class="text-3xl font-bold text-red-600">{{ jogo.golosB }}</span>
                            
                            <span :class="getResultadoJogo(jogo).classe" class="ml-2 px-2 py-0.5 rounded text-sm font-bold border border-opacity-20">
                                {{ getResultadoJogo(jogo).texto }}
                            </span>
                        </div>

                        <div class="flex justify-center items-center gap-4 text-sm text-gray-600 border-t pt-3">
                            <div class="flex items-center gap-1" title="Golos">
                                ⚽ <strong>{{ getStatsNoJogo(jogo).golos }}</strong>
                            </div>
                            <div class="flex items-center gap-1" title="Assistências">
                                🎯 <strong>{{ getStatsNoJogo(jogo).assistencias }}</strong>
                            </div>
                            <div class="flex items-center gap-1" title="Perdas">
                                ❌ <strong>{{ getStatsNoJogo(jogo).perdas }}</strong>
                            </div>
                            <div class="flex items-center gap-1" title="Falhanços">
                                😱 <strong>{{ getStatsNoJogo(jogo).falhancos }}</strong>
                            </div>
                            <div class="w-px h-4 bg-gray-300 mx-2"></div>
                            <div class="flex items-center gap-1" :class="getRatingColor(getRatingNoJogo(jogo))">
                                ⭐ <strong>{{ getRatingNoJogo(jogo).toFixed(1) }}</strong>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
        
        <div class="bg-gray-50 p-4 rounded-b-lg flex justify-end">
             <button @click="$emit('close')" class="text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium transition">Fechar</button>
        </div>
    </div>
  </div>
</template>