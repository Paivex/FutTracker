<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Store } from '../utils/store.js'
import { Utils } from '../utils/utils.js'
import { Engine } from '../utils/engine.js'

const route = useRoute()
const router = useRouter()

const jogador = ref(null)
const jogadores = ref([])
const todosJogos = ref([])
const loading = ref(true)
const isAdmin = ref(false)
const selectedTab = ref('Estatísticas')

const emEdicao = ref(false)
const form = reactive({
  nome: '',
  pePreferencial: '',
  dataNascimento: '',
  altura: null,
  imagem: null
})

const loadJogador = async (idParam) => {
  loading.value = true
  try {
    // ✅ Carregar jogador específico e jogos
    const [jogadorData, jogosData] = await Promise.all([
      Store.getJogador(idParam),
      Store.getJogos()
    ])
    
    jogador.value = jogadorData
    todosJogos.value = jogosData || []
    
    if (jogador.value) {
      Object.assign(form, JSON.parse(JSON.stringify(jogador.value)))
    }
    
    if (localStorage.getItem('modoAdmin') === 'true') {
      isAdmin.value = true
    }
  } catch (error) {
    console.error('Erro ao carregar jogador:', error)
    jogador.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadJogador(route.params.id)
})

watch(() => route.params.id, (newId) => {
  loadJogador(newId)
})

const stats = computed(() => {
  if (!jogador.value || !todosJogos.value) return null
  return Engine.calcularStatsJogador(jogador.value.id, todosJogos.value)
})

const historicoJogos = computed(() => {
  if (!jogador.value || !todosJogos.value) return []
  return todosJogos.value
    .filter(j => j.equipaA.includes(jogador.value.id) || j.equipaB.includes(jogador.value.id))
    .sort((a, b) => new Date(b.data) - new Date(a.data))
})

const premiosDoJogador = computed(() => {
  // Reutiliza a lógica de prémios: jogos com `jdj` apontando para este jogador
  return (todosJogos.value || [])
    .filter(j => j.jdj === (jogador.value?.id))
    .map(jogo => {
      const jogouNaA = jogo.equipaA.includes(jogo.jdj)
      const jogouNaB = jogo.equipaB.includes(jogo.jdj)

      let resultadoClasse = 'text-yellow-500'
      if (jogo.golosA !== jogo.golosB) {
        const ganhou = (jogouNaA && jogo.golosA > jogo.golosB) || (jogouNaB && jogo.golosB > jogo.golosA)
        resultadoClasse = ganhou ? 'text-green-600' : 'text-red-600'
      }

      return {
        tipo: 'JDJ',
        titulo: 'Jogador Defensivo do Jogo',
        emoji: '🛡️',
        pontos: 3,
        data: jogo.data,
        jogador: jogador.value,
        resultado: `${jogo.golosA} - ${jogo.golosB}`,
        resultadoClasse
      }
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data))
})

const toggleEdicao = () => {
  if (emEdicao.value) {
    if (jogador.value) Object.assign(form, jogador.value)
    emEdicao.value = false
  } else {
    emEdicao.value = true
  }
}

const guardarAlteracoes = async () => {
  if (!jogador.value) return
  
  try {
    // ✅ Usar o novo método atualizarJogador
    const dadosAtualizados = {
      nome: form.nome,
      pePreferencial: form.pePreferencial,
      dataNascimento: form.dataNascimento,
      altura: form.altura,
      imagem: form.imagem
    }
    
    const jogadorAtualizado = await Store.atualizarJogador(jogador.value.id, dadosAtualizados)
    jogador.value = jogadorAtualizado
    emEdicao.value = false
  } catch (error) {
    console.error('Erro ao guardar alterações:', error)
  }
}

const atualizarFoto = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const imagemRedimensionada = await Utils.resizeImage(file)
    form.imagem = imagemRedimensionada
    
    // Se não está em modo edição, atualiza imediatamente
    if (!emEdicao.value && jogador.value) {
      const jogadorAtualizado = await Store.atualizarJogador(jogador.value.id, {
        imagem: imagemRedimensionada
      })
      jogador.value = jogadorAtualizado
    }
  } catch (e) {
    console.error('Erro ao atualizar foto:', e)
  }
}

const removerFoto = async () => {
  if (!confirm('Remover a foto?')) return
  
  try {
    form.imagem = null
    
    // Se não está em modo edição, atualiza imediatamente
    if (!emEdicao.value && jogador.value) {
      const jogadorAtualizado = await Store.atualizarJogador(jogador.value.id, {
        imagem: null
      })
      jogador.value = jogadorAtualizado
    }
  } catch (error) {
    console.error('Erro ao remover foto:', error)
  }
}

const getRatingColor = (r) => {
  if (r >= 8) return 'text-green-600'
  if (r >= 7) return 'text-blue-600'
  if (r >= 6) return 'text-yellow-600'
  if (r >= 5) return 'text-orange-600'
  return 'text-red-600'
}

const getStatsNoJogo = (jogo) => {
  if (!jogo.estatisticas) return { golos:0, assistencias:0, perdas:0, falhancos:0 }
  return jogo.estatisticas.find(s => s.jogadorId === jogador.value.id) || { golos:0, assistencias:0, perdas:0, falhancos:0 }
}

const getRatingNoJogo = (jogo) => {
  const s = getStatsNoJogo(jogo)
  return Engine.calculateRating(s)
}

const getResultadoJogo = (jogo) => {
  const naEquipaA = jogo.equipaA.includes(jogador.value.id)
  let texto = 'D'
  let classe = 'bg-gray-100 text-gray-600'

  if (jogo.golosA > jogo.golosB) {
    if (naEquipaA) { texto='W'; classe='bg-green-100 text-green-600'; }
    else { texto='L'; classe='bg-red-100 text-red-600'; }
  } else if (jogo.golosB > jogo.golosA) {
    if (!naEquipaA) { texto='W'; classe='bg-green-100 text-green-600'; }
    else { texto='L'; classe='bg-red-100 text-red-600'; }
  }
  return { texto, classe }
}

const voltar = () => router.push({ name: 'jogadores' })

</script>

<template>
  <div class="p-6">
    <div v-if="loading" class="text-center py-12 text-gray-500">A carregar...</div>

    <div v-else>
      <div v-if="!jogador" class="text-center py-12 text-gray-400">Jogador não encontrado.</div>

      <div v-else class="space-y-6">
        <div class="flex items-center justify-between bg-white rounded-lg shadow p-6">
          <div>
            <h2 class="text-2xl font-bold">Perfil do Jogador</h2>
            <div class="text-sm text-gray-500 mt-1">{{ jogador.nome }}</div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="voltar" class="px-3 py-2 bg-gray-100 rounded">⟵ Voltar</button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex flex-col md:flex-row gap-6 mb-6">
            <div class="flex flex-col items-center gap-2 max-w-[25%]">
              <div class="player_img_container">
                <img v-if="form.imagem || jogador.imagem" :src="form.imagem || jogador.imagem">
                <div v-else class="text-5xl text-gray-300">👤</div>
              </div>
              <div v-if="isAdmin" class="w-full space-y-2">
                <input type="file" accept="image/*" @change="atualizarFoto" class="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                <button v-if="form.imagem || jogador.imagem" @click="removerFoto" class="w-full px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium">🗑️ Remover Foto</button>
              </div>
            </div>

            <div class="flex-1 bg-white border border-gray-200 rounded-lg p-4 space-y-4 h-fit">
              <div class="flex justify-between items-center border-b pb-2">
                <h4 class="font-bold text-gray-700">Dados Pessoais</h4>
                <div v-if="isAdmin">
                  <button v-if="!emEdicao" @click="toggleEdicao" class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-bold flex items-center gap-1">✏️ Editar</button>
                  <div v-else class="flex gap-2">
                    <button @click="toggleEdicao" class="text-xs px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 font-bold">Cancelar</button>
                    <button @click="guardarAlteracoes" class="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-bold">💾 Guardar</button>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <div><label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome</label><input v-model="form.nome" :disabled="!emEdicao" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-600"></div>
                <div><label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pé</label>
                    <select v-if="emEdicao" v-model="form.pePreferencial" class="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"><option value="">-</option><option value="Direito">Direito</option><option value="Esquerdo">Esquerdo</option><option value="Ambidestro">Ambidestro</option></select>
                    <input v-else :value="form.pePreferencial || '—'" disabled type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-600">
                </div>
                <div><label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nascimento</label><input v-model="form.dataNascimento" :disabled="!emEdicao" type="date" class="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-600"></div>
                <div><label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Altura (cm)</label><input v-model="form.altura" :disabled="!emEdicao" type="number" class="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-600"></div>
              </div>
            </div>
          </div>

          <!-- Abas -->
          <div class="mb-4">
            <div class="flex gap-2 mb-4">
              <button @click="selectedTab = 'Estatísticas'" :class="selectedTab === 'Estatísticas' ? 'bg-blue-600 text-white' : 'bg-gray-100'" class="px-3 py-1 rounded">Estatísticas</button>
              <button @click="selectedTab = 'Últimos Jogos'" :class="selectedTab === 'Últimos Jogos' ? 'bg-blue-600 text-white' : 'bg-gray-100'" class="px-3 py-1 rounded">Últimos Jogos</button>
              <button @click="selectedTab = 'Prémios'" :class="selectedTab === 'Prémios' ? 'bg-blue-600 text-white' : 'bg-gray-100'" class="px-3 py-1 rounded">Prémios</button>
            </div>

            <div v-if="selectedTab === 'Estatísticas'">
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Estatísticas Gerais</h3>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4"> 
                    <div class="bg-purple-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-purple-600">{{ stats.jogos }}</div><div class="text-xs text-gray-600 mt-1">🥅 Jogos</div></div>
                    <div class="bg-blue-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-blue-600">{{ stats.golos }}</div><div class="text-xs text-gray-600 mt-1">⚽ Golos</div></div>
                    <div class="bg-green-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-green-600">{{ stats.assistencias }}</div><div class="text-xs text-gray-600 mt-1">🎯 Assistências</div></div>
                    <div class="bg-orange-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-orange-600">{{ stats.falhancos }}</div><div class="text-xs text-gray-600 mt-1">😱 Falhanços</div></div>   
                    <div class="bg-red-50 rounded-lg p-3 text-center"><div class="text-2xl font-bold text-red-600">{{ stats.perdas }}</div><div class="text-xs text-gray-600 mt-1">❌ Perdas</div></div>                          
                </div>
              </div>

              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Balanço</h3>
                <div class="grid grid-cols-4 gap-4">
                    <div class="bg-green-50 rounded-lg p-4 text-center"><div class="text-2xl font-bold text-green-600">{{ stats.vitorias }}</div><div class="text-sm text-gray-600 mt-1">Vitórias</div></div>
                    <div class="bg-gray-50 rounded-lg p-4 text-center"><div class="text-2xl font-bold text-gray-600">{{ stats.empates }}</div><div class="text-sm text-gray-600 mt-1">Empates</div></div>
                    <div class="bg-red-50 rounded-lg p-4 text-center"><div class="text-2xl font-bold text-red-600">{{ stats.derrotas }}</div><div class="text-sm text-gray-600 mt-1">Derrotas</div></div>
                    <div class="bg-blue-50 rounded-lg p-4 text-center"><div class="text-2xl font-bold text-blue-600">{{ stats.jogos > 0 ? ((stats.vitorias / stats.jogos) * 100).toFixed(1) : '0.0' }}%</div><div class="text-sm text-gray-600 mt-1">Win Rate</div></div>
                </div>
              </div>

            </div>

            <div v-else-if="selectedTab === 'Últimos Jogos'">
              <div v-if="historicoJogos.length === 0" class="text-center text-gray-400 py-4">Nenhum jogo registado.</div>
              <div v-else class="space-y-4">
                <div v-for="jogo in historicoJogos.slice(0, 20)" :key="jogo.id" class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                  <div class="text-center text-xs text-gray-400 font-bold tracking-wider mb-3 uppercase">{{ Utils.formatarDataCompleta(jogo.data) }}</div>

                  <div class="flex justify-center items-center gap-4 mb-4">
                    <span class="text-3xl font-bold text-blue-600">{{ jogo.golosA }}</span>
                    <span class="text-gray-300 font-light text-2xl">-</span>
                    <span class="text-3xl font-bold text-red-600">{{ jogo.golosB }}</span>
                    <span :class="getResultadoJogo(jogo).classe" class="ml-2 px-2 py-0.5 rounded text-sm font-bold border border-opacity-20">{{ getResultadoJogo(jogo).texto }}</span>
                  </div>

                  <div class="flex justify-center items-center gap-4 text-sm text-gray-600 border-t pt-3">
                    <div class="flex items-center gap-1" title="Golos">⚽ <strong>{{ getStatsNoJogo(jogo).golos }}</strong></div>
                    <div class="flex items-center gap-1" title="Assistências">🎯 <strong>{{ getStatsNoJogo(jogo).assistencias }}</strong></div>
                    <div class="flex items-center gap-1" title="Perdas">❌ <strong>{{ getStatsNoJogo(jogo).perdas }}</strong></div>
                    <div class="flex items-center gap-1" title="Falhanços">😱 <strong>{{ getStatsNoJogo(jogo).falhancos }}</strong></div>
                    <div class="w-px h-4 bg-gray-300 mx-2"></div>
                    <div class="flex items-center gap-1" :class="getRatingColor(getRatingNoJogo(jogo))">⭐ <strong>{{ getRatingNoJogo(jogo).toFixed(1) }}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else>
              <div v-if="premiosDoJogador.length === 0" class="text-center text-gray-400 py-12">Sem prémios ainda.</div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="(premio, idx) in premiosDoJogador" :key="idx" class="relative bg-white rounded-xl border border-blue-700 p-4">
                  <div class="flex justify-between items-center text-base text-gray-500 mb-3">
                    <span class="font-semibold text-gray-700">{{ premio.titulo }} {{ premio.emoji }}</span>
                    <span>{{ Utils.formatarData(premio.data) }}</span>
                  </div>
                  <div class="flex gap-4 items-center">
                    <div class="w-[150px] h-[200px]">
                      <img v-if="premio.jogador?.imagem" :src="premio.jogador.imagem" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex-1 flex items-center justify-center">
                      <div class="text-3xl font-extrabold" :class="premio.resultadoClasse">{{ premio.resultado }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>
</template>