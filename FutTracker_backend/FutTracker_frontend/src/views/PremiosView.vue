<script setup>
import { ref, computed, onMounted } from 'vue'
import { Store } from '../utils/store.js'
import { Utils } from '../utils/utils.js'
import PremiosModal from '../components/PremiosModal.vue'

const jogos = ref([])
const jogadores = ref([])

const premioSelecionado = ref(null)

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

      return {
        tipo: 'JDJ',
        titulo: 'Jogador Defensivo do Jogo',
        emoji: '🛡️',
        pontos: 3,
        data: jogo.data,
        jogoId: jogo.id,
        jogador
      }
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data))
})

const abrirPremio = (premio) => {
  premioSelecionado.value = premio
}

const fecharPremio = () => {
  premioSelecionado.value = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b">
        <h2 class="text-xl font-bold text-gray-800">🎖️ Sala de Troféus</h2>
        <p class="text-sm text-gray-500">Hall of Fame e Conquistas</p>
      </div>

      <!-- Estado vazio -->
      <div v-if="premios.length === 0"
           class="p-12 flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">
          🏆
        </div>
        <h3 class="text-lg font-medium text-gray-600">Sem prémios ainda</h3>
        <p class="mt-2 text-sm text-center">
          Quando um jogador for eleito Jogador Defensivo do Jogo, aparecerá aqui.
        </p>
      </div>

      <!-- Lista de prémios -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <div
          v-for="(premio, idx) in premios"
          :key="idx"
          @click="abrirPremio(premio)"
          class="cursor-pointer bg-white rounded-xl shadow border p-5 hover:shadow-lg transition flex flex-col gap-3">

          <div class="flex items-center justify-between">
            <span class="text-3xl">{{ premio.emoji }}</span>
            <span class="text-xs text-gray-400">
              {{ Utils.formatarData(premio.data) }}
            </span>
          </div>

          <div>
            <h3 class="font-bold text-gray-800">{{ premio.titulo }}</h3>
            <p class="text-sm text-gray-500">Jogo #{{ premio.jogoId }}</p>
          </div>

          <div class="flex items-center gap-3 mt-2">
            <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img
                v-if="premio.jogador?.imagem"
                :src="premio.jogador.imagem"
                class="w-full h-full object-cover">
            </div>
            <div class="text-sm font-medium text-gray-700">
              {{ premio.jogador?.nome || 'Jogador removido' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <PremiosModal
      v-if="premioSelecionado"
      :premio="premioSelecionado"
      @fechar="fecharPremio" />
  </div>
</template>
