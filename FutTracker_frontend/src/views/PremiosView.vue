<script setup>
import { ref, computed, onMounted } from 'vue'
import { Store } from '../utils/store.js'
import { Utils } from '../utils/utils.js'

const jogos = ref([])
const jogadores = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    // ✅ Usar os novos métodos específicos
    const [jogosData, jogadoresData] = await Promise.all([
      Store.getJogos(),
      Store.getJogadores()
    ])
    
    // ✅ CORREÇÃO: Adaptar jogos para formato esperado
    jogos.value = (jogosData || []).map(j => ({
      ...j,
      equipaA: j.equipaA?.jogadores || [],
      equipaB: j.equipaB?.jogadores || [],
      golosA: j.equipaA?.golos || 0,
      golosB: j.equipaB?.golos || 0
    }))
    
    jogadores.value = jogadoresData || []
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    loading.value = false
  }
})

const premios = computed(() => {
  return jogos.value
    .filter(j => j.jdj)
    .map(jogo => {
      const jogador = jogadores.value.find(j => j._id === jogo.jdj)

      const jogouNaA = jogo.equipaA.includes(jogo.jdj)
      const jogouNaB = jogo.equipaB.includes(jogo.jdj)

      let resultadoClasse = 'text-yellow-500' // empate

      if (jogo.golosA !== jogo.golosB) {
        const ganhou =
          (jogouNaA && jogo.golosA > jogo.golosB) ||
          (jogouNaB && jogo.golosB > jogo.golosA)

        resultadoClasse = ganhou ? 'text-green-600' : 'text-red-600'
      }

      // ✅ CORREÇÃO: Garantir que a data é válida antes de formatar
      const dataObj = new Date(jogo.data)
      const dataFormatada = isNaN(dataObj.getTime()) 
        ? 'Data inválida' 
        : Utils.formatarData(jogo.data)

      return {
        tipo: 'JDJ',
        titulo: 'Jogador Defensivo do Jogo',
        emoji: '🛡️',
        pontos: 3,
        data: jogo.data,
        jogador,
        resultado: `${jogo.golosA} - ${jogo.golosB}`,
        resultadoClasse,
        dataFormatada
      }
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data))
})
</script>

<template>
  <div class="space-y-6">

    <div class="bg-white rounded-lg shadow">
      <!-- HEADER -->
      <div class="p-6 border-b">
        <h2 class="text-xl font-bold text-gray-800">🎖️ Sala de Troféus</h2>
        <p class="text-sm text-gray-500">Hall of Fame e Conquistas</p>
      </div>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="p-12 flex flex-col items-center justify-center text-gray-400 min-h-[400px]"
      >
        <div class="text-lg">A carregar prémios...</div>
      </div>

      <!-- ESTADO VAZIO -->
      <div
        v-else-if="premios.length === 0"
        class="p-12 flex flex-col items-center justify-center text-gray-400 min-h-[400px]"
      >
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">
          🏆
        </div>
        <h3 class="text-lg font-medium text-gray-600">Sem prémios ainda</h3>
        <p class="mt-2 text-sm text-center">
          Quando os jogadores forem premiados, aparecerá aqui.
        </p>
      </div>

      <!-- LISTA DE PRÉMIOS -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6"
      >
        <div
          v-for="(premio, idx) in premios"
          :key="idx"
          class="relative bg-white rounded-xl
                 border border-blue-700 p-4">

          <!-- TOPO -->
          <div class="flex justify-between items-center text-base text-gray-500 mb-3">
            <span class="font-semibold text-gray-700">
              {{ premio.titulo }} {{ premio.emoji }}
            </span>
            <span>
              {{ premio.dataFormatada }}
            </span>
          </div>

          <!-- CORPO -->
          <div class="flex gap-4 items-center">

            <!-- FOTO -->
            <div class="w-[150px] h-[200px]">
              <img
                v-if="premio.jogador?.imagem"
                :src="premio.jogador.imagem"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- RESULTADO -->
            <div class="flex-1 flex items-center justify-center">
              <div
                class="text-3xl font-extrabold"
                :class="premio.resultadoClasse">
                {{ premio.resultado }}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>