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
    ...vuexfireMutations,
  },
  actions: {
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
