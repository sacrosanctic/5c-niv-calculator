<template>
  <v-container>
    <div>
      <v-btn @click="result()">calculate</v-btn>
    </div>
    <p v-html="output"></p>
  </v-container>
</template>

<script>
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
      Other: 41,
    },
    goodstuff: [],
  }),
  mounted() {
    },
  methods: {
  }
};
</script>