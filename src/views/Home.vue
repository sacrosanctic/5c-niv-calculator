<template>
  <v-container>
    <v-row>
      <v-col cols=6>
        <v-text-field label="url" v-model="url"></v-text-field>
        <!-- <v-text-field label="source"></v-text-field>
        <v-text-field label="date"></v-text-field> -->
        <v-textarea label="list" v-model="input"></v-textarea>
        <v-btn @click.stop="parseList">list calc</v-btn>
        <v-btn @click.stop="getDeck">URL calc</v-btn>
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
        <h2>Preview</h2>
        <p>
          {{preview}}
        </p>
        <h2>Mainboard</h2>
        <p>
          {{mb}}
        </p>
        <h2>Sideboard</h2>
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
    url: "https://deckbox.org/sets/2641250",
    preview: null,
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
    getDeck() {
      //usage: scrape desklist data from website
      //currently none functional
      //ref https://stackoverflow.com/questions/27745/getting-parts-of-a-url-regex

    // let regex = this.url.match(/^((http[s]?|ftp):\/)?\/?([^:/\s]+)((\/\w+)*\/)([\w\-.]+[^#?\s]+)(.*)?(#[\w-]+)?$/)
    //   const obj = {
    //     url: this.url,
    //     hostname: regex[3],
    //     path: regex[4],
    //     decklist_url: this.url + "/export"
    //   }

    //   this.output = obj

    },
    parseList() {
      this.parseInput()
    },
    parseInput() {
      if (this.input == null) return false
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

      }
      this.mb = mb
      this.sb = sb
      this.lookupCards()
    },
    lookupCards() {
      let promise = []
      for(const card of this.mb) {
        promise.push(
          this.getCard(card.name)
            .then(data => {
              this.cardLookup.push(data)
          }).catch(err=>{console.log(err)})
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
        const obj = this.createCardObj(card)
        this.$store.dispatch('cacheCard', obj)
        return obj
      }
    },
    createCardObj(card) {
      if(card.layout=='transform') {
        return {
          cmc: card.cmc,
          colors: card.card_faces[0].colors.sort().join(''),
          name: card.card_faces[0].name,
          type_line: card.card_faces[0].type_line,
        }
      }
      else {
        return {
          cmc: card.cmc,
          colors: card.colors.sort().join(''),
          name: card.name,
          type_line: card.type_line,
        }
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
      let total = 0
      // let otherCount = 0
      let index = null;
      for(const [i, card] of this.mb.entries()) {
        total+=Number(card.amount)

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
      let guildsum = this.guild.reduce((a,b)=>a+(b['value'] || 0),0)
      this.guild.push({
        name: "other",
        value: total-guildsum
      })
      this.guild.push({
        name: "total",
        value: total
      })
      this.guild.push(
        Object.fromEntries(land.map((_,i)=>[land[i],landCount[i]]))
      )
        this.preview = guildCount

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
