<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { Utils } from './utils/utils.js'
import campo from '../public/campo.png'

//const isAdmin = ref(false)
import { isAdmin } from './utils/admin.js'

onMounted(() => {
    if (localStorage.getItem('modoAdmin') === 'true') {
        isAdmin.value = true
    }
})

const alternarAdmin = async () => {
    if (isAdmin.value) {
        isAdmin.value = false;
        localStorage.removeItem('modoAdmin');
        alert("Modo Admin: DESATIVADO 🔒");
        //window.location.reload();
    } else {
        const pass = prompt("Insira a password de Admin:");
        if (pass) {
            const hashDigitado = await Utils.sha256(pass);
            const HASH_SECRETO = "a1cc9e7d482da312018a0b3bb0b4c3adae351836eaa4314a57f61b14c3d5c026";

            if (hashDigitado === HASH_SECRETO) {
                isAdmin.value = true;
                localStorage.setItem('modoAdmin', 'true');
                alert("Modo Admin: ATIVADO 🔓");
                //window.location.reload(); 
            } else {
                alert("Password errada!");
            }
        }
    }
}
</script>

<template>
  <div class="min-h-screen pb-20" style="background-image: url('/campo.png'); background-size: cover; background-position: center; background-attachment: fixed;">
    
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold">⚽ FutTracker</h1>
        <p class="text-blue-100 mt-1">Gestão de jogos e estatísticas</p>
      </div>
    </header>

    <div class="bg-white shadow mb-8 sticky top-0 z-40">
        <div class="container mx-auto px-4">
            <div class="flex space-x-1 overflow-x-auto no-scrollbar">
                <router-link to="/" active-class="bg-blue-600 text-white hover:bg-blue-600 hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">📊 Dashboard</router-link>
                <router-link to="/jogadores" active-class="bg-blue-600 text-white hover:bg-blue-600 hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">👥 Jogadores</router-link>
                <router-link to="/jogos" active-class="bg-blue-600 text-white hover:bg-blue-600 hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">📋 Jogos</router-link>
                <router-link to="/classificacao" active-class="bg-blue-600 text-white hover:bg-blue-600 hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">🥇 Classificação</router-link>
                <router-link to="/tops" active-class="bg-blue-600 text-white hover:bg-blue-600 hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">🏆 Tops</router-link>
                <router-link to="/premios" active-class="bg-blue-600 text-white hover:bg-blue-600 hover:text-white" class="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">🎖️ Prémios</router-link>
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