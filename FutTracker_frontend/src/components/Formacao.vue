<script setup>
import { computed, ref } from 'vue'
import campo from '../../public/campoWebp.webp'

const props = defineProps({
  jogo: Object,
  jogadores: Array
})

const campoCarregado = ref(false)

const onCampoLoad = () => {
  campoCarregado.value = true
}

const getJogador = (id) => {
  return props.jogadores?.find(j => j._id === id)
}

const FORMATIONS = {
  fut5: [
    { x: 11, y: 50 },
    { x: 25, y: 20 },
    { x: 25, y: 80 },
    { x: 40, y: 35 },
    { x: 40, y: 65 }
  ],

  fut6: [
    { x: 11, y: 50 },
    { x: 25, y: 20 },
    { x: 25, y: 80 },
    { x: 42, y: 30 },
    { x: 42, y: 70 },
    { x: 32, y: 50 }
  ],

  fut7: [
    { x: 10, y: 50 },
    { x: 20, y: 33 },
    { x: 20, y: 67 },
    { x: 36, y: 78 },
    { x: 36, y: 22 },
    { x: 30, y: 50 },
    { x: 43, y: 50 }
  ]
}

const shuffle = (arr) => {
  if (!arr) return []
  return [...arr].sort(() => Math.random() - 0.5)
}

const mirrorX = (x) => 100 - x

const formacao = computed(() => {
  if (!props.jogo) return null

  const layout = FORMATIONS[props.jogo.tipoJogo]
  if (!layout) return null

  const equipaA = shuffle(props.jogo.equipaA)
    .map((id, i) => {
      const jogador = getJogador(id)
      if (!jogador) return null

      return {
        ...jogador,
        pos: layout[i]
      }
    })
    .filter(Boolean)

  const equipaB = shuffle(props.jogo.equipaB)
    .map((id, i) => {
      const jogador = getJogador(id)
      if (!jogador) return null

      return {
        ...jogador,
        pos: {
          x: mirrorX(layout[i].x),
          y: layout[i].y
        }
      }
    })
    .filter(Boolean)

  return { equipaA, equipaB }
})

// Calcula delay baseado na posição x (mais à esquerda = menor delay)
const getAnimationDelay = (pos) => {
  if (!pos) return 0
  // Normaliza a posição x (0-100) para um delay em ms
  // Quanto menor o x, menor o delay
  return (pos.x / 100) * 1400 // máximo 800ms de diferença
}

const getPlayerStyle = (pos) => {
  if (!pos) return {}

  return {
    position: 'absolute',
    left: pos.x + '%',
    top: pos.y + '%',
    transform: 'translate(-50%, -50%)',
    animationDelay: `${getAnimationDelay(pos)}ms`
  }
}
</script>

<template>
  <div class="relative w-full select-none">

    <!-- Campo -->
    <img 
      :src="campo" 
      alt="Campo de Futebol" 
      class="w-full h-full object-cover rounded-lg shadow"
      @load="onCampoLoad"
    />

    <!-- EQUIPA A (lado esquerdo) -->
    <div 
      v-if="campoCarregado"
      v-for="(jogador, index) in formacao?.equipaA" 
      :key="'A-' + index" 
      :style="getPlayerStyle(jogador.pos)" 
      class="flex flex-col items-center max-w-[10%] drop-in"
    >
      <img v-if="jogador.imagem" :src="jogador.imagem" class="" />
      <div v-else class="">👤</div>
    </div>

    <!-- EQUIPA B (lado direito espelhado) -->
    <div 
      v-if="campoCarregado"
      v-for="(jogador, index) in formacao?.equipaB" 
      :key="'B-' + index" 
      :style="getPlayerStyle(jogador.pos)" 
      class="flex flex-col items-center max-w-[10%] drop-in"
    >
      <img v-if="jogador.imagem" :src="jogador.imagem" class=""/>
      <div v-else class="">👤</div>
    </div>

  </div>
</template>

<style scoped>
@keyframes dropIn {
  from {
    opacity: 0;
    transform: translate(-50%, -100%) scale(0.3);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.drop-in {
  animation: dropIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}
</style>