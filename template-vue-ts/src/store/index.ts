import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useState = defineStore('state', () => {
  const data = ref(0)
  return {
    data,
    add: () => {
      data.value++
    },
  }
})
