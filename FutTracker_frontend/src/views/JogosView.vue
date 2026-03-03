<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Store } from '../utils/store.js'
import { Utils } from '../utils/utils.js'
import NovoJogoModal from '../components/NovoJogoModal.vue'

const router = useRouter()

const jogos = ref([])
const jogadores = ref([])
const filtroTempo = ref('')
const mostrarNovoJogo = ref(false)
const loading = ref(true)

onMounted(async () => {
    try {
        // ✅ Usar os novos métodos específicos
        const [jogosData, jogadoresData] = await Promise.all([
            Store.getJogos(),
            Store.getJogadores()
        ])

        // ✅ CORREÇÃO: Adaptar formato do backend para o formato esperado pela view
        jogos.value = (jogosData || []).map(j => {
            console.log('Jogo original:', j); // Debug
            
            return {
                ...j,
                // Os jogadores já vêm como array de IDs (strings), não precisam de transformação
                equipaA: j.equipaA?.jogadores || [],
                equipaB: j.equipaB?.jogadores || [],
                golosA: j.equipaA?.golos || 0,
                golosB: j.equipaB?.golos || 0,
                jdj: j.jdj || null
            };
        });

        console.log('Jogos processados:', jogos.value); // Debug

        jogadores.value = jogadoresData || []

        const hoje = new Date()
        filtroTempo.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

    } catch (error) {
        console.error('Erro ao carregar dados:', error)
    } finally {
        loading.value = false
    }
})

const getNomeJogador = (id) => {
    const j = jogadores.value.find(x => x._id === id)
    return j ? j.nome : 'Desconhecido'
}

const formatarData = (d) => Utils.formatarDataComDiaSemana(d)
const getTipoJogoLabel = (t) => t === 'fut5' ? 'Fut 5' : (t === 'fut6' ? 'Fut 6' : 'Fut 7')

const salvarNovoJogo = async (jogo) => {
    try {
        console.log('Criando jogo:', jogo); // Debug
        
        // ✅ Usar o novo método criarJogo
        const jogoCriado = await Store.criarJogo(jogo)
        
        console.log('Jogo criado:', jogoCriado); // Debug
        
        // Adaptar o jogo criado para o formato da view
        jogos.value.push({
            ...jogoCriado,
            equipaA: jogoCriado.equipaA?.jogadores || [],
            equipaB: jogoCriado.equipaB?.jogadores || [],
            golosA: jogoCriado.equipaA?.golos || 0,
            golosB: jogoCriado.equipaB?.golos || 0,
            jdj: jogoCriado.jdj || null
        });
        
        mostrarNovoJogo.value = false
        alert("Jogo guardado! ⚽")
    } catch (error) {
        console.error('Erro ao criar jogo:', error)
        alert("Erro ao guardar jogo. Verifica a consola.")
    }
}

const abrirDetalhes = (jogo) => {
    // Navegar para a página dedicada do jogo
    router.push({ name: 'jogo', params: { id: jogo._id } })
}

// Filtros
const jogosFiltrados = computed(() => {
    let lista = jogos.value
    if (filtroTempo.value && filtroTempo.value !== 'sempre') {
        const [ano, mes] = filtroTempo.value.split('-').map(Number)
        lista = lista.filter(jogo => {
            const d = new Date(jogo.data) // A data já vem em formato ISO do backend
            return d.getFullYear() === ano && (d.getMonth() + 1) === mes
        })
    }
    return lista.sort((a, b) => new Date(b.data) - new Date(a.data))
})

const opcoesTempo = computed(() => {
    const opcoes = []
    const meses = new Set()
    jogos.value.forEach(j => {
        const d = new Date(j.data) // A data já vem em formato ISO do backend
        if(!isNaN(d)) meses.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
    })
    opcoes.push({ label: '♾️ Desde Sempre', valor: 'sempre' })
    Array.from(meses).sort().reverse().forEach(k => {
        const [a, m] = k.split('-').map(Number)
        opcoes.push({ label: `📅 ${Utils.getNomeMes(m-1)} ${a}`, valor: k })
    })
    return opcoes
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 class="text-xl font-bold text-gray-800">Jogos ({{ jogosFiltrados.length }})</h2>
        <div class="flex gap-4 w-full md:w-auto">
            <select v-model="filtroTempo" class="bg-gray-100 border-none text-sm font-medium text-gray-700 py-2 pl-3 pr-8 rounded-lg cursor-pointer">
                <option v-for="opt in opcoesTempo" :key="opt.valor" :value="opt.valor">{{ opt.label }}</option>
            </select>
            <button v-if="isAdmin" @click="mostrarNovoJogo = true" class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap">
                ⚽ Registar Jogo
            </button>
        </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <div v-if="loading" class="text-center py-12 text-gray-400">
            A carregar jogos...
        </div>
        <div v-else-if="jogosFiltrados.length === 0" class="text-center py-12 text-gray-400">
            Nenhum jogo encontrado.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="jogo in jogosFiltrados" :key="jogo._id"
                 @click="abrirDetalhes(jogo)"
                 class="border-2 border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-md transition bg-white cursor-pointer relative group">
                
                <div class="text-xs text-gray-400 mb-2 flex justify-between">
                    <span>{{ formatarData(jogo.data) }}</span>
                    <span class="bg-gray-100 px-2 rounded font-medium">{{ getTipoJogoLabel(jogo.tipoJogo) }}</span>
                </div>
                <div class="flex items-center justify-center gap-3 mb-3">
                    <span class="text-2xl font-bold text-blue-600">{{ jogo.golosA }}</span>
                    <span class="text-gray-300">-</span>
                    <span class="text-2xl font-bold text-red-600">{{ jogo.golosB }}</span>
                </div>
                <div class="space-y-2 text-xs">
                    <div class="bg-blue-50 rounded p-2 text-blue-900">{{ jogo.equipaA.map(id => getNomeJogador(id)).join(' • ') }}</div>
                    <div class="bg-red-50 rounded p-2 text-red-900">{{ jogo.equipaB.map(id => getNomeJogador(id)).join(' • ') }}</div>
                </div>
            </div>
        </div>
    </div>

    <NovoJogoModal v-if="mostrarNovoJogo" :jogadores="jogadores" @close="mostrarNovoJogo = false" @save="salvarNovoJogo"/>
  </div>
</template>