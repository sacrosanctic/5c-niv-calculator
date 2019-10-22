<template>
  <v-container>
    <v-row>
      <v-col cols=6>
        <v-text-field label="source"></v-text-field>
        <v-text-field label="date"></v-text-field>
        <v-textarea v-model="input"></v-textarea>
        <v-btn @click.stop="submit">calculate</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
        v-if="mb"
        :headers="headers2"
        :items="mb"
        class="elevation-1"
        dense
        >
        </v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p>
          {{mb}}
        </p>
        <p>
          {{output}}
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    input: null,
    table: null,
    cardDB: null,
    mb: null,
    output: null,
    lookup: [],
    headers2: [
      {
        text: 'amount',
        value: 'amount',
        width: '100'
      },
      {
        text: 'name',
        align: 'left',
        sortable: false,
        value: 'name',
      },
    ],
  }),
  mounted () {
  },
  methods: {
    cacheCard(name) {
      this.$axios.get('https://api.scryfall.com/cards/named?fuzzy=' + encodeURI(name))
        .then(res => {
          this.$store.dispatch('cacheCard', res.data)
        })
    },
    getCard(name) {
      return this.$store.dispatch('getCard', name)
        .then(res => {
          return res
        })
    },
    submit() {
      let temp = this.input.split(/\r?\n/)
      let mb = []
      let promise = []
      // let obj = {}
      // let sb = []
      for(var i=0;i<temp.length;i++) {
        if(temp[i].match(/sideboard*/gi)) break
          mb.push([
            temp[i].substr(0,temp[i].indexOf(' ')),
            temp[i].substr(temp[i].indexOf(' ')+1),
          ])
        // obj = {
        //   name: temp[i].substr(temp[i].indexOf(' ')+1),
        //   amount: temp[i].substr(0,temp[i].indexOf(' ')),
        // }
        // mb.push(obj)
        promise.push(this.getCard(temp[i].substr(temp[i].indexOf(' ')+1))
          .then(data => {
            this.lookup.push(data)
          }))
      }
      this.mb = mb
      Promise.all(promise)
        .then(() => {
          this.guildTable()
        })
    },
    guildTable() {
      const guild = ['BG','BR','BW','BU','GR','GW','GU','RW','RU','UW']
      const dork = [
        'Birds of Paradise',
        'Gilded Goose',
        'Noble Hierach',
        'Sylvan Caryatid',
      ]
      const card = [
        'Niv-Mizzet Reborn',
        'Arcum\'s Astrolabe',
        'Glittering Wish',
      ]
      const land = [
        'Basic',
        'Land'
      ]
      let guildCount = Array(10).fill(0)
      let dorkCount = Array(4).fill(0)
      let cardCount = Array(3).fill(0)
      let landCount = Array(2).fill(0)
      let otherCount = 0
      let index = null;
      for(const [i, v] of this.mb.entries()) {
        // console.log(v[1])
        //find cards
        index = card.findIndex(a=>a==this.lookup[i].name)
        if(index > -1) {
          cardCount[index]+=Number(v[0])
          continue
        }
        //find dorks
        index = dork.findIndex(a=>a==this.lookup[i].name)
        if(index > -1) {
          dorkCount[index]+=Number(v[0])
          continue
        }
        //find basic land
        index = this.lookup[i].type_line.search(land[0])
        if(index > -1) {
          landCount[0]+=Number(v[0])
          continue
        }
        //find other land
        index = this.lookup[i].type_line.search(land[1])
        if(index > -1) {
          landCount[1]+=Number(v[0])
          continue
        }
        index = guild.findIndex(a=>a==this.lookup[i].colors)
        if(index > -1) {
          guildCount[index]+=Number(v[0])
          continue
        }
        otherCount++
      }
      this.output = []
      let top = [].concat(card, dork, guild, land, ['other'])
      let bottom = [].concat(cardCount,dorkCount,guildCount,landCount,[otherCount])
      console.log(bottom)
      for(let j=0;j<top.length;j++) {
        this.output.push([
          top[j],
          bottom[j],
        ])
      }
      this.output.push(['total',bottom.reduce((a,b)=>a+b,0)])
    }
  }
}
</script>
