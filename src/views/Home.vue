<template>
  <v-container>
    <v-row>
      <v-col cols="12" xs="12" sm="6">
        <input
          type="file"
          accept=".txt"
          ref="uploadInput"
          @change="loadTextFromFile"
          style="display:none"
          value
        />
        <v-tabs height="25" v-model="tab">
          <v-tabs-slider :color="this.tabColour[this.tab]"></v-tabs-slider>
          <v-tab v-for="(item,i) in tabs" :key="i" :disabled="page.running">Deck {{i+1}}</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item v-for="(item,i) in tabs" :key="i">
            <v-btn
              :disabled="page.running"
              color="primary"
              class="ma-2"
              small
              @click="$refs.uploadInput.click()"
            >.txt</v-btn>
            <!-- <v-btn small color="primary ma-2">Clipboard</v-btn> -->
            <!-- <v-btn small color="primary ma-2" @click="getDeck">Url</v-btn> -->
            <v-textarea
              label="Decklist"
              v-model="tabs[i]"
              :loading="page.running"
              rows="3"
              outlined
              solo
              flat
              dense
              hide-details="auto"
            ></v-textarea>
          </v-tab-item>
        </v-tabs-items>
        <!-- <v-text-field label="url" v-model="url"></v-text-field> -->
        <!-- <v-text-field label="source"></v-text-field>
        <v-text-field label="date"></v-text-field>-->
      </v-col>
      <v-col cols="12" xs="12" sm="6" v-if="page.result" class="default-text-color">
        <h2>Result</h2>
        <div class="warning--text" v-if="sbMsg">{{sbMsg}}</div>
        <div v-for="(item,i) in tabs" :key="i">
          <h3 :style="'display:inline;color:'+tabColour[i]">Deck {{i+1}}</h3>
          <p
            style="display:inline"
            v-if="results[i]"
          >&nbsp;Average hit: {{results[i].probability.stats.averageHit}}</p>
        </div>
        <!-- <div>
          <h3 :style="'display:inline;color:'+this.tabColour[0]">Deck 1</h3>
          <p style="display:inline" v-if="results[0]">
            Average hit: {{results[0].probability.stats.averageHit}}
            <br />
            {{results[0].probability.stats.maxHitChance}} games of getting
            {{results[0].probability.stats.maxHit}} cards
          </p>
        </div>
        <h3 :style="'color:'+this.tabColour[1]">Deck 2</h3>
        <p v-if="results[1]">
          Average hit: {{results[1].probability.stats.averageHit}}
          <br />
          {{results[1].probability.stats.maxHitChance}} games of getting
          {{results[1].probability.stats.maxHit}} cards
        </p>-->
      </v-col>
    </v-row>
    <v-row>
      <!-- <v-col xs="12" sm="4">
        <bar-chart :height="170" :chart-data="testData" title="By Guild"></bar-chart>
      </v-col>-->
      <v-col xs="12" sm="4">
        <doughnut-chart
          :height="170"
          :chart-data="chartData.doughnut"
          title="Valid Targets for Niv-Mizzet"
        ></doughnut-chart>
      </v-col>
      <v-col xs="12" sm="4">
        <bar-chart :height="170" :chart-data="chartData.guild" title="By Guild"></bar-chart>
      </v-col>
      <v-col xs="12" sm="4">
        <bar-chart :height="170" :chart-data="chartData.probability" title="Hit Probability"></bar-chart>
      </v-col>
      <v-col xs="12" sm="4">
        <bar-chart :height="170" :chart-data="chartData.cardType" title="Spells by Card Type"></bar-chart>
      </v-col>
      <v-col xs="12" sm="4">
        <bar-chart :height="170" :chart-data="chartData.colour" title="Spells by Colour"></bar-chart>
      </v-col>
      <v-col xs="12" sm="4">
        <bar-chart :height="170" :chart-data="chartData.cmc" title="Spells by CMC"></bar-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import * as R from 'ramda'
import _ from 'lodash'
import BarChart from "@/components/BarChart";
import DoughnutChart from "@/components/DoughnutChart";
import { getProbability } from "@/js/calculation"
// import colors from 'vuetify/es5/util/colors'
// import cheerio from 'cheerio'

export default {
  metaInfo() {
    return {
      title: 'Mainpage'
    }
  },
  components: {
    BarChart,
    DoughnutChart,
  },
  data: () => ({
    sb: false,
    sbMsg: '',
    tabColour: ["#C33C54", "#8CB369"],
    tabs: Array(2),
    tab: 0,
    file: null,
    const: {
      guilds: ["WU", "UB", "BR", "RG", "WG", "WB", "BG", "UG", "UR", "WR"],
      cardTypes: [/*"land",*/"creature", "artifact", "enchantment", "planeswalker", "instant", "sorcery"],
      numOfColours: ["0", "1", "2", "3", "4", "5"],
    },
    page: {
      running: false,
      result: false
    },
    deck: {
      mb: [],
      sb: []
    },
    // url: "https://deckbox.org/sets/2638519",
    url: "https://scryfall.com/@LivingEnd/decks/34fa64ef-6a07-46a5-8734-d1010e951a88",
    // url: "http://tappedout.net/mtg-decks/02-10-17-SRE-test/",

    result: null,
    results: Array(2).fill(),
    output: null,
    chartData: {
      guild: {},
      colour: {},
      cardType: {},
      doughnut: {},
      cmc: {},
      probability: {},
    },
    testData: {
      // labels: ['a','b','c'],
      datasets: [
        {
          data: [10, 30, 20],
          yAxisID: 'A'
        },
        {
          data: Array(20).fill(3),
          type: 'line',
          fill: false,
          yAxisID: 'B',
          // xAxisID: 'B'
        },
      ]
    }
  }),
  watch: {
    tabs: 'runApp',
    sbMsg: 'sbWarning'
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes[this.$vuetify.theme.isDark ? 'dark' : 'light']
    }
  },
  async mounted() {
    // this.getDeck()
    // const result = await this.$axios.get('https://us-central1-apiproxy1.cloudfunctions.net/app/api4')
    // console.log(result
    // )
  },
  methods: {
    getProbability,
    runApp() {
      // const cards = this.getData()
      // const cards2 = R.map(
      //   this.getCard()
      // )(cards)
      // console.log(cards2)
      this.getData()
    },
    sbWarning() {
      if (this.sbMsg == '') return
      setTimeout(() => { this.sbMsg = '' }, 5000)
      // this.sb = false
    },
    loadTextFromFile(e) {
      this.$da.logEvent('click .txt button')

      const file = e.target.files[0]

      if (!file || file.type !== 'text/plain') return
      this.page.running = true

      const reader = new FileReader()
      reader.readAsText(file, "UTF-8")
      reader.onload = e => {
        this.$set(this.tabs, this.tab, e.target.result)
        this.$refs.uploadInput.value = ''
      }
      reader.onerror = e => {
        console.error(e)
      }
    },
    setChartData(obj, labels, data, data2) {
      const colour1 = "#C33C54"
      const colour1Light = "#E2A1AD"
      const colour2 = "#8CB369"
      const colour2Light = "#CBDDBB"
      const neutral = "#bbb"

      let backgroundColor = null
      let backgroundColor2 = null
      if (obj == 'doughnut') {
        backgroundColor = [
          colour1,
          // this.theme.accent,
          colour1Light,
          neutral,
        ]
      } else {
        backgroundColor = colour1
      }
      if (obj == 'doughnut') {
        backgroundColor2 = [
          colour2,
          colour2Light,
          neutral
        ]
      } else {
        backgroundColor2 = colour2
      }
      let datasets = null
      if (data2 === undefined) {
        datasets = [{
          data,
          backgroundColor,
        }]
      }
      else {
        datasets = [
          {
            data,
            backgroundColor,
          },
          {
            data: data2,
            backgroundColor: backgroundColor2,
          },
        ]
      }
      this.chartData[obj] = {
        labels,
        datasets
      }
    },
    async getDeck() {
      // usage: scrape desklist data from website
      // currently none functional
      // ref https://stackoverflow.com/questions/27745/getting-parts-of-a-url-regex
      const regex = this.url.match(/^((http[s]?|ftp):\/)?\/?([^:/\s]+)((\/[\w@]+)*\/)([\w\-.]+[^#?\s]+)(.*)?(#[\w-]+)?$/)
      const obj = {
        url: regex[0],
        hostname: regex[3]
      }
      switch (obj.hostname) {
        case 'scryfall.com':
          obj.api = 'https://api.scryfall.com/decks/' + regex[6] + '/export/text'
          break
        case 'deckbox.org':
          obj.api = regex[0] + '/export'
          break
        case 'tappedout.net':
          obj.api = regex[0] + '?fmt=txt'
          break
        default:
          obj.api = false
      }
      if (!obj.api) return
      // const result = await this.$axios.get(obj.url)
      const result = await this.$axios.get('https://us-central1-apiproxy1.cloudfunctions.net/app/api4', {
        params: {
          host: encodeURI(obj.hostname),
          url: encodeURI(obj.api)
        }
      })
      this.$set(this.tabs, this.tab, result.data)

    },
    isLand(str) { return ~str.search(/land/gi) },
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
      this.$store.dispatch("logSubmission", obj)
    },
    getData: _.debounce(function () {
      let deck = { mb: [], sb: [] }
      this.page.running = true
      this.deckList = this.tabs[this.tab]

      if (this.deckList && process.env.NODE_ENV === 'production') {
        this.logSubmission()
      }
      this.$da.logEvent('Deck ' + (this.tab + 1) + ': load deck')

      let cardList = this.deckList.split(/\r?\n/);
      let location = "mb";
      let promise = [];

      // let cardList2 = cardList

      // const hasSb = R.findIndex(R.test(/sideboard[:]?|^$/gi))
      // const getMb = (list => {
      //   const index = hasSb(list)
      //   return index ? R.slice(0,index)(list) : list
      // })
      // const strToObj = R.map(item=>{
      //   const temp = [...item.matchAll(/(?:(\d+)x? )?(.*)/gi)][0]
      //   return {
      //     name: temp[2],
      //     amount: Number(temp[1]),
      //     location: 'mb'
      //   }
      // })
      // return strToObj(getMb(cardList2))
      // console.log(strToObj(getMb(cardList2)))

      for (let i = 0; i < cardList.length; i++) {
        if (cardList[i].match(/sideboard[:]?/gi) || cardList[i] === "") {
          location = "sb";
          continue
        }
        this.sbMsg = 'Sideboard was ignored.'

        //create card object
        const card = {
          name: cardList[i].substr(cardList[i].indexOf(" ") + 1),
          amount: Number([...cardList[i].matchAll(/(\d+)x? /gi)][0][1] || 1),
          location: location
        }

        //get card metadata and push new card object into deck
        promise.push(
          this.getCard(card.name)
            .then(data => {
              deck[card.location].push({ ...data, amount: card.amount });
            })
            .catch(() => {
              console.error("Cannot find " + card.name)
              // console.log(err)
            })
        )
      }
      Promise.all(promise).then(() => {
        this.analyzeDeck(deck)
      })
    }, 1000),
    analyzeDeck(deck) {

      const obj = {
        total: deck.mb.reduce((a, b) => a + (b.amount || 0), 0),
        land: 0,
        //set initial value of zero
        type: this.const.cardTypes.reduce((o, a) => ({ ...o, [a]: 0 }), {}),
        colour: this.const.numOfColours.reduce((o, a) => ({ ...o, [a]: 0 }), {}),
        guild: this.const.guilds.reduce((o, a) => ({ ...o, [a]: 0 }), {}),
        cmc:
          Array(deck.mb.reduce((o, a) => Math.max(a.cmc, o), 0) + 1).fill(0)
            .reduce((o, a, i) => ({ ...o, [i]: 0 }), {}),
        probability: {}
      }
      //count up cards by cmc
      for (const card of deck.mb) {
        if (this.isLand(card.type_line))
          obj.land += card.amount
        else
          obj.cmc[card.cmc] += card.amount
      }
      //count up cards by card type
      for (const card of deck.mb) {
        for (const cardType of this.const.cardTypes) {
          if (~card.type_line.search(RegExp(cardType, "gi"))) {
            obj.type[cardType] += card.amount
            break
          }
        }
      }
      //count up cards by guild
      for (const card of deck.mb) {
        for (const guild of this.const.guilds) {
          if (card.colors == guild) {
            obj.guild[guild] += card.amount
            break
          }
        }
      }
      //count up cards by colour
      for (const card of deck.mb) {
        for (const numOfColour of this.const.numOfColours) {
          if (
            card.colors.length == Number(numOfColour) &&
            !(
              card.colors.length == 0 &&
              this.isLand(card.type_line)
            )
          ) {
            obj.colour[numOfColour] += card.amount
            break
          }
        }
      }
      obj.hits = obj.colour[2]
      obj.nonhits = obj.total - obj.hits
      obj.probability = this.getProbability(obj.guild, obj.total)


      this.results[this.tab] = obj
      this.fillerFunction()
      this.page.result = true
      this.page.running = false
    },
    fillerFunction() {
      let obj = {}
      let obj2 = {}
      // console.log(~this.results[0])
      // console.log(~this.results[1])
      // console.log(null==this.results[1])
      if (this.results[0] != null && this.results[1] == null) {
        obj = this.results[0]
        // console.log(obj)
        this.setChartData("doughnut", ["hit", "non-hit", "land"], [obj.hits, obj.nonhits - obj.land, obj.land])
        this.setChartData("cardType", Object.keys(obj.type), Object.values(obj.type))
        this.setChartData("colour", Object.keys(obj.colour), Object.values(obj.colour))
        this.setChartData("guild", Object.keys(obj.guild), Object.values(obj.guild))
        this.setChartData("cmc", Object.keys(obj.cmc), Object.values(obj.cmc))
        this.setChartData("probability", Object.keys(obj.probability.numberHits), Object.values(obj.probability.numberHits))
      }
      else if (this.results[0] == null && this.results[1] != null) {
        obj = this.results[1]
        this.setChartData("doughnut", ["hit", "non-hit", "land"], Array(3).fill(0), [obj.hits, obj.nonhits - obj.land, obj.land])
        this.setChartData("cardType", Object.keys(obj.type), Array(6).fill(0), Object.values(obj.type))
        this.setChartData("colour", Object.keys(obj.colour), Array(6).fill(0), Object.values(obj.colour))
        this.setChartData("guild", Object.keys(obj.guild), Array(10).fill(0), Object.values(obj.guild))
        this.setChartData("cmc", Object.keys(obj.cmc), Array(6).fill(0), Object.values(obj.cmc))
        this.setChartData("probability", Object.keys(obj.probability.numberHits), Array(11).fill(0), Object.values(obj.probability.numberHits))
      }
      else if (this.results[0] != null && this.results[1] != null) {
        obj = this.results[0]
        obj2 = this.results[1]
        this.setChartData("doughnut", ["hit", "non-hit", "land"], [obj.hits, obj.nonhits - obj.land, obj.land], [obj2.hits, obj2.nonhits - obj2.land, obj2.land])
        this.setChartData("cardType", Object.keys(obj.type), Object.values(obj.type), Object.values(obj2.type))
        this.setChartData("colour", Object.keys(obj.colour), Object.values(obj.colour), Object.values(obj2.colour))
        this.setChartData("guild", Object.keys(obj.guild), Object.values(obj.guild), Object.values(obj2.guild))
        this.setChartData("cmc", Object.keys(obj.cmc), Object.values(obj.cmc), Object.values(obj2.cmc))
        this.setChartData("probability", Object.keys(obj.probability.numberHits), Object.values(obj.probability.numberHits), Object.values(obj2.probability.numberHits))
      }
    },
    async getCard(name) {
      const cacheCard = await this.$store.dispatch("getCard", name)
      if (cacheCard.exists()) {
        return JSON.parse(cacheCard.val())
      } else {
        const card = await this.$axios.get(
          "https://api.scryfall.com/cards/named?fuzzy=" + encodeURI(name)
        )
        const obj = this.createCardObj(card.data);
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
        }
      } else {
        return {
          cmc: card.cmc,
          colors: card.colors.sort(this.colourPieOrder).join(""),
          name: card.name,
          type_line: card.type_line
        }
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

<style>
.default-text-color {
  color: #aaa;
}
</style>