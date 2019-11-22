<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-text-field label="source"></v-text-field>
        <v-text-field label="date"></v-text-field>
        <v-textarea v-model="input"></v-textarea>
        <v-btn @click.stop="test">calculate</v-btn>
      </v-col>
      <v-col>
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
      </v-col>
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
        <p>{{mb}}</p>
        <p>{{sb}}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    expanded: [],
    input: null,
    output: null,
    mb: null,
    sb: null,
    cardCache: null,
    cardLookup: [],
    lookup: [],
    guild: [],
    deck: [],
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
    clicked(obj) {
      return this.deck
        .filter(card => {
          return card.colors == obj.name && !card.sideboard;
        })
        .reduce((str, card) => {
          return str + card.amount + ' ' + card.name + '\r\n'
          // str + card.name;
        }, "");
      //     .map(card => {
      //       return card.amount + ' ' + card.name;
      //     });
      //     let str = ''
      //     test.forEach(v=>{
      //       str+=v
      //     })
      //     return str
    },
    test() {
      this.parseInput2();
      this.anaylizeDeck();
      // this.parseInput()
      // this.lookupCards()
    },
    parseInput2() {
      let cardList = this.input.split(/\r?\n/);
      let sbRecord = [];
      let sb = false;
      this.deck = [];
      // let promise = []
      for (let i = 0; i < cardList.length; i++) {
        if (cardList[i].match(/sideboard[:]*/gi) || cardList[i] === "") {
          sb = true;
          continue;
        }
        sbRecord[i] = sb;
        this.promise.push(
          this.getCard(cardList[i].substr(cardList[i].indexOf(" ") + 1)).then(
            data => {
              this.deck.push({
                ...data,
                amount: Number(cardList[i].substr(0, cardList[i].indexOf(" "))),
                sideboard: sbRecord[i]
              });
            }
          )
        );
      }
    },
    anaylizeDeck() {
      this.guild = [];
      this.guildCount = [];

      Promise.all(this.promise).then(() => {
        let temp = {};
        this.deck.forEach(function(v) {
          if (v.sideboard) return;
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
    parseInput() {
      let cardList = this.input.split(/\r?\n/);
      let mb = [];
      let sb = [];
      let sbCheck = false;
      for (let i = 0; i < cardList.length; i++) {
        if (cardList[i].match(/sideboard[:]*/gi) || cardList[i] === "") {
          sbCheck = true;
          continue;
        }
        const obj = {
          name: cardList[i].substr(cardList[i].indexOf(" ") + 1),
          amount: cardList[i].substr(0, cardList[i].indexOf(" "))
        };
        sbCheck ? sb.push(obj) : mb.push(obj);
      }
      this.mb = mb;
      this.sb = sb;
    },
    lookupCards() {
      let promise = [];
      for (const card of this.mb) {
        promise.push(
          this.getCard(card.name).then(data => {
            this.cardLookup.push(data);
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
        if (card.layout != "normal") {
          card = card.card_faces[0];
        }
        const obj = this.createCardObj(card);
        this.$store.dispatch("cacheCard", obj);
        return obj;
      }
    },
    createCardObj(card) {
      return {
        cmc: card.cmc,
        colors: card.colors.sort().join(""),
        name: card.name,
        type_line: card.type_line
      };
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
      // let otherCount = 0
      let index = null;
      for (const [i, card] of this.mb.entries()) {
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

      this.guild.push({
        name: "total",
        value: guildCount.reduce((a, b) => a + b, 0)
        // Object.fromEntries(land.map((_,i)=>[land[i],landCount[i]]))
      });

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
