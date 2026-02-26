<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Store } from '../utils/store.js'
import { Engine } from '../utils/engine.js'
import { Utils } from '../utils/utils.js'

const user = ref(null)
const router = useRouter()
const ligasDoUser = ref([])
const todosJogos = ref([])
const filtroLiga = ref('todas')
const loading = ref(true)
const editandoPerfil = ref(false)
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
    const [userData, ligasData, jogosData] = await Promise.all([
      Store.getMe(),
      Store.getLigasDoUser().catch(() => []),
      Store.getJogos()
    ])

    user.value = userData
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

const preencherForm = (j) => {
  form.nome = j.nome || ''
  form.pePreferencial = j.pePreferencial || ''
  form.dataNascimento = j.dataNascimento ? j.dataNascimento.split('T')[0] : ''
  form.altura = j.altura || null
  form.imagem = j.imagem || null
}

const jogador = computed(() => user.value?.jogador || null)

const idade = computed(() => {
  if (!jogador.value?.dataNascimento) return null
  return Utils.calcularIdade(jogador.value.dataNascimento)
})

const perfilCompleto = computed(() => {
  return jogador.value && jogador.value.nome && jogador.value.nome.trim() !== ''
})

const jogosFiltrados = computed(() => {
  if (filtroLiga.value === 'todas') return todosJogos.value
  const liga = ligasDoUser.value.find(l => l._id === filtroLiga.value)
  if (!liga) return []
  const ids = new Set((liga.jogos || []).map(j => j._id || j))
  return todosJogos.value.filter(j => ids.has(j._id))
})

const stats = computed(() => {
  if (!jogador.value) return null
  return Engine.calcularStatsJogador(jogador.value._id, jogosFiltrados.value)
})

const getRatingColor = (r) => {
  if (r >= 8) return 'text-green-600'
  if (r >= 7) return 'text-blue-600'
  if (r >= 6) return 'text-yellow-600'
  if (r >= 5) return 'text-orange-600'
  return 'text-red-600'
}

const guardarPerfil = async () => {
  if (!jogador.value || !form.nome.trim()) return
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
        <div class="flex items-center gap-3">
          <span v-if="perfilCompleto"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            ✅ Perfil Completo
          </span>
          <span v-else
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
            ⚠️ Adiciona os teus dados para completar o perfil
          </span>
          <button @click="router.push('/ligas')"
            class="px-4 py-2 bg-[rgb(9,37,121)] text-white rounded-lg hover:bg-blue-900 text-sm font-medium transition">
            🏆 Ligas →
          </button>
        </div>
      </div>

      <!-- Card do jogador -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Banner com info -->
        <div class="bg-gradient-to-r from-[rgb(9,37,121)] to-blue-800 p-6 text-white flex flex-col md:flex-row items-center gap-6">
          <div class="shrink-0">
            <img v-if="jogador?.imagem" :src="jogador.imagem" class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
            <div v-else class="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl border-4 border-white">⚽</div>
          </div>
          <div class="flex-1 text-center md:text-left">
            <h3 class="text-2xl font-bold">{{ jogador?.nome || 'Sem nome' }}</h3>
            <div class="flex flex-wrap gap-4 mt-2 justify-center md:justify-start text-sm text-blue-100">
              <span v-if="jogador?.pePreferencial">🦵 {{ jogador.pePreferencial }}</span>
              <span v-if="jogador?.altura">📏 {{ jogador.altura }} cm</span>
              <span v-if="idade">🎂 {{ idade }} anos</span>
              <span v-if="!jogador?.pePreferencial && !jogador?.altura && !idade" class="text-blue-300 italic">
                Preenche os teus dados abaixo
              </span>
            </div>
          </div>
          <button
            @click="editandoPerfil = !editandoPerfil"
            class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition shrink-0">
            {{ editandoPerfil ? '✕ Fechar' : '✏️ Editar Perfil' }}
          </button>
        </div>

        <!-- Formulário de edição inline -->
        <div v-if="editandoPerfil" class="p-6 border-t border-gray-100 bg-gray-50">
          <h4 class="font-semibold text-gray-700 mb-4">Editar Perfil</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">
                Nome <span class="text-red-400">*</span>
              </label>
              <input v-model="form.nome" type="text"
                placeholder="O teu nome"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Pé Preferencial <span class="text-red-400">*</span></label>
              <select v-model="form.pePreferencial"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecionar...</option>
                <option value="Direito">Direito</option>
                <option value="Esquerdo">Esquerdo</option>
                <option value="Ambidextro">Ambidestro</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Data de Nascimento <span class="text-red-400">*</span></label>
              <input v-model="form.dataNascimento" type="date"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Altura (cm) <span class="text-red-400">*</span></label>
              <input v-model.number="form.altura" type="number" min="100" max="230"
                placeholder="Ex: 175"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">Foto <span class="text-gray-400 font-normal">(opcional)</span></label>
              <input type="file" accept="image/*" @change="onImagemChange" class="text-sm text-gray-500" />
            </div>
          </div>
          <div class="mt-4 flex gap-3">
            <button @click="guardarPerfil" :disabled="salvando || !form.nome.trim()"
              class="px-6 py-2 bg-[rgb(9,37,121)] text-white rounded-lg hover:bg-blue-900 font-medium text-sm transition disabled:opacity-50">
              {{ salvando ? 'A guardar...' : 'Guardar' }}
            </button>
            <button @click="editandoPerfil = false"
              class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 class="text-lg font-bold text-gray-800">📊 Estatísticas</h3>
          <select v-model="filtroLiga"
            class="bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 py-2 pl-3 pr-8 rounded-lg cursor-pointer">
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
  </div>
</template>