<script setup>
defineProps({
  premio: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['fechar'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">

      <button
        @click="emit('fechar')"
        class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
        ✕
      </button>

      <div class="flex flex-col items-center text-center gap-4">
        <div class="text-5xl">{{ premio.emoji }}</div>

        <h2 class="text-xl font-bold text-gray-800">
          {{ premio.titulo }}
        </h2>

        <p class="text-sm text-gray-500">
          Jogo #{{ premio.jogoId }}
        </p>

        <div class="flex items-center gap-4 mt-4">
          <div class="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
            <img
              v-if="premio.jogador?.imagem"
              :src="premio.jogador.imagem"
              class="w-full h-full object-cover">
          </div>

          <div class="text-left">
            <div class="font-semibold text-gray-800">
              {{ premio.jogador?.nome || 'Jogador removido' }}
            </div>
            <div class="text-sm text-gray-500">
              +{{ premio.pontos }} pontos
            </div>
          </div>
        </div>

        <button
          @click="emit('fechar')"
          class="mt-6 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>
