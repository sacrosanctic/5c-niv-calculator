<template>
  <v-container>
    <v-row>
      <v-col cols=6>
        <v-text-field label="source"></v-text-field>
        <v-text-field label="date"></v-text-field>
        <v-textarea v-model="input"></v-textarea>
        <v-btn @click.stop="test">calculate</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          v-if="mb"
          :headers="guildHeader"
          :items="guild"
          class="elevation-1"
          dense
          disable-pagination
          hide-default-footer
        >
        </v-data-table>
      </v-col>
      <v-col>
        <v-data-table
          v-if="output"
          :headers="guildHeader"
          :items="output"
          class="elevation-1"
          dense
          disable-pagination
          hide-default-footer
        >
        </v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p>
          {{output}}
        </p>
        <p>
          {{mb}}
        </p>
        <p>
          {{sb}}
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    input: null,
    output: null,
    mb: null,
    sb: null,
    cardCache: null,
    cardLookup: [],
    lookup: [],
    guild: [],
    guildHeader: [
      {
        text: 'name',
        value: 'name',
      },
      {
        text: 'value',
        value: 'value',
      },
    ],
  }),
  mounted () {
    // console.log(this.getCard('Dreadhorde Arcanist'))
  },
  methods: {
    test() {
      this.parseInput()
      this.lookupCards()
    },
    parseInput() {
      let cardList = this.input.split(/\r?\n/)
      let mb = []
      let sb = []
      // let promise = []
      let sbCheck = false
      for(let i=0;i<cardList.length;i++) {
        if(cardList[i].match(/sideboard[:]*/gi)) {
          sbCheck = true
          continue
        }
        const obj = {
          name: cardList[i].substr(cardList[i].indexOf(' ')+1),
          amount: cardList[i].substr(0,cardList[i].indexOf(' '))
        }
        sbCheck ? sb.push(obj) : mb.push(obj)

        // promise.push(this.getCard(obj.name))
        //   .then(data => {
        //     this.cardLookup.push(data)
        //   })
      }
      this.mb = mb
      this.sb = sb
      // Promise.all(promise)
      //   .then(() => {
      //     // this.guildTable()
      //   })
    },
    lookupCards() {
      let promise = []
      for(const card of this.mb) {
        promise.push(
          this.getCard(card.name)
            .then(data => {
              this.cardLookup.push(data)
          })
        )
      }
      Promise.all(promise)
        .then(() => {
          this.guildTable()
        })
    },
    async getCard(name) {
      const result = await this.$store.dispatch('getCard', name)
      if(result.exists()) {
        return JSON.parse(result.val())
      }
      else {
        let card = await this.$axios.get('https://api.scryfall.com/cards/named?fuzzy=' + encodeURI(name))
        card = card.data
        if(card.layout!='normal') {
          card = card.card_faces[0]
        }
        const obj = this.createCardObj(card)
        this.$store.dispatch('cacheCard', obj)
        return obj
      }
    },
    createCardObj(card) {
      return {
        cmc: card.cmc,
        colors: card.colors.sort().join(''),
        name: card.name,
        type_line: card.type_line,
      }
    },
    guildTable() {
      const guild = ['BG','BR','BW','BU','GR','GW','GU','RW','RU','UW']
      const dork = [
        'Birds of Paradise',
        'Gilded Goose',
        'Noble Hierach',
        'Sylvan Caryatid',
        'Utopia Sprawl',
      ]
      const keyCards = [
        'Niv-Mizzet Reborn',
        'Arcum\'s Astrolabe',
        'Glittering Wish',

      ]
      const land = [
        'Basic',
        'Land'
      ]
      let guildCount = Array(guild.length).fill(0)
      let dorkCount = Array(dork.length).fill(0)
      let cardCount = Array(keyCards.length).fill(0)
      let landCount = Array(land.length).fill(0)
      // let otherCount = 0
      let index = null;
      for(const [i, card] of this.mb.entries()) {
        // console.log(card.name)
        //find cards
        index = keyCards.findIndex(a=>a==this.cardLookup[i].name)
        if(index > -1) {
          cardCount[index]+=Number(card.amount)
          if(this.cardLookup[i].name=="Glittering Wish") guildCount[5]+=Number(card.amount)
          continue
        }
        //find dorks
        index = dork.findIndex(a=>a==this.cardLookup[i].name)
        if(index > -1) {
          dorkCount[index]+=Number(card.amount)
          continue
        }
        //find basic land
        index = this.cardLookup[i].type_line.search(land[0])
        if(index > -1) {
          landCount[0]+=Number(card.amount)
          continue
        }
        //find other land
        index = this.cardLookup[i].type_line.search(land[1])
        if(index > -1) {
          landCount[1]+=Number(card.amount)
          continue
        }
        index = guild.findIndex(a=>a==this.cardLookup[i].colors)
        if(index > -1) {
          guildCount[index]+=Number(card.amount)
          continue
        }
        // otherCount++
      }
      this.guild = []
      for(let i=0;i<guild.length;i++) {

        this.guild.push({
          name: guild[i],
          value: guildCount[i]
        })
      }
      this.guild.push(
        Object.fromEntries(land.map((_,i)=>[land[i],landCount[i]]))
      )


      // this.guild = []
      // let top = [...keyCards, ...dork, ...guild, ...land, 'other']
      // let bottom = [...cardCount,...dorkCount,...guildCount,...landCount,otherCount]
      // for(let j=0;j<top.length;j++) {
      //   this.guild.push({
      //     name: top[j],
      //     value: bottom[j],
      //   })
      // }
      // this.guild.push({
      //   name: 'total',
      //   value: bottom.reduce((a,b)=>a+b,0)
      // })
    }
  }
}
</script>
