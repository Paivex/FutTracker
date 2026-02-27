<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Store } from '../utils/store.js'

const router = useRouter()

const user = ref(null)
const ligasDoUser = ref([])
const loading = ref(true)

// Modal criar liga
const mostrarCriarModal = ref(false)
const nomeLiga = ref('')
const passwordLiga = ref('')
const criando = ref(false)
const erroModal = ref('')

// Modal entrar liga (clicando numa liga da lista)
const mostrarEntrarModal = ref(false)
const ligaParaEntrar = ref(null)
const passwordEntrar = ref('')
const entrando = ref(false)
const erroEntrar = ref('')

// Modal entrar por nome+password
const mostrarEntrarNomeModal = ref(false)
const entrarNome = ref('')
const entrarPassword = ref('')
const entrandoNome = ref(false)
const erroEntrarNome = ref('')

const abrirEntrarNomeModal = () => {
  entrarNome.value = ''
  entrarPassword.value = ''
  erroEntrarNome.value = ''
  mostrarEntrarNomeModal.value = true
}

const entrarLigaPorNome = async () => {
  if (!entrarNome.value.trim()) { erroEntrarNome.value = 'Indica o nome da liga.'; return }
  if (!entrarPassword.value.trim()) { erroEntrarNome.value = 'Indica a password da liga.'; return }
  entrandoNome.value = true
  erroEntrarNome.value = ''
  try {
    const res = await Store.entrarLigaPorNome(entrarNome.value.trim(), entrarPassword.value.trim())
    ligasDoUser.value = await Store.getLigasDoUser().catch(() => [])
    const ligaEntrada = ligasDoUser.value.find(l => l.nome === entrarNome.value.trim()) || res.liga
    mostrarEntrarNomeModal.value = false
    selecionarLiga(ligaEntrada)
  } catch (e) {
    erroEntrarNome.value = e.message || 'Nome ou password incorretos.'
  } finally {
    entrandoNome.value = false
  }
}

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
  return j && j.nome && j.nome.trim() !== ''
})

const abrirCriarModal = () => {
  if (!perfilCompleto.value) return
  nomeLiga.value = ''
  passwordLiga.value = ''
  erroModal.value = ''
  mostrarCriarModal.value = true
}

const criarLiga = async () => {
  if (!nomeLiga.value.trim()) {
    erroModal.value = 'O nome da liga não pode estar vazio.'
    return
  }
  if (!passwordLiga.value.trim()) {
    erroModal.value = 'A password da liga não pode estar vazia.'
    return
  }
  criando.value = true
  erroModal.value = ''
  try {
    const novaLiga = await Store.criarLiga({
      nome: nomeLiga.value.trim(),
      password: passwordLiga.value.trim()
    })
    ligasDoUser.value.unshift(novaLiga)
    mostrarCriarModal.value = false
    // Entrar diretamente na liga criada
    selecionarLiga(novaLiga)
  } catch (e) {
    erroModal.value = e.message || 'Erro ao criar liga.'
  } finally {
    criando.value = false
  }
}

// Ligas onde o user já é membro
const ligasDoUserIds = computed(() => new Set(ligasDoUser.value.map(l => l._id)))

const clicarLiga = (liga) => {
  if (ligasDoUserIds.value.has(liga._id)) {
    // Já é membro, entra diretamente
    selecionarLiga(liga)
  } else {
    // Não é membro, pede password
    ligaParaEntrar.value = liga
    passwordEntrar.value = ''
    erroEntrar.value = ''
    mostrarEntrarModal.value = true
  }
}

const entrarLiga = async () => {
  if (!passwordEntrar.value.trim()) {
    erroEntrar.value = 'Introduz a password da liga.'
    return
  }
  entrando.value = true
  erroEntrar.value = ''
  try {
    await Store.entrarLiga(ligaParaEntrar.value._id, passwordEntrar.value.trim())
    // Recarrega ligas do user e entra
    ligasDoUser.value = await Store.getLigasDoUser().catch(() => [])
    const ligaAtualizada = ligasDoUser.value.find(l => l._id === ligaParaEntrar.value._id) || ligaParaEntrar.value
    mostrarEntrarModal.value = false
    selecionarLiga(ligaAtualizada)
  } catch (e) {
    erroEntrar.value = 'Password incorreta ou erro ao entrar na liga.'
  } finally {
    entrando.value = false
  }
}

const selecionarLiga = (liga) => {
  const ligaMinima = {
    _id: liga._id,
    nome: liga.nome
  }
  localStorage.setItem('ligaSelecionada', JSON.stringify(ligaMinima))
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
        <div class="flex flex-col items-end gap-2">
          <div class="flex gap-2">
            <button
              @click="abrirEntrarNomeModal"
              :disabled="!perfilCompleto"
              class="px-5 py-2 rounded-lg font-medium text-sm transition"
              :class="perfilCompleto
                ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
              🔑 Entrar numa Liga
            </button>
            <button
              @click="abrirCriarModal"
              :disabled="!perfilCompleto"
              class="px-5 py-2 rounded-lg font-medium text-sm transition"
              :class="perfilCompleto
                ? 'bg-[rgb(9,37,121)] text-white hover:bg-blue-900 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
              + Criar Liga
            </button>
          </div>
          <div v-if="!perfilCompleto" class="text-xs text-orange-500 text-right max-w-xs">
            ⚠️ Adiciona o teu nome no perfil para criar uma liga.
            <button @click="router.push('/perfil')" class="underline ml-1 hover:text-orange-700 cursor-pointer">Completar Perfil</button>
          </div>
        </div>
      </div>

      <!-- Lista vazia -->
      <div v-if="ligasDoUser.length === 0" class="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center space-y-3">
        <div class="text-5xl">🏆</div>
        <h3 class="text-lg font-semibold text-gray-700">Ainda não estás em nenhuma liga</h3>
        <p class="text-gray-400 text-sm">Cria a tua primeira liga ou pede a alguém para te adicionar.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="liga in ligasDoUser" :key="liga._id"
          @click="clicarLiga(liga)"
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
          </div>

          <!-- Avatares -->
          <div class="flex -space-x-2 mt-4">
            <template v-for="(jog, i) in (liga.jogadores || []).slice(0, 5)" :key="jog._id || i">
              <div class="w-8 aspect-[1000/1200] overflow-hidden" :title="jog.nome || ''">
                <img v-if="jog.imagem" :src="jog.imagem" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-[rgb(9,37,121)] text-white text-xs flex items-center justify-center font-bold">
                  {{ (jog.nome || '?').charAt(0).toUpperCase() }}
                </div>
              </div>
            </template>
            <div v-if="(liga.jogadores || []).length > 5"
              class="w-8 aspect-[1000/1200] bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-bold shadow">
              +{{ (liga.jogadores || []).length - 5 }}
            </div>
          </div>

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

        <div class="space-y-3 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Nome da Liga</label>
            <input
              v-model="nomeLiga"
              type="text"
              placeholder="Ex: Liga dos Amigos"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Password da Liga</label>
            <input
              v-model="passwordLiga"
              @keyup.enter="criarLiga"
              type="password"
              placeholder="Password para entrar na liga"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-400 mt-1">Partilha esta password com quem queres que entre na liga.</p>
          </div>
          <p v-if="erroModal" class="text-red-500 text-xs">{{ erroModal }}</p>
        </div>

        <div class="flex gap-3">
          <button @click="criarLiga" :disabled="criando || !nomeLiga.trim() || !passwordLiga.trim()"
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

    <!-- Modal: Entrar por Nome + Password -->
    <div v-if="mostrarEntrarNomeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-1">🔑 Entrar numa Liga</h3>
        <p class="text-sm text-gray-500 mb-4">Introduz o nome e a password da liga para entrar.</p>

        <div class="space-y-3 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Nome da Liga</label>
            <input
              v-model="entrarNome"
              type="text"
              placeholder="Ex: Liga dos Amigos"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Password da Liga</label>
            <input
              v-model="entrarPassword"
              @keyup.enter="entrarLigaPorNome"
              type="password"
              placeholder="Password para entrar na liga"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <p v-if="erroEntrarNome" class="text-red-500 text-xs">{{ erroEntrarNome }}</p>
        </div>

        <div class="flex gap-3">
          <button @click="entrarLigaPorNome" :disabled="entrandoNome || !entrarNome.trim() || !entrarPassword.trim()"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition disabled:opacity-50">
            {{ entrandoNome ? 'A entrar...' : '✅ Entrar' }}
          </button>
          <button @click="mostrarEntrarNomeModal = false"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Entrar na Liga (pelo clique na lista) -->
    <div v-if="mostrarEntrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-1">🔑 Entrar na Liga</h3>
        <p class="text-sm text-gray-500 mb-4">Introduz a password para entrares em <strong>{{ ligaParaEntrar?.nome }}</strong>.</p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-1">Password</label>
          <input
            v-model="passwordEntrar"
            @keyup.enter="entrarLiga"
            type="password"
            placeholder="Password da liga"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="erroEntrar" class="text-red-500 text-xs mt-1">{{ erroEntrar }}</p>
        </div>

        <div class="flex gap-3">
          <button @click="entrarLiga" :disabled="entrando || !passwordEntrar.trim()"
            class="flex-1 px-4 py-2 bg-[rgb(9,37,121)] text-white rounded-lg hover:bg-blue-900 font-medium text-sm transition disabled:opacity-50">
            {{ entrando ? 'A entrar...' : '✅ Entrar' }}
          </button>
          <button @click="mostrarEntrarModal = false"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>