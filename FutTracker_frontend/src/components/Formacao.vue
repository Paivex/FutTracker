<script setup>
import { ref, computed, onMounted } from 'vue'
import { Engine } from '../utils/engine.js'
import campo from '../../public/campo.png'

const formacao = ref(null)
const props = defineProps({
  jogo: Object,
  jogadores: Array
})

onMounted(() => {
  if (props.jogo) {
    formacao.value = {
      equipaA: props.jogo.equipaA,
      equipaB: props.jogo.equipaB
    }
  }
})
</script>

<template>
  <div class="relative w-full">
    <img :src="campo" alt="Campo de Futebol" class="w-full h-full object-cover rounded-lg shadow" />
    
    <!-- Jogadores da Equipa A (lado esquerdo) -->
    <div v-for="(jogador, index) in formacao?.equipaA" :key="'A-' + index" class="absolute flex flex-col items-center" :style="getPlayerStyle(jogador.posicao, 'A')">
      <img :src="jogador.imagem" :alt="jogador.nome" class="w-8 h-8 rounded-full border-2 border-blue-600 object-cover" />
      <span class="text-xs font-bold text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center -mt-2">
        {{ jogador.numero }}
      </span>
    </div>
    
    <!-- Jogadores da Equipa B (lado direito) -->
    <div v-for="(jogador, index) in formacao?.equipaB" :key="'B-' + index" class="absolute flex flex-col items-center" :style="getPlayerStyle(jogador.posicao, 'B')">
      <img :src="jogador.imagem" :alt="jogador.nome" class="w-8 h-8 rounded-full border-2 border-red-600 object-cover" />
      <span class="text-xs font-bold text-white bg-red-600 rounded-full w-6 h-6 flex items-center justify-center -mt-2">
        {{ jogador.numero }}
      </span>
    </div>
  </div>
</template>
