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
const loading = ref(true)

onMounted(async () => {
  try {
    // ✅ Usar os novos métodos específicos
    const [jogadoresData, jogosData] = await Promise.all([
      Store.getJogadores(),
      Store.getJogos()
    ])
    
    jogadores.value = jogadoresData || []
    jogos.value = jogosData || []

    const hoje = new Date()
    filtroTempo.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    loading.value = false
  }
})

const getRatingColor = (r) => {
  if (r >= 8) return 'text-green-600'
  if (r >= 7) return 'text-blue-600'
  if (r >= 6) return 'text-yellow-600'
  if (r >= 5) return 'text-orange-600'
  return 'text-red-600'
}

const opcoesTempo = computed(() => {
  const opcoes = []
  const meses = new Set()

  jogos.value.forEach(j => {
    const d = new Date(j.data)
    if (!isNaN(d)) meses.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  })

  opcoes.push({ label: '♾️ Desde Sempre', valor: 'sempre' })

  Array.from(meses).sort().reverse().forEach(chave => {
    const [ano, mes] = chave.split('-').map(Number)
    opcoes.push({
      label: `📅 ${Utils.getNomeMes(mes - 1)} ${ano}`,
      valor: chave
    })
  })

  return opcoes
})

const tabelaStats = computed(() => {
  let jogosFiltrados = jogos.value

  if (filtroTempo.value && filtroTempo.value !== 'sempre') {
    const [ano, mes] = filtroTempo.value.split('-').map(Number)
    jogosFiltrados = jogos.value.filter(j => {
      const d = new Date(j.data)
      return d.getFullYear() === ano && d.getMonth() + 1 === mes
    })
  }

  let lista = jogadores.value.map(jogador => {
    const stats = Engine.calcularStatsJogador(jogador._id, jogosFiltrados)
    const contribuicoes = stats.golos + stats.assistencias

    return {
      ...jogador,
      ...stats,
      contribuicoes,
      winRate: stats.jogos ? (stats.vitorias / stats.jogos) * 100 : 0,
      golosPorJogo: stats.jogos ? stats.golos / stats.jogos : 0,
      assistenciasPorJogo: stats.jogos ? stats.assistencias / stats.jogos : 0,
      contribuicoesPorJogo: stats.jogos ? contribuicoes / stats.jogos : 0,
      perdasPorJogo: stats.jogos ? stats.perdas / stats.jogos : 0,
      falhancosPorJogo: stats.jogos ? stats.falhancos / stats.jogos : 0
    }
  }).filter(j => j.jogos > 0)

  const { chave, ordem } = ordenacao.value
  return lista.sort((a, b) => ordem === 'asc' ? a[chave] - b[chave] : b[chave] - a[chave])
})

const podium = computed(() =>
  [...tabelaStats.value].sort((a, b) => b.pontos - a.pontos).slice(0, 3)
)

const mudarOrdenacao = (chave) => {
  if (chave === 'index' || chave === 'nome') return
  ordenacao.value.ordem =
    ordenacao.value.chave === chave && ordenacao.value.ordem === 'desc' ? 'asc' : 'desc'
  ordenacao.value.chave = chave
}
</script>

<template>
  <div class="space-y-6 p-6">

    <SkeletonTable v-if="loading" />

    <template v-else>

      <!-- HEADER -->
      <div class="bg-white rounded-lg shadow p-6 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">🥇 Classificação da Liga</h2>
          <p class="text-sm text-gray-500">
            Vit 3p | Emp 1p | Der 0p | Golo 2p | Ast 1p
          </p>
        </div>

        <select
          v-model="filtroTempo"
          class="bg-gray-100 text-sm font-medium text-gray-700 py-2 pl-3 pr-8 rounded-lg">
          <option v-for="opt in opcoesTempo" :key="opt.valor" :value="opt.valor">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- 🏆 PÓDIO -->
      <div v-if="podium.length" class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-center items-end gap-8 max-w-4xl mx-auto">

          <!-- 2º -->
          <div v-if="podium[1]" class="flex flex-col items-center w-36">
            <div class="relative w-28 h-40 bg-white flex items-center justify-center">
              <!-- medalha -->
              <div class="absolute -top-1 -left-3 w-8 h-8 rounded-full bg-gray-300
                          text-gray-800 flex items-center justify-center font-bold shadow">
                2
              </div>
              <img :src="podium[1].imagem" class="max-w-full max-h-full object-contain">
            </div>
            <div class="mt-2 text-sm font-bold text-gray-700">{{ podium[1].pontos }} P</div>
            <div class="text-base font-semibold text-gray-800 truncate text-center">
              {{ podium[1].nome }}
            </div>
          </div>

          <!-- 1º -->
          <div
            v-if="podium[0]"
            class="flex flex-col items-center w-40 -mb-2 transform -translate-y-4"
          >
            <div class="relative w-32 h-48 bg-white flex items-center justify-center">
              <!-- medalha -->
              <div class="absolute -top-1 -left-4 w-10 h-10 rounded-full bg-yellow-400
                          text-yellow-900 flex items-center justify-center font-extrabold text-lg shadow">
                1
              </div>
              <img :src="podium[0].imagem" class="max-w-full max-h-full object-contain">
            </div>
            <div class="mt-2 text-base font-extrabold text-gray-800">
              {{ podium[0].pontos }} P
            </div>
            <div class="text-base font-semibold text-gray-800 truncate text-center">
              {{ podium[0].nome }}
            </div>
          </div>

          <!-- 3º -->
          <div v-if="podium[2]" class="flex flex-col items-center w-36">
            <div class="relative w-28 h-40 bg-white flex items-center justify-center">
              <!-- medalha -->
              <div class="absolute -top-1 -left-3 w-8 h-8 rounded-full bg-orange-500
                          text-orange-900 flex items-center justify-center font-bold shadow">
                3
              </div>
              <img :src="podium[2].imagem" class="max-w-full max-h-full object-contain">
            </div>
            <div class="mt-2 text-sm font-bold text-gray-700">{{ podium[2].pontos }} P</div>
            <div class="text-base font-semibold text-gray-800 truncate text-center">
              {{ podium[2].nome }}
            </div>
          </div>

        </div>
      </div>

      <!-- 📊 TABELA -->
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="w-full min-w-[800px] text-sm border-collapse">

          <thead class="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th v-for="col in Config.colunasClassificacao"
                  :key="col.chave"
                  @click="mudarOrdenacao(col.chave)"
                  class="px-2 py-2 text-center cursor-pointer"
                  :class="{ 'text-left': col.chave === 'nome' }">
                {{ col.label }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y">
            <tr v-for="(j, i) in tabelaStats" :key="j._id" class="hover:bg-gray-50">

              <td class="px-2 py-2 text-center">{{ i + 1 }}</td>

              <!-- NOME + CARTA -->
              <td class="px-3 py-2 text-left">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-14 bg-white flex items-center justify-center">
                    <img
                      v-if="j.imagem"
                      :src="j.imagem"
                      class="max-w-full max-h-full object-contain"
                    >
                  </div>
                  <span class="truncate font-medium text-gray-900">
                    {{ j.nome }}
                  </span>
                </div>
              </td>

              <td class="px-2 py-2 text-center font-bold text-blue-600">{{ j.pontos }}</td>
              <td class="px-2 py-2 text-center">{{ j.jogos }}</td>

              <td class="px-2 py-2 text-center" :class="getRatingColor(j.ratingMedio)">
                {{ j.ratingMedio.toFixed(2) }}
              </td>

              <td class="px-2 py-2 text-center">{{ j.winRate.toFixed(1) }}%</td>
              <td class="px-2 py-2 text-center">{{ j.golos }}</td>
              <td class="px-2 py-2 text-center">{{ j.assistencias }}</td>
              <td class="px-2 py-2 text-center text-purple-600">{{ j.contribuicoes }}</td>
              <td class="px-2 py-2 text-center text-red-500">{{ j.perdas }}</td>
              <td class="px-2 py-2 text-center text-orange-500">{{ j.falhancos }}</td>

              <td class="px-2 py-2 text-center text-gray-400">{{ j.golosPorJogo.toFixed(2) }}</td>
              <td class="px-2 py-2 text-center text-gray-400">{{ j.assistenciasPorJogo.toFixed(2) }}</td>
              <td class="px-2 py-2 text-center text-gray-400">{{ j.contribuicoesPorJogo.toFixed(2) }}</td>
              <td class="px-2 py-2 text-center text-gray-400">{{ j.perdasPorJogo.toFixed(2) }}</td>
              <td class="px-2 py-2 text-center text-gray-400">{{ j.falhancosPorJogo.toFixed(2) }}</td>

            </tr>
          </tbody>
        </table>
      </div>

    </template>
  </div>
</template>