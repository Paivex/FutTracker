<script setup>
import { computed } from 'vue'
import campo from '../../public/campo.png'

/*
PROPS
----------------------------------
jogo.tipo -> "fut5" | "fut6" | "fut7"
jogo.equipaA -> array jogadores
jogo.equipaB -> array jogadores
*/

const props = defineProps({
  jogo: Object,
  jogadores: Array
})

/*
FORMATIONS
----------------------------------
x,y em percentagem

Campo dividido ao meio:
lado esquerdo usa posições originais
lado direito usa mirror (100 - x)
*/

const FORMATIONS = {
  fut5: [
    { x: 15, y: 50 }, // GR
    { x: 30, y: 20 },
    { x: 30, y: 80 },
    { x: 45, y: 35 },
    { x: 45, y: 65 }
  ],

  fut6: [
    { x: 15, y: 50 },
    { x: 30, y: 20 },
    { x: 30, y: 80 },
    { x: 45, y: 30 },
    { x: 45, y: 70 },
    { x: 55, y: 50 }
  ],

  fut7: [
    { x: 15, y: 50 },
    { x: 30, y: 20 },
    { x: 30, y: 80 },
    { x: 45, y: 20 },
    { x: 45, y: 80 },
    { x: 60, y: 35 },
    { x: 60, y: 65 }
  ]
}

/*
HELPERS
----------------------------------
*/

const shuffle = (arr) => {
  if (!arr) return []
  return [...arr].sort(() => Math.random() - 0.5)
}

const mirrorX = (x) => 100 - x

/*
FORMAÇÃO FINAL
----------------------------------
- escolhe layout baseado no tipo
- randomiza jogadores
- equipa B espelhada automaticamente
*/

const formacao = computed(() => {
  if (!props.jogo) return null

  const layout = FORMATIONS[props.jogo.tipo]

  if (!layout) return null

  const equipaA = shuffle(props.jogo.equipaA).map((j, i) => ({
    ...j,
    pos: layout[i]
  }))

  const equipaB = shuffle(props.jogo.equipaB).map((j, i) => ({
    ...j,
    pos: {
      x: mirrorX(layout[i].x),
      y: layout[i].y
    }
  }))

  return { equipaA, equipaB }
})

console.log('JOGO RECEBIDO:', props.jogo)
console.log('FORMAÇÃO FINAL:', formacao.value)


/*
POSICIONAMENTO CSS
*/

const getPlayerStyle = (pos) => {
  if (!pos) return {}

  return {
    position: 'absolute',
    left: pos.x + '%',
    top: pos.y + '%',
    transform: 'translate(-50%, -50%)'
  }
}
</script>

<template>
  <div class="relative w-full select-none">

    <!-- Campo -->
    <img :src="campo" alt="Campo de Futebol" class="w-full h-full object-cover rounded-lg shadow"/>

    <!-- EQUIPA A (lado esquerdo) -->
    <div v-for="(jogador, index) in formacao?.equipaA" :key="'A-' + index" :style="getPlayerStyle(jogador.pos)" class="flex flex-col items-center">
      <img v-if="jogador.imagem" :src="jogador.imagem" class="w-10 h-10 rounded-full border-2 border-blue-600 object-cover" />

      <div v-else class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
        👤
      </div>
    </div>

    <!-- EQUIPA B (lado direito espelhado) -->
    <div v-for="(jogador, index) in formacao?.equipaB" :key="'B-' + index" :style="getPlayerStyle(jogador.pos)" class="flex flex-col items-center">
      <img v-if="jogador.imagem" :src="jogador.imagem" class="w-10 h-10 rounded-full border-2 border-red-600 object-cover"/>

      <div v-else class="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
        👤
      </div>
    </div>

  </div>
</template>