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

const getJogador = (id) => {
  return props.jogadores?.find(j => j._id === id)
}


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
    { x: 11, y: 50 },
    { x: 22, y: 20 },
    { x: 25, y: 50 },
    { x: 22, y: 80 },
    { x: 39, y: 20 },
    { x: 43, y: 50 },
    { x: 39, y: 80 }
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
    <div v-for="(jogador, index) in formacao?.equipaA" :key="'A-' + index" :style="getPlayerStyle(jogador.pos)" class="flex flex-col items-center max-w-[10%]">
      <img v-if="jogador.imagem" :src="jogador.imagem" class="" />

      <div v-else class="">
        👤
      </div>
    </div>

    <!-- EQUIPA B (lado direito espelhado) -->
    <div v-for="(jogador, index) in formacao?.equipaB" :key="'B-' + index" :style="getPlayerStyle(jogador.pos)" class="flex flex-col items-center max-w-[10%]">
      <img v-if="jogador.imagem" :src="jogador.imagem" class=""/>

      <div v-else class="">
        👤
      </div>
    </div>

  </div>
</template>