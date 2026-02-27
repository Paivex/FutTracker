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
const jogadorImagem = ref(null)
const jogadorNome = ref('')

const carregarUser = async () => {
  if (!localStorage.getItem('token')) return
  try {
    const userData = await Store.getMe()
    console.log('userData:', userData)
    console.log('imagem:', userData?.jogador?.imagem?.substring(0, 50))
    jogadorImagem.value = userData?.jogador?.imagem || null
    jogadorNome.value = userData?.jogador?.nome || userData?.username || ''
  } catch (e) {
    console.error(e)
  }
}

watch(() => route.path, () => {
  isLoggedIn.value = localStorage.getItem('token') !== null
  username.value = localStorage.getItem('username') || ''
  carregarUser()
})

onMounted(() => {
  if (localStorage.getItem('modoAdmin') === 'true') isAdmin.value = true
  username.value = localStorage.getItem('username') || ''
  carregarUser()
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
        <div v-if="username" class="flex items-center space-x-3">
          <p class="text-sm text-blue-100">Bem-vindo, {{ username }}</p>

          <!-- Avatar clicável -->
          <button
            @click="router.push('/perfil')"
            class="transition-all hover:scale-105 shrink-0"
            title="Ver Perfil">
            <img
              v-if="jogadorImagem"
              :src="jogadorImagem"
              class="h-12 w-auto object-contain"
            />
            <div
              v-else
              class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {{ (jogadorNome || username).charAt(0).toUpperCase() }}
            </div>
          </button>

          <button @click="handleLogout" class="px-2 py-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
            <img src="/logout.svg" alt="Logout" class="w-5 h-5">
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