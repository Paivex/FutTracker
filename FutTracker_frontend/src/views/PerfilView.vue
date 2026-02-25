<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { Store } from '../utils/store.js'
import { Engine } from '../utils/engine.js'
import { Utils } from '../utils/utils.js'

const user = ref(null)
const jogadores = ref([])
const ligasDoUser = ref([])
const todosJogos = ref([])
const filtroLiga = ref('todas')
const loading = ref(true)
const editandoPerfil = ref(false)
const mostrarVincularModal = ref(false)
const jogadorParaVincular = ref('')
const salvando = ref(false)

const form = reactive({
  nome: '',
  pePreferencial: '',
  dataNascimento: '',
  altura: null,
  imagem: null
})

onMounted(async () => {
  try {
    const [userData, jogadoresData, ligasData, jogosData] = await Promise.all([
      Store.getMe(),
      Store.getJogadores(),
      Store.getLigasDoUser().catch(() => []),
      Store.getJogos()
    ])

    user.value = userData
    jogadores.value = jogadoresData || []
    ligasDoUser.value = ligasData || []
    todosJogos.value = (jogosData || []).map(j => ({
      ...j,
      equipaA: j.equipaA?.jogadores || [],
      equipaB: j.equipaB?.jogadores || [],
      golosA: j.equipaA?.golos || 0,
      golosB: j.equipaB?.golos || 0
    }))

    if (user.value?.jogador) {
      preencherForm(user.value.jogador)
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
  } finally {
    loading.value = false
  }
})

const preencherForm = (jogador) => {
  form.nome = jogador.nome || ''
  form.pePreferencial = jogador.pePreferencial || ''
  form.dataNascimento = jogador.dataNascimento ? jogador.dataNascimento.split('T')[0] : ''
  form.altura = jogador.altura || null
  form.imagem = jogador.imagem || null
}

const jogador = computed(() => user.value?.jogador || null)

const jogosFiltrados = computed(() => {
  if (filtroLiga.value === 'todas') return todosJogos.value
  const liga = ligasDoUser.value.find(l => l._id === filtroLiga.value)
  if (!liga) return []
  const jogosIdsLiga = new Set((liga.jogos || []).map(j => j._id || j))
  return todosJogos.value.filter(j => jogosIdsLiga.has(j._id))
})

const stats = computed(() => {
  if (!jogador.value) return null
  return Engine.calcularStatsJogador(jogador.value._id, jogosFiltrados.value)
})

const idade = computed(() => {
  if (!jogador.value?.dataNascimento) return null
  return Utils.calcularIdade(jogador.value.dataNascimento)
})

const perfilCompleto = computed(() => {
  const j = jogador.value
  return j && j.nome && j.dataNascimento && j.pePreferencial && j.altura
})

const camposEmFalta = computed(() => {
  const j = jogador.value
  if (!j) return ['Nenhum jogador vinculado']
  const falta = []
  if (!j.dataNascimento) falta.push('Data de nascimento')
  if (!j.pePreferencial) falta.push('Pé preferencial')
  if (!j.altura) falta.push('Altura')
  return falta
})

const getRatingColor = (r) => {
  if (r >= 8) return 'text-green-600'
  if (r >= 7) return 'text-blue-600'
  if (r >= 6) return 'text-yellow-600'
  if (r >= 5) return 'text-orange-600'
  return 'text-red-600'
}

const jogadoresNaoVinculados = computed(() => {
  const vinculados = new Set()
  // Podemos permitir qualquer jogador — a validação é apenas na criação de liga
  return jogadores.value
})

const vincularJogador = async () => {
  if (!jogadorParaVincular.value) return
  salvando.value = true
  try {
    await Store.vincularJogador(jogadorParaVincular.value)
    // Recarregar dados
    user.value = await Store.getMe()
    if (user.value?.jogador) preencherForm(user.value.jogador)
    mostrarVincularModal.value = false
    jogadorParaVincular.value = ''
  } catch (e) {
    alert('Erro ao vincular jogador: ' + e.message)
  } finally {
    salvando.value = false
  }
}

const guardarPerfil = async () => {
  if (!jogador.value) return
  salvando.value = true
  try {
    await Store.atualizarJogador(jogador.value._id, {
      nome: form.nome,
      pePreferencial: form.pePreferencial,
      dataNascimento: form.dataNascimento,
      altura: form.altura,
      imagem: form.imagem
    })
    user.value = await Store.getMe()
    if (user.value?.jogador) preencherForm(user.value.jogador)
    editandoPerfil.value = false
  } catch (e) {
    alert('Erro ao guardar: ' + e.message)
  } finally {
    salvando.value = false
  }
}

const onImagemChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { form.imagem = ev.target.result }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="bg-gray-100 rounded-xl h-40 animate-pulse"></div>
      <div class="bg-gray-100 rounded-xl h-32 animate-pulse"></div>
    </div>

    <template v-else>
      <!-- Cabeçalho da conta -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
        <div class="w-16 h-16 rounded-full bg-[rgb(9,37,121)] flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {{ user?.username?.charAt(0)?.toUpperCase() || '?' }}
        </div>
        <div class="flex-1 text-center md:text-left">
          <h2 class="text-2xl font-bold text-gray-800">{{ user?.username }}</h2>
          <p class="text-gray-500 text-sm">{{ user?.email }}</p>
        </div>
        <div>
          <!-- Indicador de perfil completo -->
          <span v-if="perfilCompleto" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            ✅ Perfil Completo
          </span>
          <span v-else class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
            ⚠️ Perfil Incompleto
          </span>
        </div>
      </div>

      <!-- Sem jogador vinculado -->
      <div v-if="!jogador" class="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-10 text-center space-y-4">
        <div class="text-5xl">👤</div>
        <h3 class="text-lg font-semibold text-gray-700">Nenhum jogador vinculado</h3>
        <p class="text-gray-500 text-sm">Associa a tua conta a um jogador para ver as tuas estatísticas e poder criar ligas.</p>
        <button @click="mostrarVincularModal = true"
          class="mt-2 px-6 py-2 bg-[rgb(9,37,121)] text-white rounded-lg hover:bg-blue-900 font-medium transition">
          Vincular Jogador
        </button>
      </div>

      <!-- Jogador vinculado -->
      <template v-else>

        <!-- Card do jogador -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-[rgb(9,37,121)] to-blue-800 p-6 text-white flex flex-col md:flex-row items-center gap-6">
            <!-- Foto -->
            <div class="shrink-0">
              <img v-if="jogador.imagem" :src="jogador.imagem" class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
              <div v-else class="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl border-4 border-white">⚽</div>
            </div>
            <!-- Info -->
            <div class="flex-1 text-center md:text-left">
              <h3 class="text-2xl font-bold">{{ jogador.nome }}</h3>
              <div class="flex flex-wrap gap-4 mt-2 justify-center md:justify-start text-sm text-blue-100">
                <span v-if="jogador.pePreferencial">🦵 {{ jogador.pePreferencial }}</span>
                <span v-if="jogador.altura">📏 {{ jogador.altura }} cm</span>
                <span v-if="idade">🎂 {{ idade }} anos</span>
              </div>
              <div v-if="camposEmFalta.length > 0 && !perfilCompleto" class="mt-2 text-xs text-orange-300">
                Em falta: {{ camposEmFalta.join(', ') }}
              </div>
            </div>
            <!-- Botões -->
            <div class="flex gap-2 shrink-0">
              <button @click="editandoPerfil = !editandoPerfil"
                class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition">
                {{ editandoPerfil ? 'Cancelar' : '✏️ Editar' }}
              </button>
              <button @click="mostrarVincularModal = true"
                class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition">
                🔗 Trocar
              </button>
            </div>
          </div>

          <!-- Formulário de edição -->
          <div v-if="editandoPerfil" class="p-6 border-t border-gray-100 bg-gray-50">
            <h4 class="font-semibold text-gray-700 mb-4">Editar Perfil de Jogador</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Nome</label>
                <input v-model="form.nome" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Pé Preferencial</label>
                <select v-model="form.pePreferencial" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecionar...</option>
                  <option value="Direito">Direito</option>
                  <option value="Esquerdo">Esquerdo</option>
                  <option value="Ambidextro">Ambidextro</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Data de Nascimento</label>
                <input v-model="form.dataNascimento" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Altura (cm)</label>
                <input v-model.number="form.altura" type="number" min="100" max="230" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-600 mb-1">Foto</label>
                <input type="file" accept="image/*" @change="onImagemChange" class="text-sm text-gray-500" />
              </div>
            </div>
            <div class="mt-4 flex gap-3">
              <button @click="guardarPerfil" :disabled="salvando"
                class="px-6 py-2 bg-[rgb(9,37,121)] text-white rounded-lg hover:bg-blue-900 font-medium text-sm transition disabled:opacity-50">
                {{ salvando ? 'A guardar...' : 'Guardar' }}
              </button>
              <button @click="editandoPerfil = false" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <!-- Header com filtro -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 class="text-lg font-bold text-gray-800">📊 Estatísticas</h3>
            <select v-model="filtroLiga" class="bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 py-2 pl-3 pr-8 rounded-lg cursor-pointer">
              <option value="todas">♾️ Todas as Ligas</option>
              <option v-for="liga in ligasDoUser" :key="liga._id" :value="liga._id">
                🏆 {{ liga.nome }}
              </option>
            </select>
          </div>

          <div v-if="!stats || stats.jogos === 0" class="text-center py-10 text-gray-400">
            <div class="text-4xl mb-2">🏃</div>
            <p>Nenhum jogo encontrado.</p>
          </div>

          <template v-else>
            <!-- Resultado global -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-[rgb(9,37,121)]">{{ stats.jogos }}</div>
                <div class="text-xs text-gray-500 mt-1">Jogos</div>
              </div>
              <div class="bg-green-50 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-green-600">{{ stats.vitorias }}</div>
                <div class="text-xs text-gray-500 mt-1">Vitórias</div>
              </div>
              <div class="bg-yellow-50 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-yellow-600">{{ stats.empates }}</div>
                <div class="text-xs text-gray-500 mt-1">Empates</div>
              </div>
              <div class="bg-red-50 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-red-500">{{ stats.derrotas }}</div>
                <div class="text-xs text-gray-500 mt-1">Derrotas</div>
              </div>
            </div>

            <!-- Métricas individuais -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="border border-gray-100 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-gray-800">{{ stats.golos }}</div>
                <div class="text-xs text-gray-500 mt-1">⚽ Golos</div>
              </div>
              <div class="border border-gray-100 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-gray-800">{{ stats.assistencias }}</div>
                <div class="text-xs text-gray-500 mt-1">🎯 Assistências</div>
              </div>
              <div class="border border-gray-100 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-gray-800">{{ stats.pontos }}</div>
                <div class="text-xs text-gray-500 mt-1">🏅 Pontos</div>
              </div>
              <div class="border border-gray-100 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold" :class="getRatingColor(stats.ratingMedio)">
                  {{ stats.ratingMedio.toFixed(1) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">⭐ Rating Médio</div>
              </div>
            </div>

            <!-- Barra de vitórias -->
            <div class="mt-6">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Win Rate</span>
                <span>{{ stats.jogos > 0 ? ((stats.vitorias / stats.jogos) * 100).toFixed(0) : 0 }}%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full transition-all"
                  :style="{ width: stats.jogos > 0 ? (stats.vitorias / stats.jogos * 100) + '%' : '0%' }">
                </div>
              </div>
            </div>
          </template>
        </div>

      </template>
    </template>

    <!-- Modal: Vincular Jogador -->
    <div v-if="mostrarVincularModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">🔗 Vincular Jogador</h3>
        <p class="text-sm text-gray-500 mb-4">Seleciona o teu jogador desta lista para associar ao teu perfil.</p>
        <select v-model="jogadorParaVincular" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Selecionar jogador...</option>
          <option v-for="j in jogadoresNaoVinculados" :key="j._id" :value="j._id">{{ j.nome }}</option>
        </select>
        <div class="flex gap-3">
          <button @click="vincularJogador" :disabled="!jogadorParaVincular || salvando"
            class="flex-1 px-4 py-2 bg-[rgb(9,37,121)] text-white rounded-lg hover:bg-blue-900 font-medium text-sm transition disabled:opacity-50">
            {{ salvando ? 'A vincular...' : 'Vincular' }}
          </button>
          <button @click="mostrarVincularModal = false; jogadorParaVincular = ''"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
