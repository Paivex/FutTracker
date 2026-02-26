<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Utils } from './utils/utils.js'
import { Store } from './utils/store.js'
import { isAdmin } from './utils/admin.js'

const router = useRouter()
const route = useRoute()
const username = ref('')
const isLoggedIn = ref(localStorage.getItem('token') !== null)

watch(route, () => {
  isLoggedIn.value = localStorage.getItem('token') !== null
  username.value = localStorage.getItem('username') || ''
})

onMounted(() => {
  if (localStorage.getItem('modoAdmin') === 'true') isAdmin.value = true
  username.value = localStorage.getItem('username') || ''
})

const alternarAdmin = async () => {
  if (isAdmin.value) {
    isAdmin.value = false
    localStorage.removeItem('modoAdmin')
    alert("Modo Admin: DESATIVADO 🔒")
  } else {
    const pass = prompt("Insira a password de Admin:")
    if (pass) {
      const hash = await Utils.sha256(pass)
      const HASH = "a1cc9e7d482da312018a0b3bb0b4c3adae351836eaa4314a57f61b14c3d5c026"
      if (hash === HASH) {
        isAdmin.value = true
        localStorage.setItem('modoAdmin', 'true')
        alert("Modo Admin: ATIVADO 🔓")
      } else {
        alert("Password errada!")
      }
    }
  }
}

const handleLogout = () => {
  if (confirm('Tem a certeza que quer sair?')) {
    Store.logout()
    isAdmin.value = false
    isLoggedIn.value = false
    localStorage.removeItem('ligaSelecionada')
    router.push('/login')
  }
}
</script>

<template>
  <div class="min-h-screen pb-20" style="background-image: url('/background.webp'); background-size: cover; background-position: center; background-attachment: fixed;">

    <header v-if="isLoggedIn" class="bg-gradient-to-r from-[rgb(9,37,121)] to-[rgb(9,37,121)] text-white shadow-lg">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">⚽ FutTracker</h1>
          <p class="text-blue-100 mt-1">Gestão de jogos e estatísticas</p>
        </div>
        <div v-if="username" class="flex items-center space-x-4">
          <p class="text-sm text-blue-100">Bem-vindo, {{ username }}</p>
          <button @click="handleLogout" class="px-4 py-3 hover:bg-red-100 hover:text-red-600 transition-colors">
            <img src="/logout.svg" alt="Logout" class="w-5 h-5 inline-block">
          </button>
        </div>
      </div>
    </header>

    <router-view />

    <button
      v-if="isLoggedIn"
      @click="alternarAdmin"
      class="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all transform hover:scale-110 border-4 border-white active:scale-95"
      :class="isAdmin ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-900'">
      <span class="text-2xl">{{ isAdmin ? '🔓' : '🔒' }}</span>
    </button>

  </div>
</template>