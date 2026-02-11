<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Store } from '../utils/store.js'
import { Engine } from '../utils/engine.js'
import { isAdmin } from '../utils/admin.js'

const jogadores = ref([])
const jogos = ref([])
const pesquisaJogador = ref('')
const router = useRouter()

//const isAdmin = ref(false)
const mostrarGestao = ref(false)
const novoNome = ref('')
const loading = ref(true)

onMounted(async () => {
    await carregarDados()
    //if (localStorage.getItem('modoAdmin') === 'true') {
    //    isAdmin.value = true
    //}
})

const carregarDados = async () => {
    try {
        // ✅ Usar os novos métodos específicos
        const [jogadoresData, jogosData] = await Promise.all([
            Store.getJogadores(),
            Store.getJogos()
        ])
        
        jogadores.value = jogadoresData || []
        jogos.value = jogosData || []
    } catch (error) {
        console.error('Erro ao carregar dados:', error)
    } finally {
        loading.value = false
    }
}

const adicionarJogador = async () => {
    if (!novoNome.value.trim()) return
    
    const novo = {
        nome: novoNome.value.trim(),
        imagem: null,
        pePreferencial: '',
        dataNascimento: '',
        altura: null
    }

    try {
        // ✅ Usar o novo método criarJogador
        const jogadorCriado = await Store.criarJogador(novo)
        jogadores.value.push(jogadorCriado)
        novoNome.value = ''
    } catch (error) {
        console.error('Erro ao adicionar jogador:', error)
    }
}

const removerJogador = async (id) => {
    if (confirm('Tem a certeza? Isto apaga o histórico e estatísticas deste jogador para sempre.')) {
        try {
            // ✅ Usar o novo método deletarJogador
            await Store.deletarJogador(id)
            jogadores.value = jogadores.value.filter(j => j.id !== id)
        } catch (error) {
            console.error('Erro ao remover jogador:', error)
        }
    }
}

const jogadoresComStats = computed(() => {
    let lista = jogadores.value.map(jogador => {
        const stats = Engine.calcularStatsJogador(jogador.id, jogos.value)
        let corRating = 'text-red-600'
        if (stats.ratingMedio >= 8.0) corRating = 'text-green-600'
        else if (stats.ratingMedio >= 7.0) corRating = 'text-blue-600'
        else if (stats.ratingMedio >= 6.0) corRating = 'text-yellow-600'
        else if (stats.ratingMedio >= 5.0) corRating = 'text-orange-600'
        return { ...jogador, ...stats, corRating }
    })

    if (pesquisaJogador.value) {
        const termo = pesquisaJogador.value.toLowerCase()
        lista = lista.filter(j => j.nome.toLowerCase().includes(termo))
    }
    return lista.sort((a, b) => a.nome.localeCompare(b.nome))
})

const jogadoresOrdenadosNome = computed(() => {
    return [...jogadores.value].sort((a, b) => a.nome.localeCompare(b.nome))
})
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <div class="bg-white rounded-lg shadow p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 class="text-xl font-bold text-gray-800">Lista de Jogadores ({{ jogadores.length }})</h2>
        
        <div class="flex gap-2 w-full md:w-auto items-center">
            <div class="relative w-full md:w-64">
                <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input v-model="pesquisaJogador" type="text" placeholder="Pesquisar..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
            </div>
            
            <button v-if="isAdmin" @click="mostrarGestao = true" 
                class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 whitespace-nowrap shadow-md">
                ⚙️ Gerir Jogadores
            </button>
        </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <div v-if="loading" class="text-gray-500 text-center py-8">
            A carregar...
        </div>
        
        <div v-else-if="jogadores.length === 0" class="text-gray-500 text-center py-8">
            Nenhum jogador encontrado. Adiciona o primeiro jogador!
        </div>
        
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <div v-for="jogador in jogadoresComStats" :key="jogador.id"
                @click="router.push({ name: 'jogador', params: { id: jogador.id } })"
                class="relative group p-6 border border-blue-700 rounded-xl bg-white cursor-pointer flex gap-5 items-center
                       transition-all duration-300
                       hover:border-green-400 hover:shadow-2xl hover:scale-[1.02]"> 
                <div class="w-24 aspect-[1000/1200]">
                    <img v-if="jogador.imagem" :src="jogador.imagem" class="w-full h-full object-cover">
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-3xl">👤</div>
                </div>
                
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-bold text-gray-800 mb-1 truncate">{{ jogador.nome }}</h3>
                    
                    <div class="space-y-1 text-gray-600">
                        <div class="flex items-center gap-2 text-sm font-medium">
                            <span title="Jogos" class="flex items-center gap-1">🎮 {{ jogador.jogos }}</span>
                            <span class="text-gray-300">|</span>
                            <span title="Golos" class="flex items-center gap-1">⚽ {{ jogador.golos }}</span>
                            <span class="text-gray-300">|</span>
                            <span title="Assistências" class="flex items-center gap-1">🎯 {{ jogador.assistencias }}</span>
                        </div>
                        
                        <div v-if="jogador.jogos > 0" class="font-bold text-base" :class="jogador.corRating">
                            ⭐ {{ jogador.ratingMedio.toFixed(2) }}
                        </div>
                        <div v-else class="text-xs text-gray-400 italic">Sem jogos</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="mostrarGestao" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="mostrarGestao = false">
        <div class="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col" @click.stop>
            <div class="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center">
                <h2 class="text-lg font-bold flex items-center gap-2">⚙️ Gerir Lista de Jogadores</h2>
                <button @click="mostrarGestao = false" class="text-gray-400 hover:text-white font-bold text-xl">✕</button>
            </div>
            <div class="p-4 flex-1 overflow-hidden flex flex-col bg-white rounded-b-lg">
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                    <h3 class="font-bold text-gray-700 mb-2 text-sm">Adicionar Novo Jogador</h3>
                    <div class="flex gap-2">
                        <input v-model="novoNome" @keyup.enter="adicionarJogador" type="text" placeholder="Nome do Craque..." class="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-green-500 text-sm">
                        <button @click="adicionarJogador" class="bg-green-500 text-white px-4 rounded hover:bg-green-600 font-bold text-xl shadow-sm">+</button>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto pr-1">
                    <div class="text-xs font-bold text-gray-400 uppercase mb-2 sticky top-0 bg-white pb-2 border-b">JOGADORES EXISTENTES ({{ jogadores.length }})</div>
                    <ul class="space-y-1">
                        <li v-for="jogador in jogadoresOrdenadosNome" :key="jogador.id" class="flex justify-between items-center p-3 hover:bg-gray-50 rounded group transition border-b border-gray-50 last:border-0">
                            <span class="text-gray-700 font-medium">{{ jogador.nome }}</span>
                            <button @click="removerJogador(jogador.id)" class="text-gray-400 hover:text-red-600 p-1 rounded transition hover:bg-red-50" title="Eliminar Jogador">🗑️</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>