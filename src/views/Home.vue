<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-text-field label="url" v-model="url"></v-text-field>
        <!-- <v-text-field label="source"></v-text-field>
        <v-text-field label="date"></v-text-field>-->
        <v-textarea label="list" v-model="input">
        </v-textarea>
        <v-btn @click.stop="parseList">list calc</v-btn>
        <v-btn @click.stop="getDeck">URL calc</v-btn>
      </v-col>
      <v-col>
        <v-data-table
          v-if="page.result"
          :headers="guildHeader"
          :items="guild"
          class="elevation-1"
          item-key="name"
          :expanded.sync="expanded"
          dense
          disable-pagination
          hide-default-footer
          show-expand
          sort-by="colour"
        >
          <template v-slot:top>
            <!-- <v-switch label="expand all"></v-switch> -->
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="guildHeader.length" style="white-space:pre">more stuff here please {{item}}</td>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row v-if="page.result">
      <v-col>
        <h2>Number of hits</h2>
        <p>
          Deck size: {{result.total}}
        </p>
        <p>
          Niv-Mizzet Reborn Hits: {{result.hits}}
        </p>
      </v-col>
      <v-col>
        <h2>Deck Breakdown</h2>
        <p>Land: {{result.lands}}</p>
        <p>0 Colour: {{result.colors.c0}}</p>
        <p>1 Colour: {{result.colors.c1}}</p>
        <p>2 Colour: {{result.colors.c2}}</p>
        <p>3 Colour: {{result.colors.c3}}</p>
        <p>4 Colour: {{result.colors.c4}}</p>
        <p>5 Colour: {{result.colors.c5}}</p>
      </v-col>
      <v-col>
        <h2>Guild Breakdown</h2>
        <p v-for="guild in result.guilds" :key="guild.name"> {{ guild.name+": "+ guild.value }}</p>
      </v-col>
      <v-col>
        <h2>Colour Breakdown</h2>
        <p v-for="guild in result.nonguilds" :key="guild.name"> {{ guild.name + ": "+guild.value }}</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p>{{guildCount}}</p>
        <h2>Guild Colours</h2>
        <p>{{guild}}</p>
      </v-col>
      <v-col>
        <p>{{result}}</p>
        <h2>Preview</h2>
        <p>{{preview}}</p>
        <p>{{page}}</p>
        <div v-if="page.result">
          <h2>Mainboard {{ deck.mb.reduce((a,b)=>a+(b['amount'] || 0),0) }}</h2>
          <p>{{deck.mb}}</p>
          <h2>Sideboard {{ deck.sb.reduce((a,b)=>a+(b['amount'] || 0),0) }}</h2>
          <p>{{deck.sb}}</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    page: {
      running:false,
      result:false,
    },
    expanded: [],
    url: "https://deckbox.org/sets/2641250",
    preview: null,
    input: null,
    output: null,
    cardCache: null,
    cardLookup: [],
    lookup: [],
    guild: [],
    result: {},
    deck: {
      mb: [],
      sb: [],
    },
    promise: [],
    guildCount: "",
    guildHeader: [
      {
        text: "name",
        value: "name"
      },
      {
        text: "value",
        value: "value"
      },
      {
        text: "",
        value: "data-table-expand"
      }
    ],
  }),
  mounted() {
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
      this.parseInput();
    },
    parseInput() {
      let cardList = this.input.split(/\r?\n/);
      let location = "mb"
      let promise = []
      this.page.result = false;
      this.deck.mb = []
      this.deck.sb = []

      for (let i = 0; i < cardList.length; i++) {
        if (cardList[i].match(/sideboard[:]*/gi) || cardList[i] === "") {
          location = "sb"
          continue
        }

        //create card object
        const card = {
          name: cardList[i].substr(cardList[i].indexOf(" ") + 1),
          amount: Number(cardList[i].substr(0, cardList[i].indexOf(" "))),
          location: location,
        }

        //get card metadata and push new card object into deck
        promise.push(
          this.getCard(card.name)
          .then(data=>{
            this.deck[card.location].push({...data,amount:card.amount})
          })
          .catch(err=>{
            console.log(err);
          })
        )
      }
      Promise.all(promise).then(()=>{
        // this.guildTable();
        this.anaylizeDeck()
      })
    },
    anaylizeDeck() {
      this.guild = [];
      this.guildCount = [];

      let temp = {}
      this.deck.mb.forEach(a=>{
        //count up the card by colour
        temp[a.colors] = (temp[a.colors] || 0) + 1 * a.amount
      })
      this.guild = Object.entries(temp).map(e => {
        return {
          name: e[0],
          value: e[1],
          colour: e[0].length,
        }
      })
      const obj = {
        total: this.deck.mb.reduce((a,b)=>a+(b.amount||0),0),
        lands: this.deck.mb.reduce((a,b)=>a+(b.type_line.search(/land/gi)>-1?b.amount||0:0),0),
        colors: {
          c0: this.deck.mb.reduce((a,b)=>a+(b.colors.length==0&&b.type_line.search(/land/gi)==-1?b.amount||0:0),0),
          c1: this.deck.mb.reduce((a,b)=>a+(b.colors.length==1?b.amount||0:0),0),
          c2: this.deck.mb.reduce((a,b)=>a+(b.colors.length==2?b.amount||0:0),0),
          c3: this.deck.mb.reduce((a,b)=>a+(b.colors.length==3?b.amount||0:0),0),
          c4: this.deck.mb.reduce((a,b)=>a+(b.colors.length==4?b.amount||0:0),0),
          c5: this.deck.mb.reduce((a,b)=>a+(b.colors.length==5?b.amount||0:0),0),
        },
        guilds: this.guild.filter(a=>a.name.length==2),
        nonguilds: this.guild.filter(a=>a.name.length!=2)
      }
      obj.hits = obj.colors.c2
      obj.nonhits = obj.total - obj.colors.c2

      let temp2 = []
      this.guild.forEach(v=>{
        if(v.name.length == 2) temp2.push(v.value)
      })
      this.guildCount = Array(10).fill(0).map((a,i)=>{
        return a + (temp2[i]||0)
      })
      this.guildCount.push(obj.nonhits)
      this.guildCount = this.guildCount.join(",")

      this.result = {...obj}
      this.page.result = true
    },
    async getCard(name) {
      const result = await this.$store.dispatch("getCard", name);
      if (result.exists()) {
        return JSON.parse(result.val());
      } else {
        let card = await this.$axios.get(
          "https://api.scryfall.com/cards/named?fuzzy=" + encodeURI(name)
        )
        card = card.data;
        const obj = this.createCardObj(card);
        this.$store.dispatch("cacheCard", obj);
        return obj;
      }
    },
    //############
    //a compare function to sort by WUBRG
    //############
    colorPieOrder(a,b) {
      let sortedLetters = ["W","U","B","R","G"]
			for(const letter of sortedLetters) {
        if(a==b) return 0
        if(a==letter) return -1
        if(b==letter) return 1
      }
      return 0
    },
    createCardObj(card) {
      if (card.layout == "transform") {
        return {
          cmc: card.cmc,
          colors: card.card_faces[0].colors.sort(this.colorPieOrder).join(""),
          name: card.card_faces[0].name,
          type_line: card.card_faces[0].type_line
        };
      } else {
        return {
          cmc: card.cmc,
          colors: card.colors.sort(this.colorPieOrder).join(""),
          name: card.name,
          type_line: card.type_line
        };
      }
    },
    guildTable() {
      const guild = [
        "BG",
        "BR",
        "BW",
        "BU",
        "GR",
        "GW",
        "GU",
        "RW",
        "RU",
        "UW"
      ];
      const dork = [
        "Birds of Paradise",
        "Gilded Goose",
        "Noble Hierach",
        "Sylvan Caryatid",
        "Utopia Sprawl"
      ];
      const keyCards = [
        "Niv-Mizzet Reborn",
        "Arcum's Astrolabe",
        "Glittering Wish"
      ];
      const land = ["Basic", "Land"];
      let guildCount = Array(guild.length).fill(0);
      let dorkCount = Array(dork.length).fill(0);
      let cardCount = Array(keyCards.length).fill(0);
      let landCount = Array(land.length).fill(0);
      let total = 0;
      // let otherCount = 0
      let index = null;
      for (const [i, card] of this.mb.entries()) {
        total += Number(card.amount);

        // console.log(card.name)
        //find cards
        index = keyCards.findIndex(a => a == this.cardLookup[i].name);
        if (index > -1) {
          cardCount[index] += Number(card.amount);
          if (this.cardLookup[i].name == "Glittering Wish")
            guildCount[5] += Number(card.amount);
          continue;
        }
        //find dorks
        index = dork.findIndex(a => a == this.cardLookup[i].name);
        if (index > -1) {
          dorkCount[index] += Number(card.amount);
          continue;
        }
        //find basic land
        index = this.cardLookup[i].type_line.search(land[0]);
        if (index > -1) {
          landCount[0] += Number(card.amount);
          continue;
        }
        //find other land
        index = this.cardLookup[i].type_line.search(land[1]);
        if (index > -1) {
          landCount[1] += Number(card.amount);
          continue;
        }
        index = guild.findIndex(a => a == this.cardLookup[i].colors);
        if (index > -1) {
          guildCount[index] += Number(card.amount);
          continue;
        }
        // otherCount++
      }
      this.guild = [];
      for (let i = 0; i < guild.length; i++) {
        this.guild.push({
          name: guild[i],
          value: guildCount[i]
        });
      }
      let guildsum = this.guild.reduce((a, b) => a + (b["value"] || 0), 0);
      this.guild.push({
        name: "other",
        value: total - guildsum
      });
      this.guild.push({
        name: "total",
        value: total
      });
      this.guild.push(
        Object.fromEntries(land.map((_, i) => [land[i], landCount[i]]))
      );
      this.preview = guildCount;

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
      this.guildCount = guildCount;
    }
  }
};
</script>
