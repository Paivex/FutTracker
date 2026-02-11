<template>
  <div class="animate-pulse space-y-4 w-full">
    <div class="h-10 bg-gray-300 rounded w-full mb-6"></div>

    <div class="flex justify-center items-end space-x-4 mb-8 h-48">
      <div class="w-24 h-32 bg-gray-200 rounded-t-lg"></div> <div class="w-28 h-40 bg-gray-300 rounded-t-lg relative"> <div class="absolute -top-8 left-8 w-10 h-10 bg-yellow-200 rounded-full"></div>
      </div>
      <div class="w-24 h-28 bg-gray-200 rounded-t-lg"></div> </div>

    <div class="space-y-2">
      <div v-for="i in 10" :key="i" class="flex items-center space-x-4 p-4 bg-white rounded shadow-sm">
        <div class="h-8 w-8 bg-gray-200 rounded-full"></div> <div class="h-4 bg-gray-200 rounded w-1/4"></div>    <div class="flex-1"></div>
        <div class="h-4 bg-gray-200 rounded w-12"></div>     </div>
    </div>
  </div>
</template>