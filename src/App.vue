<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Niv-Mizzet Reborn</span>
        <span class="font-weight-light">Calculator</span>
      </v-toolbar-title>
        <span class="primary--text ml-5">Private Beta Test</span>
      <v-spacer></v-spacer>
      <v-toolbar-items>
      <v-btn class="primary--text" text to="/">Home</v-btn>
      <!-- <v-btn class="primary--text" text to="/about">prob</v-btn> -->
      <v-btn class="primary--text" text to="/faq">FAQ</v-btn>
      </v-toolbar-items>
      <v-switch hide-details label="dark mode" v-model="isDark"></v-switch>
    </v-app-bar>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    isDark: false
  }),
  mounted() {
    let isDark = JSON.parse(localStorage.getItem('isDark'))
    if(isDark!=null) {
      this.isDark = isDark
    }
  },
  watch: {
    isDark: 'setTheme'
  },
  methods: {
    setTheme () {
      localStorage.setItem('isDark',JSON.stringify(this.isDark))
      this.$vuetify.theme.isDark = this.isDark
      this.$da.logEvent('dark mode: ' + this.isDark)
    }
  }

}
</script>
