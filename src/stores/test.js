import { defineStore } from 'pinia'

export const useTestStore = defineStore('test', {
  state: () => ({
    count: 0,
    messages: [],
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    messageCount: (state) => state.messages.length,
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    addMessage(message) {
      this.messages.push(message)
    },
    
    reset() {
      this.count = 0
      this.messages = []
    },
    
    clearMessages() {
      this.messages = []
    }
  }
})