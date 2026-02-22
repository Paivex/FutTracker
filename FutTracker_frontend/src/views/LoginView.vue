<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Store } from '../utils/store.js'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const erro = ref('')
const abaModo = ref('login') // 'login' ou 'registro'

const fazerLogin = async () => {
  if (!email.value || !password.value) {
    erro.value = 'Por favor, preencha todos os campos'
    return
  }

  loading.value = true
  erro.value = ''

  try {
    await Store.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    erro.value = error.message
  } finally {
    loading.value = false
  }
}

const fazerRegistro = async () => {
  if (!username.value || !email.value || !password.value) {
    erro.value = 'Por favor, preencha todos os campos'
    return
  }

  loading.value = true
  erro.value = ''

  try {
    await Store.register(username.value, email.value, password.value)
    router.push('/')
  } catch (error) {
    erro.value = error.message
  } finally {
    loading.value = false
  }
}

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    abaModo.value === 'login' ? fazerLogin() : fazerRegistro()
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    
    <!-- Overlay escuro -->
    <div class="absolute inset-0 bg-black/40"></div>

    <!-- Card de Login -->
    <div class="relative w-full max-w-md mx-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-[rgb(9,37,121)] mb-2">⚽ FutTracker</h1>
          <p class="text-gray-600">Gestão de Jogos e Estatísticas</p>
        </div>

        <!-- Abas -->
        <div class="flex gap-2 mb-8">
          <button
            @click="abaModo = 'login'"
            :class="[
              'flex-1 py-2 px-4 rounded-lg font-medium transition-all',
              abaModo === 'login'
                ? 'bg-[rgb(9,37,121)] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Entrar
          </button>
          <button
            @click="abaModo = 'registro'"
            :class="[
              'flex-1 py-2 px-4 rounded-lg font-medium transition-all',
              abaModo === 'registro'
                ? 'bg-[rgb(9,37,121)] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Registar
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="abaModo === 'login' ? fazerLogin() : fazerRegistro()" class="space-y-4">

          <!-- Campo Username (só no registo) -->
          <div v-if="abaModo === 'registro'">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Escolha um username"
              @keydown="handleKeyDown"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(9,37,121)] focus:border-transparent transition-all"
              :disabled="loading"
            />
          </div>
          
          <!-- Campo Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Insira o seu email"
              @keydown="handleKeyDown"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(9,37,121)] focus:border-transparent transition-all"
              :disabled="loading"
            />
          </div>

          <!-- Campo Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Insira a sua password"
              @keydown="handleKeyDown"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(9,37,121)] focus:border-transparent transition-all"
              :disabled="loading"
            />
          </div>

          <!-- Mensagem de Erro -->
          <div v-if="erro" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ erro }}
          </div>

          <!-- Botão Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-[rgb(9,37,121)] to-[rgb(9,37,121)] text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">{{ abaModo === 'login' ? 'Entrar' : 'Registar' }}</span>
            <span v-else class="flex items-center justify-center">
              <span class="animate-spin mr-2">⏳</span>
              A processar...
            </span>
          </button>

        </form>

        <!-- Footer -->
        <p class="text-center text-gray-500 text-sm mt-6">
          FutTracker © 2026
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
input:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}
</style>
