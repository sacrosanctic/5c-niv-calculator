<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field value="amount" v-model="loopInput" outlined></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="combinationLoop(loopInput)">Loop X</v-btn>
        <v-btn @click="combinationLoop2(loopInput)">Loop 1 to X</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field value="amount" v-model="hitSpreadInput"></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="spreadLookup(hitSpreadInput)">Lookup</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>

      </v-col>
      <v-col>
        <v-btn @click="clear()">Clear</v-btn>
        <v-btn @click="exportCSV()">Export</v-btn>
      </v-col>
    </v-row>
    <div>
    </div>
    <p v-html="output"></p>
    <v-data-table
    v-if="goodstuff"
    :headers="headers"
    :items="goodstuff"
    ></v-data-table>
  </v-container>
</template>

<script>
//source: https://github.com/frankkarsten/MTG-Math/blob/master/NivMizzet.py

export default {
  data: () => ({
    headers: [
      {
        text: 'Possible hit',
        value: 'possibleHits'
      },
      {
        text: 'Guild 1',
        value: 'WU'
      },
      {
        text: 'Guild 2',
        value: 'WB'
      },
      {
        text: 'Guild 3',
        value: 'WR'
      },
      {
        text: 'Guild 4',
        value: 'WG'
      },
      {
        text: 'Guild 5',
        value: 'UB'
      },
      {
        text: 'Guild 6',
        value: 'UR'
      },
      {
        text: 'Guild 7',
        value: 'UG'
      },
      {
        text: 'Guild 8',
        value: 'BR'
      },
      {
        text: 'Guild 9',
        value: 'BG'
      },
      {
        text: 'Guild 10',
        value: 'RG'
      },
      {
        text: 'Other',
        value: 'Other'
      },
      {
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
      },
      {
        text: 'average hit',
        value: 'average'
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
    goodstuff: [],
    combination: [],
  }),
  mounted() {
  },
  methods: {
    spreadLookup(value) {
      let array = value.split(',').map(Number)
      this.transpose(array)
      this.calculateProbability()
    },
    exportCSV() {
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += [
        Object.keys(this.goodstuff[0]).join(";"),
        ...this.goodstuff.map(item => Object.values(item).join(";"))
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
      this.goodstuff = []
    },
    combinationLoop2(numHit) {
      for (let i=1;i<=numHit;i++) {
        this.combinationLoop(i)
      }
    },
    combinationLoop(numHit) {
      this.combination = []
      this.findCombinations(numHit)
      let i=0
      for(const item of this.combination) {
        this.transpose(item)
        this.calculateProbability()
        i++
        console.log('progress: ' + this.possibleHits + '-' + i)
        // if(i>500) break
      }
    },
    transpose(array) {
      this.deck.WU = array[0] ? array[0] : 0
      this.deck.WB = array[1] ? array[1] : 0
      this.deck.WR = array[2] ? array[2] : 0
      this.deck.WG = array[3] ? array[3] : 0
      this.deck.UB = array[4] ? array[4] : 0
      this.deck.UR = array[5] ? array[5] : 0
      this.deck.UG = array[6] ? array[6] : 0
      this.deck.BR = array[7] ? array[7] : 0
      this.deck.BG = array[8] ? array[8] : 0
      this.deck.RG = array[9] ? array[9] : 0

      const possibleHits = array.reduce((a,b)=>a+b,0)
      this.deck.Other = 59-possibleHits
      this.possibleHits = possibleHits
      // this.deck.Total = numHit
    },
    // https://www.geeksforgeeks.org/find-all-combinations-that-adds-upto-given-number-2/
    /* Function to find out all
      combinations of positive numbers
      that add upto given number.
      Includes duplicates */
    findCombinations($n) {
      // array to store the combinations
      // It can contain max n elements
      let $arr = []
      //find all combinations
      this.findCombinationsRecursion($arr, 0, $n, $n)
    },
    findCombinationsRecursion($arr, $index, $num, $reducedNum) {
      // Base condition
      if ($reducedNum < 0 || $index > 10) return

      // If combination is
      // found, print it
      if ($reducedNum == 0) {
        let temp = []
        for (let $i = 0; $i < $index; $i++) temp.push($arr[$i])
        this.combination.push(temp)
        return
      }

      // Find the previous number
      // stored in arr[] It helps
      // in maintaining increasing order
      const $prev = $index == 0 ? 1 : $arr[$index - 1]

      // note loop starts from previous
      // number i.e. at array location
      // index - 1
      for (let $k = $prev; $k <= $num; $k++) {
        // next element of array is k
        $arr[$index] = $k

        // call recursively with
        // reduced number
        this.findCombinationsRecursion($arr, $index + 1, $num, $reducedNum - $k)
      }
    },
    calculateProbability() {
      let temp = {}
      let expected_hits = 0
      for (let number_hits = 0; number_hits < 11; number_hits++) {
        const hit_prob = this.determine_hit_prob(number_hits)
        temp[number_hits]=(hit_prob*100).toFixed(4)
        expected_hits += number_hits * hit_prob;
      }
      temp.average=expected_hits.toFixed(4)

      let maxGuild = 0;
      for (const [key, value] of Object.entries(this.deck)) {
        if (key == "Other") continue;
        if (value != 0) maxGuild++;
      }
      temp.maxHit=maxGuild
      temp.maxHitChance=(1/this.determine_hit_prob(maxGuild)).toFixed(0)
      this.goodstuff.push({...this.deck,...temp,possibleHits: this.possibleHits})
    },
    binom(n, k) {
      /*
      Parameters:
        n - Number of elements of the entire set
        k - Number of elements in the subset
      It should hold that 0 <= k <= n
      Returns - The binomial coefficient n choose k that represents the number of ways of picking k unordered outcomes from n possibilities
      */
      let answer = 1;
      for (let i = 1; i < Math.min(k, n - k) + 1; i++)
        answer = (answer * (n + 1 - i)) / i;
      return parseInt(answer);
    },
    multivariate_hypgeom(deck, needed) {
      /*
      Parameters:
        deck - A dictionary of cardname : number of copies
        needed - Adictionary of cardname : number of copies
      It should hold that the cardname keys of deck and needed are identical
      Returns - the multivariate hypergeometric probability of drawing exactly the cards in 'needed' from 'deck' when drawing without replacement
      */
      let answer = 1;
      let sum_deck = 0;
      let sum_needed = 0;
      for (const card in deck) {
        //needs work
        answer *= this.binom(deck[card], needed[card]);
        sum_deck += deck[card];
        sum_needed += needed[card];
      }
      return answer / this.binom(sum_deck, sum_needed);
    },
    determine_hit_prob(number_hits) {
      /*
      Parameters:
        number_hits - Should be between 0 or 10. Represents the number of cards put into your hand with Niv.
      Returns - a number that represents the probability of hitting <number_hits> different guilds in your top 10.
      */
      let hit_prob = 0;
      for (let WU = 0; WU < this.deck["WU"] + 1; WU++) {
        for (let WB = 0; WB < this.deck["WB"] + 1; WB++) {
          for (let WR = 0; WR < this.deck["WR"] + 1; WR++) {
            for (let WG = 0; WG < this.deck["WG"] + 1; WG++) {
              for (let UB = 0; UB < this.deck["UB"] + 1; UB++) {
                for (let UR = 0; UR < this.deck["UR"] + 1; UR++) {
                  for (let UG = 0; UG < this.deck["UG"] + 1; UG++) {
                    for (let BR = 0; BR < this.deck["BR"] + 1; BR++) {
                      for (let BG = 0; BG < this.deck["BG"] + 1; BG++) {
                        for (let RG = 0; RG < this.deck["RG"] + 1; RG++) {
                          const cards_so_far =
                            WU + WB + WR + WG + UB + UR + UG + BR + BG + RG;
                          let hits_so_far =
                            Math.min(WU, 1) +
                            Math.min(WB, 1) +
                            Math.min(WR, 1) +
                            Math.min(WG, 1) +
                            Math.min(UB, 1);
                          hits_so_far +=
                            Math.min(UR, 1) +
                            Math.min(UG, 1) +
                            Math.min(BR, 1) +
                            Math.min(BG, 1) +
                            Math.min(RG, 1);
                          if (
                            cards_so_far <= 10 &&
                            hits_so_far == number_hits
                          ) {
                            let needed = {};
                            needed["WU"] = WU;
                            needed["WB"] = WB;
                            needed["WR"] = WR;
                            needed["WG"] = WG;
                            needed["UB"] = UB;
                            needed["UR"] = UR;
                            needed["UG"] = UG;
                            needed["BR"] = BR;
                            needed["BG"] = BG;
                            needed["RG"] = RG;
                            needed["Other"] = 10 - cards_so_far;
                            hit_prob += this.multivariate_hypgeom(
                              this.deck,
                              needed
                            );
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return hit_prob;
    }
  }
};
</script>