<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <!-- <v-text-field label="url" v-model="url"></v-text-field> -->
        <!-- <v-text-field label="source"></v-text-field>
        <v-text-field label="date"></v-text-field>-->
        <v-textarea label="Decklist" v-model="deckList" :loading="page.running"></v-textarea>
        <!-- <v-btn @click.stop="getData">list calc</v-btn> -->
        <!-- <v-btn @click.stop="getDeck">URL calc</v-btn>
        <v-btn @click.stop="setchartDataColour([1,2,3,4,5,6])">Chart</v-btn> -->
      </v-col>
      <v-col cols="6" v-if="page.result">
        <h2>Result</h2>
        <p>
          Average hit: {{result.probability.stats.averageHit}}
          <br/>
          {{result.probability.stats.maxHitChance}} games of getting
          {{result.probability.stats.maxHit}} cards
        </p>
      </v-col>
    </v-row>
    <v-row >
      <v-col cols="4">
        <!-- <h2>Number of hits</h2>
        <p>Deck size: {{result.total}}</p>
        <p>Niv-Mizzet Reborn Hits: {{result.hits}}</p> -->
        <doughnut-chart :height="200" :chart-data="chartData.doughnut" title="Valid Targets for Niv-Mizzet"></doughnut-chart>
      </v-col>
      <v-col cols="4">
        <bar-chart :height="200" :chart-data="chartData.guild" title="By Guild"></bar-chart>
      </v-col>
      <v-col cols="4">
        <bar-chart :height="200" :chart-data="chartData.probability" title="Hit Probability"></bar-chart>
      </v-col>
      <v-col cols="4">
        <bar-chart :height="200" :chart-data="chartData.cardType" title="By Card Type"></bar-chart>
      </v-col>
      <v-col cols="4">
        <bar-chart :height="200" :chart-data="chartData.colour" title="Spells by Colour"></bar-chart>
      </v-col>
      <v-col cols="4">
        <bar-chart :height="200" :chart-data="chartData.cmc" title="By CMC"></bar-chart>
      </v-col>
      <!-- <v-col>
        <h2>Guild Colour Count</h2>
        <p>{{guildCount}}</p>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<script>
import _ from 'lodash'
import BarChart from "@/components/BarChart";
import DoughnutChart from "@/components/DoughnutChart";
import { getProbability } from "@/js/calculation"

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
    result: null,
    deckList: null,
    output: null,
    guildCount: null,
    chartData: {
      guild: {},
      colour: {},
      cardType: {},
      doughnut: {},
      cmc: {},
      probability: {},
    },
  }),
  watch: {
    'deckList': 'getData'
  },
  mounted() {
  },
  methods: {
    getProbability,
    setChartDoughnut(obj, labels, data) {
      this.chartData[obj] = {
        labels,
        datasets: [
          {
            data,
            label: "Amount",
            backgroundColor: ["#f87979","#fdd1d1","#e0e0e0"],
            // backgroundColor: ["#f87979","#fdd1d1",this.$vuetify.theme.themes.dark.custom1],
          }
        ]
      }
    },
    setChartData(obj, labels, data) {
      this.chartData[obj] = {
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
    async logSubmission() {
      const obj = {
        date: Date(),
        deck: this.deckList,
      }

      try {
        const result = await this.$axios.get(
          "https://api.ipify.org"
        )
        obj.ip = result.data
      }
      catch (error) {
        obj.ip = "blocked"
      }
        this.$store.dispatch("logSubmission",obj)
    },
    getData: _.debounce(function(){

      if(this.deckList && process.env.NODE_ENV === 'production') {
        this.logSubmission()
      }

      let cardList = this.deckList.split(/\r?\n/);
      let location = "mb";
      let promise = [];
      // this.page.result = false;
      this.page.running = true
      this.deck.mb = []
      this.deck.sb = []

      for (let i = 0; i < cardList.length; i++) {
        if (cardList[i].match(/sideboard[:]*/gi) || cardList[i] === "") {
          location = "sb";
          continue
        }

        //create card object
        const card = {
          name: cardList[i].substr(cardList[i].indexOf(" ") + 1),
          amount: Number([...cardList[i].matchAll(/(\d+)x? /gi)][0][1]||1),
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
    },1000),
    anaylizeDeck() {

      const obj = {
        total: this.deck.mb.reduce((a,b)=>a+(b.amount||0),0),
        //set initial value of zero
        type:   this.const.cardTypes.reduce(   (o,a)=>({...o,[a]:0}),{}),
        colour: this.const.numOfColours.reduce((o,a)=>({...o,[a]:0}),{}),
        guild:  this.const.guilds.reduce(      (o,a)=>({...o,[a]:0}),{}),
        cmc:
          Array(this.deck.mb.reduce((o,a)=>Math.max(a.cmc,o),0)+1).fill(0)
          .reduce((o,a,i)=>({...o,[i]:0}),{})
        ,
        probability: {}
      }
      //count up cards by cmc
      for(const card of this.deck.mb) {
        obj.cmc[card.cmc] += card.amount
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
      obj.nonhits = obj.total - obj.hits

      obj.probability = this.getProbability(obj.guild,obj.total)
      this.guildCount = obj.probabilty
      // this.guildCount = [...Object.values(obj.guild),obj.nonhits].join(",")

      this.setChartDoughnut("doughnut",["hit","non-hit","land"],[obj.hits,obj.nonhits,obj.type.land])
      this.setChartData("cardType",Object.keys(obj.type),Object.values(obj.type))
      this.setChartData("colour",Object.keys(obj.colour),Object.values(obj.colour))
      this.setChartData("guild",Object.keys(obj.guild),Object.values(obj.guild))
      this.setChartData("cmc",Object.keys(obj.cmc),Object.values(obj.cmc))
      this.setChartData("probability",Object.keys(obj.probability.numberHits),Object.values(obj.probability.numberHits))

      this.result = obj
      this.page.result = true
      this.page.running = false
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