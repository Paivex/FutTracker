<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Store } from '../utils/store.js'

const router = useRouter()

const user = ref(null)
const ligasDoUser = ref([])
const loading = ref(true)
const mostrarCriarModal = ref(false)
const nomeLiga = ref('')
const criando = ref(false)
const erroModal = ref('')

onMounted(async () => {
  try {
    const [userData, ligasData] = await Promise.all([
      Store.getMe(),
      Store.getLigasDoUser().catch(() => [])
    ])
    user.value = userData
    ligasDoUser.value = ligasData || []
  } catch (error) {
    console.error('Erro ao carregar ligas:', error)
  } finally {
    loading.value = false
  }
})

const jogador = computed(() => user.value?.jogador || null)

const perfilCompleto = computed(() => {
  const j = jogador.value
  return j && j.nome && j.dataNascimento && j.pePreferencial && j.altura
})

const camposEmFalta = computed(() => {
  if (!jogador.value) return ['Nenhum jogador vinculado ao perfil']
  const falta = []
  if (!jogador.value.dataNascimento) falta.push('Data de nascimento')
  if (!jogador.value.pePreferencial) falta.push('Pé preferencial')
  if (!jogador.value.altura) falta.push('Altura')
  return falta
})

const abrirCriarModal = () => {
  if (!perfilCompleto.value) return
  nomeLiga.value = ''
  erroModal.value = ''
  mostrarCriarModal.value = true
}

const criarLiga = async () => {
  if (!nomeLiga.value.trim()) {
    erroModal.value = 'O nome da liga não pode estar vazio.'
    return
  }
  criando.value = true
  erroModal.value = ''
  try {
    const novaLiga = await Store.criarLiga({ nome: nomeLiga.value.trim() })
    ligasDoUser.value.unshift(novaLiga)
    mostrarCriarModal.value = false
    nomeLiga.value = ''
  } catch (e) {
    erroModal.value = e.message || 'Erro ao criar liga.'
  } finally {
    criando.value = false
  }
}

const selecionarLiga = (liga) => {
  localStorage.setItem('ligaSelecionada', JSON.stringify(liga))
  router.push('/')
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto pt-8 px-4">

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="bg-gray-100 rounded-xl h-20 animate-pulse"></div>
      <div class="bg-gray-100 rounded-xl h-40 animate-pulse"></div>
    </div>

    <template v-else>

      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">🏆 As Minhas Ligas</h2>
          <p class="text-gray-500 text-sm mt-1">Seleciona a liga em que queres entrar.</p>
        </div>

        <!-- Botão criar liga -->
        <div class="flex flex-col items-end gap-1">
          <button
            @click="abrirCriarModal"
            :disabled="!perfilCompleto"
            :title="!perfilCompleto ? 'Completa o teu perfil para criar uma liga' : ''"
            class="px-5 py-2 rounded-lg font-medium text-sm transition"
            :class="perfilCompleto
              ? 'bg-[rgb(9,37,121)] text-white hover:bg-blue-900 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
            + Criar Liga
          </button>
          <!-- Aviso de perfil incompleto -->
          <div v-if="!perfilCompleto" class="text-xs text-orange-500 text-right max-w-xs">
            ⚠️ Para criar uma liga precisas de ter o perfil completo.
            <button @click="router.push('/perfil')" class="underline ml-1 hover:text-orange-700 cursor-pointer">Completar Perfil</button>
          </div>
        </div>
      </div>

      <!-- Requisitos de perfil incompleto -->
      <div v-if="!perfilCompleto" class="bg-orange-50 border border-orange-200 rounded-xl p-5">
        <h4 class="font-semibold text-orange-700 mb-2">⚠️ Perfil Incompleto</h4>
        <p class="text-sm text-orange-600 mb-3">Para criar uma liga precisas de preencher os seguintes campos no teu perfil de jogador:</p>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="campo in camposEmFalta" :key="campo" class="text-sm text-orange-600">{{ campo }}</li>
        </ul>
        <button @click="router.push('/perfil')" class="mt-3 text-sm font-medium text-orange-700 underline hover:text-orange-900 cursor-pointer">
          Ir para o Perfil →
        </button>
      </div>

      <!-- Lista de ligas -->
      <div v-if="ligasDoUser.length === 0" class="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center space-y-3">
        <div class="text-5xl">🏆</div>
        <h3 class="text-lg font-semibold text-gray-700">Ainda não estás em nenhuma liga</h3>
        <p class="text-gray-400 text-sm">Cria a tua primeira liga ou pede a alguém para te adicionar.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="liga in ligasDoUser" :key="liga._id"
          @click="selecionarLiga(liga)"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-[rgb(9,37,121)] transition cursor-pointer group">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-800 group-hover:text-[rgb(9,37,121)] transition">
                🏆 {{ liga.nome }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ (liga.jogadores || []).length }} jogador{{ (liga.jogadores || []).length !== 1 ? 'es' : '' }}
              </p>
            </div>
            <span class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              {{ liga.jogos?.length || 0 }} jogos
            </span>
          </div>gti

          <!-- Avatares dos jogadores -->
          <div class="flex -space-x-2 mt-4">
            <template v-for="(jog, i) in (liga.jogadores || []).slice(0, 5)" :key="jog._id || jog">
              <div class="w-8 h-8 rounded-full border-2 border-white bg-[rgb(9,37,121)] text-white text-xs flex items-center justify-center font-bold shadow"
                :title="jog.nome || ''">
                {{ (jog.nome || '?').charAt(0).toUpperCase() }}
              </div>
            </template>
            <div v-if="(liga.jogadores || []).length > 5"
              class="w-8 h-8 rounded-full border-2 border-white bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-bold shadow">
              +{{ (liga.jogadores || []).length - 5 }}
            </div>
          </div>

          <!-- Data de criação -->
          <div class="flex items-center justify-between mt-3">
            <p class="text-xs text-gray-400">Criada em {{ new Date(liga.createdAt).toLocaleDateString('pt-PT') }}</p>
            <span class="text-xs font-medium text-[rgb(9,37,121)] opacity-0 group-hover:opacity-100 transition">Entrar →</span>
          </div>
        </div>
      </div>

    </template>

    <!-- Modal: Criar Liga -->
    <div v-if="mostrarCriarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-1">🏆 Criar Nova Liga</h3>
        <p class="text-sm text-gray-500 mb-4">Serás automaticamente adicionado como primeiro membro.</p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-1">Nome da Liga</label>
          <input
            v-model="nomeLiga"
            @keyup.enter="criarLiga"
            type="text"
            placeholder="Ex: Liga dos Amigos"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="erroModal" class="text-red-500 text-xs mt-1">{{ erroModal }}</p>
        </div>

        <div class="flex gap-3">
          <button @click="criarLiga" :disabled="criando || !nomeLiga.trim()"
            class="flex-1 px-4 py-2 bg-[rgb(9,37,121)] text-white rounded-lg hover:bg-blue-900 font-medium text-sm transition disabled:opacity-50">
            {{ criando ? 'A criar...' : '✅ Criar Liga' }}
          </button>
          <button @click="mostrarCriarModal = false"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>