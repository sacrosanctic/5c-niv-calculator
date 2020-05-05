<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field value="amount" v-model="loopInput" outlined></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="combinationLoop(loopInput,loopInput)">Loop X</v-btn>
        <v-btn @click="combinationLoop(loopInput)">Loop 1 to X</v-btn>
        <div>{{log}}</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field value="amount" v-model="hitSpreadInput"></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="getResult(hitSpreadInput)">Lookup</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn @click="clear()">Clear</v-btn>
        <v-btn @click="exportCSV()">Export</v-btn>
      </v-col>
      <v-col>
        <bar-chart :height="200" v-if="chartData" :chart-data="chartData"></bar-chart>
      </v-col>
    </v-row>
    <div>
    </div>
    <p v-html="output"></p>
    <v-data-table
    v-if="results"
    :headers="headers"
    :items="results"
    dense
    ></v-data-table>
  </v-container>
</template>

<script>
import BarChart from "@/components/BarChart"
import { determine_hit_prob, findCombination } from '@/js/calculation.js'

export default {
  // mixins: [binom,simple],
  components: {
    BarChart
  },
  data: () => ({
    chartData: null,
    log: null,
    headers: [
      {
        text: 'Deck size',
        value: 'deckSize'
      },
      {
        text: 'Possible hit',
        value: 'possibleHits'
      },
/*      {
        text: 'WU',
        value: 'WU'
      },
      {
        text: 'WB',
        value: 'WB'
      },
      {
        text: 'WR',
        value: 'WR'
      },
      {
        text: 'WG',
        value: 'WG'
      },
      {
        text: 'UB',
        value: 'UB'
      },
      {
        text: 'UR',
        value: 'UR'
      },
      {
        text: 'UG',
        value: 'UG'
      },
      {
        text: 'BR',
        value: 'BR'
      },
      {
        text: 'BG',
        value: 'BG'
      },
      {
        text: 'RG',
        value: 'RG'
      },*/
      {
        text: 'Other',
        value: 'Other'
      },
/*      {
        text: '0 hit (%)',
        value: '0'
      },
      {
        text: '1 hit (%)',
        value: '1'
      },
      {
        text: '2 hit (%)',
        value: '2'
      },
      {
        text: '3 hit (%)',
        value: '3'
      },
      {
        text: '4 hit (%)',
        value: '4'
      },
      {
        text: '5 hit (%)',
        value: '5'
      },
      {
        text: '6 hit (%)',
        value: '6'
      },
      {
        text: '7 hit (%)',
        value: '7'
      },
      {
        text: '8 hit (%)',
        value: '8'
      },
      {
        text: '9 hit (%)',
        value: '9'
      },
      {
        text: '10 hit (%)',
        value: '10'
      },*/
      {
        text: 'average hit',
        value: 'averageHit'
      },
      {
        text: 'max hit',
        value: 'maxHit'
      },
      {
        text: 'max hit chance',
        value: 'maxHitChance'
      },
    ],
    output: "",
    deck: {
      WU: 4,
      WB: 2,
      WR: 1,
      WG: 3,
      UB: 2,
      UR: 0,
      UG: 2,
      BR: 0,
      BG: 1,
      RG: 3,
      Other: 41,
      // Total: 18,
    },
    loopInput: null,
    hitSpreadInput: null,
    possibleHits: 0,
    results: [],
    combination: [],
    test123: null,
  }),
  mounted() {
  },
  methods: {
    determine_hit_prob: determine_hit_prob,
    findCombination: findCombination,
    exportCSV() {
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += [
        Object.keys(this.results[0]).join(";"),
        ...this.results.map(item => Object.values(item).join(";"))
      ]
        .join("\n")
        .replace(/(^\[)|(\]$)/gm, "");

      const data = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", data)
      link.setAttribute("download", "export.csv")
      link.click()
    },
    clear() {
      this.results = []
    },
    setChartData(data) {
      this.chartData = {
        labels: [1,2,3,4,5,6,7,8,9,10],
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            // data: [5,10,this.getRandomInt()]
            data: data,
          }
        ]
      }
    },
    getResult(data) {
      this.calculateProbability(...this.formatData(data.split(',').map(Number)))
    },
    // loop through start to end number of hits
    combinationLoop(end,start=1) {
      let combination = []
      for(let j=start;j<=end;j++) {
        combination = this.findCombination(j)
        for(const [i,item] of combination.entries()) {
          this.calculateProbability(...this.formatData([...item,60-j]))
          console.log('progress: '+combination.length + '-'+ this.possibleHits + '-' + (i+1))
          this.log = 'progress: '+combination.length + '-'+ this.possibleHits + '-' + (i+1)
        }
      }
    },
    formatData(arr) {
      const guilds = ["WU", "WR", "WB", "WG", "UB", "UR", "UG", "BR", "BG", "RG"]
      return [
        guilds.reduce(
          (o,a,i)=>({...o,[a]:arr[i]||0}),
          {Other:arr.pop()-1}
        ),
        arr.reduce((a,b)=>a+b,0)
      ]
    },
    calculateProbability(deck,possibleHits) {
      let expected_hits = 0
      let result = {
      }

      for (let number_hits = 0; number_hits <= 10; number_hits++) {
        const hit_prob = this.determine_hit_prob(deck,number_hits)
        result[number_hits]=(hit_prob*100).toFixed(2)
        expected_hits += number_hits * hit_prob;
      }
      result.averageHit=expected_hits.toFixed(4)

      let maxGuild = 0;
      for (const [key, value] of Object.entries(deck)) {
        if (key == 'Other') continue;
        if (value != 0) maxGuild++;
      }
      result.maxHit=maxGuild
      result.maxHitChance="1 in "+(1/this.determine_hit_prob(deck,maxGuild)).toFixed(0)
      this.results.push({...deck,...result,possibleHits:possibleHits,deckSize:possibleHits+ deck.Other+1})
      this.setChartData(Object.values(result).slice(0,10))
    },
  }
}
</script>