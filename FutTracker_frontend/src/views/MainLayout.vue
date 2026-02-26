<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const liga = ref(JSON.parse(localStorage.getItem('ligaSelecionada') || 'null'))

const voltarParaLigas = () => {
  localStorage.removeItem('ligaSelecionada')
  router.push('/ligas')
}
</script>

<template>
  <div>
    <!-- Barra de navegação -->
    <div class="bg-white shadow mb-8 sticky top-0 z-40">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between overflow-x-auto no-scrollbar">
          <div class="flex space-x-1 overflow-x-auto no-scrollbar">
            <router-link to="/" exact-active-class="bg-[rgb(9,37,121)] text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Dashboard</router-link>
            <router-link to="/jogadores" active-class="bg-[rgb(9,37,121)] text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Jogadores</router-link>
            <router-link to="/jogos" active-class="bg-[rgb(9,37,121)] text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Jogos</router-link>
            <router-link to="/classificacao" active-class="bg-[rgb(9,37,121)] text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Classificação</router-link>
            <router-link to="/tops" active-class="bg-[rgb(9,37,121)] text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Tops</router-link>
            <router-link to="/premios" active-class="bg-[rgb(9,37,121)] text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Prémios</router-link>
          </div>
          <!-- Liga ativa -->
          <button @click="voltarParaLigas"
            class="ml-4 flex items-center gap-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition whitespace-nowrap">
            🏆 {{ liga?.nome }}
            <span class="text-xs">✕</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Conteúdo da página -->
    <div class="container mx-auto px-4 py-8">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>