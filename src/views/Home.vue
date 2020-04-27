<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <!-- <v-text-field label="url" v-model="url"></v-text-field> -->
        <!-- <v-text-field label="source"></v-text-field>
        <v-text-field label="date"></v-text-field>-->
        <v-textarea label="list" v-model="input"></v-textarea>
        <!-- <v-btn @click.stop="getData">list calc</v-btn> -->
        <!-- <v-btn @click.stop="getDeck">URL calc</v-btn>
        <v-btn @click.stop="setchartDataColour([1,2,3,4,5,6])">Chart</v-btn> -->
      </v-col>
      <!-- <v-col>
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
            <v-switch label="expand all"></v-switch>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td
              :colspan="guildHeader.length"
              style="white-space:pre"
            >more stuff here please {{item}}</td>
          </template>
        </v-data-table>
      </v-col> -->
    </v-row>
    <v-row v-if="page.result">
      <v-col cols="3">
        <!-- <h2>Number of hits</h2>
        <p>Deck size: {{result.total}}</p>
        <p>Niv-Mizzet Reborn Hits: {{result.hits}}</p> -->
        <doughnut-chart :chart-data="chartDataDoughnut" title="Valid Targets"></doughnut-chart>
      </v-col>
      <v-col cols="3">
        <!-- <h2>By Card Type</h2> -->
        <bar-chart :chart-data="chartDataCardType" title="By Card Type"></bar-chart>
      </v-col>
      <v-col cols="3">
        <!-- <h2>By Colour</h2> -->
        <bar-chart :chart-data="chartDataColour" title="Number of Colour"></bar-chart>
      </v-col>
      <v-col cols="3">
        <!-- <h2>By Guild</h2> -->
        <bar-chart :chart-data="chartDataGuild" title="By Guild"></bar-chart>
      </v-col>
      <v-col>
        <h2>Guild Colour Count</h2>
        <p>{{guildCount}}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import BarChart from "@/components/BarChart";
import DoughnutChart from "@/components/DoughnutChart";

export default {
  components: {
    BarChart,
    DoughnutChart,
  },
  data: () => ({
    const: {
      guilds: ["WU", "UB", "BR", "RG", "WG", "WB", "BG", "UG", "UR", "WR"],
      cardTypes: ["land","creature","artifact","enchantment","planeswalker","instant","sorcery"],
      numOfColours: ["0","1","2","3","4","5"],
    },
    page: {
      running: false,
      result: false
    },
    deck: {
      mb: [],
      sb: []
    },
    url: "https://deckbox.org/sets/2641250",
    input: null,
    output: null,
    guildCount: null,
    chartDataGuild: null,
    chartDataColour: null,
    chartDataCardType: null,
    chartDataDoughnut: null,
  }),
  watch: {
    'input': 'getData'
  },
  mounted() {
  },
  methods: {
    setChartDoughnut(obj, labels, data) {
      this[obj] = {
        labels,
        datasets: [
          {
            data,
            label: "Amount",
            backgroundColor: ["#66bb6a","#e0e0e0"],
          }
        ]
      }
    },
    setChartData(obj, labels, data) {
      this[obj] = {
        labels,
        datasets: [
          {
            data,
            label: "Amount",
            backgroundColor: "#f87979",
          }
        ]
      }
    },
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
    getData() {
      let cardList = this.input.split(/\r?\n/);
      let location = "mb";
      let promise = [];
      this.page.result = false;
      this.deck.mb = [];
      this.deck.sb = [];

      for (let i = 0; i < cardList.length; i++) {
        if (cardList[i].match(/sideboard[:]*/gi) || cardList[i] === "") {
          location = "sb";
          continue;
        }

        //create card object
        const card = {
          name: cardList[i].substr(cardList[i].indexOf(" ") + 1),
          amount: Number(cardList[i].substr(0, cardList[i].indexOf(" "))),
          location: location
        };

        //get card metadata and push new card object into deck
        promise.push(
          this.getCard(card.name)
            .then(data => {
              this.deck[card.location].push({ ...data, amount: card.amount });
            })
            .catch(err => {
              console.log(err)
            })
        );
      }
      Promise.all(promise).then(() => {
        // this.guildTable();
        this.anaylizeDeck();
      });
    },
    anaylizeDeck() {

      const obj = {
        total: this.deck.mb.reduce((a,b)=>a+(b.amount||0),0),
        //set initial value of zero
        type: {
          ...this.const.cardTypes.reduce((o,a)=>({...o,[a]:0}),{})
        },
        colour:{
          ...this.const.numOfColours.reduce((o,a)=>({...o,[a]:0}),{})
        },
        guild:{
          ...this.const.guilds.reduce((o,a)=>({...o,[a]:0}),{})
        },
      }
      //count up cards by card type
      for(const card of this.deck.mb) {
        for(const cardType of this.const.cardTypes) {
          if(~card.type_line.search(RegExp(cardType,"gi"))) {
            obj.type[cardType] += card.amount
            break
          }
        }
      }
      //count up cards by guild
      for(const card of this.deck.mb) {
        for(const guild of this.const.guilds) {
          if(card.colors==guild) {
            obj.guild[guild] += card.amount
            break
          }
        }
      }
      //count up cards by colour
      for(const card of this.deck.mb) {
        for(const numOfColour of this.const.numOfColours) {
          if(
            card.colors.length==Number(numOfColour) &&
            !(
              card.colors.length==0 &&
              ~card.type_line.search(/land/gi)
            )
          ) {
            obj.colour[numOfColour] += card.amount
            break
          }
        }
      }
      obj.hits = obj.colour[2]
      obj.nonhits = obj.total - obj.colour[2]

      this.guildCount = [...Object.values(obj.guild),obj.nonhits].join(",")

      this.setChartDoughnut("chartDataDoughnut",["hit","non-hit"],[obj.hits,obj.nonhits])
      this.setChartData("chartDataCardType",Object.keys(obj.type),Object.values(obj.type))
      this.setChartData("chartDataColour",Object.keys(obj.colour),Object.values(obj.colour))
      this.setChartData("chartDataGuild",Object.keys(obj.guild),Object.values(obj.guild))

      this.result = { ...obj };
      this.page.result = true;
    },
    async getCard(name) {
      const result = await this.$store.dispatch("getCard", name)
      if (result.exists()) {
        return JSON.parse(result.val())
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
    colourPieOrder(a, b) {
      const colourPie = ["W", "U", "B", "R", "G"];
      if (a == b) return 0;
      for (const item of colourPie) {
        if (a == item) return -1;
        if (b == item) return 1;
      }
      return 0;
    },
    createCardObj(card) {
      if (card.layout == "transform") {
        return {
          cmc: card.cmc,
          colors: card.card_faces[0].colors.sort(this.colourPieOrder).join(""),
          name: card.card_faces[0].name,
          type_line: card.card_faces[0].type_line
        };
      } else {
        return {
          cmc: card.cmc,
          colors: card.colors.sort(this.colourPieOrder).join(""),
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