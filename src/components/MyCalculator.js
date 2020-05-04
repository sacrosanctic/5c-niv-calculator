//source: https://github.com/frankkarsten/MTG-Math/blob/master/NivMizzet.py
function binom(n, k) {
  /*
  Parameters:
    n - Number of elements of the entire set
    k - Number of elements in the subset
  It should hold that 0 <= k <= n
  Returns - The binomial coefficient n choose k that represents the number of ways of picking k unordered outcomes from n possibilities
  */
  let answer = 1;
  for (let i = 1; i < Math.min(k, n - k) + 1; i++)
    answer = (answer * (n + 1 - i)) / i
  return parseInt(answer)
}
function simple() {
  return 1+1
}


export {binom,simple}