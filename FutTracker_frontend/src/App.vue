<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Utils } from './utils/utils.js'
import { Store } from './utils/store.js'
import campo from '../public/background.webp'

import { isAdmin } from './utils/admin.js'

const router = useRouter()
const username = ref('')

const isLoggedIn = computed(() => {
  return localStorage.getItem('token') !== null
})

onMounted(() => {
    if (localStorage.getItem('modoAdmin') === 'true') {
        isAdmin.value = true
    }
    
    const user = localStorage.getItem('username')
    if (user) {
        username.value = user
    }
})

const alternarAdmin = async () => {
    if (isAdmin.value) {
        isAdmin.value = false;
        localStorage.removeItem('modoAdmin');
        alert("Modo Admin: DESATIVADO 🔒");
    } else {
        const pass = prompt("Insira a password de Admin:");
        if (pass) {
            const hashDigitado = await Utils.sha256(pass);
            const HASH_SECRETO = "a1cc9e7d482da312018a0b3bb0b4c3adae351836eaa4314a57f61b14c3d5c026";

            if (hashDigitado === HASH_SECRETO) {
                isAdmin.value = true;
                localStorage.setItem('modoAdmin', 'true');
                alert("Modo Admin: ATIVADO 🔓");
            } else {
                alert("Password errada!");
            }
        }
    }
}

const handleLogout = () => {
    if (confirm('Tem a certeza que quer sair?')) {
        Store.logout()
        isAdmin.value = false
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
        <div v-if="username" class="text-right">
            <p class="text-sm text-blue-100">Bem-vindo,</p>
            <p class="text-lg font-semibold">{{ username }}</p>
        </div>
    </div>
    </header>

    <div v-if="isLoggedIn" class="bg-white shadow mb-8 sticky top-0 z-40">
        <div class="container mx-auto px-4">
            <div class="flex space-x-1 overflow-x-auto no-scrollbar items-center justify-between">
                <div class="flex space-x-1 overflow-x-auto no-scrollbar">
                    <router-link to="/" active-class="bg-[rgb(9,37,121)] text-white hover:bg-[rgb(9,37,121)] hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Dashboard</router-link>
                    <router-link to="/jogadores" active-class="bg-[rgb(9,37,121)] text-white hover:bg-[rgb(9,37,121)] hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Jogadores</router-link>
                    <router-link to="/jogos" active-class="bg-[rgb(9,37,121)] text-white hover:bg-[rgb(9,37,121)] hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Jogos</router-link>
                    <router-link to="/classificacao" active-class="bg-[rgb(9,37,121)] text-white hover:bg-[rgb(9,37,121)] hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Classificação</router-link>
                    <router-link to="/tops" active-class="bg-[rgb(9,37,121)] text-white hover:bg-[rgb(9,37,121)] hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Tops</router-link>
                    <router-link to="/premios" active-class="bg-[rgb(9,37,121)] text-white hover:bg-[rgb(9,37,121)] hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">Prémios</router-link>
                </div>
                <button 
                    @click="handleLogout"
                    class="px-4 py-3 text-gray-600 hover:bg-red-100 hover:text-red-600 font-medium transition-colors whitespace-nowrap text-sm"
                    title="Sair"
                >
                    🚪 Sair
                </button>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8">
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>

    <button 
        v-if="isLoggedIn"
        @click="alternarAdmin" 
        class="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all transform hover:scale-110 border-4 border-white active:scale-95"
        :class="isAdmin ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-900'"
        :title="isAdmin ? 'Sair de Admin' : 'Entrar como Admin'">
        <span class="text-2xl">{{ isAdmin ? '🔓' : '🔒' }}</span>
    </button>

  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>