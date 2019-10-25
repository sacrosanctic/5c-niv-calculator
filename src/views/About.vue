<template>
  <v-container>
    <div>
      <v-btn @click="result()">calculate</v-btn>
    </div>
    <p v-html="output"></p>
    <!-- <textarea name="" id="" cols="30" rows="10" :value="output"></textarea> -->
  </v-container>
</template>

<script>
//source: https://github.com/frankkarsten/MTG-Math/blob/master/NivMizzet.py

export default {
  data: () => ({
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
      Other: 36
    }
  }),
  mounted() {
    this.findCombinations(5)
  },
  methods: {
    // https://www.geeksforgeeks.org/find-all-combinations-that-adds-upto-given-number-2/
    findCombinationsUtil($arr, $index, $num, $reducedNum) {
      // Base condition
      if ($reducedNum < 0) return;

      // If combination is
      // found, print it
      if ($reducedNum == 0) {
        for (let $i = 0; $i < $index; $i++) console.log($arr);
        return
      }

      // Find the previous number
      // stored in arr[] It helps
      // in maintaining increasing order
      const $prev = $index == 0 ? 1 : $arr[$index - 1];

      // note loop starts from previous
      // number i.e. at array location
      // index - 1
      for (let $k = $prev; $k <= $num; $k++) {
        // next element of array is k
        $arr[$index] = $k;

        // call recursively with
        // reduced number
        this.findCombinationsUtil($arr, $index + 1, $num, $reducedNum - $k);
      }
    },

    /* Function to find out all  
combinations of positive numbers  
that add upto given number. 
It uses findCombinationsUtil() */
    findCombinations($n) {
      // array to store the combinations
      // It can contain max n elements
      let $arr = [];

      //find all combinations
      this.findCombinationsUtil($arr, 0, $n, $n);
    },
    // console.log(this.subsetSum(array, 5))
    // console.log(this.subsetSum([1,2,6], 5))
    subsetSum(numbers, target, partial) {
      var s, n, remaining;

      partial = partial || [];

      // sum partial
      s = partial.reduce(function(a, b) {
        return a + b;
      }, 0);

      // check if the partial sum is equals to target
      if (s === target && partial.length <= 10) {
        console.log("%s=%s", partial.join("+"), target);
      }

      if (s >= target) {
        return; // if we reach the number why bother to continue
      }

      for (var i = 0; i < numbers.length; i++) {
        n = numbers[i];
        remaining = numbers.slice(i + 1);
        this.subsetSum(remaining, target, partial.concat([n]));
      }
    },

    permutation2() {
      let array = Array(10).fill(0);
      array[0] = 30;
      let loop = 0;
      for (; loop < 999999; loop++) {
        console.log(array);
        this.output += array + "<br/>";
        if (array[7] == 30) break;

        if (array[0] != 0) {
          array[0]--;
          array[1]++;
        } else {
          array = this.carryOver2(array, 1);
        }
      }
    },
    carryOver2(array, index) {
      if (array[index] == 0) {
        array = this.carryOver2(array, index + 1);
      } else {
        array[index] = 0;
        array[index + 1]++;
        array[0] = 0;
        array[0] = 30 - array.reduce((a, b) => a + b, 0);
      }
      return array;
    },
    permutation1() {
      let total = 30;
      let array = Array(11).fill(0);
      let loop = 0;
      for (; loop < 99999; loop++) {
        array[0]++;
        if (array[5] == 1) break;
        array = this.carryOver(array);
        console.log(array);
        if (array.reduce((a, b) => a + b, 0) == total)
          this.output += array + "<br/>";
      }
    },
    carryOver(array) {
      let index = -1;
      index = array.findIndex(a => a == 31);
      if (index != -1) {
        array[index] = 0;
        array[index + 1]++;
        array = this.carryOver(array);
      }
      return array;
    },
    result() {
      let expected_hits = 0;
      for (let number_hits = 0; number_hits < 11; number_hits++) {
        const hit_prob = this.determine_hit_prob(number_hits);
        // console.log('Probability of hitting '+ number_hits + ' cards: '+ (hit_prob*100).toFixed(1) + '%.')
        this.output +=
          "Probability of hitting " +
          number_hits +
          " cards: " +
          (hit_prob * 100).toFixed(1) +
          "%.<br/>";
        expected_hits += number_hits * hit_prob;
      }
      // console.log('Expected Number of hits: ' + expected_hits.toFixed(2))
      this.output +=
        "Expected Number of hits: " + expected_hits.toFixed(2) + "<br/>";
      let maxGuild = 0;
      for (const [key, value] of Object.entries(this.deck)) {
        if (key == "Other") continue;
        if (value != 0) maxGuild++;
      }
      // console.log('Hitting '+maxGuild+' cards happen once per ' + (1/this.determine_hit_prob(maxGuild)).toFixed(0) + ' games on average.')
      this.output +=
        "Hitting " +
        maxGuild +
        " cards happen once per " +
        (1 / this.determine_hit_prob(maxGuild)).toFixed(0) +
        " games on average.";
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