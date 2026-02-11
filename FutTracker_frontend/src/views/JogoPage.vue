<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Store } from '../utils/store.js'
import { Utils } from '../utils/utils.js'
import { Engine } from '../utils/engine.js'
import { isAdmin } from '../utils/admin.js'

const route = useRoute()
const router = useRouter()

const jogo = ref(null)
const jogadores = ref([])
const loading = ref(true)
//const isAdmin = ref(false)
const selectedTab = ref('Elenco')

const loadJogo = async (idParam) => {
  loading.value = true
  try {
    // ✅ Carregar jogo específico e jogadores
    const [jogoData, jogadoresData] = await Promise.all([
      Store.getJogo(idParam),
      Store.getJogadores()
    ])
    
    jogo.value = jogoData
    jogadores.value = jogadoresData || []
    
    //if (localStorage.getItem('modoAdmin') === 'true') {
    //  isAdmin.value = true
    //}
  } catch (error) {
    console.error('Erro ao carregar jogo:', error)
    jogo.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadJogo(route.params.id)
})

// Recarregar quando o param mudar (navegação entre jogos reutiliza o mesmo componente)
watch(() => route.params.id, (newId) => {
  loadJogo(newId)
})

const getNome = (id) => {
  const j = jogadores.value.find(x => x.id === id)
  return j ? j.nome : 'Desconhecido'
}

const getStatsJogador = (id) => {
  if (!jogo.value || !jogo.value.estatisticas) return null
  return jogo.value.estatisticas.find(s => s.jogadorId === id) || null
}

const calcularRating = (stat) => Engine.calculateRating(stat || {})

const getPontosJogador = (playerId) => {
  if (!jogo.value) return 0
  const naEquipaA = jogo.value.equipaA.includes(playerId)
  const naEquipaB = jogo.value.equipaB.includes(playerId)
  if (!naEquipaA && !naEquipaB) return 0

  let pontos = 0

  // Pontos por resultado do jogo
  if (jogo.value.golosA !== jogo.value.golosB) {
    const ganhou = (naEquipaA && jogo.value.golosA > jogo.value.golosB) || (naEquipaB && jogo.value.golosB > jogo.value.golosA)
    if (ganhou) pontos += 3
  } else {
    // empate
    pontos += 1
  }

  // Pontos individuais (golos = 2, assistencias = 1)
  const s = getStatsJogador(playerId) || {}
  pontos += (s.golos || 0) * 2
  pontos += (s.assistencias || 0) * 1

  // Bonus JDJ
  if (jogo.value.jdj === playerId) pontos += 3

  return pontos
}

const voltar = () => router.push({ name: 'jogos' })

const apagarJogo = async (idToDel) => {
  if (!confirm('Tens a certeza que queres apagar este jogo? Isto vai afetar as classificações.')) return
  
  try {
    // ✅ Usar o novo método deletarJogo
    await Store.deletarJogo(idToDel)
    router.push({ name: 'jogos' })
  } catch (error) {
    console.error('Erro ao apagar jogo:', error)
  }
}
</script>

<template>
  <div class="p-6">
    <div v-if="loading" class="text-center py-12 text-gray-500">A carregar...</div>
    <div v-else>
      <div v-if="!jogo" class="text-center py-12 text-gray-400">Jogo não encontrado.</div>

      <div v-else class="space-y-6">
        <div class="flex items-center justify-between bg-white rounded-lg shadow p-6">
          <div>
            <h2 class="text-2xl font-bold">Ficha do Jogo</h2>
            <div class="text-sm text-gray-500 mt-1">{{ Utils.formatarDataComDiaSemana(jogo.data) }} • {{ jogo.tipoJogo }}</div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="voltar" class="px-3 py-2 bg-gray-100 rounded">⟵ Voltar</button>
            <button v-if="isAdmin" @click="apagarJogo(jogo.id)" class="px-3 py-2 bg-red-100 text-red-700 rounded">🗑️ Eliminar</button>
          </div>
        </div>

        <!-- Pontos principais do jogo -->
        <div class="bg-white rounded-lg shadow p-6 flex items-center justify-center gap-6">
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

        <!-- Abas -->
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex gap-2 mb-4">
            <button @click="selectedTab = 'Elenco'" :class="selectedTab === 'Elenco' ? 'bg-blue-600 text-white' : 'bg-gray-100'" class="px-3 py-1 rounded">Elenco</button>
            <button @click="selectedTab = 'Estatisticas'" :class="selectedTab === 'Estatisticas' ? 'bg-blue-600 text-white' : 'bg-gray-100'" class="px-3 py-1 rounded">Estatísticas</button>
          </div>

          <div v-if="selectedTab === 'Elenco'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="font-bold text-blue-800 mb-2">Equipa A</h3>
              <div class="space-y-2">
                <div v-for="pid in jogo.equipaA" :key="pid" class="p-2 border rounded bg-blue-50">
                  {{ getNome(pid) }}
                </div>
              </div>
            </div>
            <div>
              <h3 class="font-bold text-red-800 mb-2">Equipa B</h3>
              <div class="space-y-2">
                <div v-for="pid in jogo.equipaB" :key="pid" class="p-2 border rounded bg-red-50">
                  {{ getNome(pid) }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-sm table-auto">
              <thead>
                <tr class="text-center text-xs text-gray-500">
                  <th class="px-2 py-2">Jogador</th>
                  <th class="px-2 py-2">Equipa</th>
                  <th class="px-2 py-2">Golos</th>
                  <th class="px-2 py-2">Assist.</th>
                  <th class="px-2 py-2">Perdas</th>
                  <th class="px-2 py-2">Falhanços</th>
                  <th class="px-2 py-2">Rating</th>
                  <th class="px-2 py-2">Pontos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pid in [...jogo.equipaA, ...jogo.equipaB]" :key="pid" class="border-t">
                  <td class="px-2 py-2 text-center">{{ getNome(pid) }}</td>
                  <td class="px-2 py-2 text-center">{{ jogo.equipaA.includes(pid) ? 'A' : 'B' }}</td>
                  <td class="px-2 py-2 text-center">{{ (getStatsJogador(pid)?.golos) || 0 }}</td>
                  <td class="px-2 py-2 text-center">{{ (getStatsJogador(pid)?.assistencias) || 0 }}</td>
                  <td class="px-2 py-2 text-center">{{ (getStatsJogador(pid)?.perdas) || 0 }}</td>
                  <td class="px-2 py-2 text-center">{{ (getStatsJogador(pid)?.falhancos) || 0 }}</td>
                  <td class="px-2 py-2 text-center">{{ calcularRating(getStatsJogador(pid)).toFixed(1) }}</td>
                  <td class="px-2 py-2 text-center">{{ getPontosJogador(pid) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>