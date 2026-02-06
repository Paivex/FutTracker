<script setup>
import { ref, computed, onMounted } from 'vue'
import { Store } from '../utils/store.js'
import { Utils } from '../utils/utils.js'

const jogos = ref([])
const jogadores = ref([])

onMounted(async () => {
  const dados = await Store.load()
  jogos.value = dados.jogos || []
  jogadores.value = dados.jogadores || []
})

const premios = computed(() => {
  return jogos.value
    .filter(j => j.jdj)
    .map(jogo => {
      const jogador = jogadores.value.find(j => j.id === jogo.jdj)

      const jogouNaA = jogo.equipaA.includes(jogo.jdj)
      const jogouNaB = jogo.equipaB.includes(jogo.jdj)

      let resultadoClasse = 'text-yellow-500' // empate

      if (jogo.golosA !== jogo.golosB) {
        const ganhou =
          (jogouNaA && jogo.golosA > jogo.golosB) ||
          (jogouNaB && jogo.golosB > jogo.golosA)

        resultadoClasse = ganhou ? 'text-green-600' : 'text-red-600'
      }

      return {
        tipo: 'JDJ',
        titulo: 'Jogador Defensivo do Jogo',
        emoji: '🛡️',
        pontos: 3,
        data: jogo.data,
        jogador,
        resultado: `${jogo.golosA} - ${jogo.golosB}`,
        resultadoClasse
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

      <!-- ESTADO VAZIO -->
      <div
        v-if="premios.length === 0"
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
              {{ Utils.formatarData(premio.data) }}
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
