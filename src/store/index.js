import Vue from 'vue'
import Vuex from 'vuex'
import { db } from '@/db.js'
import { vuexfireMutations, firebaseAction } from 'vuexfire'
import axios from 'axios'

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
        .ref('cards').child(payload.name)
        .set(JSON.stringify(payload))
    }),
    getCard: firebaseAction((context,payload) => {
      return db
        .ref('cards').child(payload).once('value')
          .then(res => {
            if(res.exists()) {
              return JSON.parse(res.val())
            }
            else {
              return axios.get('https://api.scryfall.com/cards/named?fuzzy=' + encodeURI(payload))
                .then(card => {
                  card = card.data
                  if(card.layout!='normal') {
                    card = card.card_faces[0]
                  }
                  const obj = {
                    cmc: card.cmc,
                    colors: card.colors.sort().join(''),
                    name: card.name,
                    type_line: card.type_line,
                  }
                  context.dispatch('cacheCard', obj)
                  return obj
                })
            }
          })
    }),
  },
  modules: {
  }
})
