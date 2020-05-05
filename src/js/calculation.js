//source: https://github.com/frankkarsten/MTG-Math/blob/master/NivMizzet.py
/*
Parameters:
  n - Number of elements of the entire set
  k - Number of elements in the subset
It should hold that 0 <= k <= n
Returns - The binomial coefficient n choose k that represents the number of ways of picking k unordered outcomes from n possibilities
*/
function binom(n,k) {
  let answer=1
  for(let i=1;i<Math.min(k,n-k)+1;i++)
    answer=answer*(n+1-i)/i
  return parseInt(answer)
}
/*
Parameters:
  deck - A dictionary of cardname : number of copies
  needed - A dictionary of cardname : number of copies
It should hold that the cardname keys of deck and needed are identical
Returns - the multivariate hypergeometric probability of drawing exactly the cards in 'needed' from 'deck' when drawing without replacement
*/
function multivariate_hypgeom(deck, needed) {
  let answer=1
  let sum_deck=0
  let sum_needed=0
  for(const card in deck) {
    answer*=binom(deck[card],needed[card])
    sum_deck+=deck[card]
    sum_needed+=needed[card]
  }
  return answer/binom(sum_deck,sum_needed)
}
/*
Parameters:
number_hits - Should be between 0 or 10. Represents the number of cards put into your hand with Niv.
Returns - a number that represents the probability of hitting <number_hits> different guilds in your top 10.
test case:
4,2,1,3,2,0,2,0,1,3,42
average 2.68, 1 in 210438
1.8,12.5,30.2,32.8,17.4,4.6,0.6,0
*/
export function determine_hit_prob(deck, number_hits) {
  let hit_prob = 0;
  for (let WU=0;WU<=deck["WU"];WU++) {
  for (let WB=0;WB<=deck["WB"];WB++) {
  for (let WR=0;WR<=deck["WR"];WR++) {
  for (let WG=0;WG<=deck["WG"];WG++) {
  for (let UB=0;UB<=deck["UB"];UB++) {
  for (let UR=0;UR<=deck["UR"];UR++) {
  for (let UG=0;UG<=deck["UG"];UG++) {
  for (let BR=0;BR<=deck["BR"];BR++) {
  for (let BG=0;BG<=deck["BG"];BG++) {
  for (let RG=0;RG<=deck["RG"];RG++) {

  const cards_so_far=WU+WB+WR+WG+UB+UR+UG+BR+BG+RG
  let hits_so_far =
    Math.min(WU,1) +
    Math.min(WB,1) +
    Math.min(WR,1) +
    Math.min(WG,1) +
    Math.min(UB,1) +
    Math.min(UR,1) +
    Math.min(UG,1) +
    Math.min(BR,1) +
    Math.min(BG,1) +
    Math.min(RG,1)
  if(
    cards_so_far<=10 &&
    hits_so_far==number_hits
  ) {
    let needed={};
    needed["WU"]=WU;
    needed["WB"]=WB;
    needed["WR"]=WR;
    needed["WG"]=WG;
    needed["UB"]=UB;
    needed["UR"]=UR;
    needed["UG"]=UG;
    needed["BR"]=BR;
    needed["BG"]=BG;
    needed["RG"]=RG;
    needed["other"]=10-cards_so_far
    hit_prob+=multivariate_hypgeom(deck,needed)
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
export function getProbability(deck,deckSize=60) {
  let result = {
    deck: deck,
    numberHits: {},
    stats: {
      deckSize: deckSize,
      possibleHits: 0,
      nonHits: 0,
      averageHit: 0,
      maxHit: 0,
    },
  }

  Object.values(deck).forEach(a=>{
    result.stats.maxHit += a!=0 ? 1 : 0
    result.stats.possibleHits += a
  })

  result.stats.nonHits = deckSize-result.stats.possibleHits-1 //the Niv on the stack
  let deck2 = {...deck,other:result.stats.nonHits}

  console.clear()
  console.log(deckSize+"calculating maxHitChance...")
  console.time('maxHitChange')
  result.stats.maxHitChance="1 in "+(1/determine_hit_prob(deck2,result.stats.maxHit)).toFixed(0)
  console.timeEnd('maxHitChange')
  console.log(deckSize+"calculating maxHitChance...done")

  console.log(deckSize+"calculating hit probability...")
  console.time('hitProb')
  for (let number_hits = 0; number_hits <= 10; number_hits++) {
    // console.log(number_hits + " of 10")
    const hit_prob = determine_hit_prob(deck2,number_hits)
    result.numberHits[number_hits]=(hit_prob*100).toFixed(2)
    result.stats.averageHit += number_hits * hit_prob;
  }
  console.timeEnd('hitProb')
  console.log(deckSize+"calculating hit probability...done")
  result.stats.averageHit=result.stats.averageHit.toFixed(2)

  return result
}

// https://www.geeksforgeeks.org/find-all-combinations-that-adds-upto-given-number-2/
/* Function to find out all combinations of positive numbers
that add upto given number. Includes duplicates */
let permutation = []
export function findCombination(n) {
  let arr = []
  permutation = []
  findCombinationsRecursion(arr,0,n,n)
  return permutation
}
function findCombinationsRecursion(arr,index,num,reducedNum) {
  // Base condition
  if (reducedNum<0 || index>10) return

  // If combination is found, print it
  if (reducedNum==0) {
    let temp = []
    for (let i=0;i<index;i++) temp.push(arr[i])
    permutation.push(temp)
    return
  }

  // Find the previous number
  // stored in arr[] It helps
  // in maintaining increasing order
  const prev = index==0?1:arr[index-1]

  // note loop starts from previous
  // number i.e. at array location
  // index - 1
  for (let k=prev;k<=num;k++) {
    // next element of array is k
    arr[index]=k

    // call recursively with
    // reduced number
    findCombinationsRecursion(arr,index+1,num,reducedNum-k)
  }
}