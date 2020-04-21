<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-text-field label="url" v-model="url"></v-text-field>
        <!-- <v-text-field label="source"></v-text-field>
        <v-text-field label="date"></v-text-field>-->
        <v-textarea label="list" v-model="input"></v-textarea>
        <v-btn @click.stop="parseList">list calc</v-btn>
        <v-btn @click.stop="getDeck">URL calc</v-btn>
      </v-col>
      <!-- <v-col>
        <v-data-table
          v-if="guild"
          :headers="guildHeader"
          :items="guild"
          class="elevation-1"
          group-by="colour"
          item-key="name"
          :expanded="expanded"
          dense
          disable-pagination
          hide-default-footer
          show-expand
        >
          <template v-slot:top>
            <v-switch label="expand all"></v-switch>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="guildHeader.length" style="white-space:pre">{{clicked(item)}}</td>
          </template>
        </v-data-table>
      </v-col>-->
    </v-row>
    <v-row>
      <v-col></v-col>
      <v-col>
        <v-data-table
          v-if="output"
          :headers="guildHeader"
          :items="output"
          class="elevation-1"
          dense
          disable-pagination
          hide-default-footer
        ></v-data-table>
        <p>{{guildCount}}</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p>{{output}}</p>
        <h2>Preview</h2>
        <p>{{preview}}</p>
        <div v-if="processed">
          <h2>Mainboard {{ mb.reduce((a,b)=>a+(b['amount'] || 0),0) }}</h2>
          <p>{{deck.mb}}</p>
          <h2>Sideboard {{ sb.reduce((a,b)=>a+(b['amount'] || 0),0) }}</h2>
          <p>{{sb}}</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    processed: false,

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
    deck: {
      mb: null,
      sb: null,
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
    ]
  }),
  mounted() {
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
      this.parseInput();
    },
    // parseInput() {
    //   if (this.input == null) return false
    //   let cardList = this.input.split(/\r?\n/)
    //   let mb = []
    //   let sb = []
    //   // let promise = []
    //   for (let i = 0; i < cardList.length; i++) {
    //     if (cardList[i].match(/sideboard[:]*/gi) || cardList[i] === "") {
    //       sb = true;
    //       continue;
    //     }
    //     sbRecord[i] = sb;
    //     this.promise.push(
    //       this.getCard(cardList[i].substr(cardList[i].indexOf(" ") + 1)).then(
    //         data => {
    //           this.deck.push({
    //             ...data,
    //             amount: Number(cardList[i].substr(0, cardList[i].indexOf(" "))),
    //             sideboard: sbRecord[i]
    //           });
    //         }
    //       )
    //     );
    // }
    // },
    parseInput() {
      let cardList = this.input.split(/\r?\n/);
      let mb = [];
      let sb = [];
      let sbCheck = false;
      this.processed = false;

      for (let i = 0; i < cardList.length; i++) {
        if (cardList[i].match(/sideboard[:]*/gi) || cardList[i] === "") {
          sbCheck = true;
          continue;
        }
        const obj = {
          name: cardList[i].substr(cardList[i].indexOf(" ") + 1),
          amount: Number(cardList[i].substr(0, cardList[i].indexOf(" ")))
        };
        sbCheck ? sb.push(obj) : mb.push(obj);
      }
      this.mb = mb
      this.sb = sb
      this.deck.mb = mb
      this.processed = true;

      this.lookupCards()
    },
    anaylizeDeck() {
      this.guild = [];
      this.guildCount = [];

      Promise.all(this.promise).then(() => {
        let temp = {};
        this.deck.forEach(function(v) {
          if (v.sideboard) return;
          // if (v.colors == 0) {
          //   if (v.type_line.search(/land/gi))
          //     temp.land = (temp.land || 0) + 1 * v.amount;
          //   else temp.artifact = (temp.artifact || 0) + 1 * v.amount;
          // } else
          temp[v.colors] = (temp[v.colors] || 0) + 1 * v.amount;
        });
        this.guild = Object.entries(temp).map(e => {
          return {
            name: e[0],
            value: e[1],
            colour: e[0].length
          };
        });
        this.guild.forEach(v => {
          if (v.name.length == 2) this.guildCount.push(v.value);
        });
      });
    },
    lookupCards() {
      let promise = [];
      for (const card of this.mb) {
        promise.push(
          this.getCard(card.name)
            .then(data => {
              this.cardLookup.push(data);
            })
            .catch(err => {
              console.log(err);
            })
        );
      }
      Promise.all(promise).then(() => {
        this.guildTable();
      });
    },
    async getCard(name) {
      const result = await this.$store.dispatch("getCard", name);
      if (result.exists()) {
        return JSON.parse(result.val());
      } else {
        let card = await this.$axios.get(
          "https://api.scryfall.com/cards/named?fuzzy=" + encodeURI(name)
        );
        card = card.data;
        const obj = this.createCardObj(card);
        this.$store.dispatch("cacheCard", obj);
        return obj;
      }
    },
    createCardObj(card) {
      if (card.layout == "transform") {
        return {
          cmc: card.cmc,
          colors: card.card_faces[0].colors.sort().join(""),
          name: card.card_faces[0].name,
          type_line: card.card_faces[0].type_line
        };
      } else {
        return {
          cmc: card.cmc,
          colors: card.colors.sort().join(""),
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
