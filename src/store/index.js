import Vue from 'vue'
import Vuex from 'vuex'
import { db } from '@/db.js'
import { vuexfireMutations, firebaseAction } from 'vuexfire'
// import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
    // binom (state) {

    // },
    ...vuexfireMutations,
  },
  actions: {
    binom (context,p) {
      let answer=1
      for(let i=1;i<Math.min(p.k,p.n-p.k)+1;i++)
        answer=(answer*(p.n+1-i))/i
      return parseInt(answer)
    },
    cacheCard: firebaseAction((context,payload) => {
      return db
        .ref('cards').child(encodeURIComponent(payload.name).replace(/\./g,'%2E'))
        .set(JSON.stringify(payload))
    }),
    getCard: firebaseAction((context,payload) => {
      return db
        .ref('cards').child(encodeURIComponent(payload).replace(/\./g,'%2E')).once('value')
    }),
  },
  modules: {
  }
})
