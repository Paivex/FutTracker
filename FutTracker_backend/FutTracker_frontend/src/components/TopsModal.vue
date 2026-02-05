<script setup>
defineProps({
  titulo: String,
  lista: Array,
  cor: String 
})

defineEmits(['close'])

const getRankColor = (index) => {
    if (index === 0) return 'text-yellow-500 font-extrabold text-xl'; 
    if (index === 1) return 'text-gray-400 font-bold text-lg';      
    if (index === 2) return 'text-orange-500 font-bold text-lg';    
    return 'text-gray-400 font-medium';                             
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="$emit('close')">
    <div class="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col" @click.stop>
        
        <div :class="`bg-${cor}-600`" class="text-white p-4 rounded-t-lg flex justify-between items-center shadow-md">
            <h2 class="text-xl font-bold flex items-center gap-2">
                ⚽ {{ titulo }}
            </h2>
            <button @click="$emit('close')" class="text-white hover:text-gray-200 text-2xl font-bold opacity-80 hover:opacity-100">✕</button>
        </div>

        <div class="flex-1 overflow-hidden flex flex-col bg-gray-50 rounded-b-lg">
            
            <div class="grid grid-cols-12 gap-2 p-3 bg-gray-100 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div class="col-span-1 text-center">#</div>
                <div class="col-span-7">Jogador</div>
                <div class="col-span-2 text-center">Jogos</div>
                <div class="col-span-2 text-center">Valor</div>
            </div>

            <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
                <div v-for="(jogador, index) in lista" :key="jogador.id" 
                     class="grid grid-cols-12 gap-2 items-center p-3 mb-1 bg-white border border-gray-100 rounded hover:shadow-sm transition">
                    
                    <div class="col-span-1 text-center">
                        <span :class="getRankColor(index)">{{ index + 1 }}</span>
                    </div>

                    <div class="col-span-7 flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            <img v-if="jogador.imagem" :src="jogador.imagem" class="w-full h-full object-cover">
                            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">👤</div>
                        </div>
                        <span class="font-bold text-gray-800 text-sm truncate">{{ jogador.nome }}</span>
                    </div>

                    <div class="col-span-2 text-center text-gray-500 text-sm">
                        {{ jogador.jogos }}
                    </div>

                    <div class="col-span-2 text-center font-bold text-lg" :class="`text-${cor}-600`">
                        {{ jogador.valorFormatado }}
                    </div>
                </div>
            </div>
            
            <div class="p-2 text-center text-xs text-gray-400 border-t bg-gray-50">
                Classificação completa de todos os jogadores
            </div>
        </div>
    </div>
  </div>
</template>